import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, RefreshCw, User, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Settings({ 
  apiKey, 
  setApiKey, 
  geminiApiKey,
  setGeminiApiKey,
  aiProvider,
  setAiProvider,
  openAiModel, 
  setOpenAiModel, 
  profile, 
  setProfile, 
  resetDatabase 
}) {
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  
  const [localOpenAiKey, setLocalOpenAiKey] = useState(apiKey);
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey);
  const [localProvider, setLocalProvider] = useState(aiProvider);
  const [localModel, setLocalModel] = useState(openAiModel);
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(localOpenAiKey);
    setGeminiApiKey(localGeminiKey);
    setAiProvider(localProvider);
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

        {/* AI Provider selector */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">AI Generation Method</label>
          <select 
            className="form-select"
            value={localProvider}
            onChange={(e) => setLocalProvider(e.target.value)}
          >
            <option value="gemini">Google Gemini API (Generous Free Tier - Recommended)</option>
            <option value="openai">OpenAI API (Paid / Credits required)</option>
            <option value="local">Local Placeholder Substitution (Free, Offline, No Keys needed)</option>
          </select>
        </div>

        {/* Google Gemini Key */}
        {localProvider === 'gemini' && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Google Gemini API Key (Free)</span>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--secondary)', fontSize: '0.75rem', textDecoration: 'underline' }}
              >
                Get Free Gemini API Key
              </a>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showGeminiKey ? "text" : "password"} 
                className="form-input"
                style={{ paddingRight: '44px' }}
                placeholder="AIzaSy..."
                value={localGeminiKey}
                onChange={(e) => setLocalGeminiKey(e.target.value)}
              />
              <button 
                type="button"
                className="btn-icon"
                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent' }}
                onClick={() => setShowGeminiKey(!showGeminiKey)}
              >
                {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              Gemini 1.5 Flash offers 15 requests per minute completely free in Google AI Studio.
            </span>
          </div>
        )}

        {/* OpenAI Key */}
        {localProvider === 'openai' && (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">OpenAI API Key</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showOpenAiKey ? "text" : "password"} 
                  className="form-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="sk-proj-..."
                  value={localOpenAiKey}
                  onChange={(e) => setLocalOpenAiKey(e.target.value)}
                />
                <button 
                  type="button"
                  className="btn-icon"
                  style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent' }}
                  onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                >
                  {showOpenAiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">ChatGPT Model Selection</label>
              <select 
                className="form-select"
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Fast & cost-efficient)</option>
                <option value="gpt-4o">gpt-4o (Higher quality, slower)</option>
              </select>
            </div>
          </>
        )}

        {/* Local compiler message */}
        {localProvider === 'local' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Local Substitution Mode Active:</strong> This mode will compile your outreach drafts instantly on your machine for free, by replacing tags like <code>[Contact Name]</code>, <code>[Company Name]</code>, and <code>[Your Name]</code> with actual lead data. No internet or API keys are required.
          </div>
        )}

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
