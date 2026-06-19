import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AssessmentRunner } from "./AssessmentRunner";
import { SiteNav } from "@/components/SiteNav";
import { getOrCreateActiveAssessment } from "@/lib/assessment";
import { requireUser } from "@/lib/auth/session";
import { replay } from "@/lib/engine/replay";

export const metadata: Metadata = { title: "Your values exercise" };

export default async function AssessmentPage() {
  const user = await requireUser("/assessment");
  const assessment = await getOrCreateActiveAssessment(user.id);

  // Server-side replay is the source of truth: refreshing this page always
  // lands on exactly the same round with exactly the same five values.
  const state = replay(assessment.sets, assessment.choices);
  if (state.phase === "customize" || state.phase === "done") {
    redirect("/assessment/results");
  }

  return (
    <>
      <SiteNav email={user.email} />
      <main className="flex-1">
        <AssessmentRunner
          assessmentId={assessment.id}
          initialSets={assessment.sets}
          initialChoices={assessment.choices}
          initialCustomizations={assessment.customizations ?? {}}
        />
      </main>
    </>
  );
}
