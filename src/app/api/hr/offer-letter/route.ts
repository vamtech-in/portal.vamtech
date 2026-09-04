import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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
      startDate,
      endDate,
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

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(candidateId);
    const candidate = await db.candidate.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: candidateId }] : []),
          { refNumber: candidateId },
        ],
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate record not found.' }, { status: 404 });
    }

    // Auto-generate offer ref number: VAMT/HR/INT/YYYY-XXX or VAMT/HR/EMP/YYYY-XXX
    const offerRefNumber = await generateOfferRefNumber(type);
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const offerDetails = {
      candidateName: candidate.name,
      candidateAddress: candidateAddress || 'Lucknow, Uttar Pradesh, 226028',
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      designation: designation || candidate.roleApplied,
      department: department || 'Engineering',
      offerRefNumber,
      date: currentDate,
      duration: duration || '3 months',
      startDate: startDate || currentDate,
      endDate: endDate || '5 December 2026',
      workingHours: workingHours || '10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)',
      stipendAmount: stipendAmount !== undefined && stipendAmount !== '' ? parseFloat(stipendAmount) : 5000,
      reportingManager: reportingManager || 'Aditya Gupta, HR',
      workLocation: workLocation || 'Remote',
      dateOfJoining: dateOfJoining || currentDate,
      probationPeriod,
      annualCtc: annualCtc ? parseFloat(annualCtc) : undefined,
      noticePeriod,
      hrName: hrName || 'Aditya Gupta',
    };

    // Render real PDF Buffer
    const pdfBuffer = await generateOfferLetterPDFBuffer(type, offerDetails);

    // Save PDF file to public disk storage
    const offersDir = path.join(process.cwd(), 'public', 'uploads', 'offers');
    await fs.promises.mkdir(offersDir, { recursive: true });
    const cleanRef = candidate.refNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfFileName = `offer-letter-${cleanRef}.pdf`;
    const pdfFilePath = path.join(offersDir, pdfFileName);
    await fs.promises.writeFile(pdfFilePath, pdfBuffer);
    const realPdfUrl = `/uploads/offers/${pdfFileName}`;

    // Save Offer Letter Record
    const offerRecord = await db.offerLetter.create({
      data: {
        candidateId: candidate.id,
        offerRefNumber,
        type,
        detailsJson: JSON.stringify(offerDetails),
        pdfUrl: realPdfUrl,
      },
    });

    // Also check if candidate already exists as an employee user and create document record in their vault
    const employeeUser = await db.user.findFirst({
      where: {
        OR: [
          { email: candidate.email },
          { refNumber: candidate.refNumber },
        ],
      },
    });

    if (employeeUser) {
      await db.document.create({
        data: {
          userId: employeeUser.id,
          title: `Official Offer Letter (${offerRefNumber})`,
          type: 'Offer Letter',
          fileUrl: realPdfUrl,
          fileSize: `${Math.max(1, Math.round(pdfBuffer.length / 1024))} KB`,
          uploadedBy: session.name,
        },
      });
    }

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
