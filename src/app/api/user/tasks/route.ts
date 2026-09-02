import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tasks = await db.task.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ tasks });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { taskId, status } = await request.json();

  const task = await db.task.updateMany({
    where: { id: taskId, userId: session.id },
    data: { status },
  });

  return NextResponse.json({ success: true, task });
}
