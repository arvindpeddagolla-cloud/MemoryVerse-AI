import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { 
  Award, TrendingUp, Cpu, BookOpen, AlertCircle, CheckCircle, Plus, Trash2 
} from 'lucide-react';
import api from '../services/api';

export const CareerInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any>({
    readinessScore: 65,
    skillDistribution: [],
    technologyUsage: [],
    missingSkills: [],
    recommendedCertifications: [],
    suggestedCareerPaths: [],
    industryMatching: 60
  });
  
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInsightsAndSkills = async () => {
    try {
      const [insightsRes, skillsRes] = await Promise.all([
        api.get('/career/insights'),
        api.get('/career/skills')
      ]);
      setInsights(insightsRes.data);
      setSkills(skillsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load career analytics:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsAndSkills();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setActionLoading(true);
    try {
      await api.post('/career/skills', {
        name: newSkillName.trim(),
        category: newSkillCategory,
        level: newSkillLevel
      });
      setNewSkillName('');
      await fetchInsightsAndSkills();
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSuggestedSkill = async (skillName: string) => {
    setActionLoading(true);
    let category = 'General';
    const lower = skillName.toLowerCase();
    
    if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('ci/cd') || lower.includes('aws') || lower.includes('cloud')) {
      category = 'DevOps';
    } else if (lower.includes('graphql') || lower.includes('node') || lower.includes('api') || lower.includes('sql') || lower.includes('database')) {
      category = 'Backend';
    } else if (lower.includes('react') || lower.includes('css') || lower.includes('tailwind') || lower.includes('html')) {
      category = 'Frontend';
    }

    try {
      await api.post('/career/skills', {
        name: skillName,
        category: category,
        level: 'Intermediate'
      });
      await fetchInsightsAndSkills();
    } catch (err) {
      console.error('Failed to add suggested skill:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setActionLoading(true);
    try {
      await api.delete(`/career/skills/${skillId}`);
      await fetchInsightsAndSkills();
    } catch (err) {
      console.error('Failed to delete skill:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getScoreRank = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'Needs Audit';
  };

  const getLevelBadgeStyles = (lvl: string) => {
    const lower = (lvl || '').toLowerCase();
    if (lower === 'completed' || lower === 'advanced') {
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    }
    if (lower === 'start' || lower === 'beginner') {
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    }
    return 'bg-blue-50 text-blue-600 border border-blue-100'; // Intermediate
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Career Development & Skill Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare your verified credentials against industry standards to spot skill gaps and view custom certification roadmaps.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-lg">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Analyzing profile metrics...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left Panel: Stats and Score (2 columns) */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Readiness Score Breakdown */}
              <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-600" /> Career Readiness Breakdown
                </h3>

                <div className="grid sm:grid-cols-2 gap-8 items-center">
                  {/* Gauge */}
                  <div className="flex flex-col items-center">
                    <div className="relative h-32 w-32 flex items-center justify-center">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="50" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="50" 
                          stroke="#2563eb" 
                          strokeWidth="8" 
                          fill="none" 
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={(2 * Math.PI * 50) * (1 - insights.readinessScore / 100)}
                        />
                      </svg>
                      <div className="text-center">
                        <span className="text-3xl font-extrabold text-slate-800 font-mono leading-none">{insights.readinessScore}</span>
                        <span className="text-[9px] text-slate-400 uppercase block tracking-wider font-bold mt-1">Ready %</span>
                      </div>
                    </div>
                  </div>

                  {/* Criteria list */}
                  <div className="space-y-3.5 text-xs text-slate-600">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-medium text-slate-500">Industry Matching Rate</span>
                      <span className="font-bold text-slate-800">{insights.industryMatching}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-medium text-slate-500">Score Rank</span>
                      <span className={`font-bold uppercase tracking-wider text-[10px] ${
                        insights.readinessScore >= 85 ? 'text-emerald-650' :
                        insights.readinessScore >= 70 ? 'text-blue-600' :
                        insights.readinessScore >= 60 ? 'text-amber-500' : 'text-rose-600'
                      }`}>{getScoreRank(insights.readinessScore)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-medium text-slate-500">Verified Credentials Count</span>
                      <span className="font-bold text-slate-800">{skills.filter(s => s.count > 1).length} Active</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-medium text-slate-500">Suggested Career Paths</span>
                      <div className="flex flex-col text-right">
                        {insights.suggestedCareerPaths?.map((path: string, i: number) => (
                          <span key={i} className="font-semibold text-slate-700">{path}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Competency Vectors */}
              <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-6 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-blue-600" /> Skill Competency Vectors
                </h3>

                <div className="space-y-4">
                  {insights.skillDistribution?.map((skill: any, index: number) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-600 font-semibold">
                        <span>{skill.name}</span>
                        <span className="font-mono text-blue-600">{skill.value}% Mastery</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${skill.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Skill Register */}
              <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Cpu className="w-4.5 h-4.5 text-blue-600" /> My Skill Inventory
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Verified via credentials or manually added below.</p>
                  </div>
                </div>

                {/* Add Skill Form */}
                <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-lg mb-6">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Skill Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Docker, Java"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 bg-white rounded text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Category</label>
                    <select 
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 bg-white rounded text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Database">Database</option>
                      <option value="Languages">Languages</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Level</label>
                    <select 
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 bg-white rounded text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="Start">Start</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button 
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-md shadow-blue-500/10 transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>
                </form>

                {/* Skill List items */}
                <div className="grid sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {skills.map((skill: any) => (
                    <div key={skill.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-slate-300 transition">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">{skill.name}</span>
                        <div className="flex gap-1.5 text-[9px] font-bold mt-1">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{skill.category}</span>
                          <span className={`px-1.5 py-0.5 rounded border ${getLevelBadgeStyles(skill.level)}`}>{skill.level || 'Intermediate'}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)}
                        disabled={actionLoading}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-slate-450 italic">No skills registered. Upload credentials or add them manually above.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Panel: Gaps and Recommendations (1 column) */}
            <div className="space-y-8">
              
              {/* Missing Skills Alert */}
              <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-500" /> Skill Gap Highlights
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Recruiters looking for your matching roles frequently search for these missing competencies:
                </p>

                <div className="space-y-2">
                  {insights.missingSkills?.map((skill: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span className="font-semibold">{skill}</span>
                      </div>
                      
                      {skill !== 'None' && (
                        <button 
                          onClick={() => handleAddSuggestedSkill(skill)}
                          disabled={actionLoading}
                          className="px-2 py-0.5 border border-blue-250 hover:border-blue-300 text-blue-600 rounded bg-white font-bold text-[9px] flex items-center gap-0.5 shadow-sm transition"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  ))}
                  {(!insights.missingSkills || insights.missingSkills.length === 0 || insights.missingSkills[0] === 'None') && (
                    <div className="text-center py-4 text-slate-400 text-xs italic flex items-center gap-1.5 justify-center">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                      All key skills verified!
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Certifications */}
              <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-blue-600" /> Suggested Certifications
                </h3>
                
                <div className="space-y-3">
                  {insights.recommendedCertifications?.map((cert: any, idx: number) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800">{cert.title}</span>
                      <span className="text-[10px] text-slate-400 mt-1">Issuer: {cert.provider}</span>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[10px]">
                        <span className="font-bold text-blue-600 uppercase font-mono">{cert.difficulty}</span>
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(cert.title + ' certificate')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-slate-500 hover:text-blue-600 hover:underline"
                        >
                          Explore Course &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
