import { 
  User, Document, TimelineItem, GraphNode, GraphLink, 
  Skill, CareerInsights, ResumeVersion 
} from '../types';

// Mock DB State interface
interface LocalDbSchema {
  users: Record<string, User>;
  documents: Document[];
  projects: any[];
  certificates: any[];
  skills: Skill[];
  internships: any[];
  achievements: any[];
  timeline: TimelineItem[];
  relationships: any[];
  careerInsights: Record<string, CareerInsights>;
  notifications: any[];
  resumeVersions: ResumeVersion[];
}

const LOCAL_DB_KEY = 'memoryverse_local_db';

// Helper to decode JWT Client-side for Firebase user info
export function decodeFirebaseToken(token: string): { uid: string; email: string; name?: string } | null {
  try {
    if (!token || !token.includes('.')) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    
    // Decode base64 payload
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return {
      uid: decoded.user_id || decoded.uid || decoded.sub || 'mock_user_id',
      email: decoded.email || 'mock@example.com',
      name: decoded.name || decoded.email?.split('@')[0] || 'User'
    };
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
}

// Get the token from localStorage and decode the current user ID
export function getUserIdFromToken(): string {
  const token = localStorage.getItem('memoryverse_token');
  if (!token) return 'mock_user_id';
  const decoded = decodeFirebaseToken(token);
  return decoded ? decoded.uid : 'mock_user_id';
}

// Read Db
export function readLocalDb(): LocalDbSchema {
  try {
    const data = localStorage.getItem(LOCAL_DB_KEY);
    if (!data) {
      return initializeDb();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading localStorage DB:', error);
    return initializeDb();
  }
}

// Write Db
export function writeLocalDb(db: LocalDbSchema): void {
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing localStorage DB:', error);
  }
}

// Init Db structure
function initializeDb(): LocalDbSchema {
  const initialDb: LocalDbSchema = {
    users: {},
    documents: [],
    projects: [],
    certificates: [],
    skills: [],
    internships: [],
    achievements: [],
    timeline: [],
    relationships: [],
    careerInsights: {},
    notifications: [],
    resumeVersions: []
  };
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(initialDb));
  return initialDb;
}

// Seed user data if they are new (matches backend seedUserData)
export function seedMockUserData(userId: string, name: string, email: string): User {
  const db = readLocalDb();
  
  if (db.users[userId]) {
    return db.users[userId];
  }

  // Create User Profile
  const newUser: User = {
    id: userId,
    name,
    email: email.toLowerCase(),
    role: 'student',
    createdAt: new Date().toISOString(),
    education: [],
    experience: [],
    socialLinks: { github: '', linkedin: '', portfolio: '' }
  };
  db.users[userId] = newUser;

  // Seed Career Insights
  db.careerInsights[userId] = {
    readinessScore: 68,
    skillDistribution: [
      { name: 'Frontend', value: 80 },
      { name: 'Backend', value: 50 },
      { name: 'DevOps', value: 30 },
      { name: 'Database', value: 60 }
    ],
    technologyUsage: [
      { name: 'React', count: 4 },
      { name: 'Node.js', count: 2 },
      { name: 'TypeScript', count: 3 },
      { name: 'Python', count: 1 }
    ],
    missingSkills: ['Docker', 'CI/CD Pipelines', 'GraphQL'],
    recommendedCertifications: [
      { title: 'AWS Certified Cloud Practitioner', provider: 'Amazon', difficulty: 'Beginner' },
      { title: 'MongoDB Certified Developer', provider: 'MongoDB', difficulty: 'Intermediate' }
    ],
    suggestedCareerPaths: ['Frontend Engineer', 'Full Stack Developer', 'Cloud Engineer'],
    industryMatching: 72
  };

  // Seed Default Skills
  const mockSkills: Skill[] = [
    { id: 'sk-1', userId, name: 'React', level: 'Advanced', category: 'Frontend', count: 4 },
    { id: 'sk-2', userId, name: 'TypeScript', level: 'Intermediate', category: 'Languages', count: 3 },
    { id: 'sk-3', userId, name: 'Node.js', level: 'Intermediate', category: 'Backend', count: 2 }
  ];
  db.skills = db.skills.filter(s => s.userId !== userId).concat(mockSkills);

  // Seed Default Notifications
  db.notifications.push(
    { id: `notif-1-${Date.now()}`, userId, text: `Welcome to MemoryVerse AI, ${name}! Start uploading your documents.`, read: false, createdAt: new Date().toISOString() },
    { id: `notif-2-${Date.now()}`, userId, text: 'Tip: Add your LinkedIn and GitHub links in Settings to enrich your profile.', read: false, createdAt: new Date().toISOString() }
  );

  writeLocalDb(db);
  return newUser;
}

