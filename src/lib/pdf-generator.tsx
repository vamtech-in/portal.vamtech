import React from 'react';
import fs from 'fs';
import path from 'path';
import {
  Document as PDFDocument,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from '@react-pdf/renderer';
import { numberToWords } from './number-to-words';

export interface OfferDetails {
  candidateName: string;
  candidateAddress: string;
  candidateEmail: string;
  candidatePhone?: string;
  designation: string;
  department: string;
  offerRefNumber: string;
  date: string;

  // Internship specific
  duration?: string; // e.g. "3 months"
  startDate?: string; // e.g. "5 September 2026"
  endDate?: string; // e.g. "5 December 2026"
  workingHours?: string; // e.g. "10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)"
  stipendAmount?: number; // for paid internship e.g. 5000
  workLocation?: string; // e.g. "Remote"
  reportingManager?: string; // e.g. "Aditya Gupta, HR"

  // Full-time specific
  dateOfJoining?: string;
  probationPeriod?: string; // e.g. "6 Months"
  annualCtc?: number;
  noticePeriod?: string; // e.g. "60 Days"

  hrName?: string; // default: "Aditya Gupta"
}

// Load logo as base64 for reliable rendering
function getLogoDataUri(): string {
  try {
    const logoFile = path.join(process.cwd(), 'public', 'images', 'vamtech-logo.png');
    if (fs.existsSync(logoFile)) {
      const buffer = fs.readFileSync(logoFile);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    }
  } catch (e) {
    console.error('Failed to load logo file', e);
  }
  return 'https://www.vamtech.in/images/vamtech-logo.png';
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 45,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#111827',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '36%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-32deg)',
    zIndex: -1,
  },
  watermarkText: {
    fontSize: 90,
    fontWeight: 'bold',
    color: '#cbd5e1',
    opacity: 0.12,
    letterSpacing: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 145,
    height: 44,
    objectFit: 'contain',
    marginBottom: 4,
  },
  companySub1: {
    fontSize: 8.5,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  companySub2: {
    fontSize: 7.5,
    color: '#4b5563',
    textAlign: 'center',
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    marginTop: 6,
    marginBottom: 14,
  },
  metaSection: {
    marginBottom: 10,
    lineHeight: 1.35,
  },
  metaText: {
    fontSize: 9.5,
    color: '#111827',
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  toSection: {
    marginBottom: 12,
    lineHeight: 1.35,
  },
  toName: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
    marginBottom: 1,
  },
  toLine: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 1,
  },
  subjectSection: {
    marginVertical: 10,
    textAlign: 'center',
  },
  subjectText: {
    fontSize: 10,
    fontWeight: 'bold',
    textDecoration: 'underline',
    textAlign: 'center',
    color: '#000000',
  },
  salutation: {
    fontSize: 9.5,
    marginBottom: 6,
    marginTop: 4,
  },
  paragraph: {
    fontSize: 9.5,
    lineHeight: 1.45,
    color: '#111827',
    marginBottom: 6,
    textAlign: 'justify',
  },
  sectionHeader: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
    marginBottom: 3,
  },
  bulletItem: {
    fontSize: 9.5,
    color: '#111827',
    paddingLeft: 14,
    marginBottom: 2,
    lineHeight: 1.35,
  },
  closingText: {
    fontSize: 9.5,
    lineHeight: 1.45,
    marginTop: 10,
    marginBottom: 14,
  },
  signOffSection: {
    marginTop: 6,
    marginBottom: 26,
  },
  signLine: {
    width: 170,
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    marginTop: 24,
    marginBottom: 4,
  },
  hrName: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#111827',
  },
  hrTitle: {
    fontSize: 9,
    color: '#4b5563',
  },
  pageDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    marginVertical: 14,
  },
  acceptanceTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  acceptanceText: {
    fontSize: 9.5,
    lineHeight: 1.45,
    color: '#111827',
    marginBottom: 20,
  },
});

/**
 * Internship Offer Letter Template (Matching official VAMTech format)
 */
