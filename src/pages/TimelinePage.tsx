import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { CalendarRange, X, Eye } from 'lucide-react';
import api from '../services/api';

export const TimelinePage: React.FC = () => {
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await api.get('/career/timeline');
      setTimelineItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleEventClick = async (documentId: string) => {
    try {
      const res = await api.get('/documents');
      const doc = res.data.find((d: any) => d.id === documentId);
      if (doc) {
        const url = doc.url.startsWith('http') ? doc.url : `http://localhost:5000${doc.url}`;
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error('Failed to locate document for timeline click:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">Digital Journey Timeline</h1>
          <p className="text-xs text-slate-450 mt-1">
            An automated chronological record of your academic achievements, projects, and work experiences.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="text-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mx-auto mb-2"></div>
              <p className="text-xs text-slate-455">Assembling chronological timeline...</p>
            </div>
          ) : (
            <JourneyTimeline 
              items={timelineItems} 
              onEventClick={handleEventClick} 
            />
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
