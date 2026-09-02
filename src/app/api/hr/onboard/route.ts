import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendOnboardingCredentialsEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { candidateId, department, designation, joiningDate } = await request.json();

    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
    }

    // Generate temporary password
    const tempPassword = `VamTech@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: candidate.email },
    });

    let user;
    if (existingUser) {
      user = await db.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'employee',
          mustResetPassword: true,
          refNumber: candidate.refNumber,
          department: department || 'Engineering',
          designation: designation || candidate.roleApplied,
          joiningDate: joiningDate || new Date().toISOString().split('T')[0],
          phone: candidate.phone,
        },
      });
    } else {
      user = await db.user.create({
        data: {
          email: candidate.email,
          name: candidate.name,
          passwordHash,
          role: 'employee',
          mustResetPassword: true, // Force password change on first login
          refNumber: candidate.refNumber, // Carry over Candidate Ref No as Employee ID
          department: department || 'Engineering',
          designation: designation || candidate.roleApplied,
          joiningDate: joiningDate || new Date().toISOString().split('T')[0],
          phone: candidate.phone,
        },
      });
    }

    // Mark candidate status as "Joined"
    await db.candidate.update({
      where: { id: candidate.id },
      data: { status: 'Joined' },
    });

    // Email login credentials & portal URL to new employee
    await sendOnboardingCredentialsEmail({
      email: candidate.email,
      name: candidate.name,
      employeeId: candidate.refNumber,
      tempPassword,
    });

    return NextResponse.json({
      success: true,
      user,
      tempPassword,
      message: `Employee account created for ${candidate.name} (Employee ID: ${candidate.refNumber}). Credentials emailed successfully!`,
    });
  } catch (error) {
    console.error('Employee onboarding error', error);
    return NextResponse.json({ error: 'Failed to onboard employee.' }, { status: 500 });
  }
}
