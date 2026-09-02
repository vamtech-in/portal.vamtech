import { NextResponse } from 'next/server';
import { devEmailOutbox } from '@/lib/email';

export async function GET() {
  return NextResponse.json({
    emails: devEmailOutbox,
  });
}
