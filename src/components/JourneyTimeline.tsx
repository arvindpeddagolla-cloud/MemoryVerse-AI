import React from 'react';
import { TimelineItem } from '../types';
import { Award, Briefcase, Code, FileText, Calendar, ExternalLink } from 'lucide-react';

interface JourneyTimelineProps {
  items: TimelineItem[];
  onEventClick?: (documentId: string) => void;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ items, onEventClick }) => {
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Certificates':
        return <Award className="w-4 h-4 text-blue-600" />;
      case 'Projects':
        return <Code className="w-4 h-4 text-emerald-600" />;
      case 'Internships':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'Achievements':
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Certificates':
        return {
          bg: 'bg-blue-50 border-blue-200',
          dot: 'bg-blue-500 ring-blue-100',
          tag: 'bg-blue-100 text-blue-800'
        };
      case 'Projects':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500 ring-emerald-100',
          tag: 'bg-emerald-100 text-emerald-800'
        };
      case 'Internships':
        return {
          bg: 'bg-purple-50 border-purple-200',
          dot: 'bg-purple-500 ring-purple-100',
          tag: 'bg-purple-100 text-purple-800'
        };
      case 'Achievements':
        return {
          bg: 'bg-amber-50 border-amber-200',
          dot: 'bg-amber-500 ring-amber-100',
          tag: 'bg-amber-100 text-amber-800'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          dot: 'bg-slate-500 ring-slate-100',
          tag: 'bg-slate-100 text-slate-800'
        };
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-white">
        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-700">Timeline is empty</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
          Upload certificates, project documents, or letters to populate your automated timeline.
        </p>
      </div>
    );
  }

  // Sort timeline chronologically (latest first)
  const sortedItems = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-8 py-2">
      {sortedItems.map((item, idx) => {
        const styles = getCategoryStyle(item.category);
        const eventDate = new Date(item.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        return (
          <div key={item.id} className="relative group">
            {/* Timeline Dot */}
            <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ${styles.dot} transition-transform duration-200 group-hover:scale-110`}></span>

            {/* Event Card */}
            <div className={`p-4 border rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${styles.bg} border`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium leading-normal ${styles.tag}`}>
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {eventDate}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.description}
              </p>

              {item.documentId && onEventClick && (
                <button
                  onClick={() => onEventClick(item.documentId!)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Original Verification Document
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
