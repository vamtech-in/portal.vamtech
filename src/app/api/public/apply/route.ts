import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCandidateRefNumber } from '@/lib/candidate-ref';
import { sendApplicationConfirmationEmail, sendHiringNotificationToHR } from '@/lib/email';
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

    // Save candidate to MongoDB database
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

    // 1. Send confirmation email to candidate
    await sendApplicationConfirmationEmail(candidate.email, candidate.name, candidate.refNumber, candidate.roleApplied);

    // 2. Send instant hiring notification email directly to HR inbox (admin@vamtech.in)
    await sendHiringNotificationToHR({
      refNumber: candidate.refNumber,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      roleApplied: candidate.roleApplied,
      linkedin: candidate.linkedin,
      coverNote: candidate.coverNote,
      resumeUrl: candidate.resumeUrl,
    });

    return NextResponse.json({
      success: true,
      refNumber: candidate.refNumber,
      message: 'Application submitted successfully! Notifications sent to candidate and HR.',
    });
  } catch (error) {
    console.error('Application submission error', error);
    return NextResponse.json({ error: 'Failed to submit job application.' }, { status: 500 });
  }
}