export const InternshipOfferPDF: React.FC<{ details: OfferDetails; isPaid: boolean }> = ({ details, isPaid }) => {
  const logoUri = getLogoDataUri();
  const firstName = details.candidateName ? details.candidateName.split(' ')[0] : 'Candidate';
  const roleName = details.designation || 'Full Stack Development Intern';
  const stipendAmount = details.stipendAmount || 5000;
  const stipendInWords = numberToWords(stipendAmount);

  return (
    <PDFDocument title={`Offer_Letter_${details.offerRefNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}`}>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermarkContainer} fixed>
          <Text style={styles.watermarkText}>VMTech</Text>
        </View>

        {/* Company Header */}
        <View style={styles.header}>
          <Image src={logoUri} style={styles.logo} />
          <Text style={styles.companySub1}>VAMTech Pvt Ltd | Custom Software & AI Engineering</Text>
          <Text style={styles.companySub2}>
            Tiwariganj, Lucknow, Uttar Pradesh 226028, India | contactvamtech@gmail.com | +91 72379 00686 | www.vamtech.in
          </Text>
        </View>
        <View style={styles.dividerLine} />

        {/* Date & Ref */}
        <View style={styles.metaSection}>
          <Text style={styles.metaText}>
            <Text style={styles.bold}>Date: </Text>{details.date}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.bold}>Ref No: </Text>{details.offerRefNumber}
          </Text>
        </View>

        {/* To Recipient */}
        <View style={styles.toSection}>
          <Text style={styles.bold}>To,</Text>
          <Text style={styles.toName}>{details.candidateName}</Text>
          <Text style={styles.toLine}>
            {details.candidateAddress}
            {details.candidateEmail ? ` | ${details.candidateEmail}` : ''}
            {details.candidatePhone ? ` | ${details.candidatePhone}` : ''}
          </Text>
        </View>

        {/* Subject */}
        <View style={styles.subjectSection}>
          <Text style={styles.subjectText}>
            Subject: Offer of Internship — {roleName} ({isPaid ? 'Paid' : 'Unpaid'})
          </Text>
        </View>

        {/* Dear Candidate */}
        <Text style={styles.salutation}>Dear {firstName},</Text>
        <Text style={styles.paragraph}>
          We are pleased to offer you the position of {roleName} at VAMTech Pvt Ltd, based on your application and the subsequent interview(s) held with our team. We were impressed with your skills and enthusiasm, and we believe you will be a valuable addition to our team.
        </Text>
        <Text style={styles.paragraph}>
          This letter outlines the terms and conditions of your internship. Please read them carefully, and if you agree, sign and return a copy of this letter to us as a token of your acceptance.
        </Text>

        {/* 1. Position and Role */}
        <Text style={styles.sectionHeader}>1. Position and Role</Text>
        <Text style={styles.bulletItem}>•  Designation: {roleName}</Text>
        <Text style={styles.bulletItem}>•  Department: {details.department || 'Engineering'}</Text>
        {isPaid || details.reportingManager ? (
          <Text style={styles.bulletItem}>•  Reporting Manager: {details.reportingManager || 'Aditya Gupta, HR'}</Text>
        ) : null}
        <Text style={styles.bulletItem}>•  Work Location: {details.workLocation || 'Remote'}</Text>

        {/* 2. Duration */}
        <Text style={styles.sectionHeader}>2. Duration</Text>
        <Text style={styles.paragraph}>
          The internship will be for a period of {details.duration || '3 months'}, commencing on {details.startDate || 'Start Date'} and ending on {details.endDate || 'End Date'}, unless extended or terminated earlier as per the terms below.
        </Text>

        {/* 3. Stipend */}
        <Text style={styles.sectionHeader}>3. Stipend</Text>
        {isPaid ? (
          <Text style={styles.paragraph}>
            You will be paid a monthly stipend of ₹{stipendAmount.toLocaleString('en-IN')} ({stipendInWords}), payable on or before the 7th of every month, subject to applicable deductions, if any.
          </Text>
        ) : (
          <Text style={styles.paragraph}>
            This is an unpaid internship. No stipend, salary, or monetary compensation will be paid for the duration of the internship. Any expenses incurred, if applicable, will be governed by VAMTech Pvt Ltd&apos;s policy in this regard, if any.
          </Text>
        )}

        {/* 4. Working Hours */}
        <Text style={styles.sectionHeader}>4. Working Hours</Text>
        <Text style={styles.paragraph}>
          Your standard working hours will be from {details.workingHours || '10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)'}. You may occasionally be required to put in additional hours to meet project deadlines.
        </Text>

        {/* 5. Roles and Responsibilities */}
        <Text style={styles.sectionHeader}>5. Roles and Responsibilities</Text>
        <Text style={styles.bulletItem}>•  Design, develop, and maintain full stack web applications (frontend and backend).</Text>
        <Text style={styles.bulletItem}>•  Build and integrate RESTful APIs and work with databases as required.</Text>
        <Text style={styles.bulletItem}>•  Write clean, maintainable, and well-documented code.</Text>
        <Text style={styles.bulletItem}>•  Participate in code reviews, stand-ups, and sprint planning sessions.</Text>
        <Text style={styles.bulletItem}>•  Assist in debugging, testing, and deploying features under guidance.</Text>

        {/* 6. Probation and Performance Review */}
        <Text style={styles.sectionHeader}>6. Probation and Performance Review</Text>
        <Text style={styles.paragraph}>
          Your performance will be reviewed periodically during the internship. Based on your performance, conduct, and business requirements, you may be considered for a full-time role and/or extension of the internship at the sole discretion of VAMTech Pvt Ltd.
        </Text>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermarkContainer} fixed>
          <Text style={styles.watermarkText}>VMTech</Text>
        </View>

        {/* 7. Confidentiality */}
        <Text style={styles.sectionHeader}>7. Confidentiality</Text>
        <Text style={styles.paragraph}>
          During and after the term of this internship, you agree to keep confidential all proprietary information, source code, business data, and trade secrets of VAMTech Pvt Ltd and its clients, and not to disclose the same to any third party without prior written consent.
        </Text>

        {/* 8. Code of Conduct */}
        <Text style={styles.sectionHeader}>8. Code of Conduct</Text>
        <Text style={styles.paragraph}>
          You are expected to adhere to VAMTech Pvt Ltd&apos;s policies, code of conduct, and instructions issued by your reporting manager from time to time, including those related to attendance, data security, and use of company resources.
        </Text>

        {/* 9. Termination */}
        <Text style={styles.sectionHeader}>9. Termination</Text>
        <Text style={styles.paragraph}>
          Either party may terminate this internship by providing 7 days&apos; written notice. VAMTech Pvt Ltd reserves the right to terminate this internship with immediate effect in case of misconduct, breach of confidentiality, or unsatisfactory performance.
        </Text>

        {/* 10. Certificate and Letter of Recommendation */}
        <Text style={styles.sectionHeader}>10. Certificate and Letter of Recommendation</Text>
        <Text style={styles.paragraph}>
          On successful completion of the internship, you will be issued an Internship Completion Certificate. A Letter of Recommendation may be provided based on your performance during the internship.
        </Text>

        {/* Closing paragraph */}
        <Text style={styles.closingText}>
          Please sign and return a copy of this letter to indicate your acceptance of the above terms and conditions. We look forward to having you on the VAMTech team and wish you a great learning experience with us.
        </Text>

        {/* Sign-off */}
        <View style={styles.signOffSection}>
          <Text style={styles.paragraph}>Warm regards,</Text>
          <Text style={styles.paragraph}>For VAMTech Pvt Ltd,</Text>
          <View style={styles.signLine} />
          <Text style={styles.hrName}>{details.hrName || 'Aditya Gupta'}</Text>
          <Text style={styles.hrTitle}>HR, VAMTech Pvt Ltd</Text>
        </View>

        <View style={styles.pageDivider} />

        {/* Candidate Acceptance */}
        <View>
          <Text style={styles.acceptanceTitle}>Acceptance</Text>
          <Text style={styles.acceptanceText}>
            I, {details.candidateName}, accept the offer of internship as {roleName} at VAMTech Pvt Ltd on the terms and conditions mentioned above.
          </Text>
          <View style={styles.signLine} />
          <Text style={styles.hrTitle}>Candidate Signature & Date</Text>
        </View>
      </Page>
    </PDFDocument>
  );
};

