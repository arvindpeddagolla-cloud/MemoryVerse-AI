export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  avatar?: string;
  education?: Education[];
  experience?: Experience[];
  socialLinks?: SocialLinks;
  createdAt: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string; // "Present" or date
  description: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface DocumentMetadata {
  title: string;
  organization: string;
  dates: string;
  skills: string[];
  technologies: string[];
  summary: string;
  category: 'Certificates' | 'Projects' | 'Skills' | 'Internships' | 'Achievements' | 'Academics' | 'Portfolio' | 'Resume' | 'Research' | 'Other';
  keywords: string[];
  confidenceScore: number;
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  path: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  extractedText: string;
  metadata: DocumentMetadata;
}

export interface TimelineItem {
  id: string;
  userId: string;
  documentId?: string;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'user' | 'category' | 'document' | 'skill';
  docUrl?: string;
  x: number;
  y: number;
  r: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  count: number;
}

export interface CareerInsights {
  readinessScore: number;
  skillDistribution: { name: string; value: number }[];
  technologyUsage: { name: string; count: number }[];
  missingSkills: string[];
  recommendedCertifications: { title: string; provider: string; difficulty: string }[];
  suggestedCareerPaths: string[];
  industryMatching: number;
}

export interface ResumeVersion {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  content: {
    summary?: string;
    education?: Education[];
    experience?: Experience[];
    skills?: string[];
    projects?: { title: string; tech: string; description: string }[];
  };
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
