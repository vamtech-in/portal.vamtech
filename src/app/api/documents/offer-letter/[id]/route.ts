import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { generateOfferLetterPDFBuffer, OfferDetails } from '@/lib/pdf-generator';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    // Find offer letter by ID, candidateId, offerRefNumber, or candidate refNumber
    const offer = await db.offerLetter.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id }, { candidateId: id }] : []),
          { offerRefNumber: id },
          { candidate: { refNumber: id } },
        ],
      },
      include: {
        candidate: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer letter not found.' }, { status: 404 });
    }

    const cleanRef = offer.candidate?.refNumber
      ? offer.candidate.refNumber.replace(/[^a-zA-Z0-9_-]/g, '_')
      : offer.offerRefNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfFileName = `offer-letter-${cleanRef}.pdf`;

    // 1. Try reading from local disk if it exists
    const diskPath = path.join(process.cwd(), 'public', 'uploads', 'offers', pdfFileName);
    if (fs.existsSync(diskPath)) {
      const fileBytes = await fs.promises.readFile(diskPath);
      return new NextResponse(new Uint8Array(fileBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${pdfFileName}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 2. If not on disk (e.g. Vercel serverless environment), generate PDF on the fly from detailsJson
    let details: OfferDetails;
    try {
      details = JSON.parse(offer.detailsJson);
    } catch {
      details = {
        candidateName: offer.candidate?.name || 'Candidate',
        candidateAddress: 'Lucknow, Uttar Pradesh, 226028',
        candidateEmail: offer.candidate?.email || '',
        designation: offer.candidate?.roleApplied || 'Employee',
        department: 'Engineering',
        offerRefNumber: offer.offerRefNumber,
        date: new Date(offer.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      };
    }

    const buffer = await generateOfferLetterPDFBuffer(
      offer.type as 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME',
      details
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pdfFileName}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Failed to retrieve offer letter PDF:', error);
    return NextResponse.json({ error: 'Failed to retrieve offer letter.' }, { status: 500 });
  }
}
