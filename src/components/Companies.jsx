import React, { useState } from 'react';
import { Plus, Search, ExternalLink, Edit2, Trash2, Star, X, Briefcase } from 'lucide-react';

export default function Companies({ companies, setCompanies }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    difficulty: 3,
    myScore: 80,
    hrSearchUrl: '',
    notes: '',
  });

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      industry: '',
      difficulty: 3,
      myScore: 80,
      hrSearchUrl: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      difficulty: company.difficulty || 3,
      myScore: company.myScore || 80,
      hrSearchUrl: company.hrSearchUrl || '',
      notes: company.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // If search URL is empty, auto-generate a smart recruiter search link
    let hrUrl = formData.hrSearchUrl;
    if (!hrUrl && formData.name) {
      hrUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(formData.name)}%20recruiter`;
    }

    if (editingCompany) {
      setCompanies(companies.map(c => 
        c.id === editingCompany.id ? { ...c, ...formData, hrSearchUrl: hrUrl } : c
      ));
    } else {
      const newCompany = {
        id: 'comp_' + Math.random().toString(36).substr(2, 9),
        ...formData,
        hrSearchUrl: hrUrl,
      };
      setCompanies([newCompany, ...companies]);
    }
    setShowModal(false);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Target Companies</h1>
          <p className="page-subtitle">Add companies, rate interview difficulty, track compatibility, and search HR contacts.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Company
        </button>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-input-wrapper" style={{ minWidth: '320px' }}>
          <Search />
          <input 
            type="text" 
            placeholder="Search companies by name or industry..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Industry</th>
              <th>Difficulty Rating</th>
              <th>My Match Score</th>
              <th>HR / Recruiter Search</th>
              <th>Extra Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => (
              <tr key={company.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <Briefcase size={16} className="text-secondary" />
                    </div>
                    <span style={{ fontWeight: 600 }}>{company.name}</span>
                  </div>
                </td>
                <td>{company.industry || 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={`star-icon ${star <= company.difficulty ? 'filled' : ''}`} 
                      />
                    ))}
                  </div>
                </td>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  <span style={{ color: company.myScore >= 85 ? 'var(--color-success)' : company.myScore >= 70 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                    {company.myScore}%
                  </span>
                </td>
                <td>
                  {company.hrSearchUrl ? (
                    <a 
                      href={company.hrSearchUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      Find Recruiter <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                  )}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {company.notes || 'No notes added'}
                </td>
                <td>
                  <div className="btn-action-group">
                    <button className="btn-icon" onClick={() => handleOpenEditModal(company)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(company.id)}>
                      <Trash2 size={12} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No target companies listed. Click "Add Company" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingCompany ? 'Edit Target Company' : 'Add Target Company'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      placeholder="e.g. Google"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Tech, Finance"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Interview Difficulty (1-5)</label>
                    <div className="stars-input" style={{ paddingTop: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className={`star-icon ${star <= formData.difficulty ? 'filled' : ''}`}
                          onClick={() => setFormData({ ...formData, difficulty: star })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">My Fit / Score (%)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      className="form-input"
                      value={formData.myScore}
                      onChange={(e) => setFormData({ ...formData, myScore: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn HR Search URL (Optional)</label>
                  <input 
                    type="url" 
                    className="form-input"
                    placeholder="Leave blank to auto-generate recruiter search link"
                    value={formData.hrSearchUrl}
                    onChange={(e) => setFormData({ ...formData, hrSearchUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Keywords for AI personalization</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Describe their tech stack, products, or what you like about them..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCompany ? 'Save Changes' : 'Create Company'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
