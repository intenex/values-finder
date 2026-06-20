"use server";

import { and, desc, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getValueText } from "@/i18n/values-server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { userValuesSessions, type SavedValue } from "@/lib/db/schema";
import { getValue } from "@/lib/values";

export async function getLatestCompletedSession(userId: string) {
  const [row] = await db
    .select()
    .from(userValuesSessions)
    .where(
      and(
        eq(userValuesSessions.userId, userId),
        isNotNull(userValuesSessions.completedAt),
      ),
    )
    .orderBy(desc(userValuesSessions.createdAt))
    .limit(1);
  return row ?? null;
}

/** True when two snapshots carry identical user-editable content. */
function sameSnapshot(a: SavedValue[], b: SavedValue[]): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(a.map((v) => [v.id, v]));
  return b.every((v) => {
    const prev = byId.get(v.id);
    return (
      prev !== undefined &&
      prev.name === v.name &&
      prev.description === v.description &&
      prev.rating === v.rating
    );
  });
}

/**
 * Reassess: take the latest completed session's ten values, apply edited
 * wording and fresh ratings, and save the result as a NEW session — history
 * is append-only, matching the old app's behavior. A snapshot is only written
 * when something actually changed, which also makes repeated/duplicate submits
 * idempotent (the second submit compares equal to the snapshot just written).
 */
export async function saveReassessment(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const latest = await getLatestCompletedSession(user.id);
  if (!latest) redirect("/profile");

  // The reassess form pre-fills non-customized values in the active language,
  // so compare each submission against what the user actually saw — otherwise
  // an untouched value in a non-English locale looks like a fresh edit. Store
  // canonical English for still-non-custom values so snapshots stay language-
  // independent and re-localize on display.
  const valueText = await getValueText();
  const topValues: SavedValue[] = latest.topValues.map((v) => {
    const name = formData.get(`name-${v.id}`);
    const description = formData.get(`description-${v.id}`);
    const rating = Number(formData.get(`rating-${v.id}`));
    if (
      typeof name !== "string" ||
      name.trim().length === 0 ||
      name.length > 60 ||
      typeof description !== "string" ||
      description.trim().length === 0 ||
      description.length > 240 ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 10
    ) {
      redirect("/profile/reassess?error=1");
    }
    const seen = v.isCustom
      ? { name: v.name, description: v.description }
      : valueText(v.id);
    const isCustom =
      v.isCustom ||
      name.trim() !== seen.name ||
      description.trim() !== seen.description;
    const canonical = getValue(v.id);
    return {
      id: v.id,
      name: isCustom ? name.trim() : canonical.name,
      description: isCustom ? description.trim() : canonical.description,
      rating,
      score: v.score,
      isCustom,
    };
  });

  // No edits vs. the latest snapshot → don't create a redundant history entry.
  if (sameSnapshot(latest.topValues, topValues)) {
    redirect("/profile?unchanged=1");
  }

  // Guard the double-submit race: if a concurrent save already wrote this exact
  // snapshot between our read and now, treat this submit as a no-op too.
  const current = await getLatestCompletedSession(user.id);
  if (current && sameSnapshot(current.topValues, topValues)) {
    redirect("/profile?unchanged=1");
  }

  await db.insert(userValuesSessions).values({
    userId: user.id,
    completedAt: new Date(),
    topValues,
    allValues: latest.allValues,
  });

  redirect("/profile");
}
