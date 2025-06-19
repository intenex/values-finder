import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';

// Define types
interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

interface UserValuesSession {
  id: string;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
  topValues: Array<{
    id: number;
    name: string;
    description: string;
    rating: number;
    score: number;
    isCustom: boolean;
  }>;
  allValues?: Array<{
    id: number;
    score: number;
  }>;
  progress?: {
    phase: 'screening' | 'refinement' | 'rating';
    completedSets: number;
    totalSets: number;
    currentValues?: any[];
  };
}

// File paths
const DATA_DIR = process.env.DATA_DIR || './data';
const USERS_FILE = join(DATA_DIR, 'users.json');
const SESSIONS_FILE = join(DATA_DIR, 'sessions.json');
const VALUES_SESSIONS_FILE = join(DATA_DIR, 'values-sessions.json');

// Initialize data directory
let initialized = false;
async function ensureDataDir() {
  if (!initialized) {
    await mkdir(DATA_DIR, { recursive: true }).catch(() => {});
    initialized = true;
  }
}

// Helper functions to read/write JSON files
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

// User management
export async function createUser(email: string, password: string): Promise<User | null> {
  const users = await readJsonFile<User[]>(USERS_FILE, []);
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return null;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: randomUUID(),
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };
  
  users.push(newUser);
  await writeJsonFile(USERS_FILE, users);
  
  return newUser;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readJsonFile<User[]>(USERS_FILE, []);
  return users.find(u => u.email === email) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await readJsonFile<User[]>(USERS_FILE, []);
  return users.find(u => u.id === id) || null;
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password);
}

// Session management
export async function createSession(userId: string): Promise<Session> {
  const sessions = await readJsonFile<Session[]>(SESSIONS_FILE, []);
  
  // Clean up expired sessions
  const now = new Date();
  const activeSessions = sessions.filter(s => new Date(s.expiresAt) > now);
  
  const newSession: Session = {
    id: randomUUID(),
    userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };
  
  activeSessions.push(newSession);
  await writeJsonFile(SESSIONS_FILE, activeSessions);
  
  return newSession;
}

export async function findSession(sessionId: string): Promise<Session | null> {
  const sessions = await readJsonFile<Session[]>(SESSIONS_FILE, []);
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(sessionId);
    return null;
  }
  
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessions = await readJsonFile<Session[]>(SESSIONS_FILE, []);
  const filtered = sessions.filter(s => s.id !== sessionId);
  await writeJsonFile(SESSIONS_FILE, filtered);
}

// Values sessions management
export async function saveValuesSession(session: Omit<UserValuesSession, 'id' | 'createdAt'>): Promise<UserValuesSession> {
  const sessions = await readJsonFile<UserValuesSession[]>(VALUES_SESSIONS_FILE, []);
  
  // Check if there's an incomplete session for this user
  const existingIncompleteIndex = sessions.findIndex(
    s => s.userId === session.userId && !s.completedAt
  );
  
  if (existingIncompleteIndex !== -1 && session.progress) {
    // Update existing incomplete session
    sessions[existingIncompleteIndex] = {
      ...sessions[existingIncompleteIndex],
      ...session,
    };
    await writeJsonFile(VALUES_SESSIONS_FILE, sessions);
    return sessions[existingIncompleteIndex];
  } else {
    // If saving a completed session, remove any incomplete sessions for this user
    if (session.completedAt) {
      const filteredSessions = sessions.filter(
        s => !(s.userId === session.userId && !s.completedAt)
      );
      
      // Create new completed session
      const newSession: UserValuesSession = {
        id: randomUUID(),
        createdAt: new Date(),
        ...session,
      };
      
      filteredSessions.push(newSession);
      await writeJsonFile(VALUES_SESSIONS_FILE, filteredSessions);
      
      return newSession;
    } else {
      // Create new session
      const newSession: UserValuesSession = {
        id: randomUUID(),
        createdAt: new Date(),
        ...session,
      };
      
      sessions.push(newSession);
      await writeJsonFile(VALUES_SESSIONS_FILE, sessions);
      
      return newSession;
    }
  }
}

export async function getUserValuesSessions(userId: string): Promise<UserValuesSession[]> {
  const sessions = await readJsonFile<UserValuesSession[]>(VALUES_SESSIONS_FILE, []);
  return sessions
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLatestIncompleteSession(userId: string): Promise<UserValuesSession | null> {
  const sessions = await readJsonFile<UserValuesSession[]>(VALUES_SESSIONS_FILE, []);
  return sessions
    .filter(s => s.userId === userId && !s.completedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
}

// Middleware
export async function requireAuth(req: Request & { user?: User }, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = await findSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  const user = await findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  req.user = user;
  next();
}