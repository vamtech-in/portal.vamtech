import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Rate-limit lookup attempts: 10 attempts per 10 mins per IP to prevent enumeration
    const rateLimit = checkRateLimit(ip, 'status', 10, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many lookup requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const { refNumber, email } = await request.json();

    if (!refNumber || !email) {
      return NextResponse.json({ error: 'Candidate Reference Number and Email are required.' }, { status: 400 });
    }

    const candidate = await db.candidate.findFirst({
      where: {
        refNumber: refNumber.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
      },
      select: {
        refNumber: true,
        name: true,
        roleApplied: true,
        status: true,
        appliedAt: true,
        updatedAt: true,
        offerLetters: {
          select: {
            offerRefNumber: true,
            type: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'No matching application found for this Reference Number and Email combination.' },
        { status: 444 } // Standard error return without exposing details
      );
    }

    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error('Status lookup error', error);
    return NextResponse.json({ error: 'Failed to look up application status.' }, { status: 500 });
  }
}
