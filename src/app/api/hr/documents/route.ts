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

    if (!userId || !title || !type || !fileUrl) {
      return NextResponse.json({ error: 'User ID, Title, Document Type, and Uploaded File are required.' }, { status: 400 });
    }

    const doc = await db.document.create({
      data: {
        userId,
        title,
        type,
        fileUrl,
        fileSize: fileSize || 'Document',
        uploadedBy: session.name,
      },
    });

    return NextResponse.json({ success: true, doc });
  } catch (error) {
    console.error('HR document upload error', error);
    return NextResponse.json({ error: 'Failed to upload document.' }, { status: 500 });
  }
}
