import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_ROLES = [
  {
    title: 'Full Stack Development Intern (Paid)',
    type: 'INTERN',
    department: 'Engineering',
    location: 'Lucknow / Hybrid',
    stipendOrCtc: '₹6,000–₹12,000 / month',
    duration: '3–6 Months',
    description: 'Work directly on client web apps, Next.js full-stack engines, API integrations, and database schemas.',
    isOpen: true,
    order: 1,
  },
  {
    title: 'Frontend Web Development Intern',
    type: 'INTERN',
    department: 'Engineering',
    location: 'Lucknow / Hybrid',
    stipendOrCtc: '₹5,000–₹10,000 / month',
    duration: '3–6 Months',
    description: 'Design and code ultra-responsive UI components with React, Tailwind CSS, TypeScript, and modern animations.',
    isOpen: true,
    order: 2,
  },
  {
    title: 'Software Engineer Intern (Skill Dev)',
    type: 'INTERN',
    department: 'Engineering',
    location: 'Lucknow / Remote',
    stipendOrCtc: 'Skill Development Internship',
    duration: '2–3 Months',
    description: 'Fast-track engineering internship with direct founder mentorship, real production code, and certificate.',
    isOpen: true,
    order: 3,
  },
  {
    title: 'Senior Full Stack Engineer',
    type: 'FULL_TIME',
    department: 'Engineering',
    location: 'Lucknow / Hybrid',
    stipendOrCtc: '₹8–16 LPA',
    duration: 'Full-Time',
    description: 'Lead architecture and rapid delivery of production SaaS MVPs, client portals, and cloud infrastructure.',
    isOpen: true,
    order: 4,
  },
  {
    title: 'Backend & Cloud Engineer',
    type: 'FULL_TIME',
    department: 'Engineering',
    location: 'Lucknow / Remote',
    stipendOrCtc: '₹6–12 LPA',
    duration: 'Full-Time',
    description: 'Build rock-solid backend services, secure authentication, database schemas, and microsecond query pipelines.',
    isOpen: true,
    order: 5,
  },
  {
    title: 'UI/UX & Product Designer',
    type: 'FULL_TIME',
    department: 'Design',
    location: 'Lucknow / Hybrid',
    stipendOrCtc: '₹5–10 LPA',
    duration: 'Full-Time',
    description: 'Craft editorial web design systems, interactive prototypes, mobile UX, and high-fidelity user workflows.',
    isOpen: true,
    order: 6,
  },
  {
    title: 'AI & Automations Engineer',
    type: 'FULL_TIME',
    department: 'AI & Data',
    location: 'Lucknow / Hybrid',
    stipendOrCtc: '₹7–14 LPA',
    duration: 'Full-Time',
    description: 'Build intelligent LLM ingestion pipelines, workflow automations, and intelligent document extraction tools.',
    isOpen: true,
    order: 7,
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get('type'); // "INTERN" | "FULL_TIME" | undefined

    // Check if database has roles. If empty, seed default roles automatically.
    let count = await (db as any).jobPosting.count();
    if (count === 0) {
      for (const r of DEFAULT_ROLES) {
        await (db as any).jobPosting.create({ data: r });
      }
    }

    const whereClause: any = { isOpen: true };
    if (typeFilter && (typeFilter === 'INTERN' || typeFilter === 'FULL_TIME')) {
      whereClause.type = typeFilter;
    }

    const roles = await (db as any).jobPosting.findMany({
      where: whereClause,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    console.error('Failed to fetch public roles:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}
