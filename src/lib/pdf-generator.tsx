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
import { numberToWords } from './number-to-words';

/**
 * Generate PDF Buffer for selected offer letter type matching the official VAMTech 2-page template
 */
export function generateOfferLetterPDFBuffer(
  type: 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME',
  details: OfferDetails
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 30, bottom: 28, left: 45, right: 45 },
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
          doc.image(logoPath, (doc.page.width - 145) / 2, 24, { width: 145 });
          doc.y = 70;
        } else {
          doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text('VAMTech Pvt Ltd', { align: 'center' });
        }
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#374151')
           .text('VAMTech Pvt Ltd | Custom Software & AI Engineering', { align: 'center' });
        doc.fontSize(7.5).font('Helvetica').fillColor('#4b5563')
           .text('Tiwariganj, Lucknow, Uttar Pradesh 226028, India | contactvamtech@gmail.com | +91 72379 00686 | www.vamtech.in', { align: 'center' });

        doc.moveDown(0.35);
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

      // Helper to draw clean bullet point
      const drawBulletItem = (text: string, indent: number = 60, widthReduction: number = 105) => {
        const itemY = doc.y;
        doc.circle(indent - 7, itemY + 4.5, 1.6).fill('#111827');
        doc.fontSize(9).font('Helvetica').fillColor('#111827')
           .text(text, indent, itemY, { width: doc.page.width - widthReduction, align: 'left', lineGap: 1.2 });
        doc.moveDown(0.15);
      };

      const isInternship = type === 'UNPAID_INTERNSHIP' || type === 'PAID_INTERNSHIP';
      const isPaid = type === 'PAID_INTERNSHIP';
      const firstName = details.candidateName ? details.candidateName.split(' ')[0] : 'Candidate';

      // ================= PAGE 1 =================
      drawWatermark();
      drawHeader();

      // Date & Ref No (matching template)
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827')
         .text('Date: ', 45, doc.y, { continued: true })
         .font('Helvetica').text(details.date);
      doc.fontSize(9.5).font('Helvetica-Bold')
         .text('Ref No: ', 45, doc.y, { continued: true })
         .font('Helvetica').text(details.offerRefNumber);

      doc.moveDown(0.5);

      // To Section
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('To,');
      doc.fontSize(9.5).font('Helvetica-Bold').text(details.candidateName);
      if (details.candidateAddress) {
        doc.fontSize(9).font('Helvetica').fillColor('#111827').text(details.candidateAddress);
      }
      const contactLine = [
        details.candidateEmail,
        details.candidatePhone,
      ].filter(Boolean).join(' | ');
      if (contactLine) {
        doc.fontSize(9).font('Helvetica').fillColor('#111827').text(contactLine);
      }

      doc.moveDown(0.55);

      // Subject line (Centered, Bold, Underlined)
      const subjectText = isInternship
        ? `Subject: Offer of Internship — ${details.designation} (${isPaid ? 'Paid' : 'Unpaid'})`
        : `Subject: Offer of Employment — ${details.designation}`;

      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#000000')
         .text(subjectText, 45, doc.y, { align: 'center', underline: true, width: doc.page.width - 90 });

      doc.moveDown(0.55);

      // Salutation
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text(`Dear ${firstName},`);
      doc.moveDown(0.3);

      // Opening paragraphs
      const openingP1 = isInternship
        ? `We are pleased to offer you the position of ${details.designation} at VAMTech Pvt Ltd, based on your application and the subsequent interview(s) held with our team. We were impressed with your skills and enthusiasm, and we believe you will be a valuable addition to our team.`
        : `We are pleased to offer you the position of ${details.designation} at VAMTech Pvt Ltd, based on your application and the subsequent interview(s) held with our team. We believe your experience and capabilities will significantly contribute to our growth and innovation.`;

      doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
         .text(openingP1, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
      doc.moveDown(0.3);

      const openingP2 = isInternship
        ? `This letter outlines the terms and conditions of your internship. Please read them carefully, and if you agree, sign and return a copy of this letter to us as a token of your acceptance.`
        : `This letter outlines the terms and conditions of your employment. Please read them carefully, and if you agree, sign and return a copy of this letter to us as a token of your acceptance.`;

      doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
         .text(openingP2, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
      doc.moveDown(0.4);

      if (isInternship) {
        // Section 1: Position and Role
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('1. Position and Role');
        doc.moveDown(0.2);
        drawBulletItem(`Designation: ${details.designation}`);
        drawBulletItem(`Department: ${details.department || 'Engineering'}`);
        drawBulletItem(`Reporting Manager: ${details.reportingManager || 'Aditya Gupta, HR'}`);
        drawBulletItem(`Work Location: ${details.workLocation || 'Remote'}`);
        doc.moveDown(0.3);

        // Section 2: Duration
        const durationText = details.duration || '3 months';
        const startText = details.startDate || '5 September 2026';
        const endText = details.endDate || '5 December 2026';
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('2. Duration');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
           .text(`The internship will be for a period of ${durationText}, commencing on ${startText} and ending on ${endText}, unless extended or terminated earlier as per the terms below.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.3);

        // Section 3: Stipend
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('3. Stipend');
        if (isPaid) {
          const amount = details.stipendAmount || 5000;
          const words = numberToWords(amount);
          doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
             .text(`You will be paid a monthly stipend of Rs. ${amount.toLocaleString('en-IN')} (${words}), payable on or before the 7th of every month, subject to applicable deductions, if any.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        } else {
          doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
             .text(`This is an unpaid internship. No stipend, salary, or monetary compensation will be paid for the duration of the internship. Any expenses incurred, if applicable, will be governed by VAMTech Pvt Ltd's policy in this regard, if any.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        }
        doc.moveDown(0.3);

        // Section 4: Working Hours
        const hoursText = details.workingHours || '10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)';
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('4. Working Hours');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
           .text(`Your standard working hours will be from ${hoursText}. You may occasionally be required to put in additional hours to meet project deadlines.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.3);

        // Section 5: Roles and Responsibilities
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('5. Roles and Responsibilities');
        doc.moveDown(0.2);
        drawBulletItem('Design, develop, and maintain full stack web applications (frontend and backend).');
        drawBulletItem('Build and integrate RESTful APIs and work with databases as required.');
        drawBulletItem('Write clean, maintainable, and well-documented code.');
        drawBulletItem('Participate in code reviews, stand-ups, and sprint planning sessions.');
        drawBulletItem('Assist in debugging, testing, and deploying features under guidance.');
        doc.moveDown(0.3);

        // Section 6: Probation and Performance Review
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('6. Probation and Performance Review');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
           .text(`Your performance will be reviewed periodically during the internship. Based on your performance, conduct, and business requirements, you may be considered for a full-time role and/or extension of the internship at the sole discretion of VAMTech Pvt Ltd.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
      } else {
        // Full Time Page 1
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('1. Position and Role');
        doc.moveDown(0.2);
        drawBulletItem(`Designation: ${details.designation}`);
        drawBulletItem(`Department: ${details.department || 'Engineering'}`);
        drawBulletItem(`Reporting Manager: ${details.reportingManager || 'Aditya Gupta, HR'}`);
        drawBulletItem(`Work Location: ${details.workLocation || 'Remote'}`);
        doc.moveDown(0.3);

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('2. Date of Joining');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
           .text(`Your employment will commence on ${details.dateOfJoining || details.startDate || details.date}, unless mutually agreed otherwise in writing.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.3);

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('3. Compensation');
        const ctc = details.annualCtc || 1200000;
        const ctcWords = numberToWords(ctc);
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
           .text(`Your Annual Cost to Company (CTC) will be Rs. ${ctc.toLocaleString('en-IN')} (${ctcWords}), payable on a monthly basis subject to statutory tax deductions and company policy.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.3);

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('4. Working Hours');
        const ftHours = details.workingHours || '10:00 AM to 6:00 PM, 5 days a week (Monday to Friday)';
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
           .text(`Your standard working hours will be from ${ftHours}. You may occasionally be required to put in additional hours to meet project milestones.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.3);

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('5. Roles and Responsibilities');
        doc.moveDown(0.2);
        drawBulletItem('Lead architecture, development, and maintenance of scalable web applications.');
        drawBulletItem('Develop robust RESTful and real-time backend microservices with database design.');
        drawBulletItem('Write maintainable, performant, and well-tested code following best practices.');
        drawBulletItem('Collaborate with cross-functional teams, conduct code reviews, and mentor engineers.');
        drawBulletItem('Drive continuous delivery, performance optimization, and system reliability.');
        doc.moveDown(0.3);

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('6. Probation and Confirmation');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.2)
           .text(`You will be on probation for a period of ${details.probationPeriod || '6 Months'} from your date of joining. Upon satisfactory performance, your services will be confirmed in writing.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
      }

      // ================= PAGE 2 =================
      doc.addPage({ size: 'A4', margins: { top: 40, bottom: 35, left: 45, right: 45 } });
      drawWatermark();

      if (isInternship) {
        // Section 7: Confidentiality
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('7. Confidentiality', 45, 40);
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`During and after the term of this internship, you agree to keep confidential all proprietary information, source code, business data, and trade secrets of VAMTech Pvt Ltd and its clients, and not to disclose the same to any third party without prior written consent.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.6);

        // Section 8: Code of Conduct
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('8. Code of Conduct');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`You are expected to adhere to VAMTech Pvt Ltd's policies, code of conduct, and instructions issued by your reporting manager from time to time, including those related to attendance, data security, and use of company resources.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.6);

        // Section 9: Termination
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('9. Termination');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`Either party may terminate this internship by providing 7 days' written notice. VAMTech Pvt Ltd reserves the right to terminate this internship with immediate effect in case of misconduct, breach of confidentiality, or unsatisfactory performance.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.6);

        // Section 10: Certificate and Letter of Recommendation
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('10. Certificate and Letter of Recommendation');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`On successful completion of the internship, you will be issued an Internship Completion Certificate. A Letter of Recommendation may be provided based on your performance during the internship.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.7);

        // Closing note
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`Please sign and return a copy of this letter to indicate your acceptance of the above terms and conditions. We look forward to having you on the VAMTech team and wish you a great learning experience with us.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(1.2);

        // Sign-off
        doc.fontSize(9).font('Helvetica').fillColor('#111827').text('Warm regards,');
        doc.fontSize(9).font('Helvetica-Bold').text('For VAMTech Pvt Ltd,');
        doc.moveDown(2.2);

        // Line for signature
        doc.strokeColor('#475569').lineWidth(0.8)
           .moveTo(45, doc.y).lineTo(190, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text(details.hrName || 'Aditya Gupta');
        doc.fontSize(9).font('Helvetica').fillColor('#374151').text('HR, VAMTech Pvt Ltd');
        doc.moveDown(1.4);

        // Divider
        doc.strokeColor('#94a3b8').lineWidth(0.8)
           .moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
        doc.moveDown(0.8);

        // Acceptance Block
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('Acceptance');
        doc.moveDown(0.3);
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`I, ${details.candidateName}, accept the offer of internship as ${details.designation} at VAMTech Pvt Ltd on the terms and conditions mentioned above.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(2.5);

        // Candidate Signature Line
        doc.strokeColor('#475569').lineWidth(0.8)
           .moveTo(45, doc.y).lineTo(230, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(9).font('Helvetica').fillColor('#374151').text('Candidate Signature & Date');
      } else {
        // Full Time Page 2
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('7. Confidentiality and Intellectual Property', 45, 40);
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`During and after your employment with VAMTech Pvt Ltd, you agree to maintain absolute confidentiality regarding all proprietary information, trade secrets, software code, client records, and business data. All intellectual property developed during your tenure belongs exclusively to VAMTech Pvt Ltd.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.6);

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('8. Code of Conduct');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`You are required to adhere to VAMTech Pvt Ltd's policies, ethical standards, security guidelines, and professional code of conduct at all times, maintaining diligence, integrity, and respect for company resources.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.6);

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('9. Notice Period and Termination');
        const noticePeriod = details.noticePeriod || '60 Days';
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`Following probation confirmation, either party may terminate employment by giving ${noticePeriod} written notice or gross salary in lieu thereof. The company reserves the right to terminate employment immediately without notice in cases of gross misconduct or breach of confidentiality.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.6);

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text('10. Documentation and Relieving');
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`Upon successful completion of tenure, satisfactory handover of assets, and settlement of obligations, you will be issued a formal Service Relieving Certificate and Work Experience Letter.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(0.7);

        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`Please sign and return a copy of this letter to indicate your acceptance of the above terms and conditions. We look forward to welcoming you to VAMTech and building high-impact technology together.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(1.2);

        // Sign-off
        doc.fontSize(9).font('Helvetica').fillColor('#111827').text('Warm regards,');
        doc.fontSize(9).font('Helvetica-Bold').text('For VAMTech Pvt Ltd,');
        doc.moveDown(2.2);

        // Line for signature
        doc.strokeColor('#475569').lineWidth(0.8)
           .moveTo(45, doc.y).lineTo(190, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#111827').text(details.hrName || 'Aditya Gupta');
        doc.fontSize(9).font('Helvetica').fillColor('#374151').text('HR, VAMTech Pvt Ltd');
        doc.moveDown(1.4);

        // Divider
        doc.strokeColor('#94a3b8').lineWidth(0.8)
           .moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
        doc.moveDown(0.8);

        // Acceptance Block
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('Acceptance');
        doc.moveDown(0.3);
        doc.fontSize(9).font('Helvetica').fillColor('#111827').lineGap(1.3)
           .text(`I, ${details.candidateName}, accept the offer of employment as ${details.designation} at VAMTech Pvt Ltd on the terms and conditions mentioned above.`, 45, doc.y, { width: doc.page.width - 90, align: 'justify' });
        doc.moveDown(2.5);

        // Candidate Signature Line
        doc.strokeColor('#475569').lineWidth(0.8)
           .moveTo(45, doc.y).lineTo(230, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(9).font('Helvetica').fillColor('#374151').text('Candidate Signature & Date');
      }

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
