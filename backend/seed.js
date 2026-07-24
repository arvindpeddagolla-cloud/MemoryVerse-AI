import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'local_db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function seed() {
  console.log('Starting MemoryVerse AI database seeding...');

  // 1. Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
  }

  // 2. Write mock files to uploads folder
  const mockFiles = [
    { name: 'meta_react_cert.pdf', content: 'Verified Digital Credential: Meta Advanced React Developer. Issued to Alex Mercer on 2024-05-15. Verified Skills: React, TypeScript, Web Development.' },
    { name: 'google_internship_letter.pdf', content: 'Google Cloud Services Internship Completion Letter. Alex Mercer completed 12 weeks as a Software Engineering Intern (June - August 2025). Verified Skills: Node.js, Express, REST APIs, Databases.' },
    { name: 'unstop_hackathon_award.png', content: 'Unstop National Hackathon Champion. First Place awarded to Alex Mercer on 2025-11-12. Verified Skills: System Design, Python, Team Leadership.' },
    { name: 'stanford_gpa_transcript.pdf', content: 'Stanford University Official Academic Transcript. Student: Alex Mercer. Major: Computer Science. Cumulative GPA: 3.9. Graduation: June 2026.' },
    { name: 'rag_system_report.pdf', content: 'Project Report: RAG Semantic Search and Ingestion Engine. Created by Alex Mercer on 2026-01-20. Verified Skills: Python, Machine Learning, Vector Stores.' }
  ];

  const docsMapping = [];
  mockFiles.forEach((file, index) => {
    const filename = `${Date.now() - (index * 100000)}-${file.name}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filepath, file.content);
    console.log(`Created mock file: ${filename}`);
    
    docsMapping.push({
      originalName: file.name,
      filename: filename,
      path: filepath,
      url: `/uploads/${filename}`
    });
  });

  // 3. Hash demo password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 4. Construct complete local database schema
  const dbData = {
    users: {
      "usr_demo_student": {
        id: "usr_demo_student",
        name: "Alex Mercer",
        email: "student.showcase@university.edu",
        password: passwordHash,
        role: "student",
        createdAt: "2024-01-10T10:00:00Z",
        education: [
          {
            id: "edu_1",
            institution: "Stanford University",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            startYear: "2022",
            endYear: "2026",
            grade: "3.9 GPA"
          }
        ],
        experience: [
          {
            id: "exp_1",
            company: "Google Cloud Services",
            position: "Software Engineering Intern",
            startDate: "2025-06-01",
            endDate: "2025-08-31",
            description: "Developed RESTful backend architectures, automated service integrations, and optimized relational database schemas."
          }
        ],
        socialLinks: {
          github: "alex-mercer",
          linkedin: "alex-mercer-dev",
          portfolio: "https://alexmercer.me"
        }
      }
    },
    documents: [
      {
        id: "doc_1",
        userId: "usr_demo_student",
        name: docsMapping[0].originalName,
        path: docsMapping[0].path,
        url: docsMapping[0].url,
        type: "application/pdf",
        size: 512,
        uploadedAt: "2024-05-16T14:32:00Z",
        extractedText: mockFiles[0].content,
        metadata: {
          title: "Advanced React Web Development Certification",
          organization: "Meta Developer Programs",
          dates: "2024-05-15",
          skills: ["React", "TypeScript", "Web Development"],
          technologies: ["React", "TypeScript", "CSS3"],
          summary: "Demonstrates advanced proficiency in component architectures, React hooks, state flow, and performance rendering.",
          category: "Certificates",
          keywords: ["react", "typescript", "frontend"],
          confidenceScore: 96
        }
      },
      {
        id: "doc_2",
        userId: "usr_demo_student",
        name: docsMapping[1].originalName,
        path: docsMapping[1].path,
        url: docsMapping[1].url,
        type: "application/pdf",
        size: 780,
        uploadedAt: "2025-09-01T09:15:00Z",
        extractedText: mockFiles[1].content,
        metadata: {
          title: "Software Engineering Internship Certificate",
          organization: "Google Cloud Services",
          dates: "2025-08-30",
          skills: ["Node.js", "Express API", "Databases"],
          technologies: ["Node.js", "Express", "SQL"],
          summary: "Completed a 12-week internship optimizing cloud service modules and building REST APIs.",
          category: "Internships",
          keywords: ["internship", "backend", "cloud"],
          confidenceScore: 98
        }
      },
      {
        id: "doc_3",
        userId: "usr_demo_student",
        name: docsMapping[2].originalName,
        path: docsMapping[2].path,
        url: docsMapping[2].url,
        type: "image/png",
        size: 1024,
        uploadedAt: "2025-11-13T16:45:00Z",
        extractedText: mockFiles[2].content,
        metadata: {
          title: "National Hackathon Champion Award",
          organization: "Unstop National Challenge",
          dates: "2025-11-12",
          skills: ["System Design", "Python", "Team Leadership"],
          technologies: ["Python", "Docker", "Git"],
          summary: "Awarded First Place out of 200+ teams for designing an AI document-indexing solution.",
          category: "Achievements",
          keywords: ["hackathon", "winner", "achievement"],
          confidenceScore: 95
        }
      },
      {
        id: "doc_4",
        userId: "usr_demo_student",
        name: docsMapping[3].originalName,
        path: docsMapping[3].path,
        url: docsMapping[3].url,
        type: "application/pdf",
        size: 1240,
        uploadedAt: "2026-06-18T10:00:00Z",
        extractedText: mockFiles[3].content,
        metadata: {
          title: "Official Academic Transcript",
          organization: "Stanford University",
          dates: "2026-06-15",
          skills: ["Computer Science Foundations", "Algorithms"],
          technologies: ["Java", "C++"],
          summary: "Verified bachelor's degree transcript showing a cumulative GPA of 3.9 with honors.",
          category: "Academics",
          keywords: ["transcript", "degree", "academics"],
          confidenceScore: 99
        }
      },
      {
        id: "doc_5",
        userId: "usr_demo_student",
        name: docsMapping[4].originalName,
        path: docsMapping[4].path,
        url: docsMapping[4].url,
        type: "application/pdf",
        size: 920,
        uploadedAt: "2026-01-21T11:20:00Z",
        extractedText: mockFiles[4].content,
        metadata: {
          title: "RAG Semantic Search Ingestion System",
          organization: "GitHub Repository",
          dates: "2026-01-20",
          skills: ["Python", "Machine Learning", "Vector Stores"],
          technologies: ["Python", "Pinecone", "Gemini API"],
          summary: "Designed and documented a RAG search architecture converting scanned documents into searchable vectors.",
          category: "Projects",
          keywords: ["rag", "project", "semantic"],
          confidenceScore: 97
        }
      }
    ],
    projects: [
      {
        id: "proj_1",
        userId: "usr_demo_student",
        documentId: "doc_5",
        title: "RAG Semantic Search Ingestion System",
        technologies: ["Python", "Pinecone", "Gemini API"],
        summary: "Designed a RAG search architecture converting scanned documents into searchable vectors.",
        date: "2026-01-20"
      }
    ],
    certificates: [
      {
        id: "cert_1",
        userId: "usr_demo_student",
        documentId: "doc_1",
        title: "Advanced React Web Development Certification",
        issuer: "Meta Developer Programs",
        date: "2024-05-15",
        skills: ["React", "TypeScript", "Web Development"]
      }
    ],
    skills: [
      { id: "sk_1", userId: "usr_demo_student", name: "React", level: "Advanced", category: "Frontend", count: 4 },
      { id: "sk_2", userId: "usr_demo_student", name: "TypeScript", level: "Advanced", category: "Languages", count: 3 },
      { id: "sk_3", userId: "usr_demo_student", name: "Node.js", level: "Intermediate", category: "Backend", count: 2 },
      { id: "sk_4", userId: "usr_demo_student", name: "Express API", level: "Intermediate", category: "Backend", count: 2 },
      { id: "sk_5", userId: "usr_demo_student", name: "Python", level: "Advanced", category: "Languages", count: 3 },
      { id: "sk_6", userId: "usr_demo_student", name: "System Design", level: "Intermediate", category: "Engineering", count: 2 },
      { id: "sk_7", userId: "usr_demo_student", name: "Databases", level: "Intermediate", category: "Backend", count: 2 }
    ],
    internships: [
      {
        id: "intern_1",
        userId: "usr_demo_student",
        documentId: "doc_2",
        company: "Google Cloud Services",
        title: "Software Engineering Intern",
        startDate: "2025-06-01",
        skills: ["Node.js", "Express API", "Databases"]
      }
    ],
    achievements: [],
    timeline: [
      {
        id: "time_1",
        userId: "usr_demo_student",
        documentId: "doc_1",
        title: "Advanced React Web Development Certification",
        subtitle: "Meta Developer Programs",
        date: "2024-05-15",
        category: "Certificates",
        description: "Certified advanced React hooks, custom context management, and optimization techniques."
      },
      {
        id: "time_2",
        userId: "usr_demo_student",
        documentId: "doc_2",
        title: "Software Engineering Internship",
        subtitle: "Google Cloud Services",
        date: "2025-08-30",
        category: "Internships",
        description: "Completed 12 weeks developing cloud API integrations and refactoring database transactions."
      },
      {
        id: "time_3",
        userId: "usr_demo_student",
        documentId: "doc_3",
        title: "National Hackathon Champion",
        subtitle: "Unstop National Challenge",
        date: "2025-11-12",
        category: "Achievements",
        description: "Won First Place for building an AI-powered student assistant within a 48h limit."
      },
      {
        id: "time_4",
        userId: "usr_demo_student",
        documentId: "doc_5",
        title: "RAG Ingestion Project Completion",
        subtitle: "GitHub Repository Showcase",
        date: "2026-01-20",
        category: "Projects",
        description: "Coded and deployed an open-source vector embedding search library."
      },
      {
        id: "time_5",
        userId: "usr_demo_student",
        documentId: "doc_4",
        title: "Official Academic Transcript Graduation",
        subtitle: "Stanford University",
        date: "2026-06-15",
        category: "Academics",
        description: "Graduated with Honors in Computer Science with a 3.9 cumulative GPA."
      }
    ],
    relationships: [
      { id: "rel_1", userId: "usr_demo_student", source: "Advanced React Web Development Certification", target: "React", type: "teaches" },
      { id: "rel_2", userId: "usr_demo_student", source: "Advanced React Web Development Certification", target: "TypeScript", type: "teaches" },
      { id: "rel_3", userId: "usr_demo_student", source: "Software Engineering Internship Certificate", target: "Node.js", type: "teaches" },
      { id: "rel_4", userId: "usr_demo_student", source: "Software Engineering Internship Certificate", target: "Databases", type: "teaches" },
      { id: "rel_5", userId: "usr_demo_student", source: "National Hackathon Champion Award", target: "Python", type: "teaches" },
      { id: "rel_6", userId: "usr_demo_student", source: "National Hackathon Champion Award", target: "System Design", type: "teaches" },
      { id: "rel_7", userId: "usr_demo_student", source: "RAG Semantic Search Ingestion System", target: "Python", type: "teaches" }
    ],
    careerInsights: {
      "usr_demo_student": {
        readinessScore: 88,
        skillDistribution: [
          { name: "Frontend Development", value: 92 },
          { name: "Backend Engineering", value: 80 },
          { name: "Database Design", value: 78 },
          { name: "Cloud & DevOps", value: 60 }
        ],
        technologyUsage: [
          { name: "React", count: 4 },
          { name: "TypeScript", count: 3 },
          { name: "Python", count: 3 },
          { name: "Node.js", count: 2 }
        ],
        missingSkills: ["Docker", "Kubernetes", "CI/CD Pipelines"],
        recommendedCertifications: [
          { title: "AWS Certified Developer - Associate", provider: "Amazon Web Services", difficulty: "Intermediate" },
          { title: "Docker Certified Associate", provider: "Mirantis", difficulty: "Intermediate" }
        ],
        suggestedCareerPaths: ["Frontend Engineer", "Full Stack Developer", "Cloud Solutions Architect"],
        industryMatching: 86
      }
    },
    notifications: [
      { id: "notif_1", userId: "usr_demo_student", text: "Welcome back, Alex! Your Career Readiness audit score has reached 88%.", read: false, createdAt: new Date().toISOString() },
      { id: "notif_2", userId: "usr_demo_student", text: "AI Skill Gap Analysis: Consider learning Docker to target Cloud Developer pathways.", read: false, createdAt: new Date().toISOString() }
    ],
    resumeVersions: [
      {
        id: "res_1",
        userId: "usr_demo_student",
        title: "Full-Stack Software Resume",
        templateId: "classic",
        content: {
          summary: "Detail-oriented Computer Science graduate with verified development backgrounds. Proven ability building API microservices and React web frontends, substantiated by projects and internships.",
          skills: ["React", "TypeScript", "Node.js", "Python", "SQL", "System Design"],
          education: [
            {
              id: "edu_1",
              institution: "Stanford University",
              degree: "Bachelor of Science",
              fieldOfStudy: "Computer Science",
              startYear: "2022",
              endYear: "2026",
              grade: "3.9 GPA"
            }
          ],
          experience: [
            {
              id: "exp_1",
              company: "Google Cloud Services",
              position: "Software Engineering Intern",
              startDate: "2025-06-01",
              endDate: "2025-08-31",
              description: "Optimized microservice API call latencies and streamlined database tables."
            }
          ]
        },
        updatedAt: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
  console.log('Seeding completed! User registered: student.showcase@university.edu / password123');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
