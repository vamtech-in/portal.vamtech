import { db } from './db';

/**
 * Generates next Candidate Reference Number
 * Internships: VT-INT-YYYY-XXX
 * Full-time / Regular: VT-YYYY-XXX
 */
export async function generateCandidateRefNumber(roleApplied?: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const isIntern = roleApplied ? roleApplied.toLowerCase().includes('intern') : false;
  const prefix = isIntern ? `VT-INT-${currentYear}-` : `VT-${currentYear}-`;

  // Find latest candidate ref number for current year with this prefix
  const latestCandidate = await db.candidate.findFirst({
    where: {
      refNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      refNumber: 'desc',
    },
  });

  let nextSequence = 1;
  if (latestCandidate && latestCandidate.refNumber) {
    const parts = latestCandidate.refNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  const paddedSeq = String(nextSequence).padStart(3, '0');
  return `${prefix}${paddedSeq}`;
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
