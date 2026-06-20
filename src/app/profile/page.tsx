import type { Metadata } from "next";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ProfileView } from "./ProfileView";
import { SiteNav } from "@/components/SiteNav";
import { getActiveAssessment } from "@/lib/assessment";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { userValuesSessions } from "@/lib/db/schema";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("profile") };
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ celebrate?: string; unchanged?: string }>;
}) {
  const user = await requireUser("/profile");
  const { celebrate, unchanged } = await searchParams;

  // Only completed sessions: legacy in-progress rows from the old app (and
  // anything half-finished) are intentionally hidden.
  const sessions = await db
    .select()
    .from(userValuesSessions)
    .where(
      and(
        eq(userValuesSessions.userId, user.id),
        isNotNull(userValuesSessions.completedAt),
      ),
    )
    .orderBy(desc(userValuesSessions.createdAt));

  const active = await getActiveAssessment(user.id);

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <ProfileView
          sessions={sessions.map((s) => ({
            id: s.id,
            createdAt: (s.completedAt ?? s.createdAt).toISOString(),
            topValues: s.topValues,
          }))}
          hasActiveAssessment={Boolean(active && active.choices.length > 0)}
          celebrate={celebrate === "1"}
          unchanged={unchanged === "1"}
        />
      </main>
    </>
  );
}
