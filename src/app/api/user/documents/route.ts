import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const documents = await db.document.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ documents });
}
