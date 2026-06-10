import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { getActiveAssessment } from "@/lib/assessment";
import { requireUser } from "@/lib/auth/session";
import { replay } from "@/lib/engine/replay";
import { getValue } from "@/lib/values";

export const metadata: Metadata = { title: "Your top 10 values" };

export default async function ResultsPage() {
  const user = await requireUser("/assessment/results");
  const assessment = await getActiveAssessment(user.id);
  if (!assessment) redirect("/assessment");

  // Pure replay of saved answers: refreshing or returning to this page can
  // never change which ten values appear.
  const state = replay(assessment.sets, assessment.choices);
  if (state.phase !== "customize") redirect("/assessment");

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Your results
        </p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">
          Your ten most important values
        </h1>
        <p className="mt-3 mb-10 text-muted-foreground">
          Out of {state.totalRounds} rounds of choices, these are the values that
          rose to the top. Next you can fine-tune their wording, then reflect on
          how fully you&apos;re living each one.
        </p>

        <ol className="space-y-3" data-testid="top-ten">
          {state.top10.map((id, i) => {
            const custom = assessment.customizations?.[id];
            const v = getValue(id);
            return (
              <li
                key={id}
                className="flex items-baseline gap-4 rounded-xl border bg-card p-5 shadow-xs"
              >
                <span className="font-display text-2xl text-primary/70 tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <h2 className="font-display text-lg font-medium tracking-wide">
                    {custom?.name ?? v.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {custom?.description ?? v.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/assessment">Review my answers</Link>
          </Button>
          <Button asChild>
            <Link href="/assessment/customize">Continue</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
