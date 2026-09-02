import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { generateOfferRefNumber } from '@/lib/candidate-ref';
import { generateOfferLetterPDFBuffer } from '@/lib/pdf-generator';
import { sendOfferLetterEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const {
      candidateId,
      type, // 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME'
      candidateAddress,
      designation,
      department,
      duration,
      workingHours,
      stipendAmount,
      reportingManager,
      workLocation,
      dateOfJoining,
      probationPeriod,
      annualCtc,
      noticePeriod,
      hrName,
    } = await request.json();

    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
    }

    // Auto-generate offer ref number
    const offerRefNumber = await generateOfferRefNumber(type);
    const currentDate = new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const offerDetails = {
      candidateName: candidate.name,
      candidateAddress: candidateAddress || 'India',
      candidateEmail: candidate.email,
      designation: designation || candidate.roleApplied,
      department: department || 'Engineering',
      offerRefNumber,
      date: currentDate,
      duration,
      workingHours,
      stipendAmount: stipendAmount ? parseFloat(stipendAmount) : undefined,
      reportingManager,
      workLocation,
      dateOfJoining,
      probationPeriod,
      annualCtc: annualCtc ? parseFloat(annualCtc) : undefined,
      noticePeriod,
      hrName: hrName || session.name,
    };

    // Render PDF Buffer
    const pdfBuffer = await generateOfferLetterPDFBuffer(type, offerDetails);
    const mockPdfUrl = `/api/documents/offer-letter-${candidate.refNumber}.pdf`;

    // Save Offer Letter Record
    const offerRecord = await db.offerLetter.create({
      data: {
        candidateId: candidate.id,
        offerRefNumber,
        type,
        detailsJson: JSON.stringify(offerDetails),
        pdfUrl: mockPdfUrl,
      },
    });

    // Update candidate status to "Offer Sent"
    await db.candidate.update({
      where: { id: candidate.id },
      data: { status: 'Offer Sent' },
    });

    // Send email with offer letter notification
    await sendOfferLetterEmail({
      email: candidate.email,
      name: candidate.name,
      offerRefNumber,
      offerType: type,
    });

    return NextResponse.json({
      success: true,
      offerRefNumber,
      offerRecord,
      message: `Offer letter ${offerRefNumber} generated and emailed to ${candidate.email}! Candidate status updated to Offer Sent.`,
    });
  } catch (error) {
    console.error('Offer letter generation error', error);
    return NextResponse.json({ error: 'Failed to generate offer letter.' }, { status: 500 });
  }
}
