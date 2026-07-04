import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, X } from 'lucide-react';

export default function Templates({ templates, setTemplates }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || '',
      subject: template.subject || '',
      body: template.body || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? { ...t, ...formData } : t
      ));
    } else {
      const newTemplate = {
        id: 'temp_' + Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      setTemplates([...templates, newTemplate]);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Outreach Templates</h1>
          <p className="page-subtitle">Manage and edit your email pitches. These are used as prompts by ChatGPT for personalized drafts.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="template-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card" onClick={() => handleOpenEditModal(template)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div className="template-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} className="text-secondary" />
                {template.name}
              </div>
              <div className="btn-action-group" onClick={(e) => e.stopPropagation()}>
                <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => handleOpenEditModal(template)}>
                  <Edit2 size={10} />
                </button>
                <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => handleDelete(template.id)}>
                  <Trash2 size={10} style={{ color: 'var(--color-danger)' }} />
                </button>
              </div>
            </div>
            <div className="template-subject">
              Subject: {template.subject}
            </div>
            <div className="template-preview">
              {template.body}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTemplate ? 'Edit Pitch Template' : 'Add Pitch Template'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Template Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input"
                    placeholder="e.g. 7-Day Follow-Up, Cold Pitch"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Line (supports placeholders)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input"
                    placeholder="e.g. Outreach: [Position Name] - [Your Name]"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Body</label>
                  <textarea 
                    className="form-textarea"
                    style={{ minHeight: '220px' }}
                    placeholder="Write email body text. Use placeholders like [Contact Name], [Company Name], [Your Name], [Contact Title] for custom AI substitution."
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  />
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <strong>Supported Placeholders:</strong> <code>[Contact Name]</code>, <code>[Contact Title]</code>, <code>[Company Name]</code>, <code>[Your Name]</code>, <code>[Found Via]</code>. The AI engine automatically reads these parameters from the contact cards to generate personalized drafts.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTemplate ? 'Save Changes' : 'Create Template'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
