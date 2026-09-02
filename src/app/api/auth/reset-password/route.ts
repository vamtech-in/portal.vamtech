import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSession, createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const { newPassword, confirmPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    // Update user in database
    await db.user.update({
      where: { id: session.id },
      data: {
        passwordHash: newHash,
        mustResetPassword: false,
      },
    });

    // Re-issue updated session
    await createSession({
      ...session,
      mustResetPassword: false,
    });

    return NextResponse.json({
      success: true,
      redirectTo: session.role === 'admin' ? '/hr' : '/dashboard',
    });
  } catch (error) {
    console.error('Password reset error', error);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
