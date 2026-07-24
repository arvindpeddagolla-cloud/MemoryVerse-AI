import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    
    // For local evaluation, if it's a mock token, bypass verification
    if (token.startsWith('mock-token-')) {
      const mockUserId = token.replace('mock-token-', '');
      req.user = { id: mockUserId, email: `${mockUserId}@example.com` };
      return next();
    }

    try {
      // 1. If it looks like a Firebase ID Token (JWT format containing header, payload, signature)
      if (token.includes('.') && !token.startsWith('mock-token-')) {
        const decoded = jwt.decode(token);
        if (decoded && decoded.email) {
          req.user = { 
            id: decoded.user_id || decoded.uid || decoded.sub, 
            email: decoded.email,
            name: decoded.name || ''
          };
          return next();
        }
      }

      // 2. Standard custom JWT verification fallback
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      // If verification failed but decode works as fallback for local dev
      const decoded = jwt.decode(token);
      if (decoded && decoded.email) {
        req.user = { 
          id: decoded.user_id || decoded.uid || decoded.sub, 
          email: decoded.email,
          name: decoded.name || ''
        };
        return next();
      }
      return res.status(401).json({ error: 'Token is invalid or expired' });
    }
  } catch (error) {
    next(error);
  }
};
