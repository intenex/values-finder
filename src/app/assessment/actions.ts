"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  abandonActiveAssessment,
  getOwnedAssessment,
  persistProgress,
} from "@/lib/assessment";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { assessments, type AssessmentChoice, type AssessmentSets } from "@/lib/db/schema";
import { applyEdit, applySubmit } from "@/lib/engine/edit";
import { getValue } from "@/lib/values";

const choiceInput = z.object({
  assessmentId: z.string().min(1),
  round: z.number().int().min(0).max(200),
  m: z.number().int(),
  l: z.number().int(),
});

export interface ChoiceResult {
  ok: boolean;
  error?: string;
  /** Authoritative post-write state, so the client can resync. */
  sets?: AssessmentSets;
  choices?: AssessmentChoice[];
  refinementInvalidated?: boolean;
}

async function recordChoice(
  input: z.infer<typeof choiceInput>,
  mode: "submit" | "edit",
): Promise<ChoiceResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Signed out" };
  // Better Auth manages sliding session renewal itself (via nextCookies()).

  const parsed = choiceInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const { assessmentId, round, m, l } = parsed.data;

  // Read-apply-write with an optimistic guard; retry once on a lost race.
  for (let attempt = 0; attempt < 2; attempt++) {
    const assessment = await getOwnedAssessment(user.id, assessmentId);
    if (!assessment || assessment.status !== "active") {
      return { ok: false, error: "Assessment not found" };
    }

    const apply = mode === "submit" ? applySubmit : applyEdit;
    const result = apply(assessment.sets, assessment.choices, assessment.seed, round, m, l);
    if (!result.ok) {
      return {
        ok: false,
        error: result.reason,
        sets: assessment.sets,
        choices: assessment.choices,
      };
    }

    // No-op (idempotent resubmission): nothing to write.
    if (result.choices === assessment.choices && result.sets === assessment.sets) {
      return { ok: true, sets: assessment.sets, choices: assessment.choices };
    }

    const written = await persistProgress(assessmentId, assessment.choices.length, {
      sets: result.sets,
      choices: result.choices,
    });
    if (written) {
      return {
        ok: true,
        sets: result.sets,
        choices: result.choices,
        refinementInvalidated: result.refinementInvalidated,
      };
    }
  }
  return { ok: false, error: "Conflicting update from another tab — reload to continue" };
}

export async function submitChoice(input: {
  assessmentId: string;
  round: number;
  m: number;
  l: number;
}): Promise<ChoiceResult> {
  return recordChoice(input, "submit");
}

export async function editChoice(input: {
  assessmentId: string;
  round: number;
  m: number;
  l: number;
}): Promise<ChoiceResult> {
  return recordChoice(input, "edit");
}

const customizeInput = z.object({
  assessmentId: z.string().min(1),
  valueId: z.number().int(),
  name: z.string().trim().min(1, "Name can't be empty").max(60, "Name is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Definition can't be empty")
    .max(240, "Definition is too long"),
});

export type Customizations = Record<number, { name: string; description: string }>;

export interface CustomizeResult {
  ok: boolean;
  error?: string;
  customizations?: Customizations;
}

/**
 * Edit a value's wording mid-exercise. Stored on the assessment so the new
 * name/definition shows everywhere that value appears, and carries through to
 * the results. Editing back to the original wording clears the override.
 */
export async function customizeValue(input: {
  assessmentId: string;
  valueId: number;
  name: string;
  description: string;
}): Promise<CustomizeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Signed out" };

  const parsed = customizeInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { assessmentId, valueId, name, description } = parsed.data;

  const assessment = await getOwnedAssessment(user.id, assessmentId);
  if (!assessment || assessment.status !== "active") {
    return { ok: false, error: "Assessment not found" };
  }

  const base = getValue(valueId);
  const next: Customizations = { ...(assessment.customizations ?? {}) };
  if (name === base.name && description === base.description) {
    delete next[valueId];
  } else {
    next[valueId] = { name, description };
  }

  await db
    .update(assessments)
    .set({ customizations: next, updatedAt: new Date() })
    .where(and(eq(assessments.id, assessmentId), eq(assessments.status, "active")));

  return { ok: true, customizations: next };
}

/** "Retake the test": abandon the in-flight assessment and start fresh. */
export async function restartAssessment(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await abandonActiveAssessment(user.id);
  redirect("/assessment");
}
