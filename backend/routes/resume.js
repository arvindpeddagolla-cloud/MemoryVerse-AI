import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readDb, writeDb } from '../config/localDb.js';
import { genAI } from '../config/gemini.js';

const router = express.Router();

// 1. Get Resume Versions
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const db = readDb();
  
  const userResumes = db.resumeVersions ? db.resumeVersions.filter(r => r.userId === userId) : [];
  res.status(200).json(userResumes);
});

// 2. Save/Update Resume
router.post('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { id, title, content, templateId } = req.body;
  
  const db = readDb();
  db.resumeVersions = db.resumeVersions || [];

  const resumeId = id || `res_${Date.now()}`;
  const existingIndex = db.resumeVersions.findIndex(r => r.id === resumeId && r.userId === userId);

  const resumeData = {
    id: resumeId,
    userId,
    title: title || 'My Professional Resume',
    templateId: templateId || 'classic',
    content: content || {},
    updatedAt: new Date().toISOString()
  };

  if (existingIndex > -1) {
    db.resumeVersions[existingIndex] = resumeData;
  } else {
    db.resumeVersions.push(resumeData);
  }

  writeDb(db);
  res.status(200).json({ message: 'Resume saved successfully', resume: resumeData });
});

// 3. Generate AI Professional Summary
router.post('/generate-summary', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = readDb();
    
    // Compile academic, project and skills data to prompt Gemini
    const docs = db.documents.filter(d => d.userId === userId);
    const skills = db.skills.filter(s => s.userId === userId).map(s => s.name);
    const user = db.users[userId] || {};

    const summarySource = `
      Name: ${user.name}
      Role: ${user.role}
      Skills: ${skills.join(', ')}
      Key milestones: ${docs.map(d => `${d.metadata.title} at ${d.metadata.organization}`).join('; ')}
    `;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert technical recruiter and resume writer. Generate a concise, ATS-friendly professional summary (2-3 sentences, maximum 60 words) for a student's resume based on the following profile metadata. Do NOT use buzzwords or flowery language. Maintain a highly objective, results-oriented tone.

Profile metadata:
---
${summarySource}
---
Only return the plain text summary, nothing else.
`;
        const result = await model.generateContent(prompt);
        const summaryText = result.response.text().trim();
        return res.status(200).json({ summary: summaryText });
      } catch (err) {
        console.error('Gemini Resume Summary generation error:', err.message);
      }
    }

    // Local Mock summary fallback
    const fallbackSummary = `Detail-oriented Software Engineering student with verified proficiency in ${skills.slice(0, 3).join(', ')}. Demonstrated technical excellence through successful project completions, hackathon participation, and practical internship experience. Eager to apply structured software development methodologies in an enterprise setting.`;
    
    res.status(200).json({ summary: fallbackSummary });
  } catch (error) {
    next(error);
  }
});

export default router;
