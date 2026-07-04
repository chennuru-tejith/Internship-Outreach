export const initialCompanies = [
  { id: 'c1', name: 'Google', industry: 'Tech', difficulty: 5, myScore: 85, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Google%20recruiter' },
  { id: 'c2', name: 'Meta', industry: 'Tech', difficulty: 5, myScore: 80, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Meta%20recruiter' },
  { id: 'c3', name: 'Microsoft', industry: 'Tech', difficulty: 4, myScore: 90, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Microsoft%20recruiter' },
  { id: 'c4', name: 'Stripe', industry: 'Fintech', difficulty: 5, myScore: 75, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Stripe%20recruiter' },
  { id: 'c5', name: 'Airbnb', industry: 'Travel Tech', difficulty: 4, myScore: 82, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Airbnb%20recruiter' },
  { id: 'c6', name: 'Uber', industry: 'Tech', difficulty: 4, myScore: 88, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Uber%20recruiter' },
  { id: 'c7', name: 'Netflix', industry: 'Entertainment', difficulty: 5, myScore: 70, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Netflix%20recruiter' },
  { id: 'c8', name: 'Nvidia', industry: 'Hardware/AI', difficulty: 5, myScore: 92, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Nvidia%20recruiter' },
  { id: 'c9', name: 'Adobe', industry: 'Tech', difficulty: 3, myScore: 85, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Adobe%20recruiter' },
  { id: 'ca', name: 'Salesforce', industry: 'SaaS', difficulty: 4, myScore: 80, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Salesforce%20recruiter' },
  { id: 'cb', name: 'Atlassian', industry: 'SaaS', difficulty: 3, myScore: 84, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Atlassian%20recruiter' },
  { id: 'cc', name: 'Snowflake', industry: 'Data', difficulty: 4, myScore: 78, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Snowflake%20recruiter' },
  { id: 'cd', name: 'Palantir', industry: 'Defense Tech', difficulty: 5, myScore: 72, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Palantir%20recruiter' },
  { id: 'ce', name: 'Coinbase', industry: 'Crypto', difficulty: 4, myScore: 74, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Coinbase%20recruiter' },
  { id: 'cf', name: 'Databricks', industry: 'Data/AI', difficulty: 5, myScore: 81, hrSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=Databricks%20recruiter' }
];

export const initialContacts = [
  {
    id: 'ct1',
    name: 'Sarah Jenkins',
    title: 'Technical Recruiter',
    company: 'Google',
    email: 'sarahjenkins@google.com',
    linkedin: 'https://linkedin.com/in/sarah-jenkins-mock',
    foundVia: 'LinkedIn Search',
    status: 'Replied',
    score: 85,
    followUpDate: '2026-07-06',
    responseNotes: 'Replied asking for my availability next week.',
    emailDraftSubject: 'Re: Technical Internship Outreach - Tejith Chennuru',
    emailDraftBody: 'Hi Sarah,\n\nThank you for reaching out! I would love to connect and discuss. I am free next Tuesday at 2 PM or Thursday at 10 AM. Let me know what works best.\n\nBest,\nTejith',
    notes: 'Very friendly, interested in my backend projects.'
  },
  {
    id: 'ct2',
    name: 'David Miller',
    title: 'Engineering Manager',
    company: 'Meta',
    email: 'dmiller@meta.com',
    linkedin: 'https://linkedin.com/in/david-miller-mock',
    foundVia: 'Alumni Network',
    status: 'Interview Scheduled',
    score: 95,
    followUpDate: '2026-07-05',
    responseNotes: 'Technical screening scheduled.',
    emailDraftSubject: '',
    emailDraftBody: '',
    notes: 'Alumnus from my university. Offered to do a resume review.'
  },
  {
    id: 'ct3',
    name: 'Emma Watson',
    title: 'University Recruiter',
    company: 'Microsoft',
    email: 'emma.watson@microsoft.com',
    linkedin: 'https://linkedin.com/in/emma-watson-mock',
    foundVia: 'Campus Career Fair',
    status: 'Connected',
    score: 75,
    followUpDate: '2026-06-28', // Overdue
    responseNotes: '',
    emailDraftSubject: 'Follow-up on Microsoft Internship Application - Tejith Chennuru',
    emailDraftBody: 'Hi Emma,\n\nIt was great meeting you at the campus career fair last week. I wanted to follow up on the Software Engineering Internship position. I have submitted my application online.\n\nBest regards,\nTejith',
    notes: 'Told me to apply online and email her my application ID.'
  },
  {
    id: 'ct4',
    name: 'James Smith',
    title: 'Staff Engineer',
    company: 'Stripe',
    email: 'jsmith@stripe.com',
    linkedin: 'https://linkedin.com/in/james-smith-mock',
    foundVia: 'GitHub Contribution',
    status: 'Not Contacted',
    score: 90,
    followUpDate: '2026-07-10',
    responseNotes: '',
    emailDraftSubject: '',
    emailDraftBody: '',
    notes: 'Maintains an open-source repo I contributed to.'
  },
  {
    id: 'ct5',
    name: 'Sophia Davis',
    title: 'HR Manager',
    company: 'Airbnb',
    email: 'sophia.davis@airbnb.com',
    linkedin: 'https://linkedin.com/in/sophia-davis-mock',
    foundVia: 'LinkedIn Search',
    status: 'Email Drafted',
    score: 80,
    followUpDate: '2026-07-04', // Today
    responseNotes: '',
    emailDraftSubject: 'Outreach: Software Engineering Intern - Tejith Chennuru',
    emailDraftBody: 'Hi Sophia,\n\nI hope this email finds you well. I am a junior pursuing Computer Science, and I am very interested in the Software Engineering Intern roles at Airbnb. I have experience building scalable web applications and would love to learn more about the team.\n\nBest,\nTejith',
    notes: 'Drafted using the HR-specific template.'
  },
  {
    id: 'ct6',
    name: 'Robert Wilson',
    title: 'Recruiter',
    company: 'Uber',
    email: 'rwilson@uber.com',
    linkedin: 'https://linkedin.com/in/robert-wilson-mock',
    foundVia: 'Cold Outreach',
    status: 'Email Sent',
    score: 70,
    followUpDate: '2026-07-11',
    responseNotes: '',
    emailDraftSubject: '',
    emailDraftBody: '',
    notes: 'Emailed on July 4th.'
  },
  {
    id: 'ct7',
    name: 'Olivia Martinez',
    title: 'Senior Engineer',
    company: 'Netflix',
    email: 'omartinez@netflix.com',
    linkedin: 'https://linkedin.com/in/olivia-martinez-mock',
    foundVia: 'Tech Conference',
    status: 'Connected',
    score: 88,
    followUpDate: '2026-06-30', // Overdue
    responseNotes: '',
    emailDraftSubject: 'Referral Inquiry: SWE Internship - Tejith Chennuru',
    emailDraftBody: 'Hi Olivia,\n\nIt was great speaking with you at the React Conference. I noticed Netflix opened its summer internship applications, and I would be incredibly grateful if you could refer me or share any insights.\n\nThanks,\nTejith',
    notes: 'Spoke briefly about video streaming architecture.'
  },
  {
    id: 'ct8',
    name: 'Michael Brown',
    title: 'HR Business Partner',
    company: 'Nvidia',
    email: 'mbrown@nvidia.com',
    linkedin: 'https://linkedin.com/in/michael-brown-mock',
    foundVia: 'LinkedIn Search',
    status: 'Offer',
    score: 98,
    followUpDate: '2026-07-15',
    responseNotes: 'Received written offer details!',
    emailDraftSubject: '',
    emailDraftBody: '',
    notes: 'Internship starting Fall 2026!'
  }
];

export const initialTemplates = [
  {
    id: 't1',
    name: 'Referral Request',
    subject: 'Referral Request: [Position Name] - [Your Name]',
    body: 'Hi [Contact Name],\n\nI hope you are doing well!\n\nI have been following [Company Name] and am really excited about the [Position Name] position. I saw that you currently work at [Company Name] as a [Contact Title] and was wondering if you would be open to referring me for this role?\n\nI have attached my resume and a link to my portfolio ([Portfolio Link]). I would also love to jump on a quick 10-minute call if you have time to chat about your experience at the company.\n\nThank you so much for your time and help!\n\nBest regards,\n[Your Name]'
  },
  {
    id: 't2',
    name: '7-Day Follow-Up',
    subject: 'Following up: [Original Subject]',
    body: 'Hi [Contact Name],\n\nI wanted to follow up briefly on my email from last week. I know you must be busy, but I wanted to make sure my message did not get lost in your inbox.\n\nI am still very interested in the [Position Name] role at [Company Name]. Please let me know if you would be open to a brief chat or if there is anyone else you recommend I speak with.\n\nThanks again for your time!\n\nBest,\n[Your Name]'
  },
  {
    id: 't3',
    name: 'HR-Specific Note',
    subject: 'Inquiry: [Position Name] - [Your Name]',
    body: 'Hi [Contact Name],\n\nI hope you are having a great week!\n\nMy name is [Your Name], and I am a Computer Science student at [Your University]. I recently applied for the [Position Name] position at [Company Name] and wanted to connect with you directly to reiterate my enthusiasm for the role.\n\nWith my background in [mention 1-2 skills or projects], I believe I would make a strong contribution to the team. I have attached my resume for your review.\n\nWould you be open to a quick call next week to discuss how my profile aligns with the team\'s needs?\n\nBest regards,\n[Your Name]'
  },
  {
    id: 't4',
    name: 'Cold Pitch (SWE)',
    subject: 'Outreach: Software Engineering Intern Opportunity - [Your Name]',
    body: 'Hi [Contact Name],\n\nI hope this email finds you well.\n\nI am a Software Developer specialized in [Skill 1] and [Skill 2]. I noticed that your team at [Company Name] is working on [mention a project or feature], and I wanted to reach out because my background aligns closely with this work.\n\nI recently built a project called [Project Name] that [explain what it does/tech stack]. You can view it here: [Project Link].\n\nI would love to learn more about upcoming opportunities on your team. Are you free for a 10-minute chat next Tuesday or Thursday?\n\nBest,\n[Your Name]'
  },
  {
    id: 't5',
    name: 'Networking / Coffee Chat',
    subject: 'Request: 15-Minute Coffee Chat - [Your Name]',
    body: 'Hi [Contact Name],\n\nI hope you\'re doing well!\n\nI saw your profile on LinkedIn and was really impressed by your career transition from [Previous Industry/Role] to [Current Role] at [Company Name].\n\nI am currently looking to enter the [Field/Industry] and would love to ask you a few questions about your journey and get some advice. Would you be open to a quick 15-minute virtual coffee chat sometime next week?\n\nI know you are busy, so I appreciate any time you can spare.\n\nWarmly,\n[Your Name]'
  },
  {
    id: 't6',
    name: 'Alumni Connection',
    subject: 'Fellow [University Name] Alum - Outreach from [Your Name]',
    body: 'Hi [Contact Name],\n\nGo [University Mascot]!\n\nI am a current student at [University Name] studying Computer Science, and I noticed that you graduated from here and now work at [Company Name] as a [Contact Title].\n\nI am very interested in [Company Name] and would love to hear about your experience transitioning from college to working there. If you have 10-15 minutes to spare next week, I would love to connect.\n\nThanks so much for considering my request!\n\nBest regards,\n[Your Name]'
  },
  {
    id: 't7',
    name: 'Mutual Connection Intro',
    subject: 'Intro: [Your Name] via [Mutual Connection Name]',
    body: 'Hi [Contact Name],\n\nOur mutual contact, [Mutual Connection Name], suggested that I reach out to you.\n\nI am currently exploring opportunities in [Target Field], and [Mutual Connection Name] mentioned that you would be a great person to speak with given your expertise at [Company Name].\n\nI would love to schedule a quick 10-minute call to ask you about your work and the industry. Let me know if you have any availability next week.\n\nThanks,\n[Your Name]'
  },
  {
    id: 't8',
    name: 'Application Follow-Up',
    subject: 'Application Follow-up: [Position Name] - [Your Name]',
    body: 'Hi [Contact Name],\n\nI hope your week is going well!\n\nI recently applied for the [Position Name] position (Req #[Req Number]) at [Company Name]. Since you are the Recruiter for this division, I wanted to reach out and introduce myself.\n\nGiven my experience in [Key Skill/Area], I am very excited about this opportunity. I have attached my resume for your convenience.\n\nI would welcome the opportunity to discuss my qualifications with you in more detail. Thank you for your time and consideration.\n\nBest regards,\n[Your Name]'
  }
];
