import React from 'react';
import { FileText, Sparkles, AlertCircle, CheckCircle, TrendingUp, HelpCircle } from 'lucide-react';

export default function ResumeAnalyzer({ resumeText, setResumeText }) {
  // Core technical keywords dictionary
  const skillKeywords = {
    languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'php', 'sql', 'html', 'css'],
    frameworks: ['react', 'angular', 'vue', 'next.js', 'express', 'django', 'flask', 'spring boot', 'laravel', 'asp.net', 'rails'],
    tools: ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'firebase', 'webpack', 'vite', 'graphql', 'rest api', 'mongodb', 'postgresql', 'redis'],
    concepts: ['agile', 'scrum', 'ci/cd', 'unit testing', 'data structures', 'algorithms', 'machine learning', 'system design', 'oop']
  };

  const getScore = () => {
    if (!resumeText) return 0;
    
    let score = 30; // base score for entering text
    const textLower = resumeText.toLowerCase();
    
    // Check keyword count
    let matchedCount = 0;
    Object.values(skillKeywords).forEach(group => {
      group.forEach(keyword => {
        if (textLower.includes(keyword)) matchedCount++;
      });
    });

    score += Math.min(matchedCount * 3, 40); // up to 40 points for technical skills
    
    // Check resume length
    if (resumeText.length > 500) score += 10;
    if (resumeText.length > 1500) score += 10;

    // Check formatting indicators (bullet points, sections)
    if (textLower.includes('experience') || textLower.includes('work')) score += 5;
    if (textLower.includes('education') || textLower.includes('university')) score += 5;

    return Math.min(score, 100);
  };

  const getDetectedSkills = () => {
    if (!resumeText) return [];
    const textLower = resumeText.toLowerCase();
    const detected = [];

    Object.entries(skillKeywords).forEach(([groupName, group]) => {
      group.forEach(keyword => {
        if (textLower.includes(keyword)) {
          detected.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            group: groupName
          });
        }
      });
    });

    return detected;
  };

  const getMissingKeywords = (detected) => {
    if (!resumeText) return [];
    const textLower = resumeText.toLowerCase();
    const missing = [];
    const detectedNames = detected.map(d => d.name.toLowerCase());

    // Basic standard recommendations for internships
    const standardKeywords = ['git', 'ci/cd', 'unit testing', 'rest api', 'docker', 'agile', 'data structures', 'algorithms'];
    
    standardKeywords.forEach(keyword => {
      if (!detectedNames.includes(keyword) && !textLower.includes(keyword)) {
        missing.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    return missing;
  };

  const getRecommendedRoles = (detected) => {
    if (!resumeText) return [];
    const detectedNames = detected.map(d => d.name.toLowerCase());
    const recommendations = [];

    const scores = {
      frontend: 0,
      backend: 0,
      fullstack: 0,
      devops: 0
    };

    // Frontend matches
    ['react', 'html', 'css', 'javascript', 'typescript', 'next.js', 'angular', 'vue', 'vite'].forEach(s => {
      if (detectedNames.includes(s)) scores.frontend += 2;
    });

    // Backend matches
    ['python', 'java', 'sql', 'express', 'django', 'flask', 'spring boot', 'node', 'mongodb', 'postgresql', 'c++', 'c#'].forEach(s => {
      if (detectedNames.includes(s)) scores.backend += 2;
    });

    // DevOps matches
    ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'git'].forEach(s => {
      if (detectedNames.includes(s)) scores.devops += 2;
    });

    // Compute recommendations
    if (scores.frontend > 2) recommendations.push('Front-End Engineer');
    if (scores.backend > 2) recommendations.push('Back-End Engineer');
    if (scores.frontend > 2 && scores.backend > 2) recommendations.push('Full-Stack Engineer');
    if (scores.devops > 2) recommendations.push('DevOps / Cloud Intern');
    
    if (recommendations.length === 0) {
      recommendations.push('Software Engineering Intern');
    }

    return recommendations;
  };

  const score = getScore();
  const detected = getDetectedSkills();
  const missing = getMissingKeywords(detected);
  const recommendedRoles = getRecommendedRoles(detected);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Resume Skills Audit & Optimizer</h1>
        <p className="page-subtitle">Analyze your CV details to identify matching job profiles and scan for missing keywords recruiters look for.</p>
      </div>

      {!resumeText ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>No Resume Context Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 20px auto' }}>
            Paste your resume text below or inside the Settings page to unlock automated skills extraction, role recommendations, and outreach personalization context.
          </p>
          <div style={{ maxWidth: '550px', margin: '0 auto' }}>
            <textarea 
              className="form-textarea"
              style={{ minHeight: '200px', marginBottom: '16px' }}
              placeholder="Paste your plain text resume contents here..."
              onChange={(e) => setResumeText(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Analyze Resume Text
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
          {/* Strength scorecard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card-panel" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <h2 className="panel-title" style={{ justifyContent: 'center' }}>Resume Strength Score</h2>
              
              <div style={{ margin: '24px auto', position: 'relative', width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(var(--primary) ${score * 3.6}deg, rgba(255,255,255,0.03) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                <div style={{ width: '104px', height: '104px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--primary)' }}>
                    {score}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>OF 100</span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--primary)' }}>
                {score >= 80 ? 'Excellent Match Profile' : score >= 60 ? 'Good Draft Context' : 'Incomplete Resume Details'}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {score >= 80 
                  ? 'Your profile contains rich technical keywords. Cold pitches will match company profiles highly.' 
                  : 'Consider adding more sections (experience details, projects) to enhance AI drafting precision.'}
              </p>
            </div>

            <div className="card-panel">
              <h2 className="panel-title" style={{ marginBottom: '12px' }}>
                <TrendingUp size={16} /> Job Match Suggestions
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Based on your skills profile, we recommend searching for and target pitching:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendedRoles.map(role => (
                  <div key={role} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details & optimization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Detected Skills */}
            <div className="card-panel">
              <h2 className="panel-title">
                <Sparkles size={16} /> Extracted Skill Tags ({detected.length})
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                {detected.map(skill => (
                  <span 
                    key={skill.name} 
                    className="skill-tag"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      background: 'rgba(192, 132, 252, 0.08)', 
                      border: '1px solid rgba(192, 132, 252, 0.2)',
                      color: 'var(--primary-light)',
                      fontWeight: 500
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
                {detected.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No standard technical tags detected. Add developer/designer terms.
                  </div>
                )}
              </div>
            </div>

            {/* Keyword Optimization Check */}
            <div className="card-panel">
              <h2 className="panel-title">
                <AlertCircle size={16} /> Recruiter Optimization Audit
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '16px' }}>
                Adding these standard tools/keywords to your resume can increase ATS matches and email response rates:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {missing.map(keyword => (
                  <div key={keyword} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                    <strong>{keyword}</strong>: Frequently sought in internship applicants to verify codebase readiness.
                  </div>
                ))}
                {missing.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontSize: '0.8rem' }}>
                    <CheckCircle size={14} />
                    <span>Fantastic! Your resume contains all standard recruiter keyword checkpoints.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit / Paste New */}
            <div className="card-panel">
              <h2 className="panel-title">Update Resume Source Text</h2>
              <textarea 
                className="form-textarea"
                style={{ minHeight: '120px', marginTop: '12px', fontSize: '0.8rem' }}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                Changes are automatically synced with your global Settings and saved locally.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
