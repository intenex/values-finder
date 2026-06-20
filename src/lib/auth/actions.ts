"use server";

import { APIError } from "better-auth/api";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getActiveAssessment } from "@/lib/assessment";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userValuesSessions } from "@/lib/db/schema";

// Match emails case-insensitively. Although Better Auth now stores and looks up
// emails in lowercase (and the data migration lowercased all legacy rows), this
// pre-check still guards signup against a mixed-case duplicate before the insert.
const emailMatches = (email: string) => sql`lower(${users.email}) = ${email}`;

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export interface AuthFormState {
  error: string | null;
}

export interface ResetRequestState {
  error: string | null;
  sent: boolean;
}

export interface ResetPasswordState {
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

/** Localized message for the first zod validation issue (email vs password). */
async function validationError(issue: { path: PropertyKey[] }): Promise<string> {
  const t = await getTranslations("auth");
  return issue.path[0] === "password"
    ? t("errorPasswordMin")
    : t("errorInvalidEmail");
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
    return { error: await validationError(parsed.error.issues[0]) };
  }
  const { email, password } = parsed.data;

  let userId: string;
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    userId = result.user.id;
  } catch {
    // Better Auth throws on bad credentials / unknown email; collapse to one
    // message so we don't reveal which accounts exist.
    const t = await getTranslations("auth");
    return { error: t("errorInvalidCredentials") };
  }

  redirect(safeNext(formData.get("next")) ?? (await postLoginDestination(userId)));
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
    return { error: await validationError(parsed.error.issues[0]) };
  }
  const { email, password } = parsed.data;
  const t = await getTranslations("auth");

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(emailMatches(email))
    .limit(1);
  if (existing) {
    return { error: t("errorAccountExists") };
  }

  try {
    // Better Auth requires a name; the app never displays it, so derive a
    // placeholder from the email local-part. The verification email is sent
    // automatically (sendOnSignUp) and the user is signed in immediately.
    await auth.api.signUpEmail({
      body: { email, password, name: email.split("@")[0] },
      headers: await headers(),
    });
  } catch (err) {
    if (err instanceof APIError) {
      // Lost the race against the case-insensitive unique index.
      return { error: t("errorAccountExists") };
    }
    return { error: t("errorSomethingWrong") };
  }

  redirect(safeNext(formData.get("next")) ?? "/assessment/intro");
}

export async function logout(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: await validationError(parsed.error.issues[0]), sent: false };
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: "/reset-password" },
    });
  } catch {
    // Swallow errors so the response is identical whether or not the account
    // exists — no user enumeration.
  }
  return { error: null, sent: true };
}

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const t = await getTranslations("auth");
  const token = formData.get("token");
  const password = formData.get("password");
  if (typeof token !== "string" || token.length === 0) {
    return { error: t("errorResetExpired") };
  }
  const parsedPassword = z.string().min(8).safeParse(password);
  if (!parsedPassword.success) {
    return { error: t("errorPasswordMin") };
  }

  try {
    await auth.api.resetPassword({
      body: { token, newPassword: parsedPassword.data },
    });
  } catch {
    return { error: t("errorResetExpired") };
  }

  redirect("/login?reset=1");
}
