import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, RefreshCw, User, ShieldCheck } from 'lucide-react';

export default function Settings({ 
  apiKey, 
  setApiKey, 
  openAiModel, 
  setOpenAiModel, 
  profile, 
  setProfile, 
  resetDatabase 
}) {
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState(openAiModel);
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(localKey);
    setOpenAiModel(localModel);
    setProfile(localProfile);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('WARNING: This will clear all your custom contacts, companies, and templates, resetting the local database to the default demo values. Do you want to proceed?')) {
      resetDatabase();
      alert('Database reset to defaults successfully.');
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <h1 className="page-title">Platform Settings</h1>
        <p className="page-subtitle">Configure AI model parameters, personal template placeholders, and API credentials.</p>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', marginBottom: '24px', color: 'var(--color-success)', fontWeight: 500 }}>
          <ShieldCheck size={18} />
          <span>Settings saved successfully! Personalizations will apply to all future email drafts.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 className="panel-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', margin: 0 }}>
          <Key size={18} /> AI & API Configuration
        </h2>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">OpenAI API Key</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showKey ? "text" : "password"} 
              className="form-input"
              style={{ paddingRight: '44px' }}
              placeholder="sk-proj-..."
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
            />
            <button 
              type="button"
              className="btn-icon"
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent' }}
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            Your key is stored securely in your browser's localStorage and is only dispatched directly to OpenAI.
          </span>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">ChatGPT Model Selection</label>
          <select 
            className="form-select"
            value={localModel}
            onChange={(e) => setLocalModel(e.target.value)}
          >
            <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Fast & cost-efficient)</option>
            <option value="gpt-4o">gpt-4o (Higher quality, slower)</option>
          </select>
        </div>

        <h2 className="panel-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', margin: '16px 0 0 0' }}>
          <User size={18} /> Personal Placeholders
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">My Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={localProfile.name}
              onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">My University / School</label>
            <input 
              type="text" 
              className="form-input"
              value={localProfile.university}
              onChange={(e) => setLocalProfile({ ...localProfile, university: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">My Portfolio / GitHub Link</label>
          <input 
            type="url" 
            className="form-input" 
            placeholder="https://github.com/yourusername"
            value={localProfile.portfolio}
            onChange={(e) => setLocalProfile({ ...localProfile, portfolio: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '16px' }}>
          <button type="button" className="btn btn-danger" onClick={handleReset}>
            <RefreshCw size={14} /> Reset Database
          </button>
          
          <button type="submit" className="btn btn-primary">
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
