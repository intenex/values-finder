"use server";

import { and, desc, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { userValuesSessions, type SavedValue } from "@/lib/db/schema";

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

/**
 * Reassess: take the latest completed session's ten values, apply edited
 * wording and fresh ratings, and save the result as a NEW session — history
 * is append-only, matching the old app's behavior.
 */
export async function saveReassessment(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const latest = await getLatestCompletedSession(user.id);
  if (!latest) redirect("/profile");

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
    return {
      ...v,
      name: name.trim(),
      description: description.trim(),
      rating,
      isCustom: v.isCustom || name.trim() !== v.name || description.trim() !== v.description,
    };
  });

  await db.insert(userValuesSessions).values({
    userId: user.id,
    completedAt: new Date(),
    topValues,
    allValues: latest.allValues,
  });

  redirect("/profile");
}
