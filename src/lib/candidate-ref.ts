import { db } from './db';

/**
 * Generates next Candidate Reference Number in format VT-YYYY-XXX
 */
export async function generateCandidateRefNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `VT-${currentYear}-`;

  // Find latest candidate ref number for current year
  const latestCandidate = await db.candidate.findFirst({
    where: {
      refNumber: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      refNumber: 'desc',
    },
  });

  let nextSequence = 1;
  if (latestCandidate && latestCandidate.refNumber) {
    const parts = latestCandidate.refNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(3, '0');
  return `VT-${currentYear}-${paddedSeq}`;
}

/**
 * Generates next Offer Letter Reference Number
 * Internships: VAMT/HR/INT/YYYY-XXX
 * Full-time: VAMT/HR/EMP/YYYY-XXX
 */
export async function generateOfferRefNumber(type: 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME'): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefixType = type === 'FULL_TIME' ? 'EMP' : 'INT';
  const prefix = `VAMT/HR/${prefixType}/${currentYear}-`;

  const latestOffer = await db.offerLetter.findFirst({
    where: {
      offerRefNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      offerRefNumber: 'desc',
    },
  });

  let nextSequence = 1;
  if (latestOffer && latestOffer.offerRefNumber) {
    const parts = latestOffer.offerRefNumber.split('-');
    if (parts.length === 2) {
      const lastSeq = parseInt(parts[1], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(3, '0');
  return `VAMT/HR/${prefixType}/${currentYear}-${paddedSeq}`;
}