// 1. Get Profile Details
export function getProfile(userId: string): User {
  const db = readLocalDb();
  let user = db.users[userId];
  if (!user) {
    // If not seeded yet, decode token to grab details
    const token = localStorage.getItem('memoryverse_token');
    const decoded = token ? decodeFirebaseToken(token) : null;
    const email = decoded?.email || 'student@example.com';
    const name = decoded?.name || 'Student';
    user = seedMockUserData(userId, name, email);
  }
  return user;
}

// 2. Update Settings Profile
export function updateProfile(userId: string, data: Partial<User>): User {
  const db = readLocalDb();
  const user = db.users[userId] || getProfile(userId);
  
  if (data.name) user.name = data.name;
  if (data.education) user.education = data.education;
  if (data.experience) user.experience = data.experience;
  if (data.socialLinks) user.socialLinks = data.socialLinks;
  
  db.users[userId] = user;
  writeLocalDb(db);
  return user;
}

// 3. Get Career Insights
export function getCareerInsights(userId: string): CareerInsights {
  const db = readLocalDb();
  // Ensure profile initialized
  getProfile(userId);
  return db.careerInsights[userId] || {
    readinessScore: 60,
    skillDistribution: [],
    technologyUsage: [],
    missingSkills: ['None'],
    recommendedCertifications: [],
    suggestedCareerPaths: [],
    industryMatching: 50
  };
}

// 4. Get User Skills List
export function getSkills(userId: string): Skill[] {
  const db = readLocalDb();
  getProfile(userId); // Ensure seeded
  return db.skills.filter(s => s.userId === userId);
}

