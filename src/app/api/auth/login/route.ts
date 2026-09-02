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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'employee' | 'admin',
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
