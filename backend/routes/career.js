import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readDb, writeDb } from '../config/localDb.js';
import { genAI } from '../config/gemini.js';

const router = express.Router();

// Helper to analyze gaps and certifications dynamically using Gemini or a smart fallback
const generateGapsAndCertifications = async (userSkills, userDocs) => {
  const skillsList = userSkills.map(s => `${s.name} (${s.level || 'Intermediate'})`).join(', ') || 'None';
  const docsList = userDocs.map(d => `${d.name} (${d.metadata.category})`).join(', ') || 'None';

  if (genAI) {
    try {
      console.log('Querying Gemini API for dynamic career gaps and certificate recommendations...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
You are an expert career advisor. Analyze this student's profile:
- Verified Skills: ${skillsList}
- Uploaded Credentials & Achievements: ${docsList}

Identify 2-3 specific technical skill gaps they need to resolve to enhance their software developer portfolio. Suggest 2 industry-recognized certifications that match these gaps.

Return ONLY a JSON object matching this schema:
{
  "missingSkills": ["Skill Name 1", "Skill Name 2"],
  "recommendedCertifications": [
    { "title": "Certification Title", "provider": "Issuing Body (e.g. AWS, Oracle, Google, Meta)", "difficulty": "Beginner/Intermediate/Advanced" }
  ]
}
Do not wrap in markdown styling. Ensure it is valid JSON.
`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const resText = result.response.text();
      return JSON.parse(resText.trim());
    } catch (err) {
      console.error('Gemini gap analysis failed, using dynamic rule fallback:', err.message);
    }
  }

  // Dynamic Rule-Based Analyzer Fallback (Offline Mode)
  console.log('Running local rule-based gap analyzer fallback...');
  const hasFrontend = userSkills.some(s => s.category === 'Frontend' || ['react', 'html', 'css', 'javascript', 'tailwind'].includes(s.name.toLowerCase()));
  const hasBackend = userSkills.some(s => s.category === 'Backend' || ['node', 'express', 'sql', 'mongodb', 'java', 'python', 'graphql'].includes(s.name.toLowerCase()));
  const hasDevOps = userSkills.some(s => s.category === 'DevOps' || ['docker', 'ci/cd', 'kubernetes', 'aws', 'cloud', 'gcp', 'azure'].includes(s.name.toLowerCase()));

  let missingSkills = [];
  let recommendedCertifications = [];

  if (!hasFrontend) {
    missingSkills.push('Frontend UI Layouts (React)', 'CSS Grid & Responsive Design');
    recommendedCertifications.push({ title: 'Meta Frontend Developer Certificate', provider: 'Coursera', difficulty: 'Beginner' });
  }
  if (!hasBackend) {
    missingSkills.push('REST API Architectures (Node.js)', 'SQL/NoSQL Databases');
    recommendedCertifications.push({ title: 'MongoDB Certified Developer', provider: 'MongoDB', difficulty: 'Intermediate' });
  }
  if (!hasDevOps) {
    missingSkills.push('Docker Containerization', 'CI/CD Pipelines');
    recommendedCertifications.push({ title: 'AWS Certified Cloud Practitioner', provider: 'Amazon', difficulty: 'Beginner' });
  }

  // If they have all core domains covered, suggest senior specializations
  if (missingSkills.length === 0) {
    missingSkills.push('System Architecture Design', 'Kubernetes Clusters');
    recommendedCertifications.push({ title: 'AWS Certified Solutions Architect', provider: 'Amazon', difficulty: 'Intermediate' });
  }

  return {
    missingSkills: missingSkills.slice(0, 3),
    recommendedCertifications: recommendedCertifications.slice(0, 2)
  };
};

// Helper function to dynamically update career insights based on user data
const updateCareerInsights = async (userId, db) => {
  const userDocs = db.documents.filter(d => d.userId === userId);
  const userSkills = db.skills.filter(s => s.userId === userId);
  
  // Calculate readiness score
  // Baseline: 50%
  let score = 50;
  
  // Documents add points (+6 per document, max 30)
  score += Math.min(30, userDocs.length * 6);
  
  // Skills add points based on proficiency level
  userSkills.forEach(skill => {
    const lvl = (skill.level || '').toLowerCase();
    if (lvl === 'completed') {
      score += 5;
    } else if (lvl === 'intermediate') {
      score += 3;
    } else if (lvl === 'start') {
      score += 1;
    } else if (lvl === 'advanced') {
      score += 5;
    } else if (lvl === 'beginner') {
      score += 1;
    } else {
      score += 2; // general default fallback
    }
  });
  
  const readinessScore = Math.min(99, score);
  
  // Map skill distribution dynamically based on category
  const categories = ['Frontend', 'Backend', 'DevOps', 'Database'];
  const skillDistribution = categories.map(cat => {
    const catSkills = userSkills.filter(s => s.category.toLowerCase() === cat.toLowerCase());
    let mastery = 0;
    if (catSkills.length > 0) {
      const totalPoints = catSkills.reduce((sum, s) => {
        const lvl = (s.level || '').toLowerCase();
        if (lvl === 'completed' || lvl === 'advanced') return sum + 90;
        if (lvl === 'intermediate') return sum + 60;
        return sum + 30; // start / beginner
      }, 0);
      mastery = Math.min(100, Math.round(totalPoints / catSkills.length));
    }
    return { name: cat, value: mastery || 20 }; // default 20% if none
  });

  // Fetch Gaps & Certifications dynamically using Gemini or fallback
  const analysis = await generateGapsAndCertifications(userSkills, userDocs);

  db.careerInsights[userId] = {
    readinessScore,
    skillDistribution,
    technologyUsage: [
      { name: 'React', count: userSkills.filter(s => s.category === 'Frontend').length + 1 },
      { name: 'Node.js', count: userSkills.filter(s => s.category === 'Backend').length + 1 },
      { name: 'TypeScript', count: userSkills.filter(s => s.name.toLowerCase() === 'typescript').length + 1 }
    ],
    missingSkills: analysis.missingSkills.length > 0 ? analysis.missingSkills : ['None'],
    recommendedCertifications: analysis.recommendedCertifications,
    suggestedCareerPaths: ['Frontend Engineer', 'Full Stack Developer', 'Cloud Engineer'],
    industryMatching: Math.min(99, Math.round(readinessScore * 0.95))
  };

  writeDb(db);
  return db.careerInsights[userId];
};

// 1. Get Career Insights
router.get('/insights', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = readDb();
    
    // Dynamically update and fetch career insights on the fly!
    const insights = await updateCareerInsights(userId, db);
    res.status(200).json(insights);
  } catch (error) {
    next(error);
  }
});

// 2. Get User Skills List
router.get('/skills', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();
  const userSkills = db.skills.filter(s => s.userId === userId);
  res.status(200).json(userSkills);
});

// 3. Get Digital Timeline
router.get('/timeline', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();
  const userTimeline = db.timeline.filter(t => t.userId === userId);
  
  userTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.status(200).json(userTimeline);
});

// 4. Get Knowledge Graph Nodes & Links
router.get('/graph', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();
  
  const docs = db.documents.filter(d => d.userId === userId);
  const skills = db.skills.filter(s => s.userId === userId);
  
  const nodes = [];
  const links = [];

  const user = db.users[userId];
  const userName = user ? user.name : 'Student';
  nodes.push({
    id: userId,
    label: userName,
    type: 'user',
    x: 400,
    y: 300,
    r: 25
  });

  const categories = ['Certificates', 'Projects', 'Internships', 'Achievements'];
  const categoryPos = {
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

  docs.forEach((doc, idx) => {
    const angle = (idx / docs.length) * Math.PI * 2;
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

  res.status(200).json({ nodes, links });
});

// 5. Add Skill Manually (User or AI suggestion)
router.post('/skills', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, category, level } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const db = readDb();
    
    const existingSkillIndex = db.skills.findIndex(s => s.userId === userId && s.name.toLowerCase() === name.toLowerCase());
    
    let skill = null;
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

    // Recalculate Career Insights dynamically
    await updateCareerInsights(userId, db);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId,
      text: `Added skill "${name}" (${level || 'Intermediate'}) to your profile!`,
      read: false,
      createdAt: new Date().toISOString()
    });

    writeDb(db);
    res.status(201).json({ message: 'Skill added successfully', skill });
  } catch (error) {
    next(error);
  }
});

// 6. Delete Skill
router.delete('/skills/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.id;

    const db = readDb();
    const skillIndex = db.skills.findIndex(s => s.userId === userId && s.id === skillId);

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    db.skills.splice(skillIndex, 1);

    // Recalculate Career Insights dynamically
    await updateCareerInsights(userId, db);

    writeDb(db);
    res.status(200).json({ message: 'Skill deleted successfully', skillId });
  } catch (error) {
    next(error);
  }
});

export default router;
