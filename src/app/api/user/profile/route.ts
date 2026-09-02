import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      refNumber: true,
      department: true,
      designation: true,
      joiningDate: true,
      phone: true,
      emergencyContact: true,
      photoUrl: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phone, emergencyContact, photoUrl } = await request.json();

  const updatedUser = await db.user.update({
    where: { id: session.id },
    data: {
      phone,
      emergencyContact,
      photoUrl,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      refNumber: true,
      department: true,
      designation: true,
      joiningDate: true,
      phone: true,
      emergencyContact: true,
      photoUrl: true,
    },
  });

  return NextResponse.json({ success: true, user: updatedUser });
}
