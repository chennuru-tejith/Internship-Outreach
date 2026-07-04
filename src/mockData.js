export const initialCompanies = [];

export const initialContacts = [];

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
