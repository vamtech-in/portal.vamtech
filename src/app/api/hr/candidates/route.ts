import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendCandidateSelectedEmail, sendCandidateRejectedEmail } from '@/lib/email';
import { generateCandidateRefNumber } from '@/lib/candidate-ref';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const role = searchParams.get('role') || '';

  const whereClause: any = {};

  if (id) {
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      whereClause.OR = [
        { id: id },
        { refNumber: id },
      ];
    } else {
      whereClause.refNumber = id;
    }
  } else if (search) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
    whereClause.OR = [
      ...(isObjectId ? [{ id: search }] : []),
      { name: { contains: search } },
      { email: { contains: search } },
      { refNumber: { contains: search } },
    ];
  }

  if (status) {
    whereClause.status = status;
  }

  if (role) {
    whereClause.roleApplied = role;
  }

  const candidates = await db.candidate.findMany({
    where: whereClause,
    include: {
      offerLetters: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return NextResponse.json({ candidates });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  const { candidateId, status } = await request.json();

  if (!candidateId || !status) {
    return NextResponse.json({ error: 'Candidate ID and status are required.' }, { status: 400 });
  }

  const candidate = await db.candidate.update({
    where: { id: candidateId },
    data: { status },
  });

  // Automatically send email notification on Selected or Rejected status update
  if (status === 'Selected') {
    await sendCandidateSelectedEmail({
      email: candidate.email,
      name: candidate.name,
      refNumber: candidate.refNumber,
      roleApplied: candidate.roleApplied,
    });
  } else if (status === 'Rejected') {
    await sendCandidateRejectedEmail({
      email: candidate.email,
      name: candidate.name,
      refNumber: candidate.refNumber,
      roleApplied: candidate.roleApplied,
    });
  }

  return NextResponse.json({ success: true, candidate });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
  }

  try {
    const {
      name,
      email,
      phone,
      roleApplied,
      status = 'Selected',
      resumeUrl,
      linkedin,
      coverNote,
      sendSelectionEmail = false,
    } = await request.json();

    if (!name || !email || !phone || !roleApplied) {
      return NextResponse.json(
        { error: 'Name, email, phone, and role applied are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanRole = roleApplied.trim();

    // Generate official candidate reference number (VT-INT-YYYY-XXX or VT-YYYY-XXX)
    const refNumber = await generateCandidateRefNumber(cleanRole);

    const candidate = await db.candidate.create({
      data: {
        refNumber,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        roleApplied: cleanRole,
        resumeUrl: resumeUrl?.trim() || null,
        linkedin: linkedin?.trim() || null,
        coverNote: coverNote?.trim() || 'Direct candidate selected via external interview & skill evaluation.',
        status: status || 'Selected',
      },
    });

    if (sendSelectionEmail && status === 'Selected') {
      try {
        await sendCandidateSelectedEmail({
          email: candidate.email,
          name: candidate.name,
          refNumber: candidate.refNumber,
          roleApplied: candidate.roleApplied,
        });
      } catch (mailErr) {
        console.warn('Failed to send candidate selection email:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Candidate registered successfully with Ref ${refNumber}`,
      candidate,
    });
  } catch (err: any) {
    console.error('Failed to create direct candidate:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to register external candidate.' },
      { status: 500 }
    );
  }
}
