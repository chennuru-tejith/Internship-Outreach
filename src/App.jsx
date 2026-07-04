import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Briefcase, Mail, BarChart3, 
  Upload, Settings as SettingsIcon, AlertCircle, ShieldAlert 
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Companies from './components/Companies';
import Templates from './components/Templates';
import Analytics from './components/Analytics';
import CSVImporter from './components/CSVImporter';
import Settings from './components/Settings';

import { initialCompanies, initialContacts, initialTemplates } from './mockData';

export default function App() {
  // --- Local Storage Hydration ---
  const [contacts, setContacts] = useState(() => {
    const local = localStorage.getItem('crm_contacts');
    return local ? JSON.parse(local) : initialContacts;
  });

  const [companies, setCompanies] = useState(() => {
    const local = localStorage.getItem('crm_companies');
    return local ? JSON.parse(local) : initialCompanies;
  });

  const [templates, setTemplates] = useState(() => {
    const local = localStorage.getItem('crm_templates');
    return local ? JSON.parse(local) : initialTemplates;
  });

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('crm_api_key') || '';
  });

  const [openAiModel, setOpenAiModel] = useState(() => {
    return localStorage.getItem('crm_openai_model') || 'gpt-4o-mini';
  });

  const [profile, setProfile] = useState(() => {
    const local = localStorage.getItem('crm_profile');
    return local ? JSON.parse(local) : { name: 'Tejith Chennuru', university: 'Computer Science Student', portfolio: '' };
  });

  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedContactForEmail, setSelectedContactForEmail] = useState(null);

  // --- Local Storage Synchronization ---
  useEffect(() => {
    localStorage.setItem('crm_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('crm_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('crm_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('crm_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('crm_openai_model', openAiModel);
  }, [openAiModel]);

  useEffect(() => {
    localStorage.setItem('crm_profile', JSON.stringify(profile));
  }, [profile]);

  const resetDatabase = () => {
    localStorage.removeItem('crm_contacts');
    localStorage.removeItem('crm_companies');
    localStorage.removeItem('crm_templates');
    localStorage.removeItem('crm_profile');
    localStorage.removeItem('crm_api_key');
    localStorage.removeItem('crm_openai_model');
  };

  // Switch tabs helper if click from action feeds
  const handleSetTab = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Briefcase size={22} style={{ color: 'var(--primary-light)' }} />
          <span>Outreach CRM</span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="sidebar-menu">
            <li 
              className={`sidebar-item ${selectedTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setSelectedTab('dashboard')}
            >
              <LayoutDashboard /> Dashboard
            </li>
            <li 
              className={`sidebar-item ${selectedTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setSelectedTab('contacts')}
            >
              <Users /> Contacts
            </li>
            <li 
              className={`sidebar-item ${selectedTab === 'companies' ? 'active' : ''}`}
              onClick={() => setSelectedTab('companies')}
            >
              <Briefcase /> Target Companies
            </li>
            <li 
              className={`sidebar-item ${selectedTab === 'templates' ? 'active' : ''}`}
              onClick={() => setSelectedTab('templates')}
            >
              <Mail /> Pitch Templates
            </li>
            <li 
              className={`sidebar-item ${selectedTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setSelectedTab('analytics')}
            >
              <BarChart3 /> Analytics
            </li>
            <li 
              className={`sidebar-item ${selectedTab === 'importer' ? 'active' : ''}`}
              onClick={() => setSelectedTab('importer')}
            >
              <Upload /> CSV Importer
            </li>
            <li 
              className={`sidebar-item ${selectedTab === 'settings' ? 'active' : ''}`}
              onClick={() => setSelectedTab('settings')}
            >
              <SettingsIcon /> Settings
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {apiKey ? (
            <div className="key-badge">
              <ShieldAlert size={14} />
              <span>OpenAI API Key: Active</span>
            </div>
          ) : (
            <div className="key-badge missing" onClick={() => setSelectedTab('settings')} style={{ cursor: 'pointer' }}>
              <AlertCircle size={14} />
              <span>OpenAI API Key: Missing</span>
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '4px' }}>
            Outreach Platform v1.1.0
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        {selectedTab === 'dashboard' && (
          <Dashboard 
            contacts={contacts} 
            companies={companies} 
            setTab={handleSetTab} 
            setSelectedContactForEmail={setSelectedContactForEmail}
          />
        )}
        {selectedTab === 'contacts' && (
          <Contacts 
            contacts={contacts} 
            setContacts={setContacts} 
            companies={companies} 
            templates={templates} 
            apiKey={apiKey}
            openAiModel={openAiModel}
            setTab={handleSetTab}
            selectedContactForEmail={selectedContactForEmail}
            setSelectedContactForEmail={setSelectedContactForEmail}
          />
        )}
        {selectedTab === 'companies' && (
          <Companies 
            companies={companies} 
            setCompanies={setCompanies} 
          />
        )}
        {selectedTab === 'templates' && (
          <Templates 
            templates={templates} 
            setTemplates={setTemplates} 
          />
        )}
        {selectedTab === 'analytics' && (
          <Analytics 
            contacts={contacts} 
            companies={companies} 
          />
        )}
        {selectedTab === 'importer' && (
          <CSVImporter 
            contacts={contacts} 
            setContacts={setContacts} 
            setTab={handleSetTab}
          />
        )}
        {selectedTab === 'settings' && (
          <Settings 
            apiKey={apiKey} 
            setApiKey={setApiKey} 
            openAiModel={openAiModel} 
            setOpenAiModel={setOpenAiModel} 
            profile={profile}
            setProfile={setProfile}
            resetDatabase={resetDatabase}
          />
        )}
      </main>
    </div>
  );
}
