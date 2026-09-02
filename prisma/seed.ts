import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VAMTech Portal database...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const empPasswordHash = await bcrypt.hash('Emp@123', 10);
  const tempPasswordHash = await bcrypt.hash('Temp@123', 10);

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vamtech.in' },
    update: {},
    create: {
      email: 'admin@vamtech.in',
      name: 'VAMTech HR Admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
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
    update: {},
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
    update: {},
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

  // 4. Candidates Pipeline
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
      refNumber: 'VT-2026-003',
      name: 'Rohan Gupta',
      email: 'rohan.gupta@example.com',
      phone: '+91 98222 33344',
      roleApplied: 'Frontend Developer',
      linkedin: 'https://linkedin.com/in/rohan-gupta',
      coverNote: 'Passionate about building responsive, modern user interfaces with React and Tailwind.',
      status: 'Selected',
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
  ];

  for (const cand of candidatesData) {
    await prisma.candidate.upsert({
      where: { refNumber: cand.refNumber },
      update: {},
      create: cand,
    });
  }
  console.log('📋 Candidates pipeline seeded');

  // 5. Tasks for Employee 1
  await prisma.task.createMany({
    data: [
      {
        userId: employee1.id,
        title: 'Complete Internal Portal Auth Integration',
        description: 'Implement Auth.js credentials provider and server-side middleware validation.',
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

  // 6. Work History for Employee 1
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

  // 7. Leave Requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: employee1.id,
        leaveType: 'Paid',
        startDate: '2026-09-15',
        endDate: '2026-09-18',
        reason: 'Family vacation and personal engagement.',
        status: 'Pending',
      },
      {
        userId: employee1.id,
        leaveType: 'Casual',
        startDate: '2026-07-10',
        endDate: '2026-07-11',
        reason: 'Personal errands.',
        status: 'Approved',
        reviewedBy: 'VAMTech HR Admin',
        reviewComment: 'Approved. Enjoy your time off.',
      },
    ],
  });

  // 8. Attendance Records
  const today = new Date().toISOString().split('T')[0];
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

  // 9. Documents
  await prisma.document.createMany({
    data: [
      {
        userId: employee1.id,
        title: 'Official Full-Time Offer Letter',
        type: 'Offer Letter',
        fileUrl: '/api/documents/demo-offer-letter.pdf',
        fileSize: '245 KB',
        uploadedBy: 'VAMTech HR Admin',
      },
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

  // 10. Announcements & Holidays
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

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