// 5. Add Skill Manually / AI suggestion
export function addSkill(userId: string, name: string, category?: string, level?: 'Beginner' | 'Intermediate' | 'Advanced'): Skill {
  const db = readLocalDb();
  
  // Check if skill already exists
  const existingSkillIndex = db.skills.findIndex(s => s.userId === userId && s.name.toLowerCase() === name.toLowerCase());
  let skill: Skill;

  if (existingSkillIndex > -1) {
    db.skills[existingSkillIndex].count = (db.skills[existingSkillIndex].count || 1) + 1;
    if (level) db.skills[existingSkillIndex].level = level;
    if (category) db.skills[existingSkillIndex].category = category;
    skill = db.skills[existingSkillIndex];
  } else {
    skill = {
      id: `sk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      name,
      level: level || 'Intermediate',
      category: category || 'General',
      count: 1
    };
    db.skills.push(skill);
  }

  // Recalculate Career Readiness slightly
  if (!db.careerInsights[userId]) {
    db.careerInsights[userId] = {
      readinessScore: 60,
      skillDistribution: [],
      technologyUsage: [],
      missingSkills: [],
      recommendedCertifications: [],
      suggestedCareerPaths: [],
      industryMatching: 50
    };
  }
  
  const currentScore = db.careerInsights[userId].readinessScore || 60;
  db.careerInsights[userId].readinessScore = Math.min(99, currentScore + 3);
  
  // Remove from missing skills if it was there
  db.careerInsights[userId].missingSkills = db.careerInsights[userId].missingSkills.filter(
    s => s.toLowerCase() !== name.toLowerCase()
  );

  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId,
    text: `Added skill "${name}" to your profile!`,
    read: false,
    createdAt: new Date().toISOString()
  });

  writeLocalDb(db);
  return skill;
}

// 6. Delete Skill
export function deleteSkill(userId: string, skillId: string): string {
  const db = readLocalDb();
  const skillIndex = db.skills.findIndex(s => s.userId === userId && s.id === skillId);
  
  if (skillIndex === -1) {
    throw new Error('Skill not found');
  }

  db.skills.splice(skillIndex, 1);

  if (db.careerInsights[userId]) {
    const currentScore = db.careerInsights[userId].readinessScore || 60;
    db.careerInsights[userId].readinessScore = Math.max(50, currentScore - 3);
  }

  writeLocalDb(db);
  return skillId;
}

// 7. Get Timeline
export function getTimeline(userId: string): TimelineItem[] {
  const db = readLocalDb();
  const timeline = db.timeline.filter(t => t.userId === userId);
  return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 8. Get Documents
export function getDocuments(userId: string): Document[] {
  const db = readLocalDb();
  const docs = db.documents.filter(d => d.userId === userId);
  return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

// 9. Simulating File OCR + Gemini Analysis client-side
export function uploadMockDocuments(userId: string, files: File[]): Document[] {
  const db = readLocalDb();
  const processedDocs: Document[] = [];

  for (const file of files) {
    const fileName = file.name;
    const nameLower = fileName.toLowerCase();
    
    // Determine category based on keywords in name
    let category: 'Certificates' | 'Projects' | 'Internships' | 'Achievements' | 'Other' = 'Certificates';
    let title = fileName.split('.')[0].replace(/[-_]/g, ' ');
    let organization = 'MemoryVerse AI Verify';
    let skills: string[] = ['Problem Solving'];
    let technologies: string[] = ['Web'];
    let summary = 'A digital verification record representing verified capability in professional environments.';
    let dates = new Date().toISOString().split('T')[0];

    // Simple AI parsing rule mapping
    if (nameLower.includes('react') || nameLower.includes('frontend')) {
      category = 'Projects';
      title = title || 'React Application Deployment';
      skills = ['React', 'JavaScript', 'Tailwind CSS', 'State Management'];
      technologies = ['React', 'HTML5', 'CSS3', 'Vite'];
      summary = 'An interactive user interface demonstrating component architectures, modular structure, state coordination, and modern styled layout configurations.';
    } else if (nameLower.includes('aws') || nameLower.includes('cloud') || nameLower.includes('azure') || nameLower.includes('devops')) {
      category = 'Certificates';
      title = 'Cloud Architect Certificate';
      organization = 'Amazon Web Services';
      skills = ['AWS Services', 'DevOps Systems', 'CI/CD Pipelines', 'Cloud Deployment'];
      technologies = ['EC2', 'S3', 'Lambda', 'Docker'];
      summary = 'A professional credential highlighting core competency in architecting highly available, secure, and cost-effective distributed systems.';
    } else if (nameLower.includes('node') || nameLower.includes('backend') || nameLower.includes('api')) {
      category = 'Projects';
      title = title || 'Backend Node API Services';
      skills = ['Node.js', 'Express Framework', 'REST API Design', 'Database Queries'];
      technologies = ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'];
      summary = 'Robust server development implementing authentication middlewares, CRUD endpoint mappings, security protocols, and relational database indexing operations.';
    } else if (nameLower.includes('intern') || nameLower.includes('work') || nameLower.includes('experience') || nameLower.includes('letter')) {
      category = 'Internships';
      title = title || 'Software Engineering Internship Letter';
      organization = 'Global Technical Corp';
      skills = ['Software Architecture', 'Team Collaboration', 'Agile Methodologies', 'System Performance'];
      technologies = ['Git', 'Jira', 'TypeScript', 'Docker'];
      summary = 'A verified internship milestone certifying active participation in code reviews, sprints planning, and implementation of scalable business features.';
    } else if (nameLower.includes('python') || nameLower.includes('ml') || nameLower.includes('ai') || nameLower.includes('gemini')) {
      category = 'Projects';
      title = title || 'AI Generative Modeling Service';
      skills = ['Python Programming', 'Machine Learning', 'Data Extraction', 'Generative AI API'];
      technologies = ['Python', 'TensorFlow', 'Gemini SDK', 'Jupyter'];
      summary = 'An artificial intelligence program parsing local image/text patterns and running embeddings mapping for semantic text matching.';
    }

    const docId = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // We create a temporary Object URL so the user can preview the file in the browser!
    let fileUrl = '';
    try {
      fileUrl = URL.createObjectURL(file);
    } catch (e) {
      fileUrl = '/favicon.svg'; // Safe fallback
    }

    const newDoc: Document = {
      id: docId,
      userId,
      name: fileName,
      path: file.name, // Local mockup path
      url: fileUrl,
      type: file.type || 'application/pdf',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      extractedText: `Mock Extracted Text from OCR processing of file: ${file.name}. Included skills: ${skills.join(', ')}.`,
      metadata: {
        title,
        organization,
        dates,
        skills,
        technologies,
        summary,
        category,
        keywords: skills.concat(technologies),
        confidenceScore: Math.floor(Math.random() * 8) + 91 // 91-98%
      }
    };

    db.documents.push(newDoc);

    // Seed into Category sub-tables inside DB
    if (category === 'Certificates') {
      db.certificates.push({
        id: `cert_${Date.now()}`,
        userId,
        documentId: docId,
        title,
        issuer: organization,
        date: dates,
        skills
      });
    } else if (category === 'Projects') {
      db.projects.push({
        id: `proj_${Date.now()}`,
        userId,
        documentId: docId,
        title,
        technologies,
        summary,
        date: dates
      });
    } else if (category === 'Internships') {
      db.internships.push({
        id: `intern_${Date.now()}`,
        userId,
        documentId: docId,
        company: organization,
        title,
        startDate: dates,
        skills
      });
    }

    // Add to timeline
    db.timeline.push({
      id: `time_${Date.now()}`,
      userId,
      documentId: docId,
      title,
      subtitle: organization,
      date: dates,
      category,
      description: summary
    });

    // Update user skills counts in DB
    skills.forEach(skillName => {
      const existingSkillIndex = db.skills.findIndex(s => s.userId === userId && s.name.toLowerCase() === skillName.toLowerCase());
      if (existingSkillIndex > -1) {
        db.skills[existingSkillIndex].count = (db.skills[existingSkillIndex].count || 1) + 1;
      } else {
        db.skills.push({
          id: `sk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          userId,
          name: skillName,
          level: 'Intermediate',
          category,
          count: 1
        });
      }
    });

    // Generate relationships for Graph
    skills.forEach(skill => {
      db.relationships.push({
        id: `rel_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId,
        source: title,
        target: skill,
        type: 'teaches'
      });
    });

    processedDocs.push(newDoc);
  }

  // Refresh career insights score slightly on uploads
  if (!db.careerInsights[userId]) {
    db.careerInsights[userId] = {
      readinessScore: 68,
      skillDistribution: [],
      technologyUsage: [],
      missingSkills: [],
      recommendedCertifications: [],
      suggestedCareerPaths: [],
      industryMatching: 70
    };
  }
  const currentScore = db.careerInsights[userId].readinessScore || 60;
  db.careerInsights[userId].readinessScore = Math.min(98, currentScore + (processedDocs.length * 4));

  // Add notification
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId,
    text: `Successfully processed ${processedDocs.length} new document(s) with Client-Side AI!`,
    read: false,
    createdAt: new Date().toISOString()
  });

  writeLocalDb(db);
  return processedDocs;
}

// 10. Delete Document
export function deleteDocument(userId: string, docId: string): string {
  const db = readLocalDb();
  const docIndex = db.documents.findIndex(d => d.id === docId && d.userId === userId);
  
  if (docIndex === -1) {
    throw new Error('Document not found');
  }

  db.documents.splice(docIndex, 1);
  db.certificates = db.certificates.filter(c => c.documentId !== docId);
  db.projects = db.projects.filter(p => p.documentId !== docId);
  db.internships = db.internships.filter(i => i.documentId !== docId);
  db.timeline = db.timeline.filter(t => t.documentId !== docId);

  writeLocalDb(db);
  return docId;
}

// 11. Get Knowledge Graph (Exact clone of backend logic)
export function getKnowledgeGraph(userId: string): { nodes: GraphNode[]; links: GraphLink[] } {
  const db = readLocalDb();
  
  const docs = db.documents.filter(d => d.userId === userId);
  const skills = db.skills.filter(s => s.userId === userId);
  
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const user = db.users[userId];
  const userName = user ? user.name : 'Student';
  
  // Add root user node
  nodes.push({
    id: userId,
    label: userName,
    type: 'user',
    x: 400,
    y: 300,
    r: 25
  });

  // Unique categories
  const categories = ['Certificates', 'Projects', 'Internships', 'Achievements'];
  const categoryPos: Record<string, { x: number; y: number }> = {
    'Certificates': { x: 200, y: 150 },
    'Projects': { x: 600, y: 150 },
    'Internships': { x: 200, y: 450 },
    'Achievements': { x: 600, y: 450 }
  };

  categories.forEach(cat => {
    nodes.push({
      id: cat,
      label: cat,
      type: 'category',
      x: categoryPos[cat].x,
      y: categoryPos[cat].y,
      r: 20
    });
    
    links.push({
      id: `l-${userId}-${cat}`,
      source: userId,
      target: cat,
      type: 'category-link'
    });
  });

  // Add document nodes and link them to their category
  docs.forEach((doc, idx) => {
    const angle = (idx / Math.max(1, docs.length)) * Math.PI * 2;
    const cat = doc.metadata.category;
    
    if (!categories.includes(cat)) return;

    const basePos = categoryPos[cat];
    const docX = basePos.x + Math.cos(angle) * 120;
    const docY = basePos.y + Math.sin(angle) * 120;

    nodes.push({
      id: doc.id,
      label: doc.metadata.title,
      type: 'document',
      docUrl: doc.url,
      x: docX,
      y: docY,
      r: 15
    });

    links.push({
      id: `l-${cat}-${doc.id}`,
      source: cat,
      target: doc.id,
      type: 'document-link'
    });

    // Link documents to skills they teach
    doc.metadata.skills.forEach((skillName, sIdx) => {
      const skillNodeId = `skill-${skillName.toLowerCase()}`;
      
      if (!nodes.some(n => n.id === skillNodeId)) {
        const skillAngle = (sIdx / Math.max(1, doc.metadata.skills.length)) * Math.PI * 2;
        nodes.push({
          id: skillNodeId,
          label: skillName,
          type: 'skill',
          x: docX + Math.cos(skillAngle) * 80,
          y: docY + Math.sin(skillAngle) * 80,
          r: 12
        });
      }

      links.push({
        id: `l-${doc.id}-${skillNodeId}`,
        source: doc.id,
        target: skillNodeId,
        type: 'skill-link'
      });
    });
  });

  return { nodes, links };
}

// 12. Simulate AI Career Assistant Chat Responses
export function generateMockChatResponse(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('hello') || promptLower.includes('hi') || promptLower.includes('hey')) {
    return `Hello! I'm your AI Career Assistant. I can analyze your uploaded credentials, suggest career roadmaps, or draft job applications. What would you like to build or improve today?`;
  }
  
  if (promptLower.includes('resume') || promptLower.includes('ats') || promptLower.includes('summary')) {
    return `I can help optimize your resume summary! You can go to the **Resume Builder** sidebar menu to generate a verified, ATS-friendly summary based on your certificates and skills. Alternatively, if you need a specific section written, just paste it here!`;
  }

  if (promptLower.includes('aws') || promptLower.includes('cloud')) {
    return `AWS skills are highly valuable. Based on your interest in Cloud Technologies, I recommend mastering:
1. **Infrastructure as Code (IaC)**: Learn Terraform or CloudFormation.
2. **Containerization**: Get hands-on with Docker & Kubernetes.
3. **CI/CD**: Work on GitHub Actions or AWS CodePipeline.
A great next certification would be the AWS Solutions Architect Associate!`;
  }

  if (promptLower.includes('react') || promptLower.includes('frontend') || promptLower.includes('javascript')) {
    return `Frontend engineering is evolving rapidly. Since you're working with React, I suggest adding:
- **TypeScript**: Highly requested in enterprise roles for type-safety.
- **Next.js**: Great for Server-Side Rendering (SSR) and full-stack React projects.
- **Testing**: Familiarize yourself with Jest and React Testing Library to stand out to recruiters.`;
  }

  if (promptLower.includes('skill') || promptLower.includes('missing')) {
    return `I've analyzed your current skill portfolio. You have strong foundations, but to increase your readiness score above 90%, you should consider adding **Docker**, **CI/CD Pipelines**, or **GraphQL**. You can manually add them in the **Career Insights** section or upload supporting certifications!`;
  }

  return `Interesting query! As your MemoryVerse AI advisor, I suggest aligning this goal with your active skills graph. Adding validated documentation or certificates for this area will automatically update your public portfolio and attract recruiter searches. Let me know if you would like me to draft a LinkedIn introductory message for a related role!`;
}

// 13. AI Professional Summary Fallback
export function getMockResumeSummary(userId: string): string {
  const db = readLocalDb();
  const skills = db.skills.filter(s => s.userId === userId).map(s => s.name);
  const skillsText = skills.length > 0 ? skills.slice(0, 3).join(', ') : 'Software Engineering and Modern Development Stack';
  
  return `Detail-oriented Software Engineering student with verified proficiency in ${skillsText}. Demonstrated technical excellence through successful project completions, hackathon participation, and practical internship experience. Eager to apply structured software development methodologies in an enterprise setting.`;
}

// 14. Delete Account
export function deleteMockAccount(userId: string): void {
  const db = readLocalDb();
  delete db.users[userId];
  db.documents = db.documents.filter(d => d.userId !== userId);
  db.certificates = db.certificates.filter(c => c.userId !== userId);
  db.projects = db.projects.filter(p => p.userId !== userId);
  db.skills = db.skills.filter(s => s.userId !== userId);
  db.internships = db.internships.filter(i => i.userId !== userId);
  db.achievements = db.achievements.filter(a => a.userId !== userId);
  db.timeline = db.timeline.filter(t => t.userId !== userId);
  db.relationships = db.relationships.filter(r => r.userId !== userId);
  
  if (db.careerInsights[userId]) {
    delete db.careerInsights[userId];
  }
  db.resumeVersions = db.resumeVersions.filter(r => r.userId !== userId);
  writeLocalDb(db);
}

// 15. Export user data
export function getExportData(userId: string): string {
  const db = readLocalDb();
  const userRecord = db.users[userId] || getProfile(userId);
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      education: userRecord.education,
      experience: userRecord.experience,
      socialLinks: userRecord.socialLinks
    },
    documents: db.documents.filter(d => d.userId === userId),
    skills: db.skills.filter(s => s.userId === userId),
    timeline: db.timeline.filter(t => t.userId === userId),
    relationships: db.relationships.filter(r => r.userId === userId),
    insights: db.careerInsights[userId] || {}
  };

  return JSON.stringify(exportData, null, 2);
}

// Search simulated documents
export function searchMockDocuments(userId: string, q?: string, category?: string, skill?: string): Document[] {
  const db = readLocalDb();
  let userDocs = db.documents.filter(d => d.userId === userId);

  if (category) {
    userDocs = userDocs.filter(d => d.metadata.category === category);
  }

  if (skill) {
    userDocs = userDocs.filter(d => 
      d.metadata.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
  }

  if (q) {
    const qLower = q.toLowerCase();
    userDocs = userDocs.filter(d => 
      d.name.toLowerCase().includes(qLower) ||
      d.metadata.title.toLowerCase().includes(qLower) ||
      d.metadata.organization.toLowerCase().includes(qLower) ||
      d.metadata.summary.toLowerCase().includes(qLower) ||
      d.metadata.skills.some(s => s.toLowerCase().includes(qLower)) ||
      d.metadata.technologies.some(t => t.toLowerCase().includes(qLower))
    );
  } else {
    userDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  return userDocs;
}
