import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { 
  Settings, User, GraduationCap, Briefcase, Link as LinkIcon, 
  DownloadCloud, Trash2, ShieldAlert, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Profile forms states
  const [name, setName] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Education forms states (single entry editing for simplicity)
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [gradYear, setGradYear] = useState('');

  // Experience forms states (single entry editing)
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [expYear, setExpYear] = useState('');

  // Notification notices
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state with user profile
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGithub(user.socialLinks?.github || '');
      setLinkedin(user.socialLinks?.linkedin || '');
      setPortfolio(user.socialLinks?.portfolio || '');

      if (user.education && user.education.length > 0) {
        setSchool(user.education[0].institution || '');
        setDegree(user.education[0].degree || '');
        setGradYear(user.education[0].endYear || '');
      }

      if (user.experience && user.experience.length > 0) {
        setCompany(user.experience[0].company || '');
        setPosition(user.experience[0].position || '');
        setExpYear(user.experience[0].endDate || '');
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      const payload = {
        name,
        socialLinks: { github, linkedin, portfolio },
        education: school ? [{ id: 'edu_1', institution: school, degree, fieldOfStudy: 'Computer Science', startYear: '2022', endYear: gradYear, grade: '3.8' }] : [],
        experience: company ? [{ id: 'exp_1', company, position, startDate: '2023', endDate: expYear, description: 'Software application developer.' }] : []
      };

      await updateProfile(payload);
      setSuccess('Profile settings updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings.');
    }
  };

  const handleExportData = async () => {
    try {
      setSuccess(null);
      setError(null);
      const response = await api.get('/settings/export');
      
      // Trigger a programmatic JSON download in the client browser
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MemoryVerse_Export_${name.replace(/\s+/g, '_') || 'Profile'}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('Digital footprint exported successfully!');
    } catch (err: any) {
      console.error('Export failed:', err);
      setError('Failed to export digital credentials.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This action is irreversible. All uploaded certificates, projects, timeline milestones, and data mappings will be deleted.')) return;
    
    try {
      await api.delete('/settings/delete-account');
      logout();
      navigate('/');
    } catch (err) {
      console.error('Delete account failed:', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8 font-sans">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Account & Profile Settings</h1>
          <p className="text-xs text-slate-450 mt-1">
            Update your public profile links, verify educational backgrounds, export backups, or delete your credentials.
          </p>
        </div>

        {/* Status Alerts */}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-250 rounded text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-250 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Card: Basic Settings */}
          <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4.5 h-4.5 text-blue-650" /> Personal Identity Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-450 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card: Education Settings */}
          <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-4.5 h-4.5 text-blue-655" /> Academic History
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">College/Institution</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Graduation Year</label>
                <input
                  type="text"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Degree Title</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Science in Computer Science"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card: Experience Settings */}
          <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4.5 h-4.5 text-blue-655" /> Professional Experience
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google Cloud Services"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Duration / End Date</label>
                <input
                  type="text"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  placeholder="e.g. 2025 or Present"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Job Position / Title</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card: Social Links */}
          <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <LinkIcon className="w-4.5 h-4.5 text-blue-650" /> Social Integrations
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">GitHub Username</label>
                <div className="flex">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 px-2.5 py-1.5 rounded-l text-[10px] text-slate-450 font-semibold flex items-center">github.com/</span>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="profile"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-r px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">LinkedIn Profile Name</label>
                <div className="flex">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 px-2.5 py-1.5 rounded-l text-[10px] text-slate-450 font-semibold flex items-center">linkedin.com/in/</span>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="profile"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-r px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Public Portfolio Link</label>
                <input
                  type="text"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://mywebsite.me"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Profile edits */}
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm transition"
          >
            Save All Profile Settings
          </button>
        </form>

        {/* Separator */}
        <hr className="border-slate-200" />

        {/* Card: Export & Delete Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Data */}
          <div className="p-6 border border-slate-200 bg-white rounded-lg shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <DownloadCloud className="w-4.5 h-4.5 text-slate-650" /> Export Digital Credentials
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download your complete MemoryVerse digital footprint as a structured JSON file. Includes verified documents, timeline history, and AI skills maps.
            </p>
            <button
              onClick={handleExportData}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-bold transition flex items-center gap-1.5"
            >
              Export JSON Archive
            </button>
          </div>

          {/* Delete Account */}
          <div className="p-6 border border-red-200 bg-red-50/10 rounded-lg shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-red-700 flex items-center gap-2">
              <Trash2 className="w-4.5 h-4.5" /> Permanent Account Deletion
            </h3>
            <p className="text-xs text-red-655 leading-relaxed">
              This action will permanently purge your user profile, original uploaded credential files, achievements timeline, and matching metadata. This cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-sm transition"
            >
              Delete Account & Records
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
