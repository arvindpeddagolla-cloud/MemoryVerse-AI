import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, seedUserData } from '../config/localDb.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

// 1. Register User
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const db = readDb();
    const existingUser = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userId = `usr_${Date.now()}`;
    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student', // student, recruiter, admin
      createdAt: new Date().toISOString(),
      education: [],
      experience: [],
      socialLinks: { github: '', linkedin: '', portfolio: '' }
    };

    db.users[userId] = newUser;
    writeDb(db);

    // Seed mock career insights, notifications, and default skills
    seedUserData(userId, name);

    const token = jwt.sign({ id: userId, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
});

// 2. Login User
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const db = readDb();
    const user = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
});

// 3. Google OAuth Simulation/Endpoint
router.post('/google-login', async (req, res, next) => {
  try {
    const { googleToken, email, name, picture } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google login requires email' });
    }

    const db = readDb();
    let user = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create user if they don't exist
      const userId = `usr_g_${Date.now()}`;
      user = {
        id: userId,
        name: name || 'Google User',
        email: email.toLowerCase(),
        avatar: picture || '',
        role: 'student',
        createdAt: new Date().toISOString(),
        education: [],
        experience: [],
        socialLinks: { github: '', linkedin: '', portfolio: '' }
      };
      
      db.users[userId] = user;
      writeDb(db);
      seedUserData(userId, user.name);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
});

// 4. Forgot Password Simulation
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  res.status(200).json({
    message: `Password reset email sent to ${email} (Simulation)`
  });
});

// 5. Get Profile Details
router.get('/profile', authMiddleware, (req, res) => {
  const db = readDb();
  let user = db.users[req.user.id];
  if (!user) {
    // Self-healing: Create user if they authenticated via Firebase but are missing in local DB
    const userId = req.user.id;
    user = {
      id: userId,
      name: req.user.name || req.user.email.split('@')[0],
      email: req.user.email.toLowerCase(),
      role: 'student',
      createdAt: new Date().toISOString(),
      education: [],
      experience: [],
      socialLinks: { github: '', linkedin: '', portfolio: '' }
    };
    db.users[userId] = user;
    writeDb(db);
    seedUserData(userId, user.name);
  }
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

export default router;
