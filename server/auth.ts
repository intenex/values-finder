import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { users, sessions, userValuesSessions } from '../shared/schema.js';
import { eq, and, desc, isNull } from 'drizzle-orm';

// Define types
interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  sid: string;
  sess: any;
  expire: Date;
}

interface UserValuesSession {
  id: string;
  userId: string;
  createdAt: Date;
  completedAt?: Date | null;
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
  }> | null;
  progress?: {
    phase: 'screening' | 'refinement' | 'rating';
    completedSets: number;
    totalSets: number;
    currentValues?: any[];
  } | null;
}

// User management
export async function createUser(email: string, password: string): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({
      id: randomUUID(),
      email,
      password: hashedPassword,
    }).returning();

    return newUser[0] as User;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] as User || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] as User || null;
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password);
}

// Session management
export async function createSession(userId: string): Promise<{ id: string; userId: string; expiresAt: Date }> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    sid: sessionId,
    sess: { userId },
    expire: expiresAt,
  });

  return {
    id: sessionId,
    userId,
    expiresAt,
  };
}

export async function findSession(sessionId: string): Promise<{ id: string; userId: string; expiresAt: Date } | null> {
  const result = await db.select().from(sessions).where(eq(sessions.sid, sessionId)).limit(1);

  if (!result || result.length === 0) {
    return null;
  }

  const session = result[0];

  // Check if expired
  if (new Date(session.expire) < new Date()) {
    await deleteSession(sessionId);
    return null;
  }

  return {
    id: session.sid,
    userId: (session.sess as any).userId,
    expiresAt: new Date(session.expire),
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sid, sessionId));
}

// Values sessions management
export async function saveValuesSession(session: Omit<UserValuesSession, 'id' | 'createdAt'>): Promise<UserValuesSession> {
  // Check if there's an incomplete session for this user
  const existingIncompleteSessions = await db
    .select()
    .from(userValuesSessions)
    .where(
      and(
        eq(userValuesSessions.userId, session.userId),
        isNull(userValuesSessions.completedAt)
      )
    );

  if (existingIncompleteSessions.length > 0 && session.progress) {
    // Update existing incomplete session
    const updated = await db
      .update(userValuesSessions)
      .set({
        topValues: session.topValues,
        allValues: session.allValues || null,
        progress: session.progress || null,
        completedAt: session.completedAt || null,
      })
      .where(eq(userValuesSessions.id, existingIncompleteSessions[0].id))
      .returning();

    return updated[0] as UserValuesSession;
  } else {
    // If saving a completed session, remove any incomplete sessions for this user
    if (session.completedAt) {
      await db
        .delete(userValuesSessions)
        .where(
          and(
            eq(userValuesSessions.userId, session.userId),
            isNull(userValuesSessions.completedAt)
          )
        );
    }

    // Create new session
    const newSession = await db
      .insert(userValuesSessions)
      .values({
        id: randomUUID(),
        userId: session.userId,
        completedAt: session.completedAt || null,
        topValues: session.topValues,
        allValues: session.allValues || null,
        progress: session.progress || null,
      })
      .returning();

    return newSession[0] as UserValuesSession;
  }
}

export async function getUserValuesSessions(userId: string): Promise<UserValuesSession[]> {
  const result = await db
    .select()
    .from(userValuesSessions)
    .where(eq(userValuesSessions.userId, userId))
    .orderBy(desc(userValuesSessions.createdAt));

  return result as UserValuesSession[];
}

export async function getLatestIncompleteSession(userId: string): Promise<UserValuesSession | null> {
  const result = await db
    .select()
    .from(userValuesSessions)
    .where(
      and(
        eq(userValuesSessions.userId, userId),
        isNull(userValuesSessions.completedAt)
      )
    )
    .orderBy(desc(userValuesSessions.createdAt))
    .limit(1);

  return result[0] as UserValuesSession || null;
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
