"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { assessments, users, userValuesSessions } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, getCurrentUser } from "./session";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface AuthFormState {
  error: string | null;
}

/**
 * After signing in, send people into the exercise (per the feedback report:
 * "Successful sign in should cause the exercise to open"). Returning users
 * with a finished assessment and nothing in flight land on their profile.
 */
async function postLoginDestination(userId: string): Promise<string> {
  const [active] = await db
    .select({ id: assessments.id })
    .from(assessments)
    .where(and(eq(assessments.userId, userId), eq(assessments.status, "active")))
    .limit(1);
  if (active) return "/assessment";

  const [completed] = await db
    .select({ id: userValuesSessions.id })
    .from(userValuesSessions)
    .where(
      and(
        eq(userValuesSessions.userId, userId),
        isNotNull(userValuesSessions.completedAt),
      ),
    )
    .limit(1);
  return completed ? "/profile" : "/assessment";
}

function safeNext(next: unknown): string | null {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : null;
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Invalid email or password" };
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")) ?? (await postLoginDestination(user.id)));
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const [user] = await db
    .insert(users)
    .values({ email, password: await hashPassword(password) })
    .returning();

  await createSession(user.id);
  redirect(safeNext(formData.get("next")) ?? "/assessment");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function getSessionUser() {
  const user = await getCurrentUser();
  return user ? { id: user.id, email: user.email } : null;
}
