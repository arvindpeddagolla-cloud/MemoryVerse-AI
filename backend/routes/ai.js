import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { generateAiChatResponse } from '../services/geminiService.js';
import { readDb } from '../config/localDb.js';
import { genAI } from '../config/gemini.js';

const router = express.Router();

// 1. AI Chat Assistant
router.post('/chat', authMiddleware, async (req, res, next) => {
  try {
    const { messages, prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const userId = req.user.id;
    const db = readDb();
    const user = db.users[userId] || {};
    const userSkills = db.skills.filter(s => s.userId === userId).map(s => `${s.name} (${s.level || 'Intermediate'})`);
    const userDocs = db.documents.filter(d => d.userId === userId).map(d => `${d.name} (${d.metadata.category})`);
    const careerInsights = db.careerInsights[userId] || {};

    const systemContext = `
You are the MemoryVerse AI Career Assistant, a professional context-aware career advisor.
Here is the live verified profile context of the student you are talking to:
- Name: ${user.name || 'Student'}
- Current Career Readiness Score: ${careerInsights.readinessScore || 60}%
- Verified Skills List: ${userSkills.join(', ') || 'No skills added yet'}
- Uploaded Credentials & Documents: ${userDocs.join(', ') || 'No documents uploaded yet'}
- Missing Gaps identified: ${careerInsights.missingSkills ? careerInsights.missingSkills.join(', ') : 'None'}

When answering questions:
1. Base your recommendations, feedback, and guidance strictly on these verified uploads, skills, and readiness scores.
2. If the user asks about skill gaps or certification recommendations, structure your answer clearly using their verified skills as the foundation, highlighting specific technical skill gaps and recommended learning paths with credentials. For example, if they have React and Python, mention that their projects lack Docker or cloud credentials, and suggest certifications like AWS Certified Cloud Practitioner.
3. Keep your advice professional, encouraging, and highly actionable.
`;

    const chatHistory = messages || [];
    const reply = await generateAiChatResponse(chatHistory, prompt, systemContext, { userSkills, userDocs, careerInsights, name: user.name });
    
    res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
});

// 2. Resume / Profile Score Analyzer
router.get('/analyze-profile', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = readDb();
    
    const docs = db.documents.filter(d => d.userId === userId);
    const skills = db.skills.filter(s => s.userId === userId);
    const user = db.users[userId] || {};

    const profileData = {
      documentsCount: docs.length,
      skillsCount: skills.length,
      skills: skills.map(s => s.name),
      educationCount: user.education ? user.education.length : 0,
      experienceCount: user.experience ? user.experience.length : 0
    };

    let score = 50; // Base score
    if (profileData.documentsCount > 0) score += Math.min(25, profileData.documentsCount * 5);
    if (profileData.skillsCount > 0) score += Math.min(15, profileData.skillsCount * 3);
    if (profileData.educationCount > 0) score += 5;
    if (profileData.experienceCount > 0) score += 5;

    let suggestions = [];
    if (profileData.documentsCount === 0) {
      suggestions.push('Upload your academic certificates and internship letters to verify your credentials.');
    }
    if (profileData.skillsCount < 5) {
      suggestions.push('Add more technical skills to your profile to match recruiter filters.');
    }
    if (profileData.educationCount === 0) {
      suggestions.push('Add your high school or college details in settings.');
    }
    if (profileData.experienceCount === 0) {
      suggestions.push('Add previous employment or student club leadership experience.');
    }

    if (suggestions.length === 0) {
      suggestions.push('Your profile looks complete! Try generating a customized ATS resume.');
    }

    res.status(200).json({
      score: Math.min(100, score),
      suggestions,
      summary: `Verified profile score based on ${docs.length} uploaded credentials and ${skills.length} listed skills.`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
