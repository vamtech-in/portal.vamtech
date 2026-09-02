import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attendance = await db.attendance.findMany({
    where: { userId: session.id },
    orderBy: { date: 'desc' },
    take: 14,
  });

  const leaveRequests = await db.leaveRequest.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate simple leave balance (Default pool: 12 Paid, 6 Casual, 6 Sick)
  const approvedPaid = leaveRequests.filter(l => l.leaveType === 'Paid' && l.status === 'Approved').length;
  const approvedCasual = leaveRequests.filter(l => l.leaveType === 'Casual' && l.status === 'Approved').length;
  const approvedSick = leaveRequests.filter(l => l.leaveType === 'Sick' && l.status === 'Approved').length;

  const leaveBalance = {
    paid: Math.max(0, 12 - approvedPaid),
    casual: Math.max(0, 6 - approvedCasual),
    sick: Math.max(0, 6 - approvedSick),
  };

  return NextResponse.json({ attendance, leaveRequests, leaveBalance });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action, leaveType, startDate, endDate, reason } = body;

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (action === 'check_in') {
    const existing = await db.attendance.findFirst({
      where: { userId: session.id, date: today },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already checked in for today.' }, { status: 400 });
    }

    const log = await db.attendance.create({
      data: {
        userId: session.id,
        date: today,
        checkIn: nowTime,
        status: 'Present',
      },
    });
    return NextResponse.json({ success: true, log });
  }

  if (action === 'check_out') {
    const existing = await db.attendance.findFirst({
      where: { userId: session.id, date: today },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Must check in before checking out.' }, { status: 400 });
    }

    const log = await db.attendance.update({
      where: { id: existing.id },
      data: { checkOut: nowTime },
    });
    return NextResponse.json({ success: true, log });
  }

  if (action === 'request_leave') {
    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Leave type, start date, end date, and reason are required.' }, { status: 400 });
    }

    const leave = await db.leaveRequest.create({
      data: {
        userId: session.id,
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'Pending',
      },
    });
    return NextResponse.json({ success: true, leave });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
