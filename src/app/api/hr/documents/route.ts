import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { userId, title, type, fileUrl, fileSize } = await request.json();

    if (!userId || !title || !type) {
      return NextResponse.json({ error: 'User ID, Title, and Document Type are required.' }, { status: 400 });
    }

    const doc = await db.document.create({
      data: {
        userId,
        title,
        type,
        fileUrl: fileUrl || '/api/documents/demo-uploaded-file.pdf',
        fileSize: fileSize || '250 KB',
        uploadedBy: session.name,
      },
    });

    return NextResponse.json({ success: true, doc });
  } catch (error) {
    console.error('HR document upload error', error);
    return NextResponse.json({ error: 'Failed to upload document.' }, { status: 500 });
  }
}
