import React, { useState } from 'react';
import { 
  Plus, Search, Mail, Edit2, Trash2, 
  Sparkles, Check, X, ExternalLink, Calendar, HelpCircle 
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
  setTab,
  selectedContactForEmail,
  setSelectedContactForEmail,
  statusFilter,
  setStatusFilter
}) {
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // AI Draft modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiContact, setAiContact] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [generating, setGenerating] = useState(false);
  const [aiPromptCustom, setAiPromptCustom] = useState('');

  // Bulk sender state
  const [bulkContacts, setBulkContacts] = useState([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
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

    return { subject, body };
  };

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      title: '',
      company: '',
      email: '',
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

  const handleSendGmail = (contact, subject, body) => {
    const s = subject || contact.emailDraftSubject || 'Internship Outreach';
    const b = body || contact.emailDraftBody || 'Hello...';
    const mailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}&su=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
    window.open(mailUrl, '_blank');

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

  const handleOpenAiModal = (contact) => {
    setAiContact(contact);
    setAiPromptCustom('');
    if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
    setShowAiModal(true);
  };

  const handleGenerateAiMessage = async () => {
    const template = templates.find(t => t.id === selectedTemplateId) || templates[0];
    
    // --- LOCAL OFFLINE SUBSTITUTION ---
    if (aiProvider === 'local') {
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
      alert(`Draft offline-generated for ${aiContact.name}!`);
      return;
    }

    // --- GEMINI FREE TIER GENERATOR ---
    if (aiProvider === 'gemini') {
      if (!geminiApiKey) {
        alert('Please enter your Gemini API key in the Settings tab to use the free generation features.');
        setTab('settings');
        setShowAiModal(false);
        return;
      }

      setGenerating(true);

      const prompt = `
        You are writing a personalized outreach email for an internship.
        Recipient details:
        - Name: ${aiContact.name}
        - Title: ${aiContact.title}
        - Company: ${aiContact.company}
        - Found Via: ${aiContact.foundVia}
        - Extra notes: ${aiContact.notes || 'None'}
        
        Sender details:
        - Name: ${profile.name}
        - University/School: ${profile.university}
        - Portfolio link: ${profile.portfolio || 'None'}

        Use this template as inspiration but rewrite it to sound natural, personalized, direct, and non-generic:
        Subject Template: ${template.subject}
        Body Template: ${template.body}

        ${aiPromptCustom ? `Specific user instructions to follow: ${aiPromptCustom}` : ''}

        Return your response as a valid JSON object ONLY. Make sure it contains exactly two keys: "subject" and "body". Do not wrap the JSON in markdown code blocks or ticks.
      `;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API returned error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(text);

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
        alert(`Personalized draft successfully generated via Gemini Free Tier for ${aiContact.name}!`);
      } catch (err) {
        console.error(err);
        alert(`Error generating message: ${err.message}`);
      } finally {
        setGenerating(false);
      }
      return;
    }

    // --- OPENAI PAID GENERATOR ---
    if (aiProvider === 'openai') {
      if (!apiKey) {
        alert('Please enter your OpenAI API key in the Settings tab to generate AI outreach emails.');
        setTab('settings');
        setShowAiModal(false);
        return;
      }

      setGenerating(true);
      const prompt = `
        You are writing a personalized outreach email for an internship.
        Recipient details:
        - Name: ${aiContact.name}
        - Title: ${aiContact.title}
        - Company: ${aiContact.company}
        - Found Via: ${aiContact.foundVia}
        - Extra Notes: ${aiContact.notes || 'None'}
        
        Sender's Name: ${profile.name}
        Sender's University: ${profile.university}
        Sender's Portfolio: ${profile.portfolio || 'None'}
        
        We want to use this outreach template as inspiration, but customize it so it sounds completely natural, non-generic, highly personalized, and direct:
        Subject Template: ${template?.subject || 'Outreach'}
        Body Template: ${template?.body || 'Hello...'}

        ${aiPromptCustom ? `Specific Instructions from user: ${aiPromptCustom}` : ''}

        Return response in JSON format:
        {
          "subject": "The email subject line here",
          "body": "The complete email body here"
        }
      `;

      try {
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

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

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
        alert(`AI Draft successfully generated for ${aiContact.name}!`);
      } catch (err) {
        console.error(err);
        alert(`Error generating message: ${err.message}`);
      } finally {
        setGenerating(false);
      }
    }
  };

  // Bulk Email Sender
  const handleOpenBulkSender = () => {
    const candidates = contacts.filter(c => 
      c.status === 'Connected' || c.status === 'Email Drafted'
    );
    if (candidates.length === 0) {
      alert('No contacts in "Connected" or "Email Drafted" status available for bulk sending.');
      return;
    }
    setBulkContacts(candidates);
    setBulkIndex(0);
    setShowBulkModal(true);
  };

  const handleBulkApprove = () => {
    const contact = bulkContacts[bulkIndex];
    handleSendGmail(contact, contact.emailDraftSubject || 'Outreach', contact.emailDraftBody || 'Hi...');
    
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
          <button className="btn btn-secondary" onClick={handleOpenBulkSender}>
            Bulk Email Sender
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
              <th>Contact Name</th>
              <th>Company & Title</th>
              <th>Found Via</th>
              <th>Outreach Status</th>
              <th>Match Score</th>
              <th>Follow-Up Date</th>
              <th>Draft & Actions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{contact.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.email}</div>
                </td>
                <td>
                  <div>{contact.company}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.title}</div>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {contact.foundVia}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} className="text-secondary" />
                    <span className={contact.followUpDate && contact.followUpDate < todayStr && contact.status !== 'Offer' ? 'color-danger' : ''}>
                      {contact.followUpDate ? contact.followUpDate : 'Not Set'}
                    </span>
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
                        title="Review and send email via Gmail compose"
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
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
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
                      onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
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

      {/* Bulk Email Sender Modal */}
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
              <button 
                type="button" 
                className="btn btn-primary" 
                disabled={!bulkContacts[bulkIndex]?.emailDraftSubject}
                onClick={handleBulkApprove}
              >
                Approve & Open Gmail (Yes)
              </button>
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
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedContactForEmail(null)}>Close</button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => handleSendGmail(selectedContactForEmail)}
              >
                Send via Gmail Compose <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
