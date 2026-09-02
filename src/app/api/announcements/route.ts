import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin action' }, { status: 403 });
  }

  const { title, content, isHoliday, holidayDate } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
  }

  const announcement = await db.announcement.create({
    data: {
      title,
      content,
      isHoliday: !!isHoliday,
      holidayDate: isHoliday ? holidayDate : null,
      authorName: session.name,
    },
  });

  return NextResponse.json({ success: true, announcement });
}
