import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendCandidateSelectedEmail, sendCandidateRejectedEmail } from '@/lib/email';

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
