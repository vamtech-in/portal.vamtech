/**
 * Dynamic Role & Responsibilities Generator based on Candidate Position & Internship/Full-Time status
 */

export function getDefaultResponsibilities(roleOrDesignation: string = '', isInternship: boolean = true): string[] {
  const role = (roleOrDesignation || '').toLowerCase().trim();

  // 1. UI/UX & Graphic Design
  if (role.includes('ui/ux') || role.includes('ui-ux') || role.includes('product design') || role.includes('graphic') || role.includes('designer')) {
    if (isInternship) {
      return [
        'Create user flow diagrams, wireframes, prototypes, and high-fidelity mockups in Figma.',
        'Design clean, accessible, and intuitive user interfaces for web and mobile platforms.',
        'Contribute to company design system libraries, typography standards, and icon sets.',
        'Conduct usability testing and gather feedback to iterate on user-centric design solutions.',
        'Collaborate closely with frontend engineers to ensure design fidelity in production builds.',
      ];
    }
    return [
      'Lead end-to-end product design, UX architecture, and responsive UI design across platforms.',
      'Establish and scale comprehensive design systems, design tokens, and component libraries.',
      'Transform complex product requirements into intuitive, visually stunning user experiences.',
      'Run usability testing, user interviews, and leverage product analytics to guide design decisions.',
      'Partner with engineering and leadership to ensure pixel-perfect delivery and brand consistency.',
    ];
  }

  // 2. Frontend Developer
  if (role.includes('frontend') || role.includes('front-end') || role.includes('react') || role.includes('next.js') || role.includes('web developer')) {
    if (isInternship) {
      return [
        'Develop responsive, interactive web interfaces using React, Next.js, and TypeScript.',
        'Implement clean, reusable UI components adhering to design systems and accessibility guidelines.',
        'Integrate client-side components with backend RESTful APIs and state management stores.',
        'Optimize web applications for maximum speed, responsiveness, and cross-browser consistency.',
        'Participate in code reviews, bug fixes, and sprint planning sessions under guidance.',
      ];
    }
    return [
      'Architect, develop, and maintain high-performance web applications using Next.js and TypeScript.',
      'Build scalable frontend architectures, reusable UI component libraries, and state flows.',
      'Optimize Core Web Vitals, page rendering performance, and search engine discoverability.',
      'Collaborate with backend engineers, designers, and product managers to launch key features.',
      'Mentor junior developers, enforce clean code standards, and conduct rigorous code reviews.',
    ];
  }

  // 3. Backend Engineer / Cloud
  if (role.includes('backend') || role.includes('back-end') || role.includes('api') || role.includes('database') || role.includes('node')) {
    if (isInternship) {
      return [
        'Develop, test, and maintain robust RESTful APIs using Node.js, Express, or Next.js.',
        'Design database schemas and write optimized queries with MongoDB, PostgreSQL, or Prisma.',
        'Implement secure authentication, role-based access control, and request validation middleware.',
        'Assist in writing API documentation, unit tests, and debugging server-side issues.',
        'Collaborate with frontend teams to ensure seamless data flow and endpoint integration.',
      ];
    }
    return [
      'Architect, develop, and scale secure RESTful and real-time backend microservices.',
      'Design high-performance database architectures, indexing strategies, and caching layers.',
      'Enforce industry-standard security protocols, data protection, and authentication mechanisms.',
      'Drive serverless deployments, CI/CD automation, and cloud infrastructure reliability.',
      'Lead code reviews, mentor engineers, and maintain comprehensive technical specifications.',
    ];
  }

  // 4. AI / Machine Learning / Data Science
  if (role.includes('ai') || role.includes('machine learning') || role.includes('ml') || role.includes('data') || role.includes('python')) {
    if (isInternship) {
      return [
        'Assist in building and evaluating machine learning models, NLP pipelines, and AI workflows.',
        'Perform data cleaning, feature extraction, and exploratory data analysis on real datasets.',
        'Integrate LLM APIs, prompt chains, and vector search embeddings into applications.',
        'Document model performance benchmarks and assist in building automated test datasets.',
        'Collaborate with software engineers to deploy experimental AI features to production.',
      ];
    }
    return [
      'Architect, train, and deploy production-grade machine learning models and LLM agent systems.',
      'Design retrieval-augmented generation (RAG) pipelines, semantic search, and vector databases.',
      'Optimize model inference speed, memory footprint, and cloud GPU resource utilization.',
      'Lead data engineering pipelines, feature stores, and automated model evaluation frameworks.',
      'Collaborate with product and leadership to identify high-impact AI/ML innovations.',
    ];
  }

  // 5. Mobile App Developer (React Native / Flutter / Android / iOS)
  if (role.includes('mobile') || role.includes('android') || role.includes('ios') || role.includes('flutter') || role.includes('react native')) {
    if (isInternship) {
      return [
        'Assist in developing cross-platform mobile application screens with React Native or Flutter.',
        'Build responsive mobile user interfaces with smooth touch gestures and transitions.',
        'Integrate mobile frontends with RESTful backend services and offline storage mechanisms.',
        'Test application stability on diverse iOS and Android physical devices and emulators.',
        'Participate in sprint stand-ups, bug tracking, and build deployment workflows under guidance.',
      ];
    }
    return [
      'Architect, develop, and deploy high-performance native and cross-platform mobile applications.',
      'Implement fluid animations, offline-first data sync, and device hardware integrations.',
      'Manage app store submission lifecycles across Google Play Console and Apple App Store.',
      'Optimize mobile application memory usage, battery efficiency, and startup performance.',
      'Collaborate with backend teams and designers to deliver seamless mobile experiences.',
    ];
  }

  // 6. DevOps Specialist / Cloud Infrastructure
  if (role.includes('devops') || role.includes('cloud') || role.includes('infrastructure') || role.includes('sre')) {
    if (isInternship) {
      return [
        'Assist in building and maintaining containerized environments using Docker.',
        'Help configure automated continuous integration and continuous delivery (CI/CD) pipelines.',
        'Monitor server uptime, system logs, and application performance metrics.',
        'Support SSL certificate installations, DNS records, and cloud deployment validations.',
        'Document infrastructure configurations and standard operating procedures with senior staff.',
      ];
    }
    return [
      'Architect and maintain secure, highly available cloud infrastructure on AWS, Vercel, and Docker.',
      'Build and optimize automated CI/CD deployment pipelines ensuring zero-downtime releases.',
      'Implement enterprise observability, centralized logging, automated alerting, and incident response.',
      'Enforce strict cloud security policies, IAM access controls, and compliance governance.',
      'Partner with engineering teams to optimize cloud infrastructure costs and system resilience.',
    ];
  }

  // 7. QA / Quality Assurance / Tester
  if (role.includes('qa') || role.includes('quality') || role.includes('test') || role.includes('testing')) {
    if (isInternship) {
      return [
        'Execute manual test cases, verify feature specifications, and identify defects across browsers.',
        'Assist in writing automated test scripts for APIs and web application user workflows.',
        'Document clear, reproducible bug reports with steps, screenshots, and logs in tracking tools.',
        'Perform regression testing before scheduled releases to ensure platform stability.',
        'Collaborate with developers during sprint planning and bug triage sessions.',
      ];
    }
    return [
      'Define and execute comprehensive QA strategies, test plans, and automated testing frameworks.',
      'Develop robust end-to-end (E2E), integration, and performance test suites with Playwright/Cypress.',
      'Integrate automated testing gates into CI/CD pipelines to guarantee software reliability.',
      'Perform security verification, API load testing, and cross-platform regression audits.',
      'Lead bug triage, collaborate with engineering leaders, and uphold zero-defect release standards.',
    ];
  }

  // 8. Digital Marketing / Content / SEO
  if (role.includes('marketing') || role.includes('seo') || role.includes('content') || role.includes('social media')) {
    if (isInternship) {
      return [
        'Assist in planning and publishing engaging digital content across social media channels.',
        'Conduct keyword research and optimize website articles for Search Engine Optimization (SEO).',
        'Monitor campaign performance, website traffic, and engagement metrics using analytics tools.',
        'Support email newsletter campaigns and inbound lead generation activities.',
        'Collaborate with the creative team to produce high-impact graphic and video assets.',
      ];
    }
    return [
      'Develop and execute holistic digital marketing, SEO, and multi-channel acquisition strategies.',
      'Drive organic search visibility, high-converting content marketing, and brand storytelling.',
      'Manage performance marketing budgets, analyze conversion funnels, and optimize CAC and ROI.',
      'Lead email marketing campaigns, automated customer nurture workflows, and PR initiatives.',
      'Collaborate with sales and engineering to align marketing efforts with business growth goals.',
    ];
  }

  // 9. Human Resources (HR) / Talent Acquisition
  if (role.includes('hr') || role.includes('human resource') || role.includes('talent') || role.includes('recruiter') || role.includes('recruiting')) {
    if (isInternship) {
      return [
        'Assist in candidate sourcing, initial resume screening, and coordinating interview schedules.',
        'Support employee onboarding procedures, document verification, and internal record keeping.',
        'Help coordinate team engagement activities, internal communications, and feedback surveys.',
        'Draft job descriptions and publish career opportunities across hiring platforms.',
        'Maintain candidate and employee directories with high confidentiality and accuracy.',
      ];
    }
    return [
      'Lead end-to-end recruitment cycles, employer branding, and proactive talent pipeline development.',
      'Manage employee onboarding, quarterly performance reviews, and statutory HR compliance.',
      'Develop employee engagement programs, professional growth pathways, and company culture.',
      'Oversee payroll processing coordination, leave management, and official documentation.',
      'Act as a strategic partner to leadership on workforce planning and organizational development.',
    ];
  }

  // 10. Business Development / Sales
  if (role.includes('sales') || role.includes('business development') || role.includes('bde') || role.includes('account')) {
    if (isInternship) {
      return [
        'Identify prospective SME and startup clients through targeted research and outreach.',
        'Support lead qualification, CRM database updates, and follow-up communication tracking.',
        'Assist in drafting custom software proposals, introductory decks, and pitch materials.',
        'Coordinate discovery calls with prospective clients and take structured meeting minutes.',
        'Collaborate with technical teams to understand software delivery capabilities and timelines.',
      ];
    }
    return [
      'Drive B2B sales cycles from outbound lead generation to contract negotiation and closing.',
      'Build and nurture an active pipeline of custom software and enterprise technology projects.',
      'Present tailored technical solutions to client stakeholders and consistently meet revenue targets.',
      'Manage long-term client relationships to drive account expansion, retention, and referrals.',
      'Collaborate with engineering leadership to scope technical feasibility and deliverables.',
    ];
  }

  // 11. Full Stack / Software Engineer (Standard Engineering default)
  if (isInternship) {
    return [
      'Design, develop, and maintain full stack web applications (frontend and backend).',
      'Build and integrate RESTful APIs and work with databases as required.',
      'Write clean, maintainable, and well-documented code.',
      'Participate in code reviews, stand-ups, and sprint planning sessions.',
      'Assist in debugging, testing, and deploying features under guidance.',
    ];
  }

  return [
    'Lead architecture, development, and maintenance of scalable web applications.',
    'Develop robust RESTful and real-time backend microservices with database design.',
    'Write maintainable, performant, and well-tested code following best practices.',
    'Collaborate with cross-functional teams, conduct code reviews, and mentor engineers.',
    'Drive continuous delivery, performance optimization, and system reliability.',
  ];
}
