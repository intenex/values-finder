import "server-only";
import { randomInt } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { assessments, type Assessment } from "@/lib/db/schema";
import { generateScreeningSets } from "@/lib/engine/generate";

export async function getActiveAssessment(userId: string): Promise<Assessment | null> {
  const [row] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.userId, userId), eq(assessments.status, "active")))
    .limit(1);
  return row ?? null;
}

export async function getOrCreateActiveAssessment(userId: string): Promise<Assessment> {
  const existing = await getActiveAssessment(userId);
  if (existing) return existing;

  const seed = randomInt(0, 2 ** 31); // int4-safe
  try {
    const [row] = await db
      .insert(assessments)
      .values({
        userId,
        seed,
        sets: { screening: generateScreeningSets(seed), refinement: null },
        choices: [],
      })
      .returning();
    return row;
  } catch {
    // Unique partial index raced with a concurrent request; use theirs.
    const raced = await getActiveAssessment(userId);
    if (raced) return raced;
    throw new Error("Failed to create assessment");
  }
}

export async function getOwnedAssessment(
  userId: string,
  assessmentId: string,
): Promise<Assessment | null> {
  const [row] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)))
    .limit(1);
  return row ?? null;
}

/**
 * Persist new sets/choices, guarded so two tabs can't silently clobber each
 * other: the write only lands if the stored choice count is still what this
 * request saw. Returns false when the guard fails (caller should re-read).
 */
export async function persistProgress(
  assessmentId: string,
  expectedChoiceCount: number,
  next: { sets: Assessment["sets"]; choices: Assessment["choices"] },
): Promise<boolean> {
  const result = await db
    .update(assessments)
    .set({ sets: next.sets, choices: next.choices, updatedAt: new Date() })
    .where(
      and(
        eq(assessments.id, assessmentId),
        eq(assessments.status, "active"),
        sql`jsonb_array_length(${assessments.choices}) = ${expectedChoiceCount}`,
      ),
    )
    .returning({ id: assessments.id });
  return result.length > 0;
}

export async function abandonActiveAssessment(userId: string): Promise<void> {
  await db
    .update(assessments)
    .set({ status: "abandoned", updatedAt: new Date() })
    .where(and(eq(assessments.userId, userId), eq(assessments.status, "active")));
}
