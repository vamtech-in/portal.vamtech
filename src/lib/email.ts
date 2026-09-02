import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface DevEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: Date;
}

// In-memory log for local testing & outbox preview
export const devEmailOutbox: DevEmail[] = [];

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string }> {
  console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);

  // Store in Dev Outbox
  const emailItem: DevEmail = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    to,
    subject,
    html,
    sentAt: new Date(),
  };
  devEmailOutbox.unshift(emailItem);

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: 'VAMTech Portal <portal@vamtech.in>',
        to: [to],
        subject,
        html,
      });
      return { success: true, id: response.data?.id };
    } catch (err) {
      console.error('[EMAIL ERROR]', err);
    }
  }

  return { success: true, id: emailItem.id };
}

/**
 * 1. Application Confirmation Email to Candidate
 */
export async function sendApplicationConfirmationEmail(email: string, name: string, refNumber: string, role: string) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #0f172a; font-size: 24px; margin: 0;">VAMTech Pvt Ltd</h1>
        <p style="color: #f9572a; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Job Application Confirmation</p>
      </div>
      <p style="font-size: 16px; color: #334155;">Dear ${name},</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Thank you for applying for the position of <strong>${role}</strong> at VAMTech Pvt Ltd. We have received your application and forwarded your profile directly to our HR Recruitment Team.
      </p>
      <div style="background: #fff5f2; border-left: 4px solid #f9572a; padding: 15px; margin: 25px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Your Candidate Reference Number</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #f9572a; font-family: monospace;">${refNumber}</p>
      </div>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        You can track your application status at any time on our portal:
      </p>
      <p style="text-align: center; margin: 25px 0;">
        <a href="https://portal.vamtech.in/status?ref=${refNumber}&email=${encodeURIComponent(email)}" 
           style="background: #f9572a; color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Check Application Status
        </a>
      </p>
      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
        Please save your reference number for future communication. Our HR team will review your application and reach out to you shortly.
      </p>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
        &copy; ${new Date().getFullYear()} VAMTech Pvt Ltd. Confidential Communication.
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Application Received - Candidate Ref: ${refNumber} | VAMTech`,
    html,
  });
}

/**
 * 2. Instant Email Notification Sent Directly to HR (admin@vamtech.in)
 */
export async function sendHiringNotificationToHR({
  refNumber,
  name,
  email,
  phone,
  roleApplied,
  linkedin,
  coverNote,
  resumeUrl,
}: {
  refNumber: string;
  name: string;
  email: string;
  phone: string;
  roleApplied: string;
  linkedin?: string | null;
  coverNote?: string | null;
  resumeUrl?: string | null;
}) {
  const hrEmail = process.env.HR_EMAIL || 'admin@vamtech.in';

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
      <div style="border-bottom: 2px solid #f9572a; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #0f172a; font-size: 22px; margin: 0;">⚡ New Candidate Application Received</h1>
        <p style="color: #64748b; font-size: 13px; margin: 5px 0 0 0;">VAMTech Internal Recruitment Alert</p>
      </div>

      <div style="background: #0f172a; color: #ffffff; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-family: monospace; display: block;">Candidate Reference Number</span>
        <span style="font-size: 22px; font-weight: bold; color: #f9572a; font-family: monospace;">${refNumber}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 140px; color: #0f172a;">Applicant Name:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">Role Applied For:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #f9572a; font-weight: bold;">${roleApplied}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">Email Address:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">Phone Number:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">${phone}</a></td>
        </tr>
        ${
          linkedin
            ? `<tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">LinkedIn:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="${linkedin}" style="color: #0284c7; text-decoration: underline;" target="_blank">View LinkedIn Profile</a></td>
              </tr>`
            : ''
        }
      </table>

      ${
        coverNote
          ? `<div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: bold; color: #64748b; uppercase; block; margin-bottom: 5px;">Candidate Cover Note:</span>
              <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5; font-style: italic;">"${coverNote}"</p>
            </div>`
          : ''
      }

      <div style="text-align: center; margin: 25px 0 10px 0;">
        <a href="https://portal.vamtech.in/hr" 
           style="background: #0f172a; color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-size: 13px;">
          Review Candidate on HR Portal →
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: hrEmail,
    subject: `[HR ALERT] New Applicant: ${name} (${roleApplied}) - Ref: ${refNumber}`,
    html,
  });
}

/**
 * 3. Offer Letter Notification Email
 */
export async function sendOfferLetterEmail({
  email,
  name,
  offerRefNumber,
  offerType,
}: {
  email: string;
  name: string;
  offerRefNumber: string;
  offerType: string;
}) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #0f172a; font-size: 24px; margin: 0;">VAMTech Pvt Ltd</h1>
        <p style="color: #f9572a; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Official Offer Letter Notification</p>
      </div>
      <p style="font-size: 16px; color: #334155;">Dear ${name},</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        We are delighted to extend an official offer of employment at VAMTech Pvt Ltd for the role specified in your application.
      </p>
      <div style="background: #fff5f2; border-left: 4px solid #f9572a; padding: 15px; margin: 25px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Offer Reference Number</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #f9572a; font-family: monospace;">${offerRefNumber}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #0f172a;">Type: <strong>${offerType.replace('_', ' ')}</strong></p>
      </div>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Your formal offer letter has been generated and attached to your application record. Please review the terms and communicate your acceptance with HR.
      </p>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
        VAMTech Pvt Ltd HR Team &bull; portal.vamtech.in
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Official Offer Letter (${offerRefNumber}) - VAMTech Pvt Ltd`,
    html,
  });
}

