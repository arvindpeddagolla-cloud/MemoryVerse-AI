import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { MessageSquare, Send, Sparkles, User, Bot, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { ChatMessage } from '../types';

export const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am your MemoryVerse AI Assistant. I can analyze your uploaded credentials and provide summary recommendations. Try clicking one of the suggestions below or ask me anything about your academic and professional journey!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Map messages history to API schema
      const historyPayload = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const res = await api.post('/ai/chat', {
        messages: historyPayload,
        prompt: textToSend
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I encountered an error connecting to the AI model. Please verify your connection or try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const chips = [
    "Summarize my resume",
    "Suggest missing skills",
    "Recommend certifications",
    "Create interview preparation roadmap",
    "Explain my career journey",
    "Generate portfolio introduction"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans h-[calc(100vh-140px)] flex flex-col">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-3 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">AI Identity Assistant</h1>
          <p className="text-xs text-slate-450 mt-1">
            Ask the AI questions about your academic milestones, projects, skills audit, and resume improvements.
          </p>
        </div>

        {/* Chat Pane */}
        <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden shadow-sm">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-full border shrink-0 flex items-center justify-center ${
                    isUser ? 'bg-slate-100 border-slate-200' : 'bg-blue-50 border-blue-150'
                  }`}>
                    {isUser ? <User className="w-4 h-4 text-slate-650" /> : <Bot className="w-4 h-4 text-blue-600" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-lg text-xs leading-relaxed border ${
                    isUser 
                      ? 'bg-blue-50 border-blue-200 text-slate-800 rounded-tr-none' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 rounded-tl-none'
                  }`}>
                    {/* Render basic markdown blocks for subheadings and bullet lists */}
                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.content.split('\n').map((line, lIdx) => {
                        if (line.startsWith('### ')) {
                          return <h4 key={lIdx} className="font-bold text-slate-800 text-sm mt-2">{line.replace('### ', '')}</h4>;
                        }
                        if (line.startsWith('#### ')) {
                          return <h5 key={lIdx} className="font-semibold text-slate-800 mt-1.5">{line.replace('#### ', '')}</h5>;
                        }
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return <li key={lIdx} className="ml-4 list-disc">{line.substring(2)}</li>;
                        }
                        return <p key={lIdx}>{line}</p>;
                      })}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono block mt-2 text-right">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {/* AI Loading Bubble */}
            {loading && (
              <div className="flex items-start gap-3 max-w-[80%] mr-auto">
                <div className="h-8 w-8 rounded-full border shrink-0 flex items-center justify-center bg-blue-50 border-blue-150">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-4 rounded-lg border bg-slate-50 border-slate-200 rounded-tl-none flex items-center gap-1.5 py-3">
                  <div className="h-2 w-2 bg-slate-450 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-slate-450 rounded-full animate-bounce delay-150"></div>
                  <div className="h-2 w-2 bg-slate-450 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips selector */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Suggested prompts</span>
            <div className="flex flex-wrap gap-2">
              {chips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="px-2.5 py-1 border border-slate-200 hover:border-slate-350 bg-white text-[10px] font-semibold text-slate-650 rounded-full shadow-sm transition disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input text form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="p-4 border-t border-slate-200 bg-white flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask me something about your profile..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-50 focus:bg-white text-xs text-slate-700 px-4 py-2.5 border border-slate-200 rounded focus:border-blue-500 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};
