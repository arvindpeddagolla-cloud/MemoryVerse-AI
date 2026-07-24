import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readDb, writeDb } from '../config/localDb.js';

const router = express.Router();

// 1. Update Profile Settings
router.put('/profile', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { name, education, experience, socialLinks } = req.body;
  
  const db = readDb();
  const user = db.users[userId];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (education) user.education = education;
  if (experience) user.experience = experience;
  if (socialLinks) user.socialLinks = socialLinks;

  db.users[userId] = user;
  writeDb(db);

  res.status(200).json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      education: user.education,
      experience: user.experience,
      socialLinks: user.socialLinks
    }
  });
});

// 2. Export All Data
router.get('/export', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();

  const userRecord = db.users[userId];
  if (!userRecord) {
    return res.status(404).json({ error: 'User record not found' });
  }

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

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=MemoryVerse_Export_${userId}.json`);
  res.status(200).send(JSON.stringify(exportData, null, 2));
});

// 3. Delete Account
router.delete('/delete-account', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();

  if (!db.users[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Delete user record
  delete db.users[userId];

  // Clean up all related items in other tables
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
  if (db.resumeVersions) {
    db.resumeVersions = db.resumeVersions.filter(r => r.userId !== userId);
  }

  writeDb(db);
  res.status(200).json({ message: 'Account and associated data deleted successfully' });
});

export default router;
