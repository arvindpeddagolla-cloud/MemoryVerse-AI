import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { 
  FileText, Search, Filter, Trash2, Eye, Calendar, Award, 
  Layers, Database, ArrowUpDown, X, AlertCircle
} from 'lucide-react';
import api from '../services/api';

export const Documents: React.FC = () => {
  const location = useLocation();
  
  // URL search query handler
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';

  // App States
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Detail Drawer state
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  
  // Preview modal state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter & Search handler
  useEffect(() => {
    let result = [...documents];

    // Apply search query (semantic or basic)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(doc => 
        doc.name.toLowerCase().includes(q) ||
        doc.metadata.title.toLowerCase().includes(q) ||
        doc.metadata.organization.toLowerCase().includes(q) ||
        doc.metadata.skills.some((s: string) => s.toLowerCase().includes(q)) ||
        doc.metadata.summary.toLowerCase().includes(q)
      );
    }

    // Apply Category Filter
    if (selectedCategory) {
      result = result.filter(doc => doc.metadata.category === selectedCategory);
    }

    // Apply Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    } else if (sortBy === 'confidence') {
      result.sort((a, b) => b.metadata.confidenceScore - a.metadata.confidenceScore);
    } else if (sortBy === 'size') {
      result.sort((a, b) => b.size - a.size);
    }

    setFilteredDocs(result);
  }, [documents, searchQuery, selectedCategory, sortBy]);

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document? All associated skills, timeline milestones, and knowledge graph points will be removed.')) return;
    
    try {
      await api.delete(`/documents/${docId}`);
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const categories = [
    'Certificates', 'Projects', 'Skills', 'Internships', 
    'Achievements', 'Academics', 'Portfolio', 'Resume', 'Research', 'Other'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header Section */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">My Managed Documents</h1>
          <p className="text-xs text-slate-405 mt-1">
            Browse and filter academic certificates, internship letters, and project reports verified by AI.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-450 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, skills, issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white text-xs text-slate-700 pl-9 pr-4 py-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 w-1/2 sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-450" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 text-xs text-slate-655 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sorting Filter */}
            <div className="flex items-center gap-1.5 w-1/2 sm:w-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-450" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 text-xs text-slate-655 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
              >
                <option value="newest">Newest Upload</option>
                <option value="oldest">Oldest Upload</option>
                <option value="confidence">Confidence Score</option>
                <option value="size">File Size</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel: Files Grid */}
          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-lg">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mx-auto mb-2"></div>
                <p className="text-xs text-slate-450">Retrieving credentials...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-lg shadow-sm">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-700 text-sm">No documents found</h3>
                <p className="text-xs text-slate-455 mt-1 max-w-[280px] mx-auto">
                  Try adjusting your search filters or upload a new certificate from the dashboard.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow transition duration-150 cursor-pointer flex flex-col justify-between h-40 ${
                      selectedDoc?.id === doc.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 max-w-[80%]">
                        <FileText className="w-5 h-5 text-blue-650 shrink-0" />
                        <div className="truncate">
                          <h4 className="font-semibold text-xs text-slate-800 leading-snug truncate" title={doc.metadata.title}>
                            {doc.metadata.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium truncate inline-block max-w-full">
                            {doc.metadata.organization}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide shrink-0 ${
                        doc.metadata.category === 'Certificates' ? 'bg-blue-50 text-blue-700' :
                        doc.metadata.category === 'Projects' ? 'bg-emerald-50 text-emerald-700' :
                        doc.metadata.category === 'Internships' ? 'bg-purple-50 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {doc.metadata.category}
                      </span>
                    </div>

                    {/* Skill Pills preview */}
                    <div className="flex flex-wrap gap-1 mt-2 mb-3">
                      {doc.metadata.skills.slice(0, 3).map((skill: string, index: number) => (
                        <span key={index} className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] text-slate-505 font-medium">
                          {skill}
                        </span>
                      ))}
                      {doc.metadata.skills.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-bold self-center">+{doc.metadata.skills.length - 3} more</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            const url = doc.url.startsWith('http') ? doc.url : `http://localhost:5000${doc.url}`;
                            setPreviewUrl(url);
                          }}
                          className="p-1 text-slate-450 hover:text-slate-700 hover:bg-slate-50 rounded"
                          title="Preview original"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Detail Drawer */}
          {selectedDoc && (
            <div className="w-full lg:w-[350px] border border-slate-200 rounded-lg bg-white p-5 shadow-sm space-y-5 h-fit lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-150 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">AI File Parsing Audit</h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{selectedDoc.id}</span>
                </div>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Card */}
              <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-semibold text-blue-900">AI Confidence Score</span>
                </div>
                <span className="text-sm font-extrabold text-blue-600 font-mono">{selectedDoc.metadata.confidenceScore}%</span>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs text-slate-655">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Title</label>
                  <span className="block font-semibold text-slate-800">{selectedDoc.metadata.title}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Issuing Organization</label>
                  <span className="block font-semibold text-slate-800">{selectedDoc.metadata.organization}</span>
                </div>
                {selectedDoc.metadata.dates && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Credential Date</label>
                    <span className="block font-semibold text-slate-800">{selectedDoc.metadata.dates}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Extracted Skills</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedDoc.metadata.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedDoc.metadata.technologies && selectedDoc.metadata.technologies.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Technologies Used</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedDoc.metadata.technologies.map((tech: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-650">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">AI Executive Summary</label>
                  <p className="leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 text-[11px] text-slate-500">
                    {selectedDoc.metadata.summary}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-slate-150 pt-4 flex gap-2">
                <button
                  onClick={() => {
                    const url = selectedDoc.url.startsWith('http') ? selectedDoc.url : `http://localhost:5000${selectedDoc.url}`;
                    setPreviewUrl(url);
                  }}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded shadow-sm transition text-center inline-block"
                >
                  View Original File
                </button>
                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-[11px] font-bold rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Embedded File Viewer Overlay */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-bold font-mono truncate max-w-[80%]">{previewUrl.split('/').pop()}</span>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Embed element */}
            <div className="flex-1 bg-slate-100 flex items-center justify-center">
              {previewUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/) ? (
                <img src={previewUrl} alt="Document preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <iframe
                  src={previewUrl}
                  title="Document PDF viewer"
                  className="w-full h-full border-none"
                >
                  <p>Your browser does not support iframes. You can open the file link directly: <a href={previewUrl}>Download Document</a></p>
                </iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
