"use server";

import { and, eq, isNotNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getActiveAssessment } from "@/lib/assessment";
import { db } from "@/lib/db";
import { users, userValuesSessions } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, getCurrentUser } from "./session";

// Match emails case-insensitively. Legacy accounts created by the old app were
// stored with the exact casing the user typed (e.g. "janusz@DeepMindfulness.io"),
// so a lowercased lookup would miss them — which previously let people get
// "invalid password" on a real account and then create an accidental duplicate.
const emailMatches = (email: string) => sql`lower(${users.email}) = ${email}`;

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface AuthFormState {
  error: string | null;
}

/**
 * Where to send someone after they sign in:
 *  - mid-exercise (answers already recorded) → straight back into the rounds;
 *  - has finished results, nothing in flight → their results;
 *  - brand new / not yet started → the explanation page before the exercise.
 */
async function postLoginDestination(userId: string): Promise<string> {
  const active = await getActiveAssessment(userId);
  if (active && active.choices.length > 0) return "/assessment";

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
  return completed ? "/profile" : "/assessment/intro";
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

  const [user] = await db.select().from(users).where(emailMatches(email)).limit(1);
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
    .where(emailMatches(email))
    .limit(1);
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  let user: { id: string } | undefined;
  try {
    const inserted = await db
      .insert(users)
      .values({ email, password: await hashPassword(password) })
      .returning({ id: users.id });
    user = inserted[0];
  } catch {
    // Case-insensitive unique index raced with a concurrent signup.
    return { error: "An account with this email already exists" };
  }
  if (!user) {
    return { error: "Something went wrong creating your account" };
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")) ?? "/assessment/intro");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function getSessionUser() {
  const user = await getCurrentUser();
  return user ? { id: user.id, email: user.email } : null;
}
