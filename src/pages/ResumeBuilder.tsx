import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Wrench, Sparkles, Download, RefreshCw, LayoutTemplate, Plus, Trash } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  
  // Builder form state
  const [resumeTitle, setResumeTitle] = useState('My Enterprise Resume');
  const [templateId, setTemplateId] = useState('classic');
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Lists (populated from user data if exists, or editable)
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Load defaults from user profile
  useEffect(() => {
    if (user) {
      setEducation(user.education || []);
      setExperience(user.experience || []);
      
      // Load skills
      const fetchSkills = async () => {
        try {
          const res = await api.get('/career/skills');
          setSkills(res.data.map((s: any) => s.name));
          
          // Seed mock projects if empty
          const docsRes = await api.get('/documents');
          const projs = docsRes.data
            .filter((d: any) => d.metadata.category === 'Projects')
            .map((d: any) => ({
              title: d.metadata.title,
              tech: d.metadata.technologies.join(', '),
              description: d.metadata.summary
            }));
          
          if (projs.length > 0) {
            setProjects(projs);
          } else {
            setProjects([
              { title: 'AI Platform Ingestion Service', tech: 'Node.js, Express, OCR', description: 'Developed text processing pipelines converting raw image data into structured database collections.' }
            ]);
          }
        } catch (err) {
          console.error(err);
        }
      };
      
      fetchSkills();
    }
  }, [user]);

  // Call AI summary generator
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await api.post('/resume/generate-summary');
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Trigger Print to PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header Block */}
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">ATS Resume Builder</h1>
            <p className="text-xs text-slate-455 mt-1">
              Create and preview ATS-optimized resume files automatically populated from your verified credentials.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download PDF / Print
            </button>
          </div>
        </div>

        {/* Builder Workspace */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left Panel: Form Editors (2/5 columns) */}
          <div className="lg:col-span-2 space-y-6 print:hidden">
            
            {/* Template Selector & Title */}
            <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-blue-650" /> Layout Configuration
              </h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Resume Name</label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Template Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTemplateId('classic')}
                    className={`py-1.5 border rounded text-xs font-semibold ${
                      templateId === 'classic' ? 'border-blue-500 bg-blue-50/50 text-blue-600' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Classic Serif
                  </button>
                  <button
                    onClick={() => setTemplateId('modern')}
                    className={`py-1.5 border rounded text-xs font-semibold ${
                      templateId === 'modern' ? 'border-blue-500 bg-blue-50/50 text-blue-600' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Modern Sans
                  </button>
                </div>
              </div>
            </div>

            {/* AI Summary Generator Panel */}
            <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Professional Summary
                </h3>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                  Generate AI
                </button>
              </div>
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Click Generate AI to compose a professional ATS executive summary based on your uploaded credentials."
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-655 focus:outline-none"
              />
            </div>

            {/* Dynamic Skills Editor */}
            <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Skills list</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, index) => (
                  <span key={index} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 flex items-center gap-1">
                    {skill}
                    <button 
                      onClick={() => setSkills(skills.filter(s => s !== skill))}
                      className="text-red-400 hover:text-red-600 font-bold ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const inputVal = (form.elements.namedItem('newSkill') as HTMLInputElement).value;
                  if (inputVal.trim() && !skills.includes(inputVal)) {
                    setSkills([...skills, inputVal]);
                    form.reset();
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="newSkill"
                  type="text"
                  placeholder="Add custom skill..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none"
                />
                <button type="submit" className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-xs font-semibold text-slate-600">
                  Add
                </button>
              </form>
            </div>

          </div>

          {/* Right Panel: Live PDF Print Preview (3/5 columns) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg shadow-md p-8 sm:p-12 overflow-y-auto max-h-[85vh] print:max-h-none print:shadow-none print:border-none print:p-0">
            {/* Resume content container */}
            <div className={`mx-auto max-w-2xl text-slate-800 ${templateId === 'classic' ? 'font-serif' : 'font-sans'}`}>
              
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">{user?.name}</h2>
                <div className="flex justify-center gap-3 text-[10px] text-slate-500 font-mono mt-2">
                  <span>{user?.email}</span>
                  <span>&bull;</span>
                  <span>GitHub: github.com/{user?.socialLinks?.github || 'profile'}</span>
                  <span>&bull;</span>
                  <span>LinkedIn: linkedin.com/in/{user?.socialLinks?.linkedin || 'profile'}</span>
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="mb-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">Professional Summary</h4>
                  <p className="text-[11px] leading-relaxed text-slate-650">{summary}</p>
                </div>
              )}

              {/* Experience list */}
              {experience.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">Experience</h4>
                  <div className="space-y-4">
                    {experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between text-[11px] font-bold text-slate-850">
                          <span>{exp.position}</span>
                          <span className="font-mono text-slate-500">{exp.startDate} &mdash; {exp.endDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-450 italic mt-0.5">{exp.company}</div>
                        <p className="text-[10px] leading-relaxed text-slate-600 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education list */}
              {education.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">Education</h4>
                  <div className="space-y-3">
                    {education.map((edu) => (
                      <div key={edu.id}>
                        <div className="flex justify-between text-[11px] font-bold text-slate-850">
                          <span>{edu.degree} in {edu.fieldOfStudy}</span>
                          <span className="font-mono text-slate-500">{edu.startYear} &mdash; {edu.endYear}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-450 mt-0.5">
                          <span>{edu.institution}</span>
                          {edu.grade && <span className="font-mono">GPA: {edu.grade}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects list */}
              {projects.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">Academic Projects</h4>
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[11px] font-bold text-slate-850">
                          <span>{proj.title}</span>
                          <span className="font-mono text-[9px] font-normal text-slate-450">{proj.tech}</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-600 mt-1">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">Technical Skills</h4>
                  <p className="text-[11px] leading-relaxed text-slate-655 font-mono">
                    {skills.join(' | ')}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
