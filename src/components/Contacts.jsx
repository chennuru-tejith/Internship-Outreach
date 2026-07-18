import React, { useState } from 'react';
import { 
  Plus, Search, Mail, Edit2, Trash2, 
  Sparkles, Check, X, ExternalLink, Calendar, HelpCircle, Send, Play, CheckCircle2 
} from 'lucide-react';

const Linkedin = ({ size = 24, ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Contacts({ 
  contacts, 
  setContacts, 
  companies, 
  templates, 
  apiKey, 
  geminiApiKey,
  aiProvider,
  openAiModel, 
  profile,
  resumeText,
  setTab,
  selectedContactForEmail,
  setSelectedContactForEmail,
  statusFilter,
  setStatusFilter,
  gmailToken,
  setGmailToken,
  emailClient,
  globalCc,
  globalBcc,
  customPlaceholders,
  emailFont,
  emailLineHeight,
  emailSignature
}) {
  const [search, setSearch] = useState('');
  
  // Selection states for Mass Campaigns
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiContact, setAiContact] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [generating, setGenerating] = useState(false);
  const [aiPromptCustom, setAiPromptCustom] = useState('');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);

  // Bulk sender state (reviewing drafted emails sequentially)
  const [bulkContacts, setBulkContacts] = useState([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Mass Campaign Modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignTemplateId, setCampaignTemplateId] = useState(templates[0]?.id || '');
  const [campaignStatus, setCampaignStatus] = useState('idle'); // idle | sending | completed
  const [campaignIndex, setCampaignIndex] = useState(0);
  const [campaignLogs, setCampaignLogs] = useState([]);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    cc: '',
    bcc: '',
    linkedin: '',
    foundVia: 'LinkedIn Search',
    status: 'Not Contacted',
    score: 80,
    followUpDate: '',
    responseNotes: '',
    notes: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-set 7 days follow-up helper
  const getSevenDaysLater = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const handleCopyRichText = async (subject, bodyText) => {
    const signatureHtml = emailSignature 
      ? emailSignature.replace(/\n/g, '<br />')
      : '';

    const bodyHtml = bodyText.replace(/\n/g, '<br />');

    const fullHtml = `
      <div style="font-family: ${emailFont}; font-size: 11pt; line-height: ${emailLineHeight}; color: #000000; margin: 0;">
        ${bodyHtml}
        ${signatureHtml ? `<br /><br />${signatureHtml}` : ''}
      </div>
    `;

    const fullPlainText = `${bodyText}${emailSignature ? `\n\n${emailSignature}` : ''}`;

    try {
      const blobHtml = new Blob([fullHtml], { type: 'text/html' });
      const blobPlain = new Blob([fullPlainText], { type: 'text/plain' });
      
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobPlain
      });

      await navigator.clipboard.write([item]);
      alert('Rich Text formatted email & signature successfully copied! You can now paste (Ctrl+V) directly into Outlook to preserve all fonts, line spacing, and signatures.');
    } catch (err) {
      console.error(err);
      await navigator.clipboard.writeText(fullPlainText);
      alert('Copied as plain text (Modern browser rich clipboard writing not supported on this browser version).');
    }
  };

  // Compile local offline templates
  const compileLocalTemplate = (template, contact, userProfile) => {
    if (!template) return { subject: 'Outreach', body: 'Hello...' };
    
    let subject = template.subject || '';
    let body = template.body || '';

    const replacements = {
      '\\[Contact Name\\]': contact.name || '',
      '\\[Contact Title\\]': contact.title || 'Recruiter',
      '\\[Company Name\\]': contact.company || 'Company',
      '\\[Found Via\\]': contact.foundVia || 'LinkedIn Outreach',
      '\\[Your Name\\]': userProfile.name || 'Tejith Chennuru',
      '\\[Your University\\]': userProfile.university || 'University Student',
      '\\[Your School\\]': userProfile.university || 'University Student',
      '\\[Portfolio Link\\]': userProfile.portfolio || 'github.com/my-profile',
      '\\[Project Link\\]': userProfile.portfolio || 'github.com/my-profile',
      '\\[Position Name\\]': contact.title ? `${contact.title} Internship` : 'Software Engineering Intern',
      '\\[Original Subject\\]': contact.emailDraftSubject || 'Software Engineering Internship Outreach',
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder, 'gi');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    // Dynamic user-defined custom placeholders replacement
    if (customPlaceholders && Array.isArray(customPlaceholders)) {
      customPlaceholders.forEach(p => {
        const escapedKey = p.key.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const regex = new RegExp(escapedKey, 'gi');
        subject = subject.replace(regex, p.value || '');
        body = body.replace(regex, p.value || '');
      });
    }

    return { subject, body };
  };

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      title: '',
      company: '',
      email: '',
      cc: '',
      bcc: '',
      linkedin: '',
      foundVia: 'LinkedIn Search',
      status: 'Not Contacted',
      score: 80,
      followUpDate: '',
      responseNotes: '',
      notes: '',
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      title: contact.title || '',
      company: contact.company || '',
      email: contact.email || '',
      cc: contact.cc || '',
      bcc: contact.bcc || '',
      linkedin: contact.linkedin || '',
      foundVia: contact.foundVia || 'LinkedIn Search',
      status: contact.status || 'Not Contacted',
      score: contact.score || 80,
      followUpDate: contact.followUpDate || '',
      responseNotes: contact.responseNotes || '',
      notes: contact.notes || '',
    });
    setShowAddEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
      setSelectedContactIds(selectedContactIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContact) {
      setContacts(contacts.map(c => {
        if (c.id === editingContact.id) {
          let followUp = formData.followUpDate;
          if (formData.status === 'Email Sent' && c.status !== 'Email Sent') {
            followUp = getSevenDaysLater();
          }
          return { 
            ...c, 
            ...formData, 
            followUpDate: followUp 
          };
        }
        return c;
      }));
    } else {
      const newContact = {
        id: 'ct_' + Math.random().toString(36).substr(2, 9),
        ...formData,
        emailDraftSubject: '',
        emailDraftBody: '',
      };
      if (newContact.status === 'Email Sent') {
        newContact.followUpDate = getSevenDaysLater();
      }
      setContacts([newContact, ...contacts]);
    }
    setShowAddEditModal(false);
  };

  const handlePostponeFollowUp = (contactId, days) => {
    setContacts(contacts.map(c => {
      if (c.id === contactId) {
        const baseDate = c.followUpDate ? new Date(c.followUpDate) : new Date();
        const start = isNaN(baseDate.getTime()) ? new Date() : baseDate;
        start.setDate(start.getDate() + days);
        return {
          ...c,
          followUpDate: start.toISOString().split('T')[0]
        };
      }
      return c;
    }));
  };

  // Compile deep link URLs based on selected client (Gmail, Outlook, Default Mailto) and CC/BCC
  const getEmailClientComposeUrl = (contact, subject, body) => {
    const to = contact.email;
    const s = subject || contact.emailDraftSubject || 'Internship Outreach';
    const b = body || contact.emailDraftBody || 'Hello...';
    
    // Resolve CC and BCC priorities (contact-specific CC -> global CC)
    const ccVal = contact.cc || globalCc || '';
    const bccVal = contact.bcc || globalBcc || '';

    if (emailClient === 'outlook') {
      return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&cc=${encodeURIComponent(ccVal)}&bcc=${encodeURIComponent(bccVal)}&subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
    } else if (emailClient === 'default') {
      return `mailto:${encodeURIComponent(to)}?cc=${encodeURIComponent(ccVal)}&bcc=${encodeURIComponent(bccVal)}&subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
    } else {
      // Default to Gmail Web
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&cc=${encodeURIComponent(ccVal)}&bcc=${encodeURIComponent(bccVal)}&su=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
    }
  };

  const handleOpenLinkedIn = (contact) => {
    if (contact.linkedin) {
      window.open(contact.linkedin, '_blank');
      setContacts(contacts.map(c => {
        if (c.id === contact.id) {
          return {
            ...c,
            status: 'Email Sent',
            followUpDate: getSevenDaysLater()
          };
        }
        return c;
      }));
    } else {
      alert('No LinkedIn URL provided for this contact.');
    }
  };

  // Redirect composer open
  const handleSendGmail = (contact, subject, body) => {
    const composeUrl = getEmailClientComposeUrl(contact, subject, body);
    window.open(composeUrl, '_blank');

    setContacts(contacts.map(c => {
      if (c.id === contact.id) {
        return {
          ...c,
          status: 'Email Sent',
          followUpDate: getSevenDaysLater()
        };
      }
      return c;
    }));
    
    setSelectedContactForEmail(null);
  };

  // Gmail API Direct send mechanism (no tabs opened!)
  const sendDirectEmail = async (to, subject, body, token, cc = '', bcc = '') => {
    const toBase64 = (str) => {
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        })
      );
    };

    const utf8Subject = `=?utf-8?B?${toBase64(subject)}?=`;
    const emailLines = [
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      body
    ].filter(Boolean);

    const email = emailLines.join('\r\n');
    const base64Safe = toBase64(email)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64Safe
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Gmail API returned status ${response.status}`);
    }

    return await response.json();
  };

  const handleSendDirectGmail = async (contact, subject, body) => {
    setGenerating(true);
    const s = subject || contact.emailDraftSubject || 'Internship Outreach';
    const b = body || contact.emailDraftBody || 'Hello...';
    const ccVal = contact.cc || globalCc || '';
    const bccVal = contact.bcc || globalBcc || '';

    try {
      await sendDirectEmail(contact.email, s, b, gmailToken, ccVal, bccVal);
      
      setContacts(contacts.map(c => {
        if (c.id === contact.id) {
          return {
            ...c,
            status: 'Email Sent',
            followUpDate: getSevenDaysLater()
          };
        }
        return c;
      }));

      alert(`Email sent successfully via Gmail API directly to ${contact.name}!`);
      setSelectedContactForEmail(null);
    } catch (err) {
      console.error(err);
      if (err.message.includes('401') || err.message.toLowerCase().includes('invalid credentials') || err.message.toLowerCase().includes('expired')) {
        alert('Your Google access token has expired. Falling back to Compose redirect compose tab...');
        setGmailToken(''); // reset token
        handleSendGmail(contact, s, b);
      } else {
        alert(`Error sending email directly: ${err.message}. Redirecting to Web compose fallback...`);
        handleSendGmail(contact, s, b);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenAiModal = (contact) => {
    setAiContact(contact);
    setAiPromptCustom('');
    setUseSearchGrounding(false);
    if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
    setShowAiModal(true);
  };

  // Compile template context (supports both local/API flows)
  const generateSingleDraftContext = async (contact, templateId, customInstruction = '', searchGrounding = false) => {
    const template = templates.find(t => t.id === templateId) || templates[0];
    
    // Check if key is missing and fall back
    const isGemini = aiProvider === 'gemini';
    const isOpenAi = aiProvider === 'openai';
    const needsFallback = (isGemini && !geminiApiKey) || (isOpenAi && !apiKey);

    if (aiProvider === 'local' || needsFallback) {
      const compiled = compileLocalTemplate(template, contact, profile);
      return { subject: compiled.subject, body: compiled.body, wasFallback: needsFallback };
    }

    // Google Search Grounding Prompt Additions
    const groundingContext = searchGrounding 
      ? `Search the internet for public information, LinkedIn profile details, articles, or news about ${contact.name} at company ${contact.company}. Use this context to personalize the outreach body to reference their specific achievements or recent projects.`
      : '';

    const prompt = `
      You are writing a personalized outreach email for an internship.
      Recipient details:
      - Name: ${contact.name}
      - Title: ${contact.title}
      - Company: ${contact.company}
      - Found Via: ${contact.foundVia}
      - Extra notes: ${contact.notes || 'None'}
      
      Sender details:
      - Name: ${profile.name}
      - University/School: ${profile.university}
      - Portfolio link: ${profile.portfolio || 'None'}
      - Resume/Qualifications context: ${resumeText || 'None supplied'}
      - Custom Placeholders context: ${JSON.stringify(customPlaceholders)}

      ${groundingContext}

      Use this template as inspiration but rewrite it to sound natural, personalized, direct, and non-generic.
      If the sender has supplied resume context, analyze it and pick 1 or 2 relevant achievements, skills, or projects and reference them naturally in the email body (instead of generic placeholders). Keep the pitch short, punchy, and direct.

      Subject Template: ${template.subject}
      Body Template: ${template.body}

      ${customInstruction ? `Specific user instructions to follow: ${customInstruction}` : ''}

      Return your response as a valid JSON object ONLY. Make sure it contains exactly two keys: "subject" and "body". Do not wrap the JSON in markdown code blocks or ticks.
    `;

    if (isGemini) {
      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      if (searchGrounding) {
        requestBody.tools = [
          {
            googleSearchRetrieval: {}
          }
        ];
      } else {
        requestBody.generationConfig = { responseMimeType: "application/json" };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      let cleaned = text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(cleaned);
    } else {
      // OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: openAiModel || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You write highly personalized outreach emails. You always return responses in JSON structure containing "subject" and "body" keys. Keep it concise, friendly, and professional.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }
  };

  const handleGenerateAiMessage = async () => {
    setGenerating(true);
    try {
      const result = await generateSingleDraftContext(aiContact, selectedTemplateId, aiPromptCustom, useSearchGrounding);
      setContacts(contacts.map(c => {
        if (c.id === aiContact.id) {
          return {
            ...c,
            emailDraftSubject: result.subject || 'Outreach',
            emailDraftBody: result.body || '',
            status: 'Email Drafted'
          };
        }
        return c;
      }));
      setShowAiModal(false);
      
      if (result.wasFallback) {
        alert(`API key was missing for ${aiProvider}. Automatically compiled the draft locally using your placeholders instead!`);
      } else {
        alert(`Outreach draft generated successfully for ${aiContact.name}!`);
      }
    } catch (err) {
      console.error(err);
      alert(`Draft generation failed: ${err.message}. Falling back to local template compiler...`);
      const template = templates.find(t => t.id === selectedTemplateId) || templates[0];
      const compiled = compileLocalTemplate(template, aiContact, profile);
      setContacts(contacts.map(c => {
        if (c.id === aiContact.id) {
          return {
            ...c,
            emailDraftSubject: compiled.subject,
            emailDraftBody: compiled.body,
            status: 'Email Drafted'
          };
        }
        return c;
      }));
      setShowAiModal(false);
    } finally {
      setGenerating(false);
    }
  };

  // Bulk Email Reviewer (reviews CONNECTED or DRAFTED sequentially)
  const handleOpenBulkSender = () => {
    const candidates = contacts.filter(c => 
      c.status === 'Connected' || c.status === 'Email Drafted'
    );
    if (candidates.length === 0) {
      alert('No contacts in "Connected" or "Email Drafted" status available for bulk review.');
      return;
    }
    setBulkContacts(candidates);
    setBulkIndex(0);
    setShowBulkModal(true);
  };

  const handleBulkApproveDirect = async () => {
    const contact = bulkContacts[bulkIndex];
    await handleSendDirectGmail(contact, contact.emailDraftSubject, contact.emailDraftBody);
    
    if (bulkIndex + 1 < bulkContacts.length) {
      setBulkIndex(bulkIndex + 1);
    } else {
      setShowBulkModal(false);
      alert('Bulk send workflow completed!');
    }
  };

  const handleBulkApproveComposeTab = () => {
    const contact = bulkContacts[bulkIndex];
    handleSendGmail(contact, contact.emailDraftSubject, contact.emailDraftBody);
    
    if (bulkIndex + 1 < bulkContacts.length) {
      setBulkIndex(bulkIndex + 1);
    } else {
      setShowBulkModal(false);
      alert('Bulk send workflow completed!');
    }
  };

  const handleBulkReject = () => {
    if (bulkIndex + 1 < bulkContacts.length) {
      setBulkIndex(bulkIndex + 1);
    } else {
      setShowBulkModal(false);
      alert('Bulk send workflow completed!');
    }
  };

  // --- Mass Campaign Engine ---
  const handleOpenCampaignModal = () => {
    if (selectedContactIds.length === 0) {
      alert('Please select at least one contact using the table row checkboxes first.');
      return;
    }
    setCampaignStatus('idle');
    setCampaignLogs([]);
    setShowCampaignModal(true);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runCampaign = async () => {
    setCampaignStatus('sending');
    const logs = [];
    const template = templates.find(t => t.id === campaignTemplateId) || templates[0];
    
    // Determine if background send via Gmail API is possible
    const canSendDirect = !!gmailToken;
    const ccVal = globalCc || '';
    const bccVal = globalBcc || '';

    // Loop through selected contact IDs sequentially
    for (let i = 0; i < selectedContactIds.length; i++) {
      setCampaignIndex(i);
      const contactId = selectedContactIds[i];
      const contact = contacts.find(c => c.id === contactId);

      if (!contact) continue;

      try {
        logs.push(`Processing lead: ${contact.name} (${contact.email})...`);
        setCampaignLogs([...logs]);

        // 1. Compile or Generate email draft if missing or outdated
        let subject = contact.emailDraftSubject;
        let body = contact.emailDraftBody;

        if (!subject || !body) {
          logs.push(`Generating personalized AI draft context for ${contact.name}...`);
          setCampaignLogs([...logs]);
          const generated = await generateSingleDraftContext(contact, campaignTemplateId);
          subject = generated.subject;
          body = generated.body;
        }

        // 2. Dispatch email
        if (canSendDirect) {
          // Send background Gmail API request
          logs.push(`Sending email via Gmail API directly to ${contact.email}...`);
          setCampaignLogs([...logs]);
          await sendDirectEmail(contact.email, subject, body, gmailToken, contact.cc || ccVal, contact.bcc || bccVal);
          logs.push(`✅ Successfully sent to ${contact.name}!`);
          
          // Update status in master array
          setContacts(prev => prev.map(c => {
            if (c.id === contactId) {
              return {
                ...c,
                emailDraftSubject: subject,
                emailDraftBody: body,
                status: 'Email Sent',
                followUpDate: getSevenDaysLater()
              };
            }
            return c;
          }));
        } else {
          // Open sequential browser tab redirection
          logs.push(`Opening web composer tab redirection for ${contact.email}...`);
          setCampaignLogs([...logs]);
          const composeUrl = getEmailClientComposeUrl(contact, subject, body);
          window.open(composeUrl, '_blank');
          logs.push(`✅ Opened tab compose for ${contact.name}.`);

          setContacts(prev => prev.map(c => {
            if (c.id === contactId) {
              return {
                ...c,
                emailDraftSubject: subject,
                emailDraftBody: body,
                status: 'Email Sent',
                followUpDate: getSevenDaysLater()
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error(err);
        logs.push(`❌ Failed for ${contact.name}: ${err.message}`);
      }

      setCampaignLogs([...logs]);
      
      // Throttle delay of 2 seconds to respect API rate limits and avoid spam detection
      if (i + 1 < selectedContactIds.length) {
        await sleep(2000);
      }
    }

    setCampaignStatus('completed');
    setSelectedContactIds([]); // clear selection
  };

  // Row selection helpers
  const handleSelectToggle = (id) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleSelectAllToggle = (filteredRows) => {
    const filteredIds = filteredRows.map(r => r.id);
    const allSelected = filteredIds.every(id => selectedContactIds.includes(id));

    if (allSelected) {
      // Deselect all visible
      setSelectedContactIds(selectedContactIds.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all visible
      const combined = Array.from(new Set([...selectedContactIds, ...filteredIds]));
      setSelectedContactIds(combined);
    }
  };

  // Filters and Search
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Manage Contacts</h1>
          <p className="page-subtitle">Personalize your pitches, track follow-ups, and automate your outreach.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {selectedContactIds.length > 0 && (
            <button className="btn btn-primary" onClick={handleOpenCampaignModal} style={{ background: 'var(--color-warning)', border: 'none' }}>
              Mass Campaign ({selectedContactIds.length})
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleOpenBulkSender}>
            Bulk Reviewer
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search />
          <input 
            type="text" 
            placeholder="Search contacts, title, or company..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          {['All', 'Not Contacted', 'Connected', 'Email Drafted', 'Email Sent', 'Replied', 'Interview Scheduled', 'Offer'].map(status => (
            <button 
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th style={{ width: '40px', paddingLeft: '16px' }}>
                <input 
                  type="checkbox" 
                  checked={filteredContacts.length > 0 && filteredContacts.every(c => selectedContactIds.includes(c.id))}
                  onChange={() => handleSelectAllToggle(filteredContacts)}
                />
              </th>
              <th>Contact Name</th>
              <th>Company & Title</th>
              <th>CC / BCC Copy</th>
              <th>Outreach Status</th>
              <th>Match Score</th>
              <th>Follow-Up Date</th>
              <th>Draft & Actions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id} className={selectedContactIds.includes(contact.id) ? 'selected-row' : ''}>
                <td style={{ paddingLeft: '16px' }}>
                  <input 
                    type="checkbox"
                    checked={selectedContactIds.includes(contact.id)}
                    onChange={() => handleSelectToggle(contact.id)}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{contact.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.email}</div>
                </td>
                <td>
                  <div>{contact.company}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.title}</div>
                  {contact.notes && (
                    <div 
                      style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={contact.notes}
                    >
                      "{contact.notes}"
                    </div>
                  )}
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>CC: {contact.cc || globalCc || 'None'}</div>
                  <div style={{ marginTop: '2px' }}>BCC: {contact.bcc || globalBcc || 'None'}</div>
                </td>
                <td>
                  <span className={`status-badge ${contact.status.toLowerCase().replace(' ', '-')}`}>
                    {contact.status}
                  </span>
                </td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  <span style={{ color: contact.score >= 85 ? 'var(--color-success)' : contact.score >= 70 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                    {contact.score}%
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} className="text-secondary" />
                      <span className={contact.followUpDate && contact.followUpDate < todayStr && contact.status !== 'Offer' ? 'color-danger' : ''}>
                        {contact.followUpDate ? contact.followUpDate : 'Not Set'}
                      </span>
                    </div>
                    {contact.followUpDate && contact.status !== 'Offer' && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                        <button 
                          className="btn-tiny" 
                          style={{ fontSize: '0.65rem', padding: '1px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          onClick={() => handlePostponeFollowUp(contact.id, 3)}
                          title="Postpone follow-up by 3 days"
                        >
                          +3d
                        </button>
                        <button 
                          className="btn-tiny" 
                          style={{ fontSize: '0.65rem', padding: '1px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          onClick={() => handlePostponeFollowUp(contact.id, 7)}
                          title="Postpone follow-up by 7 days"
                        >
                          +7d
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="btn-action-group">
                    <button 
                      className="btn-icon primary" 
                      title={aiProvider === 'local' ? "Compile template locally" : "Generate personalized AI Email draft"}
                      onClick={() => handleOpenAiModal(contact)}
                    >
                      <Sparkles size={14} />
                    </button>
                    {contact.emailDraftSubject ? (
                      <button 
                        className="btn-icon success" 
                        title="Review and send email"
                        onClick={() => setSelectedContactForEmail(contact)}
                      >
                        <Mail size={14} />
                      </button>
                    ) : (
                      <button 
                        className="btn-icon" 
                        title="No email draft generated yet"
                        disabled
                        style={{ opacity: 0.3, cursor: 'not-allowed' }}
                      >
                        <Mail size={14} />
                      </button>
                    )}
                    <button 
                      className="btn-icon" 
                      title="Open LinkedIn profile"
                      onClick={() => handleOpenLinkedIn(contact)}
                    >
                      <Linkedin size={14} />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="btn-action-group">
                    <button className="btn-icon" onClick={() => handleOpenEditModal(contact)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(contact.id)}>
                      <Trash2 size={12} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredContacts.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No contacts found matching search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Contact Modal */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
              <button className="btn-icon" onClick={() => setShowAddEditModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Custom CC (Overrides Default CC)</label>
                    <input 
                      type="email" 
                      className="form-input"
                      placeholder="e.g. tracking@uni.edu"
                      value={formData.cc}
                      onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Custom BCC (Overrides Default BCC)</label>
                    <input 
                      type="email" 
                      className="form-input"
                      placeholder="e.g. bcc@archive.com"
                      value={formData.bcc}
                      onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Target Company</label>
                    <select 
                      className="form-select"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    >
                      <option value="">Select a company</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title / Role</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Recruiter, EM"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input 
                      type="url" 
                      className="form-input"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Found Via</label>
                    <select 
                      className="form-select"
                      value={formData.foundVia}
                      onChange={(e) => setFormData({ ...formData, foundVia: e.target.value })}
                    >
                      <option value="LinkedIn Search">LinkedIn Search</option>
                      <option value="Campus Career Fair">Campus Career Fair</option>
                      <option value="Alumni Network">Alumni Network</option>
                      <option value="Cold Outreach">Cold Outreach</option>
                      <option value="GitHub Contribution">GitHub Contribution</option>
                      <option value="Referral">Referral</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Outreach Status</label>
                    <select 
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Not Contacted">Not Contacted</option>
                      <option value="Connected">Connected</option>
                      <option value="Email Drafted">Email Drafted</option>
                      <option value="Email Sent">Email Sent</option>
                      <option value="Replied">Replied</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offer">Offer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Score (Match %)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      className="form-input"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 70 })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Follow-Up Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Response Notes</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Replied, interested"
                      className="form-input"
                      value={formData.responseNotes}
                      onChange={(e) => setFormData({ ...formData, responseNotes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Notes / Background Details</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Mention specific skills or projects discussed..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingContact ? 'Save Changes' : 'Create Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Outreach Draft Modal */}
      {showAiModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--primary-light)' }} />
                {aiProvider === 'local' ? 'Compile Local Draft' : 'Generate AI Outreach'}
              </h2>
              <button className="btn-icon" onClick={() => setShowAiModal(false)} disabled={generating}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Create a personalized outreach email for <strong>{aiContact?.name}</strong> at <strong>{aiContact?.company}</strong>.
              </p>

              <div className="form-group">
                <label className="form-label">Base Outreach Template</label>
                <select 
                  className="form-select"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  disabled={generating}
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {aiProvider !== 'local' && (
                <div className="form-group">
                  <label className="form-label">Additional Instructions / Direct Customization (Optional)</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="e.g. Mention that I built a React dashboard, or make it extremely short and direct..."
                    value={aiPromptCustom}
                    onChange={(e) => setAiPromptCustom(e.target.value)}
                    disabled={generating}
                  />
                </div>
              )}

              {aiProvider === 'gemini' && !generating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: '8px', marginTop: '12px' }}>
                  <input 
                    type="checkbox"
                    id="search_grounding_cb"
                    checked={useSearchGrounding}
                    onChange={(e) => setUseSearchGrounding(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="search_grounding_cb" style={{ fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', margin: 0 }}>
                    💡 Search Online (Enable Google Search grounding context)
                  </label>
                </div>
              )}

              {generating && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                  <div className="ai-spinner" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                    {aiProvider === 'gemini' ? 'Gemini Free Tier is generating personalized draft...' : 'ChatGPT is generating personalized draft...'}
                  </span>
                </div>
              )}

              {aiProvider === 'local' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                  <strong>Note:</strong> In Local compiler mode, drafts are created instantly on your device by parsing and filling placeholder tags.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAiModal(false)} disabled={generating}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleGenerateAiMessage} disabled={generating}>
                <Sparkles size={14} /> {aiProvider === 'local' ? 'Compile Draft' : 'Generate Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sequential Bulk Email Reviewer Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Bulk Outreach Approvals ({bulkIndex + 1} of {bulkContacts.length})</h2>
              <button className="btn-icon" onClick={() => setShowBulkModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div><strong>Name:</strong> {bulkContacts[bulkIndex]?.name}</div>
                  <div><strong>Email:</strong> {bulkContacts[bulkIndex]?.email}</div>
                  <div><strong>Company:</strong> {bulkContacts[bulkIndex]?.company}</div>
                  <div><strong>Title:</strong> {bulkContacts[bulkIndex]?.title}</div>
                </div>
              </div>

              {bulkContacts[bulkIndex]?.emailDraftSubject ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={bulkContacts[bulkIndex].emailDraftSubject}
                      onChange={(e) => {
                        const updated = [...bulkContacts];
                        updated[bulkIndex].emailDraftSubject = e.target.value;
                        setBulkContacts(updated);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message Body</label>
                    <textarea 
                      className="form-textarea"
                      style={{ minHeight: '180px' }}
                      value={bulkContacts[bulkIndex].emailDraftBody}
                      onChange={(e) => {
                        const updated = [...bulkContacts];
                        updated[bulkIndex].emailDraftBody = e.target.value;
                        setBulkContacts(updated);
                      }}
                    />
                  </div>

                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Visual Outlook Preview</label>
                      <button 
                        type="button"
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.7rem', padding: '3px 8px', margin: 0 }}
                        onClick={() => handleCopyRichText(bulkContacts[bulkIndex].emailDraftSubject, bulkContacts[bulkIndex].emailDraftBody)}
                      >
                        Copy Rich Text
                      </button>
                    </div>
                    <div 
                      style={{ 
                        background: '#ffffff', 
                        color: '#000000', 
                        padding: '12px 14px', 
                        borderRadius: '8px', 
                        fontFamily: emailFont, 
                        lineHeight: emailLineHeight, 
                        fontSize: '13px', 
                        minHeight: '140px', 
                        maxHeight: '220px',
                        overflowY: 'auto',
                        border: '1px solid var(--border)',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {bulkContacts[bulkIndex].emailDraftBody}
                      {emailSignature && (
                        <div style={{ marginTop: '18px', borderTop: '1px dashed rgba(0,0,0,0.15)', paddingTop: '10px', fontSize: '12px', color: '#444444' }}>
                          {emailSignature}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  No draft has been generated for this contact yet. Would you like to generate one?
                  <div style={{ marginTop: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => {
                      setShowBulkModal(false);
                      handleOpenAiModal(bulkContacts[bulkIndex]);
                    }}>Generate AI Draft</button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-secondary" onClick={handleBulkReject}>
                Skip Contact (No)
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  disabled={!bulkContacts[bulkIndex]?.emailDraftSubject}
                  onClick={handleBulkApproveComposeTab}
                >
                  Approve & Open Composer Tab
                </button>
                {gmailToken && (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    disabled={!bulkContacts[bulkIndex]?.emailDraftSubject || generating}
                    onClick={handleBulkApproveDirect}
                    style={{ gap: '6px' }}
                  >
                    <Send size={12} /> Approve & Send Direct
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mass Campaign Dispatcher Modal */}
      {showCampaignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} style={{ color: 'var(--color-warning)' }} />
                Execute Outreach Campaign ({selectedContactIds.length} Selected Leads)
              </h2>
              <button className="btn-icon" onClick={() => setShowCampaignModal(false)} disabled={campaignStatus === 'sending'}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {campaignStatus === 'idle' ? (
                <>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Launch an automated outreach run to the {selectedContactIds.length} selected recipients. The platform will dynamically compile or AI-generate drafts for any contacts missing customized email bodies before sending.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Outreach Pitch Template</label>
                    <select 
                      className="form-select"
                      value={campaignTemplateId}
                      onChange={(e) => setCampaignTemplateId(e.target.value)}
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.8rem' }}>
                    <div>
                      <strong>Sender Account:</strong> {gmailToken ? 'Direct Gmail API (Connected)' : `Browser Redirection Client (${emailClient})`}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {gmailToken 
                          ? 'Campaign will run fully in the background automatically.' 
                          : 'Campaign will open a series of pre-filled composer browser tabs sequentially.'}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <strong>Campaign Dispatch Status:</strong>
                    <span>{campaignIndex + 1} of {selectedContactIds.length} processed</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ 
                      width: `${((campaignIndex + (campaignStatus === 'completed' ? 1 : 0)) / selectedContactIds.length) * 100}%`, 
                      height: '100%', 
                      background: 'var(--color-success)', 
                      transition: 'width 0.3s ease' 
                    }} />
                  </div>

                  {/* Logs console */}
                  <div style={{ height: '220px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {campaignLogs.map((log, idx) => (
                      <div key={idx} className={log.includes('❌') ? 'color-danger' : log.includes('✅') ? 'color-success' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowCampaignModal(false)}
                disabled={campaignStatus === 'sending'}
              >
                {campaignStatus === 'completed' ? 'Close' : 'Cancel'}
              </button>
              {campaignStatus === 'idle' && (
                <button type="button" className="btn btn-primary" onClick={runCampaign}>
                  Launch Outreach Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Individual Email Draft Modal */}
      {selectedContactForEmail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Review Email Draft: {selectedContactForEmail.name}</h2>
              <button className="btn-icon" onClick={() => setSelectedContactForEmail(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Recipient Email</label>
                  <input 
                    type="text" 
                    disabled 
                    className="form-input" 
                    style={{ opacity: 0.7 }}
                    value={selectedContactForEmail.email}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Recipient CC (Copy)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="None"
                    value={selectedContactForEmail.cc || globalCc || ''}
                    onChange={(e) => {
                      const newCc = e.target.value;
                      setContacts(contacts.map(c => 
                        c.id === selectedContactForEmail.id ? { ...c, cc: newCc } : c
                      ));
                      setSelectedContactForEmail({ ...selectedContactForEmail, cc: newCc });
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={selectedContactForEmail.emailDraftSubject}
                  onChange={(e) => {
                    const newSubject = e.target.value;
                    setContacts(contacts.map(c => 
                      c.id === selectedContactForEmail.id ? { ...c, emailDraftSubject: newSubject } : c
                    ));
                    setSelectedContactForEmail({ ...selectedContactForEmail, emailDraftSubject: newSubject });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Body</label>
                <textarea 
                  className="form-textarea"
                  style={{ minHeight: '220px' }}
                  value={selectedContactForEmail.emailDraftBody}
                  onChange={(e) => {
                    const newBody = e.target.value;
                    setContacts(contacts.map(c => 
                      c.id === selectedContactForEmail.id ? { ...c, emailDraftBody: newBody } : c
                    ));
                    setSelectedContactForEmail({ ...selectedContactForEmail, emailDraftBody: newBody });
                  }}
                />
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Visual Outlook Preview</label>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.7rem', padding: '3px 8px', margin: 0 }}
                    onClick={() => handleCopyRichText(selectedContactForEmail.emailDraftSubject, selectedContactForEmail.emailDraftBody)}
                  >
                    Copy Rich Text
                  </button>
                </div>
                <div 
                  style={{ 
                    background: '#ffffff', 
                    color: '#000000', 
                    padding: '12px 14px', 
                    borderRadius: '8px', 
                    fontFamily: emailFont, 
                    lineHeight: emailLineHeight, 
                    fontSize: '13px', 
                    minHeight: '140px', 
                    maxHeight: '220px',
                    overflowY: 'auto',
                    border: '1px solid var(--border)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {selectedContactForEmail.emailDraftBody}
                  {emailSignature && (
                    <div style={{ marginTop: '18px', borderTop: '1px dashed rgba(0,0,0,0.15)', paddingTop: '10px', fontSize: '12px', color: '#444444' }}>
                      {emailSignature}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedContactForEmail(null)}>Close</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => handleSendGmail(selectedContactForEmail, selectedContactForEmail.emailDraftSubject, selectedContactForEmail.emailDraftBody)}
                style={{ gap: '6px' }}
              >
                Send via {emailClient === 'gmail' ? 'Gmail Web' : emailClient === 'outlook' ? 'Outlook Web' : 'Default Mail'} <ExternalLink size={14} />
              </button>
              {gmailToken && (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleSendDirectGmail(selectedContactForEmail)}
                  disabled={generating}
                  style={{ gap: '6px' }}
                >
                  <Send size={14} /> Send Direct via Gmail API
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