/**
 * 4. Employee Onboarding Credentials Email
 */
export async function sendOnboardingCredentialsEmail({
  email,
  name,
  employeeId,
  tempPassword,
}: {
  email: string;
  name: string;
  employeeId: string;
  tempPassword: string;
}) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Welcome to VAMTech!</h1>
        <p style="color: #f9572a; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Employee Portal Account Credentials</p>
      </div>
      <p style="font-size: 16px; color: #334155;">Dear ${name},</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Welcome to the team! Your employee account has been created on the internal VAMTech Portal.
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 25px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;"><strong>Employee ID:</strong> <span style="color: #f9572a; font-family: monospace; font-weight: bold;">${employeeId}</span></p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;"><strong>Login Email:</strong> <span style="color: #0f172a; font-weight: bold;">${email}</span></p>
        <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Temporary Password:</strong> <span style="color: #0284c7; font-family: monospace; background: #e0f2fe; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${tempPassword}</span></p>
      </div>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
        You will be required to change your temporary password immediately upon your first login.
      </p>
      <p style="text-align: center; margin: 25px 0;">
        <a href="https://portal.vamtech.in/login" 
           style="background: #f9572a; color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Log In to VAMTech Portal
        </a>
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to VAMTech - Employee Credentials (ID: ${employeeId})`,
    html,
  });
}

/**
 * 5. Leave Approval / Rejection Email
 */
export async function sendLeaveStatusEmail({
  email,
  name,
  leaveType,
  startDate,
  endDate,
  status,
  comment,
}: {
  email: string;
  name: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Rejected';
  comment?: string;
}) {
  const statusColor = status === 'Approved' ? '#16a34a' : '#dc2626';
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-top: 0;">Leave Request ${status}</h2>
      <p>Dear ${name},</p>
      <p>Your request for <strong>${leaveType} Leave</strong> from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been <span style="color: ${statusColor}; font-weight: bold;">${status}</span>.</p>
      ${comment ? `<p style="background: #f8fafc; padding: 12px; border-radius: 6px; font-style: italic; color: #475569;">Reviewer comment: "${comment}"</p>` : ''}
      <p style="margin-top: 20px; font-size: 13px; color: #64748b;">Log into <a href="https://portal.vamtech.in/dashboard/attendance" style="color: #f9572a;">portal.vamtech.in</a> to view your updated leave balance.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Leave Request ${status}: ${leaveType} (${startDate} to ${endDate})`,
    html,
  });
}

/**
 * 6. Candidate Selected Email Notification
 */
export async function sendCandidateSelectedEmail({
  email,
  name,
  refNumber,
  roleApplied,
}: {
  email: string;
  name: string;
  refNumber: string;
  roleApplied: string;
}) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #0f172a; font-size: 24px; margin: 0;">VAMTech Pvt Ltd</h1>
        <p style="color: #16a34a; font-size: 14px; font-weight: bold; margin: 5px 0 0 0;">Congratulations! Selection Update</p>
      </div>
      <p style="font-size: 16px; color: #334155;">Dear ${name},</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        We are thrilled to inform you that after reviewing your application and interview evaluation, you have been <strong style="color: #f9572a;">SELECTED</strong> for the position of <strong>${roleApplied}</strong> at VAMTech Pvt Ltd!
      </p>
      <div style="background: #fff5f2; border-left: 4px solid #f9572a; padding: 15px; margin: 25px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Candidate Reference Number</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #f9572a; font-family: monospace;">${refNumber}</p>
      </div>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Our HR team is preparing your official offer letter package. You will receive a separate notification with your offer letter and formal details very shortly.
      </p>
      <p style="text-align: center; margin: 25px 0;">
        <a href="https://portal.vamtech.in/status?ref=${refNumber}&email=${encodeURIComponent(email)}" 
           style="background: #f9572a; color: #ffffff; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
          View Application Status
        </a>
      </p>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
        VAMTech Pvt Ltd Talent Acquisition Team &bull; portal.vamtech.in
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Congratulations! Selected for ${roleApplied} (${refNumber}) - VAMTech`,
    html,
  });
}

/**
 * 7. Candidate Rejected Email Notification
 */
export async function sendCandidateRejectedEmail({
  email,
  name,
  refNumber,
  roleApplied,
}: {
  email: string;
  name: string;
  refNumber: string;
  roleApplied: string;
}) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #0f172a; font-size: 24px; margin: 0;">VAMTech Pvt Ltd</h1>
        <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Application Update</p>
      </div>
      <p style="font-size: 16px; color: #334155;">Dear ${name},</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Thank you for taking the time to apply for the <strong>${roleApplied}</strong> position (Ref: <span style="font-family: monospace; color: #f9572a; font-weight: bold;">${refNumber}</span>) at VAMTech Pvt Ltd and for engaging with our recruitment team.
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely align with our current operational requirements for this specific role.
      </p>
      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        We sincerely appreciate your interest in VAMTech and encourage you to apply for future openings that match your experience. We wish you every success in your professional endeavors.
      </p>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
        VAMTech Pvt Ltd HR Team &bull; portal.vamtech.in
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Application Status Update - ${roleApplied} (${refNumber}) | VAMTech`,
    html,
  });
}
