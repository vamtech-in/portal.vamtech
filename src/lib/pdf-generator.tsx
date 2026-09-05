import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Statically import standard fonts so Next.js serverless NFT bundler includes them in Lambda container
import 'pdfkit/standard-fonts/Helvetica';
import 'pdfkit/standard-fonts/HelveticaBold';
import 'pdfkit/standard-fonts/HelveticaOblique';
import 'pdfkit/standard-fonts/HelveticaBoldOblique';
import 'pdfkit/standard-fonts/TimesRoman';
import 'pdfkit/standard-fonts/TimesBold';

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

/**
 * Generate PDF Buffer for selected offer letter type using native high-performance PDFKit
 */
export function generateOfferLetterPDFBuffer(
  type: 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME',
  details: OfferDetails
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 32, bottom: 32, left: 45, right: 45 },
        info: {
          Title: `Offer_Letter_${details.offerRefNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          Author: 'VAMTech Pvt Ltd',
          Subject: 'Official Offer Letter',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const logoPath = path.join(process.cwd(), 'public', 'images', 'vamtech-logo.png');

      // Helper function to draw company header
      const drawHeader = () => {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, (doc.page.width - 145) / 2, 28, { width: 145 });
          doc.y = 76;
        } else {
          doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text('VAMTech Pvt Ltd', { align: 'center' });
        }
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#374151')
           .text('VAMTech Pvt Ltd | Custom Software & AI Engineering', { align: 'center' });
        doc.fontSize(7.5).font('Helvetica').fillColor('#4b5563')
           .text('Tiwariganj, Lucknow, Uttar Pradesh 226028, India | contactvamtech@gmail.com | +91 72379 00686 | www.vamtech.in', { align: 'center' });

        doc.moveDown(0.4);
        doc.strokeColor('#111827').lineWidth(1)
           .moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
        doc.moveDown(0.5);
      };

      // Helper function to draw watermark
      const drawWatermark = () => {
        doc.save();
        doc.fontSize(90).font('Helvetica-Bold').fillColor('#cbd5e1').fillOpacity(0.12);
        doc.rotate(-32, { origin: [doc.page.width / 2, doc.page.height / 2] });
        doc.text('VMTech', (doc.page.width - 320) / 2, doc.page.height / 2 - 45, {
          width: 320,
          align: 'center',
          lineBreak: false,
        });
        doc.restore();
      };

      // Helper function to draw footer
      const drawFooter = () => {
        const bottomY = doc.page.height - 28;
        doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
           .text('VAMTech Pvt Ltd • portal.vamtech.in • Private & Confidential', 45, bottomY, {
             width: doc.page.width - 90,
             align: 'center',
           });
      };

      // ================= PAGE 1 =================
      drawWatermark();
      drawHeader();

      // Meta Section (Ref & Date)
      const metaY = doc.y;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827')
         .text('Ref: ', 45, metaY, { continued: true }).font('Helvetica').text(details.offerRefNumber);
      doc.fontSize(9.5).font('Helvetica-Bold')
         .text('Date: ', doc.page.width - 200, metaY, { width: 155, align: 'right', continued: true })
         .font('Helvetica').text(details.date);

      doc.moveDown(0.7);

      // To Section
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('To,');
      doc.fontSize(9.5).font('Helvetica-Bold').text(details.candidateName);
      doc.fontSize(9).font('Helvetica').fillColor('#374151').text(details.candidateAddress || 'Lucknow, Uttar Pradesh, 226028');
      if (details.candidateEmail || details.candidatePhone) {
        doc.fontSize(9).font('Helvetica').fillColor('#374151')
           .text(`${details.candidateEmail}${details.candidatePhone ? ` | ${details.candidatePhone}` : ''}`);
      }

      doc.moveDown(0.7);

      // Subject
      const isInternship = type === 'UNPAID_INTERNSHIP' || type === 'PAID_INTERNSHIP';
      const isPaid = type === 'PAID_INTERNSHIP';
      const subjectText = isInternship
        ? `Sub: Offer of Internship for the position of ${details.designation}`
        : `Sub: Offer of Employment - ${details.designation}`;

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
         .text(subjectText, 45, doc.y, { align: 'center', underline: true, width: doc.page.width - 90 });

      doc.moveDown(0.7);

      // Salutation & Intro
      const firstName = details.candidateName ? details.candidateName.split(' ')[0] : 'Candidate';
      doc.fontSize(9.5).font('Helvetica').fillColor('#111827')
         .text(`Dear ${firstName},`);
      doc.moveDown(0.4);

      if (isInternship) {
        doc.fontSize(9.5).font('Helvetica').fillColor('#111827').lineGap(2)
           .text(`We are pleased to offer you an internship opportunity with VAMTech Pvt Ltd as ${details.designation}. We believe your skills and enthusiasm will be a valuable addition to our engineering team.`, { align: 'justify' });
        doc.moveDown(0.5);

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('Terms and Conditions of Internship:');
        doc.moveDown(0.3);

        const items = [
          `1. Designation & Department: You will be designated as ${details.designation} in the ${details.department || 'Engineering'} Department.`,
          `2. Duration & Schedule: The internship will be for a duration of ${details.duration || '3 months'}, starting from ${details.startDate || details.date} to ${details.endDate || '5 December 2026'}. Working hours will be ${details.workingHours || '10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)'}.`,
          `3. Work Location: Your work location will be ${details.workLocation || 'Remote'}. You will report to ${details.reportingManager || 'Aditya Gupta, HR'}.`,
          isPaid
            ? `4. Stipend: You will receive a monthly stipend of Rs. ${(details.stipendAmount || 5000).toLocaleString('en-IN')}/- upon satisfactory performance.`
            : `4. Stipend: This is an unpaid internship for learning and skill development. No financial stipend will be provided.`,
          `5. Confidentiality: You will be required to sign and adhere to the company's Non-Disclosure Agreement (NDA). Any proprietary technology, codebase, client data, or business strategy must be kept strictly confidential during and after your internship.`,
          `6. Intellectual Property: Any software, code, designs, or documentation produced during your internship shall remain the exclusive intellectual property of VAMTech Pvt Ltd.`,
          `7. Code of Conduct: You are expected to conduct yourself in a professional manner, follow company policies, maintain clear communication with your mentor, and deliver tasks within agreed timelines.`,
        ];

        items.forEach((it) => {
          doc.fontSize(9.5).font('Helvetica').fillColor('#111827').text(it, 55, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 1.5 });
          doc.moveDown(0.25);
        });
      } else {
        // Full time
        doc.fontSize(9.5).font('Helvetica').fillColor('#111827').lineGap(2)
           .text(`We are pleased to offer you the position of ${details.designation} at VAMTech Pvt Ltd. We believe your experience and capabilities will significantly contribute to our growth and innovation.`, { align: 'justify' });
        doc.moveDown(0.5);

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('Terms and Conditions of Employment:');
        doc.moveDown(0.3);

        const items = [
          `1. Designation: ${details.designation} in the ${details.department || 'Engineering'} Department.`,
          `2. Date of Joining: Your employment will commence on ${details.dateOfJoining || details.startDate || details.date}.`,
          `3. Compensation: Your Annual Cost to Company (CTC) will be Rs. ${(details.annualCtc || 1200000).toLocaleString('en-IN')}/- as per agreed structure.`,
          `4. Probation Period: You will be on probation for a period of ${details.probationPeriod || '6 Months'} from the date of joining.`,
          `5. Notice Period: Following confirmation, either party may terminate employment with ${details.noticePeriod || '60 Days'} written notice or salary in lieu thereof.`,
          `6. Confidentiality & IP: All proprietary systems, trade secrets, software code, and client confidential information remain exclusive property of VAMTech Pvt Ltd.`,
        ];

        items.forEach((it) => {
          doc.fontSize(9.5).font('Helvetica').fillColor('#111827').text(it, 55, doc.y, { width: doc.page.width - 100, align: 'justify', lineGap: 1.5 });
          doc.moveDown(0.25);
        });
      }

      drawFooter();

      // ================= PAGE 2 =================
      doc.addPage({ size: 'A4', margins: { top: 32, bottom: 32, left: 45, right: 45 } });
      drawWatermark();
      drawHeader();

      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('8. Termination:');
      doc.fontSize(9.5).font('Helvetica').fillColor('#111827').lineGap(1.5)
         .text('The company reserves the right to terminate this agreement immediately without notice in the event of misconduct, breach of confidentiality, violation of company policies, or non-performance.', 55, doc.y, { width: doc.page.width - 100, align: 'justify' });

      doc.moveDown(0.5);
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('9. Certificate & Documentation:');
      doc.fontSize(9.5).font('Helvetica').fillColor('#111827').lineGap(1.5)
         .text('Upon successful completion of the tenure and satisfactory fulfillment of assigned responsibilities, you will be awarded an official Certificate of Completion and Letter of Recommendation (LOR) or Service Relieving Letter.', 55, doc.y, { width: doc.page.width - 100, align: 'justify' });

      doc.moveDown(0.8);
      doc.fontSize(9.5).font('Helvetica').fillColor('#111827')
         .text('Please confirm your acceptance of this offer by signing and returning the duplicate copy of this letter within 3 business days.');

      doc.moveDown(1.2);
      doc.fontSize(9.5).font('Helvetica').fillColor('#111827').text('Sincerely,');
      doc.fontSize(9.5).font('Helvetica-Bold').text('For VAMTech Pvt Ltd');

      doc.moveDown(1.8);
      doc.strokeColor('#64748b').lineWidth(1)
         .moveTo(45, doc.y).lineTo(220, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text(details.hrName || 'Aditya Gupta');
      doc.fontSize(9).font('Helvetica').fillColor('#4b5563').text('HR & Talent Acquisition Team');
      doc.fontSize(8.5).font('Helvetica').fillColor('#64748b').text('contactvamtech@gmail.com | +91 72379 00686');

      doc.moveDown(1.2);
      doc.strokeColor('#94a3b8').lineWidth(1)
         .moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
      doc.moveDown(0.8);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('Acceptance of Offer');
      doc.moveDown(0.3);
      doc.fontSize(9.5).font('Helvetica').fillColor('#111827').lineGap(1.5)
         .text(`I, ${details.candidateName}, have read, understood, and accept the terms and conditions outlined in this offer letter. I confirm my acceptance of the offer for the position of ${details.designation} at VAMTech Pvt Ltd.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });

      doc.moveDown(2.2);
      doc.strokeColor('#64748b').lineWidth(1)
         .moveTo(45, doc.y).lineTo(250, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('Candidate Signature & Date');

      drawFooter();

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Generate PDF Buffer for generic employee vault document
 */
export function generateVaultDocumentPDFBuffer(params: {
  title: string;
  type: string;
  userName: string;
  userEmail: string;
  uploadedBy?: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 32, bottom: 32, left: 45, right: 45 },
        info: {
          Title: params.title,
          Author: 'VAMTech Pvt Ltd',
          Subject: params.type,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const logoPath = path.join(process.cwd(), 'public', 'images', 'vamtech-logo.png');

      // Watermark
      doc.save();
      doc.fontSize(90).font('Helvetica-Bold').fillColor('#cbd5e1').fillOpacity(0.12);
      doc.rotate(-32, { origin: [doc.page.width / 2, doc.page.height / 2] });
      doc.text('VMTech', (doc.page.width - 320) / 2, doc.page.height / 2 - 45, {
        width: 320,
        align: 'center',
        lineBreak: false,
      });
      doc.restore();

      // Header
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, (doc.page.width - 145) / 2, 28, { width: 145 });
        doc.y = 76;
      } else {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text('VAMTech Pvt Ltd', { align: 'center' });
      }
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#374151')
         .text('VAMTech Pvt Ltd | Custom Software & AI Engineering', { align: 'center' });
      doc.fontSize(7.5).font('Helvetica').fillColor('#4b5563')
         .text('Tiwariganj, Lucknow, Uttar Pradesh 226028, India | contactvamtech@gmail.com | +91 72379 00686 | www.vamtech.in', { align: 'center' });

      doc.moveDown(0.4);
      doc.strokeColor('#111827').lineWidth(1)
         .moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
      doc.moveDown(1);

      // Title
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#f9572a').text(params.title);
      doc.moveDown(0.8);

      // Details Box
      const boxY = doc.y;
      doc.rect(45, boxY, doc.page.width - 90, 70).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#334155').fontSize(10);
      doc.font('Helvetica-Bold').text('Employee Name: ', 60, boxY + 14, { continued: true })
         .font('Helvetica').text(`${params.userName} (${params.userEmail})`);
      doc.font('Helvetica-Bold').text('Document Type: ', 60, boxY + 32, { continued: true })
         .font('Helvetica').text(params.type);
      doc.font('Helvetica-Bold').text('Issued By: ', 60, boxY + 50, { continued: true })
         .font('Helvetica').text(params.uploadedBy || 'HR Administration');

      doc.y = boxY + 90;
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').lineGap(2)
         .text('This official digital record was retrieved from the authenticated employee document repository on portal.vamtech.in. The digital record serves as certified verification of employment documentation issued by VAMTech Pvt Ltd.', 45, doc.y, { width: doc.page.width - 90, align: 'justify' });

      // Footer
      const bottomY = doc.page.height - 28;
      doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
         .text('VAMTech Pvt Ltd • portal.vamtech.in • Private & Confidential', 45, bottomY, {
           width: doc.page.width - 90,
           align: 'center',
         });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
