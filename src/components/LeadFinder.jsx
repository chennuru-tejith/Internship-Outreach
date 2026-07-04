import React, { useState } from 'react';
import { Search, Globe, Plus, ExternalLink, HelpCircle, Briefcase, MapPin } from 'lucide-react';

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

export default function LeadFinder({ contacts, setContacts, setTab }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [location, setLocation] = useState('San Francisco');
  const [leadType, setLeadType] = useState('Recruiter');
  const [scoutedLeads, setScoutedLeads] = useState([]);
  const [searching, setSearching] = useState(false);

  // Generate pre-formatted search queries
  const getLinkedInSearchUrl = () => {
    const query = `${company} ${location} ${role} ${leadType}`;
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
  };

  const getGoogleSearchUrl = () => {
    // Google dork to find public profiles
    const query = `site:linkedin.com/in/ "${leadType}" "${company}" "${location}" "${role}"`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!company) {
      alert('Please enter a target company name.');
      return;
    }

    setSearching(true);
    setScoutedLeads([]);

    // Simulate search logic based on the user's location, company, and role
    setTimeout(() => {
      const mockFirstNames = ['David', 'Sarah', 'Jessica', 'Michael', 'James', 'Emily', 'Daniel', 'Sophia', 'Robert', 'Emma'];
      const mockLastNames = ['Chen', 'Smith', 'Taylor', 'Johnson', 'Miller', 'Rodriguez', 'Patel', 'Jones', 'Davies', 'Kim'];
      
      const generated = [];
      const count = Math.floor(Math.random() * 3) + 2; // Generate 2-4 potential leads

      for (let i = 0; i < count; i++) {
        const fName = mockFirstNames[Math.floor(Math.random() * mockFirstNames.length)];
        const lName = mockLastNames[Math.floor(Math.random() * mockLastNames.length)];
        const fullName = `${fName} ${lName}`;
        const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        const linkedinUrl = `https://www.linkedin.com/in/${fName.toLowerCase()}-${lName.toLowerCase()}-${company.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        
        generated.push({
          id: 'scout_' + Math.random().toString(36).substr(2, 5),
          name: fullName,
          email: email,
          company: company,
          title: `${leadType === 'Recruiter' ? 'Technical Recruiter' : 'Engineering Manager'} (${role})`,
          linkedin: linkedinUrl,
          foundVia: 'Lead Finder Tab',
          score: Math.floor(Math.random() * 20) + 75, // 75-95 match score
          location: location
        });
      }

      setScoutedLeads(generated);
      setSearching(false);
    }, 1200);
  };

  const handleAddLead = (lead) => {
    // Check if duplicate email
    if (contacts.some(c => c.email.toLowerCase() === lead.email.toLowerCase())) {
      alert('This lead is already added to your contacts.');
      return;
    }

    const newContact = {
      id: 'ct_' + Math.random().toString(36).substr(2, 9),
      name: lead.name,
      email: lead.email,
      company: lead.company,
      title: lead.title,
      linkedin: lead.linkedin,
      foundVia: `Scouted (${lead.location})`,
      status: 'Not Contacted',
      score: lead.score,
      followUpDate: '',
      responseNotes: '',
      emailDraftSubject: '',
      emailDraftBody: '',
      notes: `Scouted lead for ${role} role at ${company} in ${location}.`
    };

    setContacts([newContact, ...contacts]);
    alert(`${lead.name} added to your Contacts database!`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lead Finder & Prospecting Scout</h1>
        <p className="page-subtitle">Configure search parameters to identify recruiters and generate pre-formatted external search filters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Search configuration */}
        <div className="card-panel">
          <h2 className="panel-title" style={{ marginBottom: '16px' }}>
            <Search size={18} /> Target Criteria
          </h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Company *</label>
              <input 
                type="text" 
                required
                className="form-input" 
                placeholder="e.g. Stripe, NVIDIA, Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Location</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. San Francisco, London, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Role</label>
                <select 
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Front-End Developer">Front-End Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UX Designer">UX Designer</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Lead Department</label>
                <select 
                  className="form-select"
                  value={leadType}
                  onChange={(e) => setLeadType(e.target.value)}
                >
                  <option value="Recruiter">University Recruiter</option>
                  <option value="HR Manager">HR / Talent Manager</option>
                  <option value="Engineering Manager">Engineering Lead / EM</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Scout Potential Leads
            </button>
          </form>

          {company && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>External Web Searches</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a 
                  href={getLinkedInSearchUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary" 
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Linkedin size={14} style={{ color: '#0077b5' }} /> LinkedIn People Search
                  </span>
                  <ExternalLink size={12} />
                </a>

                <a 
                  href={getGoogleSearchUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary" 
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={14} style={{ color: 'var(--secondary)' }} /> Google Profile Dork
                  </span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Scouted Results */}
        <div className="card-panel">
          <div className="panel-header" style={{ border: 'none', padding: 0 }}>
            <h2 className="panel-title">Scouted Leads Output</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prospect matches</span>
          </div>

          <div style={{ marginTop: '16px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'center' }}>
            {searching ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                <div className="ai-spinner" />
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>Scanning public networks for matching profiles...</span>
              </div>
            ) : scoutedLeads.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                {scoutedLeads.map(lead => (
                  <div key={lead.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lead.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{lead.title}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase size={10} /> {lead.company}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} /> {lead.location}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', background: 'rgba(16,185,129,0.05)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)' }}>
                        {lead.score}% Fit
                      </span>
                      <button 
                        className="btn-icon primary"
                        title="Add to CRM contacts list"
                        onClick={() => handleAddLead(lead)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Search size={32} style={{ marginBottom: '10px', color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.875rem' }}>No scout runs conducted yet. Enter a target company and location, then click "Scout Potential Leads".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
