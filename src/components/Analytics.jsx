import React from 'react';
import { BarChart2, TrendingUp, Compass, Award } from 'lucide-react';

export default function Analytics({ contacts, companies }) {
  // 1. Calculations by Company
  const companyMetrics = {};
  
  // Initialize with all target companies
  companies.forEach(company => {
    companyMetrics[company.name] = {
      name: company.name,
      leads: 0,
      contacted: 0,
      replied: 0,
      interviews: 0,
      offers: 0
    };
  });

  // Aggregate contact data
  contacts.forEach(contact => {
    const compName = contact.company || 'Other';
    if (!companyMetrics[compName]) {
      companyMetrics[compName] = {
        name: compName,
        leads: 0,
        contacted: 0,
        replied: 0,
        interviews: 0,
        offers: 0
      };
    }

    const metric = companyMetrics[compName];
    metric.leads += 1;
    
    if (['Email Sent', 'Replied', 'Interview Scheduled', 'Offer'].includes(contact.status)) {
      metric.contacted += 1;
    }
    if (['Replied', 'Interview Scheduled', 'Offer'].includes(contact.status)) {
      metric.replied += 1;
    }
    if (['Interview Scheduled', 'Offer'].includes(contact.status)) {
      metric.interviews += 1;
    }
    if (contact.status === 'Offer') {
      metric.offers += 1;
    }
  });

  const companyList = Object.values(companyMetrics).filter(c => c.leads > 0);

  // 2. Bar Chart Data: Leads by Status
  const statuses = [
    { label: 'Not Contacted', key: 'Not Contacted', color: '#9ca3af' },
    { label: 'Connected', key: 'Connected', color: '#3b82f6' },
    { label: 'Drafted', key: 'Email Drafted', color: '#f59e0b' },
    { label: 'Sent', key: 'Email Sent', color: '#6366f1' },
    { label: 'Replied', key: 'Replied', color: '#06b6d4' },
    { label: 'Interview', key: 'Interview Scheduled', color: '#10b981' },
    { label: 'Offer', key: 'Offer', color: '#10b981' }
  ];

  const statusCounts = statuses.map(s => {
    const count = contacts.filter(c => c.status === s.key).length;
    return {
      label: s.label,
      count: count,
      color: s.color
    };
  });

  const maxCount = Math.max(...statusCounts.map(s => s.count), 1);

  // 3. Conversion Efficiency
  const totalLeads = contacts.length;
  const totalContacted = contacts.filter(c => 
    ['Email Sent', 'Replied', 'Interview Scheduled', 'Offer'].includes(c.status)
  ).length;
  const totalReplied = contacts.filter(c => 
    ['Replied', 'Interview Scheduled', 'Offer'].includes(c.status)
  ).length;
  const totalInterviews = contacts.filter(c => 
    ['Interview Scheduled', 'Offer'].includes(c.status)
  ).length;

  const responseRate = totalContacted ? Math.round((totalReplied / totalContacted) * 100) : 0;
  const interviewYield = totalReplied ? Math.round((totalInterviews / totalReplied) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics & Conversion Reports</h1>
        <p className="page-subtitle">Understand pipeline health, response rates, and company-specific funnel performance.</p>
      </div>

      <div className="analytics-grid">
        {/* Conversion Yields */}
        <div className="card-panel">
          <h2 className="panel-title" style={{ marginBottom: '20px' }}>
            <TrendingUp size={18} /> Performance Yields
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(99,102,241,0.08)', color: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{responseRate}%</span>
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Overall Response Rate</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Percentage of sent emails that received a follow-up reply.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(6,182,212,0.08)', color: 'var(--secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{interviewYield}%</span>
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Interview Conversion Rate</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Percentage of positive replies that converted into live interviews.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(16,185,129,0.08)', color: 'var(--color-success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {totalLeads ? Math.round((totalContacted / totalLeads) * 100) : 0}%
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Outreach Coverage</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Percentage of your target leads that you have actually contacted.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live CSS Bar Chart */}
        <div className="card-panel">
          <h2 className="panel-title" style={{ marginBottom: '10px' }}>
            <BarChart2 size={18} /> Lead Distribution by Status
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Number of leads currently in each outreach phase</span>
          
          <div className="chart-bar-container">
            {statusCounts.map((sc, index) => {
              const fillPct = Math.round((sc.count / maxCount) * 100);
              return (
                <div key={index} className="chart-bar-column">
                  <div 
                    className="chart-bar-fill" 
                    style={{ 
                      height: `${fillPct}%`,
                      background: sc.count > 0 ? `linear-gradient(0deg, ${sc.color} 30%, var(--text-primary) 150%)` : 'rgba(255,255,255,0.03)'
                    }}
                  >
                    <div className="chart-bar-tooltip">{sc.count} Leads</div>
                  </div>
                  <span className="chart-bar-label">{sc.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company Wise Metrics Table */}
      <div className="card-panel" style={{ marginTop: '24px' }}>
        <div className="panel-header" style={{ border: 'none', padding: 0, marginBottom: '20px' }}>
          <h2 className="panel-title">
            <Compass size={18} /> Target Company Outreach Breakdown
          </h2>
        </div>

        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Total Leads</th>
                <th>Contacted</th>
                <th>Replies</th>
                <th>Interviews</th>
                <th>Offers</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {companyList.map(comp => {
                const convRate = comp.contacted ? Math.round((comp.replied / comp.contacted) * 100) : 0;
                return (
                  <tr key={comp.name}>
                    <td><strong>{comp.name}</strong></td>
                    <td>{comp.leads}</td>
                    <td>{comp.contacted}</td>
                    <td>{comp.replied}</td>
                    <td>{comp.interviews}</td>
                    <td>
                      <span style={{ color: comp.offers > 0 ? 'var(--color-success)' : 'inherit', fontWeight: comp.offers > 0 ? 600 : 'normal' }}>
                        {comp.offers}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                      <span style={{ color: convRate >= 75 ? 'var(--color-success)' : convRate >= 40 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                        {convRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}

              {companyList.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No contact interactions recorded to compute metrics.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
