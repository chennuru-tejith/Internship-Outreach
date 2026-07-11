import React from 'react';
import { Kanban, ArrowLeft, ArrowRight, CheckCircle, Mail, ExternalLink, Calendar, Search } from 'lucide-react';

const Linkedin = ({ size = 20, ...props }) => (
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

export default function Pipeline({ contacts, setContacts, setTab, setSelectedContactForEmail }) {
  
  // Columns definition mapping CRM status values
  const columns = [
    {
      id: 'inbox',
      title: 'Inbox / Drafts',
      statuses: ['Not Contacted', 'Email Drafted'],
      color: 'var(--text-secondary)',
      badgeClass: 'not-contacted'
    },
    {
      id: 'sent',
      title: 'Outreach Sent',
      statuses: ['Email Sent', 'Connected'],
      color: 'var(--primary)',
      badgeClass: 'sent'
    },
    {
      id: 'replied',
      title: 'Active Replies',
      statuses: ['Replied'],
      color: 'var(--secondary)',
      badgeClass: 'replied'
    },
    {
      id: 'interviews',
      title: 'Interviews',
      statuses: ['Interview Scheduled'],
      color: 'var(--color-success)',
      badgeClass: 'interview'
    },
    {
      id: 'offers',
      title: 'Offers Received',
      statuses: ['Offer'],
      color: 'var(--color-success)',
      badgeClass: 'offer'
    }
  ];

  // Helper to shift contact status
  const shiftStatus = (contactId, direction) => {
    const statusOrder = [
      'Not Contacted',
      'Email Sent',
      'Replied',
      'Interview Scheduled',
      'Offer'
    ];

    const currentContact = contacts.find(c => c.id === contactId);
    if (!currentContact) return;

    // Normalise status if it's 'Email Drafted' or 'Connected'
    let normStatus = currentContact.status;
    if (normStatus === 'Email Drafted') normStatus = 'Not Contacted';
    if (normStatus === 'Connected') normStatus = 'Email Sent';

    const currentIndex = statusOrder.indexOf(normStatus);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= statusOrder.length) nextIndex = statusOrder.length - 1;

    const nextStatus = statusOrder[nextIndex];

    setContacts(contacts.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          status: nextStatus,
          // Auto-set standard follow-up dates when status changes
          followUpDate: nextStatus === 'Email Sent' 
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : c.followUpDate
        };
      }
      return c;
    }));
  };

  const handleCompose = (contact) => {
    setSelectedContactForEmail(contact);
    setTab('contacts');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Visual Outreach Pipeline</h1>
        <p className="page-subtitle">Manage recruiters, follow-ups, and interview stages with a Kanban workflow board.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', height: 'calc(100vh - 200px)', minHeight: '550px', overflowX: 'auto', paddingBottom: '16px' }}>
        {columns.map(col => {
          const colContacts = contacts.filter(c => col.statuses.includes(c.status));
          
          return (
            <div key={col.id} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)', borderRadius: '14px', display: 'flex', flexDirection: 'column', height: '100%', minWidth: '220px' }}>
              
              {/* Column Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: col.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {col.title}
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                  {colContacts.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colContacts.map(contact => (
                  <div 
                    key={contact.id} 
                    style={{ 
                      background: 'var(--bg-card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px', 
                      padding: '12px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px',
                      transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-active)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Header: Name and Fit score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)', wordBreak: 'break-word', maxWidth: '70%' }}>
                        {contact.name}
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.05)', padding: '1px 6px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        {contact.score}%
                      </span>
                    </div>

                    {/* Company and Role */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {contact.title} at <strong style={{ color: 'var(--text-primary)' }}>{contact.company}</strong>
                    </div>

                    {/* Follow-up date warning */}
                    {contact.followUpDate && (
                      <div style={{ fontSize: '0.65rem', color: contact.followUpDate < new Date().toISOString().split('T')[0] ? 'var(--color-danger)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={10} /> Follow-up: {contact.followUpDate}
                      </div>
                    )}

                    {/* Notes Snippet */}
                    {contact.notes && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>
                        {contact.notes.replace(/^Scouted for [^.]+.\s*Match context:\s*/, '💡 ')}
                      </div>
                    )}

                    {/* Action controls footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {col.id !== 'inbox' && (
                          <button 
                            className="btn-icon" 
                            title="Move back" 
                            style={{ width: '22px', height: '22px', borderRadius: '6px' }}
                            onClick={() => shiftStatus(contact.id, -1)}
                          >
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {col.id !== 'offers' && (
                          <button 
                            className="btn-icon" 
                            title="Advance stage" 
                            style={{ width: '22px', height: '22px', borderRadius: '6px' }}
                            onClick={() => shiftStatus(contact.id, 1)}
                          >
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>

                      {/* Launch direct email compose */}
                      <button 
                        className="btn-icon primary"
                        title="Review and send outreach email"
                        style={{ width: '22px', height: '22px', borderRadius: '6px' }}
                        onClick={() => handleCompose(contact)}
                      >
                        <Mail size={10} />
                      </button>
                    </div>
                  </div>
                ))}

                {colContacts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
                    Empty column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
