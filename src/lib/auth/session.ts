import "server-only";
import { createHash, randomBytes } from "crypto";
import { eq, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { authSessions, users, type User } from "@/lib/db/schema";

const COOKIE_NAME = "session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RENEW_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000; // renew when < 15 days left

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(authSessions).values({
    id: hashToken(token),
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(authSessions).where(eq(authSessions.id, hashToken(token)));
  }
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Returns the logged-in user, or null. Cached per request.
 * Does not renew the cookie (server components cannot set cookies).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await db
    .select({ user: users, session: authSessions })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(eq(authSessions.id, hashToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (row.session.expiresAt < new Date()) {
    await db.delete(authSessions).where(eq(authSessions.id, row.session.id));
    return null;
  }

  return row.user;
});

/** For server components/pages: redirect to login when signed out. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

/**
 * Sliding renewal — callable only where cookies may be written
 * (server actions). Extends the session when under the renewal threshold.
 */
export async function renewSessionIfNeeded(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return;

  const id = hashToken(token);
  const rows = await db
    .select({ expiresAt: authSessions.expiresAt })
    .from(authSessions)
    .where(eq(authSessions.id, id))
    .limit(1);
  const session = rows[0];
  if (!session) return;

  if (session.expiresAt.getTime() - Date.now() < RENEW_THRESHOLD_MS) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.update(authSessions).set({ expiresAt }).where(eq(authSessions.id, id));
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  }
}

/** Opportunistic cleanup of expired sessions; cheap on a small table. */
export async function pruneExpiredSessions(): Promise<void> {
  await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));
}
