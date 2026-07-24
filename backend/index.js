import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import authRouter from './routes/auth.js';
import documentsRouter from './routes/documents.js';
import searchRouter from './routes/search.js';
import careerRouter from './routes/career.js';
import resumeRouter from './routes/resume.js';
import settingsRouter from './routes/settings.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup simple local DB persistent storage for Demo Mode
const DB_FILE = path.join(__dirname, 'local_db.json');
if (!fs.existsSync(DB_FILE)) {
  const initialDb = {
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
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
}

// Global Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/search', searchRouter);
app.use('/api/career', careerRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/ai', aiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    mode: process.env.VITE_GEMINI_API_KEY ? 'production' : 'demo-fallback',
    timestamp: new Date().toISOString()
  });
});

// Serve uploads static folder if storing locally
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Central Error Handler]:', err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`MemoryVerse AI Server running on port ${PORT}`);
  console.log(`Mode: ${process.env.VITE_GEMINI_API_KEY ? 'Live API Mode' : 'Demo Fallback Mode'}`);
  console.log(`Local Database: ${DB_FILE}`);
  console.log(`====================================================`);
});
