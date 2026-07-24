import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Cpu, Database, Search, Workflow, 
  ChevronRight, Award, Network, ChevronDown, Check, UserCheck, HelpCircle, Code,
  Eye, CheckCircle2, Lock, ArrowUpRight, GraduationCap, Briefcase,
  LayoutDashboard, FileText, CalendarRange, MessageSquare, UploadCloud
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(prev => (prev === index ? null : index));
  };

  const faqItems = [
    {
      q: "What is MemoryVerse AI?",
      a: "MemoryVerse AI is a secure, AI-powered Digital Identity Platform for academic institutions, recruiters, and students. It automatically reads uploaded PDFs or images of certificates, resumes, and internship letters, extracts key skills and metadata via Gemini AI, and indexes them in a searchable knowledge graph and timeline."
    },
    {
      q: "How does the AI document understanding work?",
      a: "When you upload a document, we analyze the file extension. For images, we run local Tesseract.js OCR to extract raw text first. Then, we feed the text into Google Gemini AI using a structured JSON schema configuration to extract metadata like title, organization, dates, skills, and classification categories."
    },
    {
      q: "What is RAG-ready semantic search?",
      a: "Retrieval-Augmented Generation (RAG) lets you search your documents using natural language instead of just keywords. For instance, searching for 'React projects' matches documents containing React skills, web developer descriptions, and GitHub links, even if the word 'project' isn't explicitly in the title."
    },
    {
      q: "How secure is my data?",
      a: "MemoryVerse AI leverages Firebase Authentication and Firestore rules to ensure all uploaded files are completely private. Only verified users can access their dashboard, and you can export or delete your entire history at any time from your settings page."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100">
      
      {/* Navigation Header */}
      <nav className="border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">MV</div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">MemoryVerse<span className="text-blue-650">AI</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-555 tracking-wide">
          <a href="#why" className="hover:text-blue-600 transition">Why MemoryVerse</a>
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#workflow" className="hover:text-blue-600 transition">AI Engine</a>
          <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-md text-xs font-bold text-slate-650 hover:bg-slate-50 transition shadow-sm"
            >
              Console Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-2 transition"
              >
                Sign In
              </button>
              <button 
                onClick={handleStart} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition duration-150"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-white py-20 md:py-28 px-6 md:px-12 w-full">
        {/* Background Grid Pattern Layer */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-100"></div>
          <div className="absolute inset-0 bg-grid-pattern animate-grid-drift opacity-60"></div>
        </div>

        {/* Floating Soft Blur Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-drift-1 -z-10"></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-300 rounded-full filter blur-3xl opacity-20 animate-drift-2 -z-10"></div>

        {/* Inner Content Wrapper */}
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
          <span className="px-3.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-[10px] uppercase tracking-wider font-extrabold text-blue-700 mb-6 flex items-center gap-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping"></span>
            Next-Generation Academic Identity
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mb-6">
            The verified knowledge graph for your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">academic and professional</span> journey.
          </h1>
          
          <p className="text-sm sm:text-base md:text-[16px] text-slate-500 max-w-2xl leading-relaxed mb-10">
            MemoryVerse AI automatically reads uploaded certificates, resume drafts, and internship letters using Gemini AI and OCR — mapping them into a secure, searchable credential registry.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleStart}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-lg shadow-slate-900/10 text-xs flex items-center gap-2 transition duration-150"
            >
              Launch Identity Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#workflow" 
              className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-655 font-bold rounded-md text-xs shadow-sm transition duration-150"
            >
              Review AI Pipelines
            </a>
        </div>

        {/* Enterprise Logos Bar */}
        <div className="mt-20 w-full text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Built in compliance with modern verification guidelines</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:opacity-75 transition duration-200">
            <span className="font-extrabold text-sm tracking-tight text-slate-500 uppercase">Stanford Univ</span>
            <span className="font-extrabold text-sm tracking-tight text-slate-500 uppercase">Meta Developer</span>
            <span className="font-extrabold text-sm tracking-tight text-slate-500 uppercase">Google Cloud</span>
            <span className="font-extrabold text-sm tracking-tight text-slate-500 uppercase">GitHub Repo</span>
            <span className="font-extrabold text-sm tracking-tight text-slate-500 uppercase">Unstop Challenge</span>
          </div>
        </div>

        {/* High-Fidelity App Mockup Preview */}
        <div className="mt-16 w-full border border-slate-200 rounded-xl shadow-lg bg-slate-100 p-3 max-w-5xl">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[420px]">
            {/* Window bar */}
            <div className="bg-slate-50 border-b border-slate-200 py-2.5 px-4 flex items-center justify-between shrink-0">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block"></span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">workspace.memoryverse.ai/dashboard</span>
              <div className="w-12"></div>
            </div>
            
            {/* Graphic mock workspace */}
            <div className="flex-1 flex bg-slate-50 p-4 gap-4 overflow-hidden text-left">
              {/* Sidebar */}
              <div className="w-44 border border-slate-200 rounded-lg bg-white p-3 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 block px-1">Navigation</span>
                  <nav className="space-y-1">
                    <span className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                      <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </span>
                    <span className="flex items-center gap-2 px-2 py-1 text-slate-500 rounded text-[10px] font-medium hover:bg-slate-50">
                      <FileText className="w-3.5 h-3.5" /> My Documents
                    </span>
                    <span className="flex items-center gap-2 px-2 py-1 text-slate-500 rounded text-[10px] font-medium hover:bg-slate-50">
                      <Network className="w-3.5 h-3.5" /> Knowledge Graph
                    </span>
                    <span className="flex items-center gap-2 px-2 py-1 text-slate-500 rounded text-[10px] font-medium hover:bg-slate-50">
                      <CalendarRange className="w-3.5 h-3.5" /> Journey Timeline
                    </span>
                    <span className="flex items-center gap-2 px-2 py-1 text-slate-500 rounded text-[10px] font-medium hover:bg-slate-50">
                      <MessageSquare className="w-3.5 h-3.5" /> AI Chat
                    </span>
                  </nav>
                </div>
                
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[9px] text-slate-400 block px-1 font-mono">User: Alex Mercer</span>
                </div>
              </div>
              
              {/* Center Grid content */}
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Uploader Box */}
                <div className="border border-slate-200 rounded-lg bg-white p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                    <UploadCloud className="w-4 h-4 text-blue-650" />
                    <span>Quick Document Ingestion</span>
                  </div>
                  <div className="border border-dashed border-slate-200 rounded-md p-3.5 text-center bg-slate-50 flex items-center justify-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><UploadCloud className="w-3.5 h-3.5" /></span>
                    <span className="text-[9px] font-semibold text-slate-500">Drag credential files here to begin AI audit</span>
                  </div>
                </div>

                {/* Queue list */}
                <div className="border border-slate-200 rounded-lg bg-white p-3.5 flex-1 flex flex-col overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-800 block mb-2">Ingested Credentials</span>
                  <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                    <div className="p-2 border border-slate-150 rounded bg-slate-50/50 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-650 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">Meta_React_Cert.pdf</span>
                      </div>
                      <span className="text-[9px] bg-blue-100 text-blue-750 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">Verified (96%)</span>
                    </div>

                    <div className="p-2 border border-slate-150 rounded bg-slate-50/50 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-650 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">Google_Internship_Letter.pdf</span>
                      </div>
                      <span className="text-[9px] bg-purple-100 text-purple-750 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">Verified (98%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Readiness Audit */}
              <div className="w-56 border border-slate-200 rounded-lg bg-white p-4 flex flex-col items-center justify-between shrink-0">
                <div className="w-full text-center space-y-4">
                  <span className="text-[11px] font-bold text-slate-800 block text-left">Career Readiness</span>
                  
                  {/* Circle Score */}
                  <div className="relative h-24 w-24 flex items-center justify-center mx-auto">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="6" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#2563eb" strokeWidth="6" fill="none" strokeDasharray={2*Math.PI*40} strokeDashoffset={(2*Math.PI*40)*(1-0.88)} />
                    </svg>
                    <div className="text-center flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-slate-850 font-mono leading-none">88%</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Ready</span>
                    </div>
                  </div>
                </div>

                <div className="w-full border-t border-slate-100 pt-3 space-y-2 text-left">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Skills Gaps</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[8px] font-bold text-slate-500">Docker</span>
                    <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[8px] font-bold text-slate-500">AWS Cloud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Why MemoryVerse AI Section */}
      <section id="why" className="py-24 bg-white border-y border-slate-250 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600">Enterprise Standards</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Why MemoryVerse AI?</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Unlike static resumes, MemoryVerse translates certifications directly to skills, providing immediate, verified portfolios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-150">
              <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-5">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">Automated Credentials Extraction</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Simply upload PDF/Image certificates, transcripts, and letters. Our OCR + Gemini pipeline extracts title, provider, dates, and skills in real-time.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-150">
              <div className="h-10 w-10 bg-purple-50 border border-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-5">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">Dynamic Skill Graph Mapping</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Watch your achievements form a connected knowledge web. See how certifications feed into skills, which in turn substantiate project capabilities.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg shadow-sm hover:shadow-md transition duration-150">
              <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-5">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-2">Natural Language Search</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Recruiters can query the database using standard sentences. "Who has React credentials and Python experience?" instantly shows qualified student profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Workflow Section */}
      <section id="workflow" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600">Pipeline Ingestion</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">How The AI Ingestion Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A step-by-step review of our secure, scalable credential ingestion architecture.
          </p>
        </div>

        {/* Visual Workflow Steps */}
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm relative hover:border-slate-300 transition">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center mx-auto mb-5 font-bold text-sm font-mono">01</div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">Ingestion & OCR</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">PDF or Image uploads are received. Local Tesseract.js OCR extracts unstructured text.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm relative hover:border-slate-300 transition">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-605 border border-blue-200 flex items-center justify-center mx-auto mb-5 font-bold text-sm font-mono">02</div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">Gemini Extraction</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Gemini structures the text, detecting category, skills, issuing company, and confidence score.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm relative hover:border-slate-300 transition">
            <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-650 border border-purple-200 flex items-center justify-center mx-auto mb-5 font-bold text-sm font-mono">03</div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">Vector Indexing</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Gemini embeddings model creates high-dim vectors stored in Pinecone/local similarity DB.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm relative hover:border-slate-300 transition">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-650 border border-emerald-200 flex items-center justify-center mx-auto mb-5 font-bold text-sm font-mono">04</div>
            <h4 className="font-bold text-xs text-slate-800 mb-2">Knowledge Mapping</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">The certificate joins the timeline, updates career readiness score, and updates the skill graph.</p>
          </div>
        </div>
      </section>

      {/* Graph and Timeline Mock Previews */}
      <section className="py-24 bg-slate-900 text-white px-6 md:px-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Interactive Previews</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">Interactive Knowledge Graphs & Chronological Timelines</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              MemoryVerse AI maps verified documents to their respective skill nodes in real time. Rather than checking a PDF manually, a recruiter can view the network flow to see which certificate verified each skill.
            </p>
            
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-5 w-5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></div>
                <span>Interactive dragging, zooming, and panning</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-5 w-5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></div>
                <span>Hover node connection highlights that dim unrelated nodes</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-5 w-5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></div>
                <span>Click to view original verification files instantly</span>
              </div>
            </div>
          </div>

          {/* Right Visual Simulator (Knowledge Web Mockup) */}
          <div className="border border-slate-800 rounded-xl p-8 bg-slate-950 shadow-2xl relative overflow-hidden h-[340px] flex items-center justify-center">
            {/* Mock Node Ring */}
            <div className="absolute h-48 w-48 border border-slate-800/40 rounded-full animate-spin-slow"></div>
            <div className="absolute h-24 w-24 border border-slate-800/40 rounded-full animate-spin-reverse-slow"></div>
            
            {/* Center Node */}
            <div className="h-14 w-14 rounded-full bg-blue-950 border-2 border-blue-500 text-white flex items-center justify-center text-[10px] font-extrabold z-10 shadow-lg shadow-blue-500/10 font-mono">
              ALEX
            </div>

            {/* Orbiting nodes */}
            <div className="absolute top-16 left-20 p-2.5 bg-slate-900 border border-slate-800 rounded-lg shadow-md text-[10px] font-bold text-slate-300 flex items-center gap-1.5 hover:border-blue-500 transition duration-150">
              <Award className="w-3.5 h-3.5 text-blue-400" /> AWS Cloud
            </div>
            <div className="absolute bottom-16 right-20 p-2.5 bg-slate-900 border border-slate-800 rounded-lg shadow-md text-[10px] font-bold text-slate-300 flex items-center gap-1.5 hover:border-emerald-500 transition duration-150">
              <Code className="w-3.5 h-3.5 text-emerald-400" /> ReactJS
            </div>
            <div className="absolute top-36 right-12 p-2.5 bg-slate-900 border border-slate-800 rounded-lg shadow-md text-[10px] font-bold text-slate-300 flex items-center gap-1.5 hover:border-amber-500 transition duration-150">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Hackathon
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600">Assistance Directory</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">Everything you need to know about the platform capabilities.</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="border border-slate-200 bg-white rounded-lg overflow-hidden shadow-sm hover:border-slate-300 transition duration-150">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4.5 h-4.5 text-slate-400" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-6 md:px-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">MV</div>
            <span className="font-extrabold text-lg text-white tracking-tight">MemoryVerse<span className="text-blue-550">AI</span></span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold">
            <a href="#why" className="hover:text-white transition">Why MemoryVerse</a>
            <a href="#features" className="hover:text-white transition">Platform Features</a>
            <a href="#workflow" className="hover:text-white transition">System Workflow</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>

          <div className="text-xs text-slate-600 font-mono">
            &copy; {new Date().getFullYear()} MemoryVerse AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
