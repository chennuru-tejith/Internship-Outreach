import React from 'react';
import { 
  Users, CheckCircle, MessageSquare, Briefcase, Calendar, 
  ArrowUpRight, AlertCircle, Mail, ExternalLink, Award 
} from 'lucide-react';

export default function Dashboard({ contacts, companies, setTab, setSelectedContactForEmail }) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to format dates nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // 1. KPI Calculations
  const totalLeads = contacts.length;
  const connectedLeads = contacts.filter(c => 
    ['Connected', 'Email Sent', 'Replied', 'Interview Scheduled', 'Offer'].includes(c.status)
  ).length;
  const repliedLeads = contacts.filter(c => 
    ['Replied', 'Interview Scheduled', 'Offer'].includes(c.status)
  ).length;
  const interviewLeads = contacts.filter(c => 
    ['Interview Scheduled', 'Offer'].includes(c.status)
  ).length;
  const offers = contacts.filter(c => c.status === 'Offer').length;

  const connectionRate = totalLeads ? Math.round((connectedLeads / totalLeads) * 100) : 0;
  const replyRate = connectedLeads ? Math.round((repliedLeads / connectedLeads) * 100) : 0;
  const interviewRate = repliedLeads ? Math.round((interviewLeads / repliedLeads) * 100) : 0;

  // 2. Today's Action Items & Overdue
  const overdueContacts = contacts.filter(c => 
    c.followUpDate && c.followUpDate < todayStr && c.status !== 'Offer'
  );
  
  const todayFollowUps = contacts.filter(c => 
    c.followUpDate === todayStr && c.status !== 'Offer'
  );

  const draftOutbox = contacts.filter(c => 
    c.status === 'Email Drafted' && c.emailDraftSubject
  );

  // 3. Goals (Static/Dynamic Targets)
  const connectionGoal = 10;
  const interviewGoal = 2;
  const connectionProgress = Math.min(Math.round((connectedLeads / connectionGoal) * 100), 100);
  const interviewProgress = Math.min(Math.round((interviewLeads / interviewGoal) * 100), 100);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Personal Outreach Dashboard</h1>
        <p className="page-subtitle">Track your internship conversions, manage follow-ups, and send AI drafts.</p>
      </div>

      {overdueContacts.length > 0 && (
        <div className="alert-banner">
          <AlertCircle size={18} />
          <span>You have {overdueContacts.length} contacts with overdue follow-ups! Please review today's action items.</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid-kpi">
        <div className="card-kpi">
          <div className="kpi-header">
            <span className="kpi-title">Total Leads</span>
            <div className="kpi-icon"><Users size={20} /></div>
          </div>
          <div className="kpi-value">{totalLeads}</div>
          <div className="kpi-change neutral">
            <span>In database</span>
          </div>
        </div>

        <div className="card-kpi">
          <div className="kpi-header">
            <span className="kpi-title">Connections</span>
            <div className="kpi-icon"><CheckCircle size={20} /></div>
          </div>
          <div className="kpi-value">{connectedLeads}</div>
          <div className="kpi-change up">
            <ArrowUpRight size={14} />
            <span>{connectionRate}% rate</span>
          </div>
        </div>

        <div className="card-kpi">
          <div className="kpi-header">
            <span className="kpi-title">Replies</span>
            <div className="kpi-icon"><MessageSquare size={20} /></div>
          </div>
          <div className="kpi-value">{repliedLeads}</div>
          <div className="kpi-change up">
            <ArrowUpRight size={14} />
            <span>{replyRate}% reply rate</span>
          </div>
        </div>

        <div className="card-kpi">
          <div className="kpi-header">
            <span className="kpi-title">Interviews</span>
            <div className="kpi-icon"><Briefcase size={20} /></div>
          </div>
          <div className="kpi-value">{interviewLeads}</div>
          <div className="kpi-change up">
            <ArrowUpRight size={14} />
            <span>{interviewRate}% conv. rate</span>
          </div>
        </div>
      </div>

      {/* Funnel and Actions Grid */}
      <div className="dashboard-grid">
        {/* Conversion Pipeline Funnel */}
        <div className="card-panel">
          <div className="panel-header">
            <h2 className="panel-title"><Award size={18} /> Conversion Funnel</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live pipeline metrics</span>
          </div>
          <div className="funnel-container">
            <div className="funnel-stage">
              <div className="funnel-label">1. Leads Captured</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar stage-1" style={{ width: '100%' }}>
                  <span className="funnel-value">{totalLeads}</span>
                </div>
              </div>
            </div>

            <div className="funnel-stage">
              <div className="funnel-label">2. Connected</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar stage-2" style={{ width: `${totalLeads ? (connectedLeads / totalLeads) * 100 : 0}%` }}>
                  <span className="funnel-value">{connectedLeads}</span>
                  {connectedLeads > 0 && <span className="funnel-conversion">{connectionRate}%</span>}
                </div>
              </div>
            </div>

            <div className="funnel-stage">
              <div className="funnel-label">3. Replied</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar stage-3" style={{ width: `${totalLeads ? (repliedLeads / totalLeads) * 100 : 0}%` }}>
                  <span className="funnel-value">{repliedLeads}</span>
                  {repliedLeads > 0 && <span className="funnel-conversion">{totalLeads ? Math.round((repliedLeads / totalLeads) * 100) : 0}%</span>}
                </div>
              </div>
            </div>

            <div className="funnel-stage">
              <div className="funnel-label">4. Interviews</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar stage-4" style={{ width: `${totalLeads ? (interviewLeads / totalLeads) * 100 : 0}%` }}>
                  <span className="funnel-value">{interviewLeads}</span>
                  {interviewLeads > 0 && <span className="funnel-conversion">{totalLeads ? Math.round((interviewLeads / totalLeads) * 100) : 0}%</span>}
                </div>
              </div>
            </div>

            <div className="funnel-stage">
              <div className="funnel-label">5. Offers</div>
              <div className="funnel-bar-wrapper">
                <div className="funnel-bar stage-5" style={{ width: `${totalLeads ? (offers / totalLeads) * 100 : 0}%` }}>
                  <span className="funnel-value">{offers}</span>
                  {offers > 0 && <span className="funnel-conversion">{totalLeads ? Math.round((offers / totalLeads) * 100) : 0}%</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goals & Metrics */}
        <div className="card-panel">
          <div className="panel-header">
            <h2 className="panel-title"><Calendar size={18} /> Weekly Outreach Goals</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>New Connections Made</span>
                <span style={{ color: 'var(--text-secondary)' }}>{connectedLeads} / {connectionGoal}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${connectionProgress}%`, background: 'var(--primary)', height: '100%', borderRadius: '6px', transition: 'width 0.5s' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Interviews Scheduled</span>
                <span style={{ color: 'var(--text-secondary)' }}>{interviewLeads} / {interviewGoal}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${interviewProgress}%`, background: 'var(--secondary)', height: '100%', borderRadius: '6px', transition: 'width 0.5s' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: 700 }}>Quick Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Companies</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{companies.length}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Match Score</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    {companies.length ? Math.round(companies.reduce((acc, c) => acc + (c.myScore || 0), 0) / companies.length) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="card-panel">
        <div className="panel-header">
          <h2 className="panel-title"><AlertCircle size={18} /> Action Items Feed</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Today's priority tasks</span>
        </div>
        <div className="action-feed">
          {overdueContacts.map(contact => (
            <div key={contact.id} className="feed-item">
              <div className="feed-icon overdue">
                <AlertCircle size={18} />
              </div>
              <div className="feed-content">
                <div className="feed-title">{contact.name} ({contact.company})</div>
                <div className="feed-meta">Overdue follow-up since {formatDate(contact.followUpDate)}</div>
              </div>
              <button className="feed-action-btn" onClick={() => { setTab('contacts'); }}>
                Follow up
              </button>
            </div>
          ))}

          {draftOutbox.map(contact => (
            <div key={contact.id} className="feed-item">
              <div className="feed-icon draft">
                <Mail size={18} />
              </div>
              <div className="feed-content">
                <div className="feed-title">{contact.name} ({contact.company})</div>
                <div className="feed-meta">AI outreach draft ready to be sent</div>
              </div>
              <button className="feed-action-btn" onClick={() => { setSelectedContactForEmail(contact); }}>
                Review Draft
              </button>
            </div>
          ))}

          {todayFollowUps.map(contact => (
            <div key={contact.id} className="feed-item">
              <div className="feed-icon today">
                <Calendar size={18} />
              </div>
              <div className="feed-content">
                <div className="feed-title">{contact.name} ({contact.company})</div>
                <div className="feed-meta">Scheduled follow-up is due today</div>
              </div>
              <button className="feed-action-btn" onClick={() => { setTab('contacts'); }}>
                Follow up
              </button>
            </div>
          ))}

          {overdueContacts.length === 0 && draftOutbox.length === 0 && todayFollowUps.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} style={{ marginBottom: '8px', color: 'var(--color-success)' }} />
              <p>Everything is up to date! Good job.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
