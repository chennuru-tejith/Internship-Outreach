import React, { useState } from 'react';
import { FileText, Sparkles, AlertCircle, CheckCircle, TrendingUp, HelpCircle, Award, MessageSquare } from 'lucide-react';

export default function ResumeAnalyzer({ 
  resumeText, 
  setResumeText,
  aiProvider = 'local',
  apiKey = '',
  geminiApiKey = '',
  openAiModel = 'gpt-4o-mini'
}) {
  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit' | 'coach' | 'pitch'
  
  // AI Coach state variables
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('Stripe');
  const [coachQuestions, setCoachQuestions] = useState([]);
  const [loadingCoach, setLoadingCoach] = useState(false);

  // Cold Pitch states
  const [jobDescription, setJobDescription] = useState('');
  const [pitchAssets, setPitchAssets] = useState(null); // { coverLetter, linkedinInvite, elevatorPitch }
  const [loadingPitch, setLoadingPitch] = useState(false);

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

  // --- AI Coach Questions Generator ---
  const handleGenerateCoachQuestions = async () => {
    setLoadingCoach(true);
    
    const isGemini = aiProvider === 'gemini';
    const isOpenAi = aiProvider === 'openai';
    const hasKey = (isGemini && geminiApiKey) || (isOpenAi && apiKey);

    // If API keys are missing or offline mode, run high-quality local template generation
    if (aiProvider === 'local' || !hasKey) {
      setTimeout(() => {
        const detected = getDetectedSkills();
        const techTags = detected.slice(0, 3).map(d => d.name);
        const tech1 = techTags[0] || 'JavaScript';
        const tech2 = techTags[1] || 'REST APIs';
        const tech3 = techTags[2] || 'Git';

        const mockQuestions = [
          {
            question: `Explain how you would design or structure an application feature utilizing ${tech1} and ${tech2} to handle latency issues for a user base like ${targetCompany}'s.`,
            type: 'Technical Q&A',
            suggestedAnswer: `Describe your project workflow. Focus on performance optimization patterns (e.g. pagination, client caching, lazy loading, debouncing). Emphasize how you used ${tech1} to clean up execution loops.`
          },
          {
            question: `Recruiters at ${targetCompany} look for collaborative version control. Describe a time you resolved a difficult merge conflict or coordinated feature branches with team repository tools like ${tech3}.`,
            type: 'Behavioral Prep',
            suggestedAnswer: `Use the STAR method: Describe the conflict, the Git branching model (like GitFlow), how you reviewed diffs together, and resolved it without deleting other members' commits.`
          },
          {
            question: `What are your strategies for testing and debugging your codebase? How do you ensure modular quality when working on a high-availability service?`,
            type: 'System & Architecture',
            suggestedAnswer: `Reference Unit Testing and CI/CD parameters. Explain your local testing routine: writing mock tests, using debuggers, checking browser inspector logs, and setting up staging branches.`
          },
          {
            question: `Describe a scenario where you had to pick up a tool or library other than ${tech1} or ${tech2} in a short timeframe. How did you manage to ship the deliverable?`,
            type: 'Adaptability Focus',
            suggestedAnswer: `Demonstrate your resourcefulness. Emphasize reading official documentation, building boilerplate proof-of-concepts, asking targeted team questions, and delivering working prototypes incrementally.`
          },
          {
            question: `Why do you want to join ${targetCompany} as a ${targetRole}? What specific product area or engineering challenge of ours excites you?`,
            type: 'Culture Fit',
            suggestedAnswer: `Connect your interests to their actual developer blog or news. Mention Stripe's global API reliability, or their developer-first documentation. Show that you understand their mission.`
          }
        ];

        setCoachQuestions(mockQuestions);
        setLoadingCoach(false);
      }, 1000);
      return;
    }

    // Direct LLM Call Grounding
    const prompt = `
      You are an expert technical interviewer preparing a student for an internship interview.
      Candidate Resume Details:
      "${resumeText}"

      Target Company: ${targetCompany}
      Target Role: ${targetRole}

      Construct exactly 5 highly personalized interview questions tailored specifically to the candidate's achievements and the target company's stack/domain. Include:
      - 2 core technical/system design questions referencing tools in their resume.
      - 2 behavioral questions focusing on developer collaboration.
      - 1 company-fit question.
      
      For each question, provide a detailed "suggestedAnswer" blueprint outlining what achievements they should talk about.
      
      Return your response as a valid JSON array of objects ONLY. Do not wrap in markdown backticks or code blocks.
      Each object must contain exactly three keys: "question", "type", and "suggestedAnswer".
    `;

    try {
      if (isGemini) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        setCoachQuestions(JSON.parse(cleaned));
      } else {
        // OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: openAiModel || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You write technical prep questions in structured JSON arrays.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
        const data = await response.json();
        const obj = JSON.parse(data.choices[0].message.content);
        const arr = Array.isArray(obj) ? obj : obj.questions || Object.values(obj)[0] || [];
        setCoachQuestions(arr);
      }
    } catch (err) {
      console.error(err);
      alert(`AI Coach call failed: ${err.message}. Generating mock questions offline instead.`);
      setCoachQuestions([
        {
          question: `How would you explain the architecture of your React or web projects to an interviewer at ${targetCompany}?`,
          type: 'Technical Q&A',
          suggestedAnswer: `Mention component separation, API routing, custom hooks, state handlers, and optimized bundlers like Vite.`
        },
        {
          question: `Describe a collaborative obstacle you faced on an engineering project. How did you resolve it?`,
          type: 'Behavioral Prep',
          suggestedAnswer: `Detail communication methods, code reviews on GitHub, dividing tasks, and aligning code interfaces.`
        }
      ]);
    } finally {
      setLoadingCoach(false);
    }
  };

  // --- Cold Pitch Generator ---
  const handleGenerateColdPitch = async () => {
    setLoadingPitch(true);

    const isGemini = aiProvider === 'gemini';
    const isOpenAi = aiProvider === 'openai';
    const hasKey = (isGemini && geminiApiKey) || (isOpenAi && apiKey);

    // Offline mode or missing keys fallback
    if (aiProvider === 'local' || !hasKey) {
      setTimeout(() => {
        const detected = getDetectedSkills();
        const techTags = detected.slice(0, 3).map(d => d.name);
        const tech1 = techTags[0] || 'JavaScript';
        const tech2 = techTags[1] || 'React';
        
        const coverLetter = `Dear Hiring Team at ${targetCompany},

I am writing to express my interest in the ${targetRole} internship position. As a student developer with hands-on experience building projects in ${tech1} and ${tech2}, I have focused my studies on writing high-performance, modular code.

In my independent projects, I developed web modules and set up structured database pipelines, improving performance metrics. I am highly interested in ${targetCompany}'s developer ecosystem, specifically how your team addresses scaling engineering challenges.

Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications further.

Sincerely,
[Your Name]`;

        const linkedinInvite = `Hi! I saw you lead engineering teams at ${targetCompany}. I'm an internship applicant specializing in ${tech1} and ${tech2}. I'd love to connect to follow your engineering updates and product milestones!`;

        const elevatorPitch = `Hi, I'm [Your Name]. I study Computer Science and specialize in building web systems using ${tech1} and ${tech2}. I've designed and shipped performance dashboard projects locally. I'm really excited about ${targetCompany}'s developer tools, and I'd love to learn more about what skills your team prioritizes for internships!`;

        setPitchAssets({ coverLetter, linkedinInvite, elevatorPitch });
        setLoadingPitch(false);
      }, 1000);
      return;
    }

    const prompt = `
      You are an expert recruitment advisor. Write 3 outreach assets based on the candidate's resume context:
      "${resumeText}"

      Target Company: ${targetCompany}
      Target Role: ${targetRole}
      ${jobDescription ? `Job Description: "${jobDescription}"` : ''}

      Provide:
      1. A professional Cover Letter tailored to the company. Keep it punchy (under 250 words).
      2. An optimized LinkedIn connection request invite note to recruiters/EMs. This invite note MUST be strictly under 300 characters (including spaces). Keep it short and polite.
      3. A 30-second spoken elevator pitch for career fairs.

      Return your response as a valid JSON object ONLY. Make sure it contains exactly three keys: "coverLetter", "linkedinInvite" (max 280 chars), and "elevatorPitch". Do not wrap the JSON in markdown code blocks or ticks.
    `;

    try {
      if (isGemini) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        setPitchAssets(JSON.parse(cleaned));
      } else {
        // OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: openAiModel || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You write customized job outreach documents in JSON format containing coverLetter, linkedinInvite (max 280 chars), and elevatorPitch keys.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
        const data = await response.json();
        setPitchAssets(JSON.parse(data.choices[0].message.content));
      }
    } catch (err) {
      console.error(err);
      alert(`AI Pitch generation failed: ${err.message}. Compiling mock assets instead.`);
      setPitchAssets({
        coverLetter: `Dear Hiring Team,\n\nI am interested in joining ${targetCompany} as a ${targetRole}.`,
        linkedinInvite: `Hi, I saw your engineering work at ${targetCompany}. I'd love to connect!`,
        elevatorPitch: `Hi, I am interested in developer internships at ${targetCompany}.`
      });
    } finally {
      setLoadingPitch(false);
    }
  };

  const score = getScore();
  const detected = getDetectedSkills();
  const missing = getMissingKeywords(detected);
  const recommendedRoles = getRecommendedRoles(detected);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Resume Skills Audit & Optimizer</h1>
        <p className="page-subtitle">Analyze your CV details to identify matching job profiles, scan for missing keywords, and practice tailored interview questions.</p>
      </div>

      {/* Sub-tab switcher */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button 
          className={`btn-tab ${activeSubTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('audit')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: activeSubTab === 'audit' ? 'var(--primary)' : 'var(--text-secondary)', 
            fontWeight: 600, 
            fontSize: '0.9rem', 
            cursor: 'pointer',
            paddingBottom: '8px',
            borderBottom: activeSubTab === 'audit' ? '2px solid var(--primary)' : 'none'
          }}
        >
          Skills Audit & ATS Optimizer
        </button>
        <button 
          className={`btn-tab ${activeSubTab === 'coach' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('coach')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: activeSubTab === 'coach' ? 'var(--primary)' : 'var(--text-secondary)', 
            fontWeight: 600, 
            fontSize: '0.9rem', 
            cursor: 'pointer',
            paddingBottom: '8px',
            borderBottom: activeSubTab === 'coach' ? '2px solid var(--primary)' : 'none'
          }}
        >
          AI Interview Coach (Q&A Prep)
        </button>
        <button 
          className={`btn-tab ${activeSubTab === 'pitch' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pitch')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: activeSubTab === 'pitch' ? 'var(--primary)' : 'var(--text-secondary)', 
            fontWeight: 600, 
            fontSize: '0.9rem', 
            cursor: 'pointer',
            paddingBottom: '8px',
            borderBottom: activeSubTab === 'pitch' ? '2px solid var(--primary)' : 'none'
          }}
        >
          Cold Pitch Generator
        </button>
      </div>

      {!resumeText ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>No Resume Context Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 20px auto' }}>
            Paste your resume text below to unlock automated skills extraction, role recommendations, and custom interview practice templates.
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
      ) : activeSubTab === 'audit' ? (
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
      ) : activeSubTab === 'coach' ? (
        /* AI Interview Coach Sub-view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card-panel">
            <h2 className="panel-title" style={{ marginBottom: '12px' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> Practice Tailored Interview Questions
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Specify your target role and company. The coach will analyze your resume context and write targeted questions and model answers matching their technical parameters.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Front-End Intern"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Company</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Stripe, NVIDIA, Apple"
                />
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              onClick={handleGenerateCoachQuestions}
              disabled={loadingCoach}
            >
              {loadingCoach ? (
                <>
                  <div className="ai-spinner" style={{ width: '12px', height: '12px' }} /> Compiling customized questions...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate Custom Prep Questions
                </>
              )}
            </button>
          </div>

          {/* Practice Questions Output */}
          <div className="card-panel" style={{ minHeight: '300px' }}>
            <h2 className="panel-title" style={{ marginBottom: '16px' }}>
              <Award size={18} /> Prep Questions Output
            </h2>

            {loadingCoach ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 0' }}>
                <div className="ai-spinner" />
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                  {aiProvider === 'local' ? 'Parsing resume keywords offline...' : 'Querying LLM for tailored company questions...'}
                </span>
              </div>
            ) : coachQuestions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {coachQuestions.map((q, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.1)' }}>
                        {q.type}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Question {idx + 1}</span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                      {q.question}
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.01)', borderLeft: '3px solid var(--secondary)', padding: '10px 12px', borderRadius: '0 8px 8px 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Suggested Pitch Strategy:</strong>
                      {q.suggestedAnswer}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <HelpCircle size={32} style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '0.85rem' }}>No prep questions compiled yet. Choose a target role and company above, then click "Generate Custom Prep Questions".</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Cold Pitch Generator Sub-view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card-panel">
            <h2 className="panel-title" style={{ marginBottom: '12px' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} /> AI Cold Pitch & Cover Letter Generator
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Generate highly personalized Cover Letters, spoken Elevator Pitches, and copy-pasteable recruiter LinkedIn invitation notes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Company</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description / Requirements (Optional)</label>
              <textarea 
                className="form-textarea"
                style={{ minHeight: '100px' }}
                placeholder="Paste key responsibilities or skills mentioned in the job post to tailor your pitches..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              onClick={handleGenerateColdPitch}
              disabled={loadingPitch}
            >
              {loadingPitch ? (
                <>
                  <div className="ai-spinner" style={{ width: '12px', height: '12px' }} /> Generating pitches...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate Cold Pitch Assets
                </>
              )}
            </button>
          </div>

          {/* Pitches outputs panels */}
          {pitchAssets && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Cover Letter */}
              <div className="card-panel">
                <h3 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span>✉️ Tailored Cover Letter Draft</span>
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => {
                      navigator.clipboard.writeText(pitchAssets.coverLetter);
                      alert('Cover Letter copied to clipboard!');
                    }}
                  >
                    Copy Cover Letter
                  </button>
                </h3>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '320px', background: 'rgba(0,0,0,0.1)', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.4' }}
                  readOnly
                  value={pitchAssets.coverLetter}
                />
              </div>

              {/* Grid for LinkedIn Note and Elevator Pitch */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* LinkedIn Invitation Note */}
                <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span>🔗 Recruiter LinkedIn Invite Note</span>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => {
                        navigator.clipboard.writeText(pitchAssets.linkedinInvite);
                        alert('LinkedIn Invite Note copied to clipboard!');
                      }}
                    >
                      Copy Note
                    </button>
                  </h3>
                  <textarea 
                    className="form-textarea" 
                    style={{ minHeight: '120px', background: 'rgba(0,0,0,0.1)', fontSize: '0.8rem', lineHeight: '1.4' }}
                    readOnly
                    value={pitchAssets.linkedinInvite}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.72rem', color: pitchAssets.linkedinInvite.length > 300 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                    <span>Character count: <strong>{pitchAssets.linkedinInvite.length}</strong> / 300</span>
                    {pitchAssets.linkedinInvite.length <= 300 ? (
                      <span style={{ color: 'var(--color-success)' }}>✅ Optimal Length</span>
                    ) : (
                      <span style={{ color: 'var(--color-danger)' }}>⚠️ Exceeds Invite limit</span>
                    )}
                  </div>
                </div>

                {/* Elevator Pitch */}
                <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span>🗣️ 30-Second Elevator Pitch</span>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => {
                        navigator.clipboard.writeText(pitchAssets.elevatorPitch);
                        alert('Elevator Pitch copied to clipboard!');
                      }}
                    >
                      Copy Pitch
                    </button>
                  </h3>
                  <textarea 
                    className="form-textarea" 
                    style={{ minHeight: '120px', background: 'rgba(0,0,0,0.1)', fontSize: '0.8rem', lineHeight: '1.4', fontStyle: 'italic' }}
                    readOnly
                    value={pitchAssets.elevatorPitch}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Perfect for speaking at career fairs or virtual networking rooms.
                  </span>
                </div>
              </div>
            </div>
          )}

          {!pitchAssets && !loadingPitch && (
            <div className="card-panel" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <HelpCircle size={32} style={{ marginBottom: '10px' }} />
              <p style={{ fontSize: '0.85rem' }}>No cold pitch assets compiled yet. Click "Generate Cold Pitch Assets" to write Cover Letters, elevator pitches, and invites.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
