import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Save } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { getActiveAssessment } from "@/lib/assessment";
import { requireUser } from "@/lib/auth/session";
import { VALUE_COUNT } from "@/lib/values";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  {
    icon: ArrowUp,
    title: "Compare five at a time",
    body: `You'll see small sets of values drawn from a library of ${VALUE_COUNT}. Each round, pick the one that matters Most to you and the one that matters Least.`,
  },
  {
    icon: ArrowDown,
    title: "There are no wrong answers",
    body: "Every value here is a good one — this is about what matters most to you right now, not what's “correct.” Go with your gut; the first you pick becomes your Most.",
  },
  {
    icon: Pencil,
    title: "Make them your own",
    body: "Any value can be reworded to fit your voice at any point — just tap the pencil icon on a card. Your wording carries through to your results.",
  },
  {
    icon: Save,
    title: "Your progress is saved",
    body: "Every choice is saved as you go, so you can stop anytime and pick up right where you left off — on any device. It takes about 15–20 minutes.",
  },
];

export default async function IntroPage() {
  const user = await requireUser("/assessment/intro");
  const active = await getActiveAssessment(user.id);
  const inProgress = Boolean(active && active.choices.length > 0);

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Before you begin
        </p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">
          Discover what matters most to you
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          This short exercise helps you surface — and rank — your ten most
          important personal values through a series of simple choices.
        </p>

        <ol className="mt-10 space-y-5">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Icon className="size-4" />
              </span>
              <div>
                <h2 className="font-medium">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex items-center gap-3">
          <Button size="lg" asChild data-testid="begin-button">
            <Link href="/assessment">
              {inProgress ? "Continue your exercise" : "Begin"}
            </Link>
          </Button>
          {inProgress ? (
            <span className="text-sm text-muted-foreground">
              You&apos;re part way through — pick up where you left off.
            </span>
          ) : null}
        </div>
      </main>
    </>
  );
}
