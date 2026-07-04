import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Check, AlertTriangle, ArrowRight, Grid } from 'lucide-react';

export default function CSVImporter({ contacts, setContacts, setTab }) {
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  
  // Column Mappings
  const [mappings, setMappings] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    linkedin: '',
    foundVia: '',
  });

  const [previewRows, setPreviewRows] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loaded | mapped | completed

  const crmFields = [
    { key: 'name', label: 'Contact Name *', required: true },
    { key: 'email', label: 'Email Address *', required: true },
    { key: 'company', label: 'Company Name', required: false },
    { key: 'title', label: 'Job Title / Position', required: false },
    { key: 'linkedin', label: 'LinkedIn Profile URL', required: false },
    { key: 'foundVia', label: 'Lead Source (Found Via)', required: false },
  ];

  // Try to autodetect headers based on common PhantomBuster / Scraper columns
  const autoDetectMappings = (headers) => {
    const newMappings = { ...mappings };
    
    headers.forEach(header => {
      const lower = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Name
      if (['fullname', 'name', 'contactname', 'displayname', 'firstname'].includes(lower)) {
        newMappings.name = header;
      }
      // Email
      else if (['email', 'emailaddress', 'mail', 'personalemail', 'workemail'].includes(lower)) {
        newMappings.email = header;
      }
      // Company
      else if (['company', 'companyname', 'currentcompany', 'employer', 'organization'].includes(lower)) {
        newMappings.company = header;
      }
      // Title
      else if (['title', 'jobtitle', 'role', 'position', 'designation'].includes(lower)) {
        newMappings.title = header;
      }
      // LinkedIn
      else if (['linkedin', 'linkedinurl', 'linkedinprofile', 'profileurl', 'url'].includes(lower)) {
        newMappings.linkedin = header;
      }
      // Found Via / Source
      else if (['foundvia', 'source', 'query', 'category', 'campaign'].includes(lower)) {
        newMappings.foundVia = header;
      }
    });

    setMappings(newMappings);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = Object.keys(results.data[0]);
          setCsvHeaders(headers);
          setCsvData(results.data);
          setPreviewRows(results.data.slice(0, 5));
          autoDetectMappings(headers);
          setStatus('loaded');
        } else {
          alert('Empty CSV or invalid file structure.');
        }
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleMappingChange = (crmKey, csvVal) => {
    setMappings({
      ...mappings,
      [crmKey]: csvVal
    });
  };

  const handleImport = () => {
    // Validate required fields
    if (!mappings.name || !mappings.email) {
      alert('Please map the required fields: Contact Name and Email Address.');
      return;
    }

    const imported = csvData.map((row, index) => {
      // Clean and resolve name
      let nameVal = row[mappings.name] || 'Unknown Lead';
      
      // If we only have firstName / lastName in separate columns
      if (!row[mappings.name] && row['firstName']) {
        nameVal = `${row['firstName']} ${row['lastName'] || ''}`.trim();
      }

      return {
        id: 'imported_' + index + '_' + Math.random().toString(36).substr(2, 5),
        name: nameVal,
        email: row[mappings.email] || '',
        company: row[mappings.company] || 'Other',
        title: row[mappings.title] || 'Professional',
        linkedin: row[mappings.linkedin] || '',
        foundVia: row[mappings.foundVia] || 'PhantomBuster Export',
        status: 'Not Contacted',
        score: 70, // Default match score
        followUpDate: '',
        responseNotes: '',
        emailDraftSubject: '',
        emailDraftBody: '',
        notes: `Imported from CSV file: ${fileName}`
      };
    });

    setContacts([...imported, ...contacts]);
    setStatus('completed');
    alert(`Successfully imported ${imported.length} contacts!`);
    setTab('contacts');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">CSV & Lead Importer</h1>
        <p className="page-subtitle">Paste PhantomBuster or custom CSV files to quickly bulk populate your outreach list.</p>
      </div>

      {status === 'idle' && (
        <div className="card-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <label className="dropzone">
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <div className="dropzone-icon">
              <Upload size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Drag and drop your outreach CSV here</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
              Supports PhantomBuster LinkedIn Search Export, LinkedIn Sales Navigator exports, or custom CSV templates.
            </p>
            <span className="btn btn-primary" style={{ marginTop: '12px' }}>Choose CSV File</span>
          </label>
        </div>
      )}

      {status === 'loaded' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
          {/* Mapping configuration */}
          <div className="card-panel">
            <h2 className="panel-title" style={{ marginBottom: '16px' }}>
              <Grid size={18} /> Map CSV Columns
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Select which column in your CSV maps to each field in your CRM. Required fields are marked with an asterisk (*).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {crmFields.map(field => (
                <div key={field.key} className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{field.label}</span>
                    {mappings[field.key] && (
                      <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                        <Check size={10} /> Auto-mapped
                      </span>
                    )}
                  </label>
                  <select 
                    className="form-select"
                    value={mappings[field.key]}
                    onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  >
                    <option value="">-- Do Not Map --</option>
                    {csvHeaders.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setStatus('idle')}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleImport}
                disabled={!mappings.name || !mappings.email}
              >
                Import {csvData.length} Leads <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Preview panel */}
          <div className="card-panel">
            <div className="panel-header" style={{ border: 'none', padding: 0 }}>
              <h2 className="panel-title">Data Preview (First 5 Rows)</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>File: {fileName}</span>
            </div>

            <div className="table-container" style={{ maxHeight: '420px', marginTop: '16px' }}>
              <table className="premium-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    {csvHeaders.slice(0, 5).map(header => (
                      <th key={header}>{header}</th>
                    ))}
                    {csvHeaders.length > 5 && <th>+{csvHeaders.length - 5} more</th>}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {csvHeaders.slice(0, 5).map((header, hIdx) => (
                        <td key={hIdx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                          {row[header]}
                        </td>
                      ))}
                      {csvHeaders.length > 5 && <td style={{ color: 'var(--text-muted)' }}>...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '12px', marginTop: '24px' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Tip:</strong> Ensure your CSV contains distinct email addresses. Duplicate emails will be imported, but we recommend auditing details inside the contacts panel afterward.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
