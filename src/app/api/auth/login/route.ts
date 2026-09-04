import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Rate limit check: 5 attempts per 15 mins per IP
    const rateLimit = checkRateLimit(ip, 'login', 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      const minutesRemaining = Math.ceil(rateLimit.resetInMs / (60 * 1000));
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${minutesRemaining} minutes.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawIdentifier = (body.identifier || body.email || '').trim();
    const password = body.password;

    if (!rawIdentifier || !password) {
      return NextResponse.json({ error: 'Candidate ID or Email and password are required.' }, { status: 400 });
    }

    const lowerEmail = rawIdentifier.toLowerCase();
    const upperRaw = rawIdentifier.toUpperCase();
    const noSpaces = rawIdentifier.replace(/\s+/g, '').toUpperCase();
    const hyphensClean = rawIdentifier.replace(/\s*-\s*/g, '-').toUpperCase();

    const idPermutations = new Set<string>([
      rawIdentifier,
      upperRaw,
      lowerEmail,
      noSpaces,
      hyphensClean,
    ]);

    // If user enters INT-2026-001 or INT-001, also test VT-INT-...
    if (hyphensClean.startsWith('INT-')) {
      idPermutations.add(`VT-${hyphensClean}`);
    }
    // If user enters VT-2026-001 for an intern with VT-INT-2026-001, or vice versa
    if (hyphensClean.startsWith('VT-') && !hyphensClean.includes('-INT-')) {
      idPermutations.add(hyphensClean.replace('VT-', 'VT-INT-'));
    }

    const orConditions = Array.from(idPermutations).flatMap((val) => [
      { email: val.toLowerCase() },
      { refNumber: val },
    ]);

    // Find user by either email or Candidate / Employee / Intern Reference ID (refNumber)
    const user = await db.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid Candidate ID / Email or password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid Candidate ID / Email or password.' }, { status: 401 });
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'employee' | 'admin' | 'intern',
      refNumber: user.refNumber || undefined,
      mustResetPassword: user.mustResetPassword,
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      mustResetPassword: user.mustResetPassword,
      redirectTo: user.mustResetPassword ? '/reset-password' : (user.role === 'admin' ? '/hr' : '/dashboard'),
    });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'An unexpected authentication error occurred.' }, { status: 500 });
  }
}
