"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getValueText } from "@/i18n/values-server";
import { getActiveAssessment } from "@/lib/assessment";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { assessments, userValuesSessions, type SavedValue } from "@/lib/db/schema";
import { replay } from "@/lib/engine/replay";
import { getValue } from "@/lib/values";

const customizationsSchema = z.record(
  z.coerce.number().int(),
  z.object({
    name: z.string().trim().min(1).max(60),
    description: z.string().trim().min(1).max(240),
  }),
);

export async function saveCustomizations(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const assessment = await getActiveAssessment(user.id);
  if (!assessment) redirect("/assessment");

  const state = replay(assessment.sets, assessment.choices);
  if (state.phase !== "customize") redirect("/assessment");

  // Compare against the localized base the user actually saw, so leaving a
  // value untouched in any language is never mistaken for a customization.
  const valueText = await getValueText();
  const draft: Record<number, { name: string; description: string }> = {};
  for (const id of state.top10) {
    const name = formData.get(`name-${id}`);
    const description = formData.get(`description-${id}`);
    if (typeof name === "string" && typeof description === "string") {
      const base = valueText(id);
      if (name.trim() !== base.name || description.trim() !== base.description) {
        draft[id] = { name: name.trim(), description: description.trim() };
      }
    }
  }
  const parsed = customizationsSchema.safeParse(draft);
  if (!parsed.success) redirect("/assessment/customize?error=1");

  await db
    .update(assessments)
    .set({ customizations: draft, updatedAt: new Date() })
    .where(and(eq(assessments.id, assessment.id), eq(assessments.status, "active")));

  redirect("/assessment/rate");
}

/**
 * Save ratings and finish: write the completed session into the same
 * user_values_sessions table the old app used, so new results and historical
 * ones live side by side.
 */
export async function completeAssessment(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const assessment = await getActiveAssessment(user.id);
  if (!assessment) redirect("/assessment");

  const state = replay(assessment.sets, assessment.choices);
  if (state.phase !== "customize") redirect("/assessment");

  const ratings: Record<number, number> = {};
  for (const id of state.top10) {
    const raw = Number(formData.get(`rating-${id}`));
    if (!Number.isInteger(raw) || raw < 1 || raw > 10) {
      redirect("/assessment/rate?error=1");
    }
    ratings[id] = raw;
  }

  const topValues: SavedValue[] = state.top10.map((id) => {
    const base = getValue(id);
    const custom = assessment.customizations?.[id];
    return {
      id,
      name: custom?.name ?? base.name,
      description: custom?.description ?? base.description,
      rating: ratings[id],
      score: state.scores[id] ?? 0,
      isCustom: Boolean(custom),
    };
  });

  const allValues = Object.entries(state.scores)
    .map(([id, score]) => ({ id: Number(id), score }))
    .sort((a, b) => b.score - a.score || a.id - b.id);

  const completedAt = new Date();
  await db.insert(userValuesSessions).values({
    userId: user.id,
    completedAt,
    topValues,
    allValues,
  });
  await db
    .update(assessments)
    .set({ ratings, status: "completed", completedAt, updatedAt: completedAt })
    .where(and(eq(assessments.id, assessment.id), eq(assessments.status, "active")));

  redirect("/profile?celebrate=1");
}
