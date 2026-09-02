import React from 'react';
import {
  Document as PDFDocument,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { numberToWords } from './number-to-words';

export interface OfferDetails {
  candidateName: string;
  candidateAddress: string;
  candidateEmail: string;
  designation: string;
  department: string;
  offerRefNumber: string;
  date: string;
  
  // Internship specific
  duration?: string; // e.g. "3 Months (01 Oct 2026 to 31 Dec 2026)"
  workingHours?: string; // e.g. "9:30 AM to 6:30 PM (Mon-Fri)"
  stipendAmount?: number; // for paid internship
  
  // Full-time specific
  reportingManager?: string;
  workLocation?: string;
  dateOfJoining?: string;
  probationPeriod?: string; // e.g. "6 Months"
  annualCtc?: number;
  noticePeriod?: string; // e.g. "60 Days"
  
  hrName?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#0b1f3a',
    borderBottomStyle: 'solid',
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b1f3a',
    letterSpacing: 0.5,
  },
  companySub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  refDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    fontSize: 9,
    color: '#475569',
  },
  refNumber: {
    fontWeight: 'bold',
    color: '#0b1f3a',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0b1f3a',
    marginVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recipientBox: {
    marginBottom: 15,
    lineHeight: 1.4,
  },
  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  clauseSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0b1f3a',
    marginBottom: 4,
  },
  clauseText: {
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#334155',
    marginBottom: 8,
    paddingLeft: 10,
  },
  tableBox: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 6,
  },
  tableLabel: {
    width: '40%',
    fontWeight: 'bold',
    color: '#334155',
  },
  tableValue: {
    width: '60%',
    color: '#0f172a',
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sigBox: {
    width: '45%',
  },
  sigTitle: {
    fontWeight: 'bold',
    color: '#0b1f3a',
    marginBottom: 35,
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    paddingTop: 4,
    fontSize: 9,
    color: '#475569',
  },
  acceptanceBlock: {
    marginTop: 25,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  acceptanceText: {
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
});

export const UnpaidInternshipPDF: React.FC<{ details: OfferDetails }> = ({ details }) => (
  <PDFDocument title={`Offer_Letter_${details.offerRefNumber.replace(/\//g, '_')}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>VAMTECH PVT LTD</Text>
          <Text style={styles.companySub}>Software Innovation & Engineering &bull; www.vamtech.in</Text>
        </View>
        <Text style={{ fontSize: 9, color: '#0b1f3a', fontWeight: 'bold' }}>INTERNAL HR PORTAL</Text>
      </View>

      <View style={styles.refDateRow}>
        <Text>Ref: <Text style={styles.refNumber}>{details.offerRefNumber}</Text></Text>
        <Text>Date: {details.date}</Text>
      </View>

      <Text style={styles.title}>INTERNSHIP OFFER LETTER (UNPAID)</Text>

      <View style={styles.recipientBox}>
        <Text style={{ fontSize: 9, color: '#64748b' }}>To,</Text>
        <Text style={styles.recipientName}>{details.candidateName}</Text>
        <Text>{details.candidateAddress}</Text>
        <Text>Email: {details.candidateEmail}</Text>
      </View>

      <Text style={styles.paragraph}>
        We are pleased to offer you an internship position at VAMTech Pvt Ltd as <Text style={{ fontWeight: 'bold' }}>{details.designation}</Text> in the <Text style={{ fontWeight: 'bold' }}>{details.department}</Text> department.
      </Text>

      <View style={styles.tableBox}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Designation:</Text>
          <Text style={styles.tableValue}>{details.designation}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Department:</Text>
          <Text style={styles.tableValue}>{details.department}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Duration:</Text>
          <Text style={styles.tableValue}>{details.duration || '3 Months'}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Working Hours:</Text>
          <Text style={styles.tableValue}>{details.workingHours || '9:30 AM to 6:30 PM (Mon-Fri)'}</Text>
        </View>
        <View style={[styles.tableRow, { backgroundColor: '#fef2f2' }]}>
          <Text style={styles.tableLabel}>Stipend & Compensation:</Text>
          <Text style={[styles.tableValue, { color: '#991b1b', fontWeight: 'bold' }]}>Unpaid (No financial compensation)</Text>
        </View>
      </View>

      <View style={styles.clauseSection}>
        <Text style={styles.clauseTitle}>Terms and Conditions:</Text>
        <Text style={styles.clauseText}>1. Scope of Training: This internship is designed solely for educational gain and practical skill accumulation in software engineering practices.</Text>
        <Text style={styles.clauseText}>2. Compensation: This is an unpaid internship program. No monetary compensation, stipend, or financial allowance will be paid during or after the internship period.</Text>
        <Text style={styles.clauseText}>3. Confidentiality: You shall maintain strict confidentiality regarding all company intellectual property, source code, data, and proprietary business tools.</Text>
        <Text style={styles.clauseText}>4. Certificate: Upon successful completion of the internship duration and submission of assigned projects, you will receive an official Internship Completion Certificate.</Text>
      </View>

      <View style={styles.signatureSection}>
        <View style={styles.sigBox}>
          <Text style={styles.sigTitle}>For VAMTech Pvt Ltd,</Text>
          <Text style={styles.sigLine}>{details.hrName || 'HR Manager'}{'\n'}Authorized Signatory</Text>
        </View>

        <View style={styles.sigBox}>
          <Text style={styles.sigTitle}>Candidate Acceptance,</Text>
          <Text style={styles.sigLine}>{details.candidateName}{'\n'}Date & Signature</Text>
        </View>
      </View>

      <View style={styles.acceptanceBlock}>
        <Text style={styles.acceptanceText}>
          Acceptance Statement: I accept the terms of this unpaid internship offer. I acknowledge that I am participating for educational experience and will receive no monetary compensation.
        </Text>
      </View>

      <Text style={styles.footer}>VAMTech Pvt Ltd &bull; portal.vamtech.in &bull; Confidential Document</Text>
    </Page>
  </PDFDocument>
);

export const PaidInternshipPDF: React.FC<{ details: OfferDetails }> = ({ details }) => {
  const stipendText = details.stipendAmount
    ? `INR ${details.stipendAmount.toLocaleString()} (${numberToWords(details.stipendAmount)}) per month`
    : 'INR 10,000 (Ten Thousand Rupees Only) per month';

  return (
    <PDFDocument title={`Offer_Letter_${details.offerRefNumber.replace(/\//g, '_')}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>VAMTECH PVT LTD</Text>
            <Text style={styles.companySub}>Software Innovation & Engineering &bull; www.vamtech.in</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#0b1f3a', fontWeight: 'bold' }}>INTERNAL HR PORTAL</Text>
        </View>

        <View style={styles.refDateRow}>
          <Text>Ref: <Text style={styles.refNumber}>{details.offerRefNumber}</Text></Text>
          <Text>Date: {details.date}</Text>
        </View>

        <Text style={styles.title}>PAID INTERNSHIP OFFER LETTER</Text>

        <View style={styles.recipientBox}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>To,</Text>
          <Text style={styles.recipientName}>{details.candidateName}</Text>
          <Text>{details.candidateAddress}</Text>
          <Text>Email: {details.candidateEmail}</Text>
        </View>

        <Text style={styles.paragraph}>
          We are pleased to offer you a paid internship position at VAMTech Pvt Ltd as <Text style={{ fontWeight: 'bold' }}>{details.designation}</Text> in the <Text style={{ fontWeight: 'bold' }}>{details.department}</Text> department.
        </Text>

        <View style={styles.tableBox}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Designation:</Text>
            <Text style={styles.tableValue}>{details.designation}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Department:</Text>
            <Text style={styles.tableValue}>{details.department}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Duration:</Text>
            <Text style={styles.tableValue}>{details.duration || '6 Months'}</Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.tableLabel}>Monthly Stipend:</Text>
            <Text style={[styles.tableValue, { color: '#166534', fontWeight: 'bold' }]}>{stipendText}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Reporting Manager:</Text>
            <Text style={styles.tableValue}>{details.reportingManager || 'Engineering Lead'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Working Hours:</Text>
            <Text style={styles.tableValue}>{details.workingHours || '9:30 AM to 6:30 PM (Mon-Fri)'}</Text>
          </View>
        </View>

        <View style={styles.clauseSection}>
          <Text style={styles.clauseTitle}>Key Terms & Conditions:</Text>
          <Text style={styles.clauseText}>1. Stipend Payment: Your stipend will be processed monthly subject to statutory deductions as applicable.</Text>
          <Text style={styles.clauseText}>2. Intellectual Property: All source code, designs, and documentation developed during your internship belong exclusively to VAMTech Pvt Ltd.</Text>
          <Text style={styles.clauseText}>3. Performance Review: Based on your performance and business requirements, VAMTech may consider extending a full-time employment offer upon internship completion.</Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.sigBox}>
            <Text style={styles.sigTitle}>For VAMTech Pvt Ltd,</Text>
            <Text style={styles.sigLine}>{details.hrName || 'HR Director'}{'\n'}Authorized Signatory</Text>
          </View>

          <View style={styles.sigBox}>
            <Text style={styles.sigTitle}>Candidate Acceptance,</Text>
            <Text style={styles.sigLine}>{details.candidateName}{'\n'}Date & Signature</Text>
          </View>
        </View>

        <View style={styles.acceptanceBlock}>
          <Text style={styles.acceptanceText}>
            Acceptance Statement: I accept the paid internship offer as outlined above and agree to abide by VAMTech company policies.
          </Text>
        </View>

        <Text style={styles.footer}>VAMTech Pvt Ltd &bull; portal.vamtech.in &bull; Confidential Document</Text>
      </Page>
    </PDFDocument>
  );
};

export const FullTimeOfferPDF: React.FC<{ details: OfferDetails }> = ({ details }) => {
  const ctcText = details.annualCtc
    ? `INR ${details.annualCtc.toLocaleString()} (${numberToWords(details.annualCtc)}) per annum`
    : 'INR 1,200,000 (Twelve Lakh Rupees Only) per annum';

  return (
    <PDFDocument title={`Offer_Letter_${details.offerRefNumber.replace(/\//g, '_')}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>VAMTECH PVT LTD</Text>
            <Text style={styles.companySub}>Software Innovation & Engineering &bull; www.vamtech.in</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#0b1f3a', fontWeight: 'bold' }}>INTERNAL HR PORTAL</Text>
        </View>

        <View style={styles.refDateRow}>
          <Text>Ref: <Text style={styles.refNumber}>{details.offerRefNumber}</Text></Text>
          <Text>Date: {details.date}</Text>
        </View>

        <Text style={styles.title}>OFFER OF EMPLOYMENT (FULL-TIME)</Text>

        <View style={styles.recipientBox}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>To,</Text>
          <Text style={styles.recipientName}>{details.candidateName}</Text>
          <Text>{details.candidateAddress}</Text>
          <Text>Email: {details.candidateEmail}</Text>
        </View>

        <Text style={styles.paragraph}>
          We are pleased to offer you full-time employment at VAMTech Pvt Ltd as <Text style={{ fontWeight: 'bold' }}>{details.designation}</Text> in our <Text style={{ fontWeight: 'bold' }}>{details.department}</Text> team.
        </Text>

        <View style={styles.tableBox}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Job Title / Designation:</Text>
            <Text style={styles.tableValue}>{details.designation}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Department:</Text>
            <Text style={styles.tableValue}>{details.department}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Date of Joining:</Text>
            <Text style={styles.tableValue}>{details.dateOfJoining || 'Immediate / TBD'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Work Location:</Text>
            <Text style={styles.tableValue}>{details.workLocation || 'Headquarters / Hybrid'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Reporting Manager:</Text>
            <Text style={styles.tableValue}>{details.reportingManager || 'VP of Engineering'}</Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.tableLabel}>Annual CTC:</Text>
            <Text style={[styles.tableValue, { color: '#166534', fontWeight: 'bold' }]}>{ctcText}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Probation Period:</Text>
            <Text style={styles.tableValue}>{details.probationPeriod || '6 Months'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Notice Period (Post-Confirmation):</Text>
            <Text style={styles.tableValue}>{details.noticePeriod || '60 Days'}</Text>
          </View>
        </View>

        <View style={styles.clauseSection}>
          <Text style={styles.clauseTitle}>Principal Terms of Employment:</Text>
          <Text style={styles.clauseText}>1. Probation & Confirmation: Your performance will be evaluated during your probation period of {details.probationPeriod || '6 months'}. Confirmation is subject to satisfactory review.</Text>
          <Text style={styles.clauseText}>2. Confidentiality & Non-Compete: You agree to uphold company non-disclosure agreements and IP assignments during and after your tenure.</Text>
          <Text style={styles.clauseText}>3. Resignation & Notice Period: Post-confirmation, either party may terminate employment by giving {details.noticePeriod || '60 days'} written notice or salary in lieu thereof.</Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.sigBox}>
            <Text style={styles.sigTitle}>For VAMTech Pvt Ltd,</Text>
            <Text style={styles.sigLine}>{details.hrName || 'Head of HR'}{'\n'}Authorized Signatory</Text>
          </View>

          <View style={styles.sigBox}>
            <Text style={styles.sigTitle}>Candidate Acceptance,</Text>
            <Text style={styles.sigLine}>{details.candidateName}{'\n'}Date & Signature</Text>
          </View>
        </View>

        <View style={styles.acceptanceBlock}>
          <Text style={styles.acceptanceText}>
            Acceptance Statement: I hereby accept this offer of full-time employment and confirm that I will join VAMTech Pvt Ltd on the specified date of joining.
          </Text>
        </View>

        <Text style={styles.footer}>VAMTech Pvt Ltd &bull; portal.vamtech.in &bull; Strict Private & Confidential</Text>
      </Page>
    </PDFDocument>
  );
};

/**
 * Generate PDF Buffer for selected offer letter type
 */
export async function generateOfferLetterPDFBuffer(type: 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME', details: OfferDetails): Promise<Buffer> {
  let docElement: React.ReactElement;
  if (type === 'UNPAID_INTERNSHIP') {
    docElement = <UnpaidInternshipPDF details={details} />;
  } else if (type === 'PAID_INTERNSHIP') {
    docElement = <PaidInternshipPDF details={details} />;
  } else {
    docElement = <FullTimeOfferPDF details={details} />;
  }

  const pdfStream = (await pdf(docElement).toBuffer()) as unknown as NodeJS.ReadableStream;
  const chunks: Uint8Array[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
