import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCandidateRefNumber } from '@/lib/candidate-ref';
import { sendApplicationConfirmationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 'apply', 5, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many application attempts. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const { name, email, phone, roleApplied, resumeUrl, linkedin, coverNote } = await request.json();

    if (!name || !email || !phone || !roleApplied) {
      return NextResponse.json(
        { error: 'Full Name, Email, Phone, and Role Applied are required.' },
        { status: 400 }
      );
    }

    // Auto-generate Candidate Ref Number VT-YYYY-XXX
    const refNumber = await generateCandidateRefNumber();

    const candidate = await db.candidate.create({
      data: {
        refNumber,
        name,
        email: email.toLowerCase().trim(),
        phone,
        roleApplied,
        resumeUrl: resumeUrl || '/api/documents/demo-resume.pdf',
        linkedin: linkedin || null,
        coverNote: coverNote || null,
        status: 'Applied',
      },
    });

    // Send confirmation email
    await sendApplicationConfirmationEmail(candidate.email, candidate.name, candidate.refNumber, candidate.roleApplied);

    return NextResponse.json({
      success: true,
      refNumber: candidate.refNumber,
      message: 'Application submitted successfully! Your Candidate Reference Number has been emailed to you.',
    });
  } catch (error) {
    console.error('Application submission error', error);
    return NextResponse.json({ error: 'Failed to submit job application.' }, { status: 500 });
  }
}
