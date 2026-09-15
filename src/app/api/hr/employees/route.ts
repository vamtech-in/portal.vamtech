import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  const employees = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      refNumber: true,
      department: true,
      designation: true,
      joiningDate: true,
      phone: true,
      mustResetPassword: true,
      tasks: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      attendanceLogs: {
        select: {
          id: true,
          date: true,
          status: true,
          checkIn: true,
          checkOut: true,
        },
        orderBy: { date: 'desc' },
        take: 20,
      },
      workHistory: {
        select: {
          id: true,
          projectTitle: true,
          description: true,
          skills: true,
          dateCompleted: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      leaveRequests: {
        select: {
          id: true,
          leaveType: true,
          startDate: true,
          endDate: true,
          status: true,
          reason: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  return NextResponse.json({ employees });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  const { employeeId, department, designation, role } = await request.json();

  const user = await db.user.update({
    where: { id: employeeId },
    data: {
      department,
      designation,
      role,
    },
  });

  return NextResponse.json({ success: true, user });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  const { employeeId, title, description, dueDate } = await request.json();

  if (!employeeId || !title) {
    return NextResponse.json({ error: 'Employee ID and task title are required.' }, { status: 400 });
  }

  const task = await db.task.create({
    data: {
      userId: employeeId,
      title,
      description,
      dueDate,
      status: 'To Do',
    },
  });

  return NextResponse.json({ success: true, task });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  try {
    const { employeeId, reason, notes } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required.' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: employeeId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Employee record not found.' }, { status: 404 });
    }

    // Safety guard: prevent self-deletion or deleting the primary admin
    if (
      targetUser.id === session.id ||
      targetUser.email.toLowerCase() === 'contactvamtech@gmail.com' ||
      targetUser.refNumber === 'VT-HR-ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Cannot delete the primary HR Administrator account.' },
        { status: 400 }
      );
    }

    // Cleanly delete user (Prisma cascade will delete tasks, attendance, documents, and leaves)
    await db.user.delete({
      where: { id: employeeId },
    });

    // If candidate pipeline has a matching record, update status if reason is layoff or resignation
    if (targetUser.refNumber) {
      const matchingCandidate = await db.candidate.findFirst({
        where: { refNumber: targetUser.refNumber },
      });

      if (matchingCandidate) {
        if (reason === 'Mock Data / Test Account') {
          // Clean up mock candidate too
          await db.candidate.delete({ where: { id: matchingCandidate.id } });
        } else {
          await db.candidate.update({
            where: { id: matchingCandidate.id },
            data: { status: reason === 'Voluntary Resignation' ? 'Resigned' : 'Offboarded' },
          });
        }
      }
    }

    console.log(`[EMPLOYEE OFFBOARDED] ${targetUser.name} (${targetUser.email}) removed. Reason: ${reason || 'Not specified'}`);

    return NextResponse.json({
      success: true,
      message: `Employee ${targetUser.name} (${targetUser.email}) successfully offboarded and removed.`,
    });
  } catch (err: any) {
    console.error('Delete employee error', err);
    return NextResponse.json({ error: 'Failed to offboard employee: ' + err.message }, { status: 500 });
  }
}
