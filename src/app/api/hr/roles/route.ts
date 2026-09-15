import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const roles = await db.jobPosting.findMany({
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    // Also count candidates applying for each role
    const candidates = await db.candidate.findMany({
      select: { roleApplied: true },
    });

    const candidateCountMap: Record<string, number> = {};
    candidates.forEach((c) => {
      const r = c.roleApplied?.trim();
      if (r) {
        candidateCountMap[r] = (candidateCountMap[r] || 0) + 1;
      }
    });

    const rolesWithCounts = roles.map((role) => ({
      ...role,
      applicantCount: candidateCountMap[role.title] || 0,
    }));

    return NextResponse.json({ success: true, roles: rolesWithCounts });
  } catch (error: any) {
    console.error('Failed to fetch HR roles:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await req.json();
    const { title, type, department, location, stipendOrCtc, duration, description, isOpen } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and role type (INTERN or FULL_TIME) are required' }, { status: 400 });
    }

    const newRole = await db.jobPosting.create({
      data: {
        title: title.trim(),
        type: type === 'INTERN' ? 'INTERN' : 'FULL_TIME',
        department: department?.trim() || 'Engineering',
        location: location?.trim() || 'Lucknow / Remote',
        stipendOrCtc: stipendOrCtc?.trim() || null,
        duration: duration?.trim() || null,
        description: description?.trim() || null,
        isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
      },
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error: any) {
    console.error('Failed to create role:', error);
    return NextResponse.json({ error: error.message || 'Failed to create role' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const body = await req.json();
    const { id, isOpen, title, type, department, location, stipendOrCtc, duration, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (isOpen !== undefined) updateData.isOpen = Boolean(isOpen);
    if (title !== undefined) updateData.title = title.trim();
    if (type !== undefined) updateData.type = type === 'INTERN' ? 'INTERN' : 'FULL_TIME';
    if (department !== undefined) updateData.department = department.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (stipendOrCtc !== undefined) updateData.stipendOrCtc = stipendOrCtc.trim();
    if (duration !== undefined) updateData.duration = duration.trim();
    if (description !== undefined) updateData.description = description.trim();

    const updatedRole = await db.jobPosting.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, role: updatedRole });
  } catch (error: any) {
    console.error('Failed to update role:', error);
    return NextResponse.json({ error: error.message || 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    await db.jobPosting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Role removed successfully' });
  } catch (error: any) {
    console.error('Failed to delete role:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete role' }, { status: 500 });
  }
}
