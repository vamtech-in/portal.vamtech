import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const history = await db.workHistory.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectTitle, description, skills, dateCompleted } = await request.json();

  if (!projectTitle || !description || !skills) {
    return NextResponse.json({ error: 'Project Title, Description, and Skills are required.' }, { status: 400 });
  }

  const entry = await db.workHistory.create({
    data: {
      userId: session.id,
      projectTitle,
      description,
      skills,
      dateCompleted: dateCompleted || new Date().toISOString().split('T')[0],
    },
  });

  return NextResponse.json({ success: true, entry });
}
