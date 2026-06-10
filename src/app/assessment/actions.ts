"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  abandonActiveAssessment,
  getOwnedAssessment,
  persistProgress,
} from "@/lib/assessment";
import { getCurrentUser, renewSessionIfNeeded } from "@/lib/auth/session";
import type { AssessmentChoice, AssessmentSets } from "@/lib/db/schema";
import { applyEdit, applySubmit } from "@/lib/engine/edit";

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
  await renewSessionIfNeeded();

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

/** "Retake the test": abandon the in-flight assessment and start fresh. */
export async function restartAssessment(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await abandonActiveAssessment(user.id);
  redirect("/assessment");
}
