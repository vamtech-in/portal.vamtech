import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { generateOfferLetterPDFBuffer } from '../src/lib/pdf-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VAMTech Portal database with Admin, Employee, and Interns...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const empPasswordHash = await bcrypt.hash('Emp@123', 10);
  const tempPasswordHash = await bcrypt.hash('Temp@123', 10);
  const internPasswordHash = await bcrypt.hash('Intern@123', 10);

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vamtech.in' },
    update: {
      refNumber: 'VT-HR-ADMIN',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
    create: {
      email: 'admin@vamtech.in',
      name: 'VAMTech HR Admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
      refNumber: 'VT-HR-ADMIN',
      mustResetPassword: false,
      department: 'Human Resources',
      designation: 'HR Director',
      joiningDate: '2024-01-15',
      phone: '+91 98765 43210',
      emergencyContact: 'Emergency Admin - +91 98765 00000',
    },
  });
  console.log('👤 Admin user created:', admin.email);

  // 2. Existing Employee User
  const employee1 = await prisma.user.upsert({
    where: { email: 'employee@vamtech.in' },
    update: {
      refNumber: 'VT-2026-001',
      role: 'employee',
      passwordHash: empPasswordHash,
    },
    create: {
      email: 'employee@vamtech.in',
      name: 'Aniket Sharma',
      passwordHash: empPasswordHash,
      role: 'employee',
      mustResetPassword: false,
      refNumber: 'VT-2026-001',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      joiningDate: '2026-02-01',
      phone: '+91 91234 56789',
      emergencyContact: 'Father - +91 98111 22233',
    },
  });
  console.log('👤 Employee user created:', employee1.email);

  // 3. Newly Onboarded Employee (Requires Password Reset)
  const employee2 = await prisma.user.upsert({
    where: { email: 'new.hire@vamtech.in' },
    update: {
      refNumber: 'VT-2026-002',
      role: 'employee',
      passwordHash: tempPasswordHash,
    },
    create: {
      email: 'new.hire@vamtech.in',
      name: 'Priya Verma',
      passwordHash: tempPasswordHash,
      role: 'employee',
      mustResetPassword: true, // Forces reset on first login
      refNumber: 'VT-2026-002',
      department: 'Product Design',
      designation: 'UI/UX Designer',
      joiningDate: '2026-08-15',
      phone: '+91 99887 76655',
    },
  });
  console.log('👤 New Hire user created:', employee2.email);

  // Clean up any stale demo users or legacy intern refNumbers
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: ['rohan.gupta@example.com'] } },
        { refNumber: { in: ['VT-2026-003', 'VT-2026-007'] } },
      ],
    },
  });

  // 4. Paid Intern User (Sumit Prajapati)
  const intern1 = await prisma.user.upsert({
    where: { email: 'intern@vamtech.in' },
    update: {
      refNumber: 'VT-INT-2026-001',
      role: 'intern',
      designation: 'Full Stack Development Intern (Paid)',
      department: 'Engineering',
      passwordHash: internPasswordHash,
    },
    create: {
      email: 'intern@vamtech.in',
      name: 'Sumit Prajapati',
      passwordHash: internPasswordHash,
      role: 'intern',
      mustResetPassword: false,
      refNumber: 'VT-INT-2026-001',
      department: 'Engineering',
      designation: 'Full Stack Development Intern (Paid)',
      joiningDate: '2026-09-01',
      phone: '+91 98765 12345',
      emergencyContact: 'Father - +91 98765 54321',
    },
  });
  console.log('👤 Paid Intern user created:', intern1.email, 'Ref:', intern1.refNumber);

  // 5. Unpaid Intern User (Rohan Gupta)
  const intern2 = await prisma.user.upsert({
    where: { email: 'unpaid.intern@vamtech.in' },
    update: {
      refNumber: 'VT-INT-2026-002',
      role: 'intern',
      designation: 'Full Stack Development Intern (Unpaid)',
      department: 'Engineering',
      passwordHash: internPasswordHash,
    },
    create: {
      email: 'unpaid.intern@vamtech.in',
      name: 'Rohan Gupta',
      passwordHash: internPasswordHash,
      role: 'intern',
      mustResetPassword: false,
      refNumber: 'VT-INT-2026-002',
      department: 'Engineering',
      designation: 'Full Stack Development Intern (Unpaid)',
      joiningDate: '2026-09-01',
      phone: '+91 98222 33344',
      emergencyContact: 'Mother - +91 98222 55566',
    },
  });
  console.log('👤 Unpaid Intern user created:', intern2.email, 'Ref:', intern2.refNumber);

  // Clean up legacy candidate ref numbers if they exist
  await prisma.candidate.deleteMany({
    where: {
      refNumber: { in: ['VT-2026-003', 'VT-2026-007'] },
    },
  });

  // 6. Candidates Pipeline
  const candidatesData = [
    {
      refNumber: 'VT-2026-001',
      name: 'Aniket Sharma',
      email: 'employee@vamtech.in',
      phone: '+91 91234 56789',
      roleApplied: 'Senior Full Stack Engineer',
      linkedin: 'https://linkedin.com/in/aniket-sharma',
      coverNote: 'Experienced Next.js & React developer with 4 years building scalable web applications.',
      status: 'Joined',
    },
    {
      refNumber: 'VT-2026-002',
      name: 'Priya Verma',
      email: 'new.hire@vamtech.in',
      phone: '+91 99887 76655',
      roleApplied: 'UI/UX Designer',
      linkedin: 'https://linkedin.com/in/priya-verma',
      status: 'Joined',
    },
    {
      refNumber: 'VT-INT-2026-001',
      name: 'Sumit Prajapati',
      email: 'intern@vamtech.in',
      phone: '+91 98765 12345',
      roleApplied: 'Full Stack Development Intern (Paid)',
      linkedin: 'https://linkedin.com/in/sumit-prajapati',
      coverNote: 'Enthusiastic full stack developer experienced in React, Next.js, and TypeScript.',
      status: 'Joined',
    },
    {
      refNumber: 'VT-2026-004',
      name: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      phone: '+91 97111 22233',
      roleApplied: 'AI / Machine Learning Engineer',
      status: 'Interviewed',
    },
    {
      refNumber: 'VT-2026-005',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 96555 44433',
      roleApplied: 'DevOps & Infrastructure Specialist',
      status: 'Applied',
    },
    {
      refNumber: 'VT-INT-2026-002',
      name: 'Rohan Gupta',
      email: 'unpaid.intern@vamtech.in',
      phone: '+91 98222 33344',
      roleApplied: 'Full Stack Development Intern (Unpaid)',
      linkedin: 'https://linkedin.com/in/rohan-gupta',
      coverNote: 'Passionate about building responsive, modern user interfaces with React and Tailwind.',
      status: 'Joined',
    },
  ];

  const candMap: Record<string, any> = {};
  for (const cand of candidatesData) {
    const record = await prisma.candidate.upsert({
      where: { refNumber: cand.refNumber },
      update: {
        name: cand.name,
        email: cand.email,
        phone: cand.phone,
        roleApplied: cand.roleApplied,
        status: cand.status,
      },
      create: cand,
    });
    candMap[cand.refNumber] = record;
  }
  console.log('📋 Candidates pipeline seeded with intern IDs (VT-INT-2026-XXX)');

  // 7. Generate Real Physical PDF Offer Letters for Interns
  const offersDir = path.join(process.cwd(), 'public', 'uploads', 'offers');
  await fs.promises.mkdir(offersDir, { recursive: true });

  // Paid Intern Offer Letter
  try {
    const paidOfferDetails = {
      candidateName: 'Sumit Prajapati',
      candidateAddress: 'Tiwariganj, Lucknow, Uttar Pradesh 226028',
      candidateEmail: 'intern@vamtech.in',
      candidatePhone: '+91 98765 12345',
      designation: 'Full Stack Development Intern',
      department: 'Engineering',
      offerRefNumber: 'VAMT/HR/INT/2026-001',
      date: '1 September 2026',
      duration: '3 months',
      startDate: '5 September 2026',
      endDate: '5 December 2026',
      workingHours: '10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)',
      stipendAmount: 5000,
      reportingManager: 'Aditya Gupta, HR',
      workLocation: 'Remote',
      hrName: 'Aditya Gupta',
    };

    const paidPdfBuffer = await generateOfferLetterPDFBuffer('PAID_INTERNSHIP', paidOfferDetails);
    const paidPdfPath = path.join(offersDir, 'offer-letter-VT-INT-2026-001.pdf');
    await fs.promises.writeFile(paidPdfPath, paidPdfBuffer);
    console.log('📄 Generated physical PDF for Paid Intern:', paidPdfPath);

    // Create or update OfferLetter record
    const cand001 = candMap['VT-INT-2026-001'];
    if (cand001) {
      await prisma.offerLetter.deleteMany({ where: { candidateId: cand001.id } });
      await prisma.offerLetter.create({
        data: {
          candidateId: cand001.id,
          offerRefNumber: 'VAMT/HR/INT/2026-001',
          type: 'PAID_INTERNSHIP',
          detailsJson: JSON.stringify(paidOfferDetails),
          pdfUrl: '/uploads/offers/offer-letter-VT-INT-2026-001.pdf',
        },
      });
    }

    // Add Offer Letter to Intern's document vault
    await prisma.document.deleteMany({
      where: {
        userId: intern1.id,
        title: { contains: 'Offer Letter' },
      },
    });
    await prisma.document.create({
      data: {
        userId: intern1.id,
        title: 'Official Paid Internship Offer Letter (VAMT/HR/INT/2026-001)',
        type: 'Offer Letter',
        fileUrl: '/uploads/offers/offer-letter-VT-INT-2026-001.pdf',
        fileSize: `${Math.round(paidPdfBuffer.length / 1024)} KB`,
        uploadedBy: 'Aditya Gupta (HR)',
      },
    });
  } catch (err) {
    console.error('Failed generating seed PDF for Paid Intern', err);
  }

  // Unpaid Intern Offer Letter
  try {
    const unpaidOfferDetails = {
      candidateName: 'Rohan Gupta',
      candidateAddress: 'Lucknow, Uttar Pradesh 226028',
      candidateEmail: 'unpaid.intern@vamtech.in',
      candidatePhone: '+91 98222 33344',
      designation: 'Full Stack Development Intern',
      department: 'Engineering',
      offerRefNumber: 'VAMT/HR/INT/2026-002',
      date: '1 September 2026',
      duration: '3 months',
      startDate: '5 September 2026',
      endDate: '5 December 2026',
      workingHours: '10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)',
      reportingManager: 'Aditya Gupta, HR',
      workLocation: 'Remote',
      hrName: 'Aditya Gupta',
    };

    const unpaidPdfBuffer = await generateOfferLetterPDFBuffer('UNPAID_INTERNSHIP', unpaidOfferDetails);
    const unpaidPdfPath = path.join(offersDir, 'offer-letter-VT-INT-2026-002.pdf');
    await fs.promises.writeFile(unpaidPdfPath, unpaidPdfBuffer);
    console.log('📄 Generated physical PDF for Unpaid Intern:', unpaidPdfPath);

    // Create or update OfferLetter record
    const cand002 = candMap['VT-INT-2026-002'];
    if (cand002) {
      await prisma.offerLetter.deleteMany({ where: { candidateId: cand002.id } });
      await prisma.offerLetter.create({
        data: {
          candidateId: cand002.id,
          offerRefNumber: 'VAMT/HR/INT/2026-002',
          type: 'UNPAID_INTERNSHIP',
          detailsJson: JSON.stringify(unpaidOfferDetails),
          pdfUrl: '/uploads/offers/offer-letter-VT-INT-2026-002.pdf',
        },
      });
    }

    // Add Offer Letter to Intern's document vault
    await prisma.document.deleteMany({
      where: {
        userId: intern2.id,
        title: { contains: 'Offer Letter' },
      },
    });
    await prisma.document.create({
      data: {
        userId: intern2.id,
        title: 'Official Unpaid Internship Offer Letter (VAMT/HR/INT/2026-002)',
        type: 'Offer Letter',
        fileUrl: '/uploads/offers/offer-letter-VT-INT-2026-002.pdf',
        fileSize: `${Math.round(unpaidPdfBuffer.length / 1024)} KB`,
        uploadedBy: 'Aditya Gupta (HR)',
      },
    });
  } catch (err) {
    console.error('Failed generating seed PDF for Unpaid Intern', err);
  }

  // 8. Tasks for Employee 1
  await prisma.task.deleteMany({ where: { userId: employee1.id } });
  await prisma.task.createMany({
    data: [
      {
        userId: employee1.id,
        title: 'Complete Internal Portal Auth Integration',
        description: 'Implement Auth credentials provider and server-side session validation.',
        status: 'In Progress',
        dueDate: '2026-09-05',
      },
      {
        userId: employee1.id,
        title: 'Setup PDF Template Engine',
        description: 'Implement React PDF generator for internship and full-time offer letters.',
        status: 'Done',
        dueDate: '2026-09-02',
      },
      {
        userId: employee1.id,
        title: 'Review System Security Headers & Robots',
        description: 'Ensure noindex meta tags and robots.txt disallow all crawlers.',
        status: 'To Do',
        dueDate: '2026-09-10',
      },
    ],
  });

  // 9. Tasks for Paid Intern (Sumit Prajapati)
  await prisma.task.deleteMany({ where: { userId: intern1.id } });
  await prisma.task.createMany({
    data: [
      {
        userId: intern1.id,
        title: 'Complete Onboarding & Workspace Setup',
        description: 'Configure local development environment, git SSH keys, and verify npm dev server.',
        status: 'Done',
        dueDate: '2026-09-02',
      },
      {
        userId: intern1.id,
        title: 'Build Interactive Dashboard UI Components',
        description: 'Implement responsive React and Tailwind components adhering to VAMTech design specifications.',
        status: 'In Progress',
        dueDate: '2026-09-08',
      },
      {
        userId: intern1.id,
        title: 'Submit Weekly Sprint Progress Report',
        description: 'Summarize completed tasks and milestone achievements for technical mentor review.',
        status: 'To Do',
        dueDate: '2026-09-12',
      },
    ],
  });

  // 10. Work History for Employee 1
  await prisma.workHistory.deleteMany({ where: { userId: employee1.id } });
  await prisma.workHistory.createMany({
    data: [
      {
        userId: employee1.id,
        projectTitle: 'VAMTech Core SaaS Dashboard',
        description: 'Architected and built real-time analytics module reducing query response time by 40%.',
        skills: 'Next.js 15, React, TypeScript, TailwindCSS, Prisma',
        dateCompleted: '2026-06-30',
      },
      {
        userId: employee1.id,
        projectTitle: 'Automated CI/CD Pipeline Migration',
        description: 'Configured automated deployment workflows and preview environments on Vercel.',
        skills: 'Docker, Vercel, GitHub Actions, Node.js',
        dateCompleted: '2026-03-15',
      },
    ],
  });

  // 11. Work History for Intern 1
  await prisma.workHistory.deleteMany({ where: { userId: intern1.id } });
  await prisma.workHistory.createMany({
    data: [
      {
        userId: intern1.id,
        projectTitle: 'Candidate Application Tracking UI',
        description: 'Designed and built clean applicant tracking status badges and interactive resume preview.',
        skills: 'React, Next.js, Tailwind CSS, TypeScript',
        dateCompleted: '2026-09-03',
      },
    ],
  });

  // 12. Attendance Records
  const today = new Date().toISOString().split('T')[0];
  await prisma.attendance.deleteMany({ where: { userId: employee1.id } });
  await prisma.attendance.createMany({
    data: [
      {
        userId: employee1.id,
        date: today,
        checkIn: '09:30 AM',
        checkOut: '06:30 PM',
        status: 'Present',
      },
      {
        userId: employee1.id,
        date: '2026-09-01',
        checkIn: '09:45 AM',
        checkOut: '06:45 PM',
        status: 'Present',
      },
    ],
  });

  await prisma.attendance.deleteMany({ where: { userId: intern1.id } });
  await prisma.attendance.createMany({
    data: [
      {
        userId: intern1.id,
        date: today,
        checkIn: '09:55 AM',
        checkOut: '05:05 PM',
        status: 'Present',
      },
      {
        userId: intern1.id,
        date: '2026-09-01',
        checkIn: '10:00 AM',
        checkOut: '05:00 PM',
        status: 'Present',
      },
    ],
  });

  // 13. Documents for Employee 1
  await prisma.document.deleteMany({
    where: {
      userId: employee1.id,
      title: { not: { contains: 'Official Offer Letter' } },
    },
  });
  await prisma.document.createMany({
    data: [
      {
        userId: employee1.id,
        title: 'Appointment Letter & Contract',
        type: 'Appointment Letter',
        fileUrl: '/api/documents/demo-appointment.pdf',
        fileSize: '320 KB',
        uploadedBy: 'VAMTech HR Admin',
      },
      {
        userId: employee1.id,
        title: 'August 2026 Salary Payslip',
        type: 'Payslip',
        fileUrl: '/api/documents/demo-payslip-aug-2026.pdf',
        fileSize: '180 KB',
        uploadedBy: 'VAMTech HR Admin',
      },
    ],
  });

  // 14. Announcements & Holidays
  await prisma.announcement.deleteMany({});
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Q3 All-Hands Town Hall & Product Roadmap',
        content: 'Join us this Friday at 4:00 PM IST for our quarterly company town hall meeting.',
        isHoliday: false,
        authorName: 'VAMTech Executive Office',
      },
      {
        title: 'Mahatma Gandhi Jayanti Holiday',
        content: 'VAMTech offices will remain closed in observance of Gandhi Jayanti.',
        isHoliday: true,
        holidayDate: '2026-10-02',
        authorName: 'HR Department',
      },
      {
        title: 'Diwali Festive Holiday',
        content: 'VAMTech official holiday for Diwali celebrations.',
        isHoliday: true,
        holidayDate: '2026-11-08',
        authorName: 'HR Department',
      },
    ],
  });

  console.log('✅ Database seeding completed successfully with Intern accounts!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
