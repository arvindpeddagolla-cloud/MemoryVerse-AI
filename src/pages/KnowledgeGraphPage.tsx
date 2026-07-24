import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { KnowledgeGraph } from '../components/KnowledgeGraph';
import { Network, X, Eye, FileText, Calendar, Award } from 'lucide-react';
import api from '../services/api';
import { GraphNode } from '../types';

export const KnowledgeGraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  
  // Document details drawer (when node is clicked)
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.get('/career/graph');
      setGraphData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading graph:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleNodeClick = async (node: GraphNode) => {
    if (node.type === 'document') {
      try {
        const res = await api.get('/documents');
        const doc = res.data.find((d: any) => d.id === node.id);
        if (doc) {
          setSelectedDoc(doc);
        }
      } catch (err) {
        console.error('Failed to get document detail:', err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Digital Identity Knowledge Graph</h1>
          <p className="text-xs text-slate-450 mt-1">
            An interactive AI mapping connecting your verified milestones (Certificates, Projects, Internships) to extracted skills.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="w-full h-[550px] border border-slate-200 rounded-lg bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                  <p className="text-xs text-slate-455">Compiling connections...</p>
                </div>
              </div>
            ) : (
              <KnowledgeGraph 
                data={graphData} 
                onNodeClick={handleNodeClick} 
              />
            )}
          </div>

          {/* Details Drawer side pane */}
          {selectedDoc && (
            <div className="w-full lg:w-[320px] border border-slate-200 rounded-lg bg-white p-5 shadow-sm space-y-4 h-fit max-h-[550px] overflow-y-auto shrink-0">
              <div className="flex items-start justify-between border-b border-slate-150 pb-3">
                <div className="truncate pr-4">
                  <h3 className="font-bold text-xs text-slate-800 leading-snug truncate" title={selectedDoc.metadata.title}>
                    {selectedDoc.metadata.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">{selectedDoc.metadata.organization}</span>
                </div>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tag Category */}
              <div className="text-xs text-slate-655 space-y-3.5">
                <div className="flex justify-between items-center bg-slate-50 p-2 border border-slate-100 rounded">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Classification</span>
                  <span className="text-[10px] font-bold text-blue-650 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedDoc.metadata.category}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Confidence Accuracy</label>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${selectedDoc.metadata.confidenceScore}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1 block text-right">{selectedDoc.metadata.confidenceScore}% Match</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Extracted Skills</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDoc.metadata.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] text-slate-500 font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">Executive Summary</label>
                  <p className="leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 text-[10.5px] text-slate-500">
                    {selectedDoc.metadata.summary}
                  </p>
                </div>
              </div>

              {/* View Action */}
              <button
                onClick={() => {
                  const url = selectedDoc.url.startsWith('http') ? selectedDoc.url : `http://localhost:5000${selectedDoc.url}`;
                  setPreviewUrl(url);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                View Original Document
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Embedded File Viewer Overlay */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-bold font-mono truncate max-w-[80%]">{previewUrl.split('/').pop()}</span>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
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
