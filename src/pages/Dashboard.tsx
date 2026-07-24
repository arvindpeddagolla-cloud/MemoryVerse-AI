import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { 
  FileText, UploadCloud, Award, Briefcase, Code, BookOpen, 
  ArrowRight, AlertCircle, TrendingUp, Sparkles, CheckCircle2,
  ListTodo, Globe
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dashboard state
  const [stats, setStats] = useState({
    documents: 0,
    certificates: 0,
    projects: 0,
    skills: 0,
    internships: 0,
    achievements: 0
  });

  const [insights, setInsights] = useState<any>({
    readinessScore: 65,
    missingSkills: [],
    recommendedCertifications: []
  });

  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      // 1. Get documents
      const docsRes = await api.get('/documents');
      const docs = docsRes.data;
      setRecentDocs(docs.slice(0, 4));

      // 2. Get skills
      const skillsRes = await api.get('/career/skills');
      const skills = skillsRes.data;

      // 3. Get insights
      const insightsRes = await api.get('/career/insights');
      const ins = insightsRes.data;
      setInsights(ins);

      // Compute statistics based on document categories
      const certCount = docs.filter((d: any) => d.metadata.category === 'Certificates').length;
      const projCount = docs.filter((d: any) => d.metadata.category === 'Projects').length;
      const internCount = docs.filter((d: any) => d.metadata.category === 'Internships').length;
      const achieveCount = docs.filter((d: any) => d.metadata.category === 'Achievements').length;

      setStats({
        documents: docs.length,
        certificates: certCount,
        projects: projCount,
        skills: skills.length,
        internships: internCount,
        achievements: achieveCount
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick drag & drop upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploadProgress(40);
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchDashboardData(); // Refresh metrics
      }, 800);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError(err.response?.data?.error || 'Failed to process document. Try another file.');
      setIsUploading(false);
    }
  };

  const statCards = [
    { title: 'Total Docs', count: stats.documents, icon: <FileText className="w-5 h-5 text-slate-500" />, bg: 'bg-slate-50' },
    { title: 'Certificates', count: stats.certificates, icon: <Award className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50/50' },
    { title: 'Projects', count: stats.projects, icon: <Code className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50/50' },
    { title: 'Skills Extracted', count: stats.skills, icon: <BookOpen className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50/50' },
    { title: 'Internships', count: stats.internships, icon: <Briefcase className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50/50' },
    { title: 'Achievements', count: stats.achievements, icon: <Award className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50/50' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Welcome, {user?.name}</h1>
            <p className="text-xs text-slate-450 mt-1">Here is a verified summary of your academic and professional accomplishments.</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded text-slate-650 font-semibold">
            <span>Database Mode:</span>
            <span className="text-blue-650">JSON Persistence</span>
          </div>
        </div>

        {/* Statistics Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, idx) => (
            <div key={idx} className={`p-4 border border-slate-200 rounded-lg ${card.bg} shadow-sm flex flex-col justify-between h-28`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{card.title}</span>
                {card.icon}
              </div>
              <span className="text-2xl font-extrabold text-slate-800 font-mono mt-2">{card.count}</span>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Upload & Recent Documents (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Upload Panel */}
            <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">Quick Document Processing Ingestion</h3>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-3 py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mx-auto"></div>
                    <p className="text-xs text-slate-500 font-semibold">Running OCR text extraction and Gemini parser... ({uploadProgress}%)</p>
                    <div className="w-48 bg-slate-100 rounded-full h-1.5 mx-auto">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Drag & Drop files or click to upload</p>
                    <p className="text-[10px] text-slate-450 mt-1">Supports PDF, DOCX, PNG, JPG (Max 10MB)</p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Recent Uploads Table */}
            <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-800">Recent AI-Analyzed Documents</h3>
                <Link to="/documents" className="text-xs text-blue-650 hover:underline font-semibold flex items-center gap-1">
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentDocs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-100 rounded">
                  <p className="text-xs text-slate-450">No processed documents yet. Ingest your first certificate above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="pb-2">Filename</th>
                        <th className="pb-2">AI Title</th>
                        <th className="pb-2">Organization</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2 text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDocs.map((doc) => (
                        <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                          <td className="py-3 font-medium text-slate-800 max-w-[120px] truncate">{doc.name}</td>
                          <td className="py-3 text-slate-650 max-w-[150px] truncate">{doc.metadata.title}</td>
                          <td className="py-3 text-slate-500 max-w-[120px] truncate">{doc.metadata.organization}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              doc.metadata.category === 'Certificates' ? 'bg-blue-50 text-blue-700' :
                              doc.metadata.category === 'Projects' ? 'bg-emerald-50 text-emerald-700' :
                              doc.metadata.category === 'Internships' ? 'bg-purple-50 text-purple-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {doc.metadata.category}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-blue-650">{doc.metadata.confidenceScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Insights & Score (1/3 width) */}
          <div className="space-y-8">
            
            {/* Career Readiness Score Card */}
            <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col items-center text-center">
              <h3 className="font-bold text-sm text-slate-800 self-start mb-6">Career Readiness Audit</h3>
              
              {/* Circular SVG Chart */}
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#2563eb"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={(2 * Math.PI * 54) * (1 - insights.readinessScore / 100)}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-slate-800 font-mono leading-none">{insights.readinessScore}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Ready %</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 w-full">
                <div className="flex justify-between items-center text-xs border-b border-slate-150 pb-2">
                  <span className="text-slate-400 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Score Rank</span>
                  <span className={`font-bold uppercase tracking-wider text-[10px] ${
                    insights.readinessScore >= 85 ? 'text-emerald-650' :
                    insights.readinessScore >= 70 ? 'text-blue-600' :
                    insights.readinessScore >= 60 ? 'text-amber-500' : 'text-rose-600'
                  }`}>
                    {insights.readinessScore >= 85 ? 'Excellent' :
                     insights.readinessScore >= 70 ? 'Very Good' :
                     insights.readinessScore >= 60 ? 'Good' : 'Needs Audit'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 text-left leading-relaxed">
                  Your score is calculated based on verified certificates, tech project uploads, and skill counts. Uploading additional credentials will boost this score.
                </div>
              </div>
            </div>

            {/* AI Career Suggestions */}
            <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800">AI Target Suggestions</h3>
              </div>

              <div className="space-y-4">
                {/* Missing Skills */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5" /> Missing Skills Gaps
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.missingSkills && insights.missingSkills.length > 0 && insights.missingSkills[0] !== 'None' ? (
                      insights.missingSkills.map((skill: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 border border-slate-200 rounded bg-slate-50 text-[10px] font-semibold text-slate-650">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> All key skills verified!
                      </span>
                    )}
                  </div>
                </div>

                {/* Recommended Certifications */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recommended Certifications</h4>
                  <div className="space-y-2">
                    {insights.recommendedCertifications && insights.recommendedCertifications.length > 0 ? (
                      insights.recommendedCertifications.map((cert: any, index: number) => (
                        <div key={index} className="p-2 border border-slate-100 rounded bg-slate-50/50 flex flex-col text-left">
                          <span className="text-[11px] font-bold text-slate-750">{cert.title}</span>
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                            <span>Provider: {cert.provider}</span>
                            <span className="text-blue-600 font-semibold">{cert.difficulty}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No suggestions available.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Social Identities Card */}
            <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Connected Social Identities
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded bg-slate-50/50">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <svg className="w-4 h-4 text-slate-700 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                    GitHub
                  </span>
                  {user?.socialLinks?.github ? (
                    <a 
                      href={`https://github.com/${user.socialLinks.github}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-mono font-bold text-blue-600 hover:underline"
                    >
                      @{user.socialLinks.github}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not Connected</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded bg-slate-50/50">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                  </span>
                  {user?.socialLinks?.linkedin ? (
                    <a 
                      href={`https://linkedin.com/in/${user.socialLinks.linkedin}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-mono font-bold text-blue-600 hover:underline"
                    >
                      @{user.socialLinks.linkedin}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not Connected</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded bg-slate-50/50">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <Globe className="w-4 h-4 text-slate-400" />
                    Portfolio
                  </span>
                  {user?.socialLinks?.portfolio ? (
                    <a 
                      href={user.socialLinks.portfolio} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-bold text-blue-600 hover:underline truncate max-w-[120px]"
                    >
                      Website
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not Connected</span>
                  )}
                </div>
              </div>

              <Link 
                to="/settings" 
                className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-center font-bold rounded block transition text-[10px]"
              >
                Manage Social Connections
              </Link>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
