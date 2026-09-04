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

    const targetDesignation = designation || candidate.roleApplied;
    const isIntern = targetDesignation.toLowerCase().includes('intern');
    const assignedRole = isIntern ? 'intern' : 'employee';

    // Ensure intern IDs contain 'INT' (e.g. VT-INT-2026-001)
    let assignedId = candidate.refNumber;
    if (isIntern && !assignedId.toUpperCase().includes('INT')) {
      assignedId = assignedId.replace(/^VT-/i, 'VT-INT-');
    }

    let user;
    if (existingUser) {
      user = await db.user.update({
        where: { id: existingUser.id },
        data: {
          role: assignedRole,
          mustResetPassword: true,
          refNumber: assignedId,
          department: department || 'Engineering',
          designation: targetDesignation,
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
          role: assignedRole,
          mustResetPassword: true, // Force password change on first login
          refNumber: assignedId, // Intern ID with INT or Employee ID
          department: department || 'Engineering',
          designation: targetDesignation,
          joiningDate: joiningDate || new Date().toISOString().split('T')[0],
          phone: candidate.phone,
        },
      });
    }

    // Mark candidate status as "Joined" and sync refNumber if updated to intern format
    await db.candidate.update({
      where: { id: candidate.id },
      data: { 
        status: 'Joined',
        refNumber: assignedId,
      },
    });

    // Email login credentials & portal URL to new intern/employee
    await sendOnboardingCredentialsEmail({
      email: candidate.email,
      name: candidate.name,
      employeeId: assignedId,
      tempPassword,
      isIntern,
    });

    const roleName = isIntern ? 'Intern' : 'Employee';
    return NextResponse.json({
      success: true,
      user,
      tempPassword,
      message: `${roleName} account created for ${candidate.name} (${roleName} ID: ${assignedId}). Credentials emailed successfully!`,
    });
  } catch (error) {
    console.error('Employee onboarding error', error);
    return NextResponse.json({ error: 'Failed to onboard employee.' }, { status: 500 });
  }
}
