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
      hrPhone,
      responsibilities,
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

    const cleanDesignation = ((designation || candidate.roleApplied || '') as string)
      .replace(/\s*\((paid|unpaid)\)\s*$/gi, '')
      .trim();

    let parsedResponsibilities: string[] | undefined = undefined;
    if (Array.isArray(responsibilities) && responsibilities.length > 0) {
      parsedResponsibilities = responsibilities.map((r: any) => String(r).trim()).filter(Boolean);
    } else if (typeof responsibilities === 'string' && responsibilities.trim()) {
      parsedResponsibilities = responsibilities
        .split('\n')
        .map(r => r.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter(Boolean);
    }

    const offerDetails = {
      candidateName: candidate.name,
      candidateAddress: candidateAddress || 'Lucknow, Uttar Pradesh, 226028',
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      designation: cleanDesignation || designation || candidate.roleApplied,
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
      hrPhone: hrPhone || '+91 72379 00686',
      responsibilities: parsedResponsibilities && parsedResponsibilities.length > 0 ? parsedResponsibilities : undefined,
    };

    // Render real PDF Buffer
    const pdfBuffer = await generateOfferLetterPDFBuffer(type, offerDetails);

    // Save PDF file to public disk storage if filesystem is writable (local dev/servers)
    const cleanRef = candidate.refNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfFileName = `offer-letter-${cleanRef}.pdf`;
    try {
      const offersDir = path.join(process.cwd(), 'public', 'uploads', 'offers');
      await fs.promises.mkdir(offersDir, { recursive: true });
      const pdfFilePath = path.join(offersDir, pdfFileName);
      await fs.promises.writeFile(pdfFilePath, pdfBuffer);
    } catch (fsErr) {
      // In serverless environments (e.g. Vercel), disk is read-only. This is safely handled by the dynamic download endpoint.
      console.warn('Notice: PDF not saved to disk storage in serverless environment:', fsErr);
    }

    // Save Offer Letter Record
    const offerRecord = await db.offerLetter.create({
      data: {
        candidateId: candidate.id,
        offerRefNumber,
        type,
        detailsJson: JSON.stringify(offerDetails),
        pdfUrl: '',
      },
    });

    // Set permanent dynamic download URL
    const realPdfUrl = `/api/documents/offer-letter/${offerRecord.id}`;
    await db.offerLetter.update({
      where: { id: offerRecord.id },
      data: { pdfUrl: realPdfUrl },
    });
    offerRecord.pdfUrl = realPdfUrl;

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

    // Generate secure download URL for the candidate
    const baseUrl = process.env.NEXTAUTH_URL || 'https://career.vamtech.in';
    const downloadUrl = `${baseUrl}/api/documents/offer-letter/${offerRecord.id}`;

    // Format compensation or stipend string for email summary
    let stipendOrCtc: string | undefined;
    if (type === 'PAID_INTERNSHIP') {
      stipendOrCtc = `Rs. ${(offerDetails.stipendAmount || 5000).toLocaleString('en-IN')} / month`;
    } else if (type === 'UNPAID_INTERNSHIP') {
      stipendOrCtc = 'Unpaid (Skill Development Internship)';
    } else if (type === 'FULL_TIME') {
      stipendOrCtc = `Rs. ${(offerDetails.annualCtc || 1200000).toLocaleString('en-IN')} / annum (CTC)`;
    }

    // Send email with PDF offer letter attached directly to candidate email
    const candidateEmail = candidate.email.trim();
    const emailResult = await sendOfferLetterEmail({
      email: candidateEmail,
      name: candidate.name,
      offerRefNumber,
      offerType: type,
      designation: offerDetails.designation,
      stipendOrCtc,
      startDate: offerDetails.startDate || offerDetails.dateOfJoining || offerDetails.date,
      pdfBuffer,
      downloadUrl,
    });

    let message = `Offer letter ${offerRefNumber} generated successfully!`;
    if (emailResult.success) {
      message += ` Official signed PDF Offer Letter has been delivered directly to candidate's email (${candidateEmail}).`;
    } else if (emailResult.isSandboxRestriction) {
      message += ` (Email Notice: Cloud email is in test mode; please add SMTP_PASS in Vercel to send directly to ${candidateEmail}. A copy was forwarded to ${process.env.HR_EMAIL || 'contactvamtech@gmail.com'}).`;
    } else {
      message += ` (Email Notice: Could not deliver to ${candidateEmail}: ${emailResult.error || 'Check SMTP configuration'}).`;
    }

    return NextResponse.json({
      success: true,
      offerRefNumber,
      offerRecord,
      emailSent: emailResult.success,
      emailError: emailResult.error,
      message,
    });
  } catch (error: any) {
    console.error('Offer letter generation error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate offer letter.' },
      { status: 500 }
    );
  }
}
