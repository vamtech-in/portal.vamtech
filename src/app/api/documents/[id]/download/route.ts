import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { generateVaultDocumentPDFBuffer } from '@/lib/pdf-generator';

export const runtime = 'nodejs';

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const { id } = await params;

    // Check document in DB
    const doc = await db.document.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document record not found.' }, { status: 404 });
    }

    // Access control check: Must be document owner or admin
    if (doc.userId !== session.id && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access Denied: You do not have permission to view this document.' },
        { status: 403 }
      );
    }

    // Attempt to read physical file from disk if fileUrl exists
    if (doc.fileUrl) {
      let localDiskPath = '';
      if (doc.fileUrl.startsWith('/uploads/')) {
        localDiskPath = path.join(process.cwd(), 'public', doc.fileUrl);
      } else if (doc.fileUrl.startsWith('/')) {
        localDiskPath = path.join(process.cwd(), 'public', doc.fileUrl);
      } else {
        localDiskPath = path.join(process.cwd(), 'public', 'uploads', 'documents', doc.fileUrl);
      }

      if (fs.existsSync(localDiskPath)) {
        const fileBytes = await fs.promises.readFile(localDiskPath);
        const mimeType = getMimeType(localDiskPath);
        const safeFilename = path.basename(localDiskPath);

        return new NextResponse(new Uint8Array(fileBytes), {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': `inline; filename="${encodeURIComponent(doc.title || safeFilename)}"`,
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          },
        });
      }
    }

    // If file is not on disk (e.g. legacy demo record), generate real valid PDF on the fly
    const generatedBuffer = await generateVaultDocumentPDFBuffer({
      title: doc.title,
      type: doc.type,
      userName: doc.user.name,
      userEmail: doc.user.email,
      uploadedBy: doc.uploadedBy,
    });

    return new NextResponse(new Uint8Array(generatedBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.title)}.pdf"`,
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (error) {
    console.error('Document download error', error);
    return NextResponse.json({ error: 'Failed to access document.' }, { status: 500 });
  }
}
