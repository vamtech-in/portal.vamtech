import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

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
      // Fallback for demo static document IDs (e.g. demo-offer-letter.pdf)
      return new NextResponse(
        `%PDF-1.4\n1 0 obj\n<< /Title (VAMTech Official Document) /Author (VAMTech HR) >>\nendobj\n`,
        {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${id}.pdf"`,
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      );
    }

    // Access control check: Must be document owner or admin
    if (doc.userId !== session.id && session.role !== 'admin') {
      return NextResponse.json({ error: 'Access Denied: You do not have permission to view this document.' }, { status: 403 });
    }

    // Return document content header with strict anti-indexing
    return new NextResponse(
      `%PDF-1.4\n%VAMTech Internal Secure Document Document ID: ${doc.id}\n%Owner: ${doc.user.name} (${doc.user.email})\n%Title: ${doc.title}\n`,
      {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${encodeURIComponent(doc.title)}.pdf"`,
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      }
    );
  } catch (error) {
    console.error('Document download error', error);
    return NextResponse.json({ error: 'Failed to access document.' }, { status: 500 });
  }
}
