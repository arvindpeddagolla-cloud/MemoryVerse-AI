import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'local_db.json');

export const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local DB:', error);
    return {};
  }
};

export const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing local DB:', error);
    return false;
  }
};

// Seed initial values for a newly created user so they see a populated dashboard
export const seedUserData = (userId, name) => {
  const db = readDb();
  
  // Seed basic careerInsights
  db.careerInsights = db.careerInsights || {};
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

  // Seed default skills
  const mockSkills = [
    { id: 'sk-1', userId, name: 'React', level: 'Advanced', category: 'Frontend', count: 4 },
    { id: 'sk-2', userId, name: 'TypeScript', level: 'Intermediate', category: 'Languages', count: 3 },
    { id: 'sk-3', userId, name: 'Node.js', level: 'Intermediate', category: 'Backend', count: 2 }
  ];
  db.skills = db.skills.filter(s => s.userId !== userId).concat(mockSkills);

  // Seed default notifications
  db.notifications = db.notifications || [];
  db.notifications.push(
    { id: `notif-1-${Date.now()}`, userId, text: `Welcome to MemoryVerse AI, ${name}! Start uploading your documents.`, read: false, createdAt: new Date().toISOString() },
    { id: `notif-2-${Date.now()}`, userId, text: 'Tip: Add your LinkedIn and GitHub links in Settings to enrich your profile.', read: false, createdAt: new Date().toISOString() }
  );

  writeDb(db);
};
