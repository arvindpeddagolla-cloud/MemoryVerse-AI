import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readDb } from '../config/localDb.js';
import { performSemanticSearch } from '../services/vectorService.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q, category, skill } = req.query;
    const db = readDb();

    // Get all documents for this user
    let userDocs = db.documents.filter(d => d.userId === userId);

    // Apply category filters
    if (category) {
      userDocs = userDocs.filter(d => d.metadata.category === category);
    }

    // Apply skill filters
    if (skill) {
      userDocs = userDocs.filter(d => 
        d.metadata.skills.some(s => s.toLowerCase() === skill.toLowerCase())
      );
    }

    // Apply Semantic Search if search string is provided
    let results = userDocs;
    if (q) {
      results = await performSemanticSearch(userId, q, userDocs);
    } else {
      // Sort by upload date descending if no query
      results.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