export const UnpaidInternshipPDF: React.FC<{ details: OfferDetails }> = ({ details }) => {
  return <InternshipOfferPDF details={details} isPaid={false} />;
};

export const PaidInternshipPDF: React.FC<{ details: OfferDetails }> = ({ details }) => {
  return <InternshipOfferPDF details={details} isPaid={true} />;
};

export const FullTimeOfferPDF: React.FC<{ details: OfferDetails }> = ({ details }) => {
  const logoUri = getLogoDataUri();
  const ctcText = details.annualCtc
    ? `INR ${details.annualCtc.toLocaleString('en-IN')} (${numberToWords(details.annualCtc)}) per annum`
    : 'INR 1,200,000 (Twelve Lakh Rupees Only) per annum';

  return (
    <PDFDocument title={`Offer_Letter_${details.offerRefNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.watermarkContainer} fixed>
          <Text style={styles.watermarkText}>VMTech</Text>
        </View>

        <View style={styles.header}>
          <Image src={logoUri} style={styles.logo} />
          <Text style={styles.companySub1}>VAMTech Pvt Ltd | Custom Software & AI Engineering</Text>
          <Text style={styles.companySub2}>
            Tiwariganj, Lucknow, Uttar Pradesh 226028, India | contactvamtech@gmail.com | +91 72379 00686 | www.vamtech.in
          </Text>
        </View>
        <View style={styles.dividerLine} />

        <View style={styles.metaSection}>
          <Text style={styles.metaText}>
            <Text style={styles.bold}>Date: </Text>{details.date}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.bold}>Ref No: </Text>{details.offerRefNumber}
          </Text>
        </View>

        <View style={styles.toSection}>
          <Text style={styles.bold}>To,</Text>
          <Text style={styles.toName}>{details.candidateName}</Text>
          <Text style={styles.toLine}>
            {details.candidateAddress}
            {details.candidateEmail ? ` | ${details.candidateEmail}` : ''}
            {details.candidatePhone ? ` | ${details.candidatePhone}` : ''}
          </Text>
        </View>

        <View style={styles.subjectSection}>
          <Text style={styles.subjectText}>
            Subject: Offer of Employment — {details.designation} (Full-Time)
          </Text>
        </View>

        <Text style={styles.salutation}>Dear {details.candidateName.split(' ')[0] || details.candidateName},</Text>
        <Text style={styles.paragraph}>
          We are pleased to offer you full-time employment at VAMTech Pvt Ltd as <Text style={styles.bold}>{details.designation}</Text> in our <Text style={styles.bold}>{details.department}</Text> team.
        </Text>

        <View style={{ marginVertical: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: 5 }}>
            <Text style={{ width: '40%', fontWeight: 'bold' }}>Designation:</Text>
            <Text style={{ width: '60%' }}>{details.designation}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: 5 }}>
            <Text style={{ width: '40%', fontWeight: 'bold' }}>Department:</Text>
            <Text style={{ width: '60%' }}>{details.department}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: 5 }}>
            <Text style={{ width: '40%', fontWeight: 'bold' }}>Date of Joining:</Text>
            <Text style={{ width: '60%' }}>{details.dateOfJoining || 'Immediate'}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: 5 }}>
            <Text style={{ width: '40%', fontWeight: 'bold' }}>Annual CTC:</Text>
            <Text style={{ width: '60%', fontWeight: 'bold', color: '#15803d' }}>{ctcText}</Text>
          </View>
          <View style={{ flexDirection: 'row', padding: 5 }}>
            <Text style={{ width: '40%', fontWeight: 'bold' }}>Work Location:</Text>
            <Text style={{ width: '60%' }}>{details.workLocation || 'Hybrid / Remote'}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>1. Terms of Employment</Text>
        <Text style={styles.paragraph}>
          Your employment will be governed by the standard HR policies and code of conduct of VAMTech Pvt Ltd.
        </Text>

        <View style={styles.signOffSection}>
          <Text style={styles.paragraph}>Warm regards,</Text>
          <Text style={styles.paragraph}>For VAMTech Pvt Ltd,</Text>
          <View style={styles.signLine} />
          <Text style={styles.hrName}>{details.hrName || 'Aditya Gupta'}</Text>
          <Text style={styles.hrTitle}>HR, VAMTech Pvt Ltd</Text>
        </View>

        <View style={styles.pageDivider} />

        <View>
          <Text style={styles.acceptanceTitle}>Acceptance</Text>
          <Text style={styles.acceptanceText}>
            I, {details.candidateName}, accept the offer of employment as {details.designation} at VAMTech Pvt Ltd.
          </Text>
          <View style={styles.signLine} />
          <Text style={styles.hrTitle}>Candidate Signature & Date</Text>
        </View>
      </Page>
    </PDFDocument>
  );
};

/**
 * Generate PDF Buffer for selected offer letter type
 */
export async function generateOfferLetterPDFBuffer(
  type: 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME',
  details: OfferDetails
): Promise<Buffer> {
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

/**
 * Generate PDF Buffer for generic employee vault document
 */
export async function generateVaultDocumentPDFBuffer({
  title,
  type,
  userName,
  userEmail,
  uploadedBy,
}: {
  title: string;
  type: string;
  userName: string;
  userEmail: string;
  uploadedBy?: string;
}): Promise<Buffer> {
  const logoUri = getLogoDataUri();
  const docElement = (
    <PDFDocument>
      <Page size="A4" style={styles.page}>
        <View style={styles.watermarkContainer} fixed>
          <Text style={styles.watermarkText}>VMTech</Text>
        </View>

        <View style={styles.header}>
          <Image src={logoUri} style={styles.logo} />
          <Text style={styles.companySub1}>VAMTech Pvt Ltd | Custom Software & AI Engineering</Text>
          <Text style={styles.companySub2}>
            Tiwariganj, Lucknow, Uttar Pradesh 226028, India | contactvamtech@gmail.com | +91 72379 00686 | www.vamtech.in
          </Text>
        </View>
        <View style={styles.dividerLine} />

        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#f9572a', marginBottom: 15 }}>{title}</Text>

        <View style={{ backgroundColor: '#f8fafc', padding: 15, borderRadius: 6, marginBottom: 20 }}>
          <Text style={{ fontSize: 10, color: '#334155', marginBottom: 6 }}>
            <Text style={{ fontWeight: 'bold' }}>Employee Name: </Text>{userName} ({userEmail})
          </Text>
          <Text style={{ fontSize: 10, color: '#334155', marginBottom: 6 }}>
            <Text style={{ fontWeight: 'bold' }}>Document Type: </Text>{type}
          </Text>
          <Text style={{ fontSize: 10, color: '#334155' }}>
            <Text style={{ fontWeight: 'bold' }}>Issued By: </Text>{uploadedBy || 'HR Administration'}
          </Text>
        </View>

        <Text style={{ fontSize: 10, color: '#64748b', lineHeight: 1.5 }}>
          This official digital record was retrieved from the authenticated employee document repository on portal.vamtech.in.
        </Text>

        <Text style={{ position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8' }}>
          VAMTech Pvt Ltd &bull; portal.vamtech.in &bull; Private & Confidential
        </Text>
      </Page>
    </PDFDocument>
  );

  const pdfStream = (await pdf(docElement).toBuffer()) as unknown as NodeJS.ReadableStream;
  const chunks: Uint8Array[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
