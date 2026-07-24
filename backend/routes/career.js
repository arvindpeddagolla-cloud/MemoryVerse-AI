import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readDb, writeDb } from '../config/localDb.js';

const router = express.Router();

// 1. Get Career Insights
router.get('/insights', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();
  
  const insights = db.careerInsights[userId] || {
    readinessScore: 60,
    skillDistribution: [],
    technologyUsage: [],
    missingSkills: ['None'],
    recommendedCertifications: [],
    suggestedCareerPaths: [],
    industryMatching: 50
  };

  res.status(200).json(insights);
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
  
  // Sort timeline chronologically (oldest to newest or newest to oldest. Let's send newest first and we can render it appropriately)
  userTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.status(200).json(userTimeline);
});

// 4. Get Knowledge Graph Nodes & Links
router.get('/graph', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();
  
  const docs = db.documents.filter(d => d.userId === userId);
  const skills = db.skills.filter(s => s.userId === userId);
  
  // Nodes array
  const nodes = [];
  // Links array
  const links = [];

  // Add root user node
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

  // Unique categories
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
    
    // Connect user to categories
    links.push({
      id: `l-${userId}-${cat}`,
      source: userId,
      target: cat,
      type: 'category-link'
    });
  });

  // Add document nodes and link them to their category
  docs.forEach((doc, idx) => {
    const angle = (idx / docs.length) * Math.PI * 2;
    const cat = doc.metadata.category;
    
    // If it's a category we aren't tracking as node, skip or map to 'Other'
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
      // Find matching skill node or check if we should map it
      const skillNodeId = `skill-${skillName.toLowerCase()}`;
      
      // If node doesn't exist yet, add it
      if (!nodes.some(n => n.id === skillNodeId)) {
        // Place skills around the outer perimeter
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
router.post('/skills', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { name, category, level } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Skill name is required' });
  }

  const db = readDb();
  
  // Check if skill already exists
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

  // Recalculate Career Readiness slightly (+3 per skill added, max 99)
  if (db.careerInsights[userId]) {
    const currentScore = db.careerInsights[userId].readinessScore || 60;
    db.careerInsights[userId].readinessScore = Math.min(99, currentScore + 3);
    
    // Remove from missing skills if it was there
    db.careerInsights[userId].missingSkills = db.careerInsights[userId].missingSkills.filter(
      s => s.toLowerCase() !== name.toLowerCase()
    );
  }

  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId,
    text: `Added skill "${name}" to your profile!`,
    read: false,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ message: 'Skill added successfully', skill });
});

// 6. Delete Skill
router.delete('/skills/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const skillId = req.params.id;

  const db = readDb();
  const skillIndex = db.skills.findIndex(s => s.userId === userId && s.id === skillId);

  if (skillIndex === -1) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  const deletedSkill = db.skills[skillIndex];
  db.skills.splice(skillIndex, 1);

  // Recalculate Career Readiness slightly (-3 per skill deleted, min 50)
  if (db.careerInsights[userId]) {
    const currentScore = db.careerInsights[userId].readinessScore || 60;
    db.careerInsights[userId].readinessScore = Math.max(50, currentScore - 3);
  }

  writeDb(db);
  res.status(200).json({ message: 'Skill deleted successfully', skillId });
});

export default router;
