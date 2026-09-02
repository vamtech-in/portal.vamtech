import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendLeaveStatusEmail } from '@/lib/email';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  const leaves = await db.leaveRequest.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, department: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ leaves });
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { leaveId, status, reviewComment } = await request.json();

    if (!leaveId || !status) {
      return NextResponse.json({ error: 'Leave ID and status are required.' }, { status: 400 });
    }

    const updatedLeave = await db.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status, // 'Approved' | 'Rejected'
        reviewedBy: session.name,
        reviewComment: reviewComment || null,
      },
      include: {
        user: true,
      },
    });

    // Send email notification to employee
    await sendLeaveStatusEmail({
      email: updatedLeave.user.email,
      name: updatedLeave.user.name,
      leaveType: updatedLeave.leaveType,
      startDate: updatedLeave.startDate,
      endDate: updatedLeave.endDate,
      status: status as 'Approved' | 'Rejected',
      comment: reviewComment,
    });

    return NextResponse.json({ success: true, leave: updatedLeave });
  } catch (error) {
    console.error('Leave approval error', error);
    return NextResponse.json({ error: 'Failed to update leave request status.' }, { status: 500 });
  }
}
