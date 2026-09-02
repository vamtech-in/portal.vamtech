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
        select: { id: true, title: true, status: true },
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
