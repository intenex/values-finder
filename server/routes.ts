import { type Express } from "express";
import { createServer, type Server } from "http";
import { Router } from 'express';
import { z } from 'zod';
import { 
  createUser, 
  findUserByEmail, 
  validatePassword, 
  createSession, 
  deleteSession,
  saveValuesSession,
  getUserValuesSessions,
  getLatestIncompleteSession,
  requireAuth
} from './auth.js';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const saveValuesSchema = z.object({
  topValues: z.array(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    rating: z.number(),
    score: z.number(),
    isCustom: z.boolean(),
  })),
  allValues: z.array(z.object({
    id: z.number(),
    score: z.number(),
  })).optional(),
});

const saveProgressSchema = z.object({
  progress: z.object({
    phase: z.enum(['screening', 'refinement', 'rating']),
    completedSets: z.number(),
    totalSets: z.number(),
    currentValues: z.any().optional(),
  }),
  topValues: z.array(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    rating: z.number(),
    score: z.number(),
    isCustom: z.boolean(),
  })).optional(),
  allValues: z.array(z.object({
    id: z.number(),
    score: z.number(),
  })).optional(),
});

// Auth routes
router.post('/api/auth/signup', async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    
    const user = await createUser(data.email, data.password);
    if (!user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const session = await createSession(user.id);
    res.json({ 
      user: { id: user.id, email: user.email },
      sessionId: session.id 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = await findUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await validatePassword(user, data.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const session = await createSession(user.id);
    res.json({ 
      user: { id: user.id, email: user.email },
      sessionId: session.id 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/auth/logout', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    await deleteSession(sessionId);
  }
  res.json({ success: true });
});

router.get('/api/auth/me', requireAuth as any, async (req: any, res) => {
  res.json({ 
    user: { 
      id: req.user.id, 
      email: req.user.email 
    } 
  });
});

// Values routes
router.post('/api/values/sessions', requireAuth as any, async (req: any, res) => {
  try {
    const data = saveValuesSchema.parse(req.body);
    
    const session = await saveValuesSession({
      userId: req.user.id,
      completedAt: new Date(),
      topValues: data.topValues,
      allValues: data.allValues,
    });
    
    res.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/values/sessions', requireAuth as any, async (req: any, res) => {
  const sessions = await getUserValuesSessions(req.user.id);
  res.json(sessions);
});

// Save progress endpoint
router.post('/api/values/progress', requireAuth as any, async (req: any, res) => {
  try {
    const data = saveProgressSchema.parse(req.body);
    
    const session = await saveValuesSession({
      userId: req.user.id,
      progress: data.progress,
      topValues: data.topValues || [],
      allValues: data.allValues,
    });
    
    res.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get latest incomplete session
router.get('/api/values/latest-incomplete', requireAuth as any, async (req: any, res) => {
  const session = await getLatestIncompleteSession(req.user.id);
  res.json(session || null);
});

export function registerRoutes(app: Express): Server {
  app.use(router);
  const httpServer = createServer(app);
  return httpServer;
}