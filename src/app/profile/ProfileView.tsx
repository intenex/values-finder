"use client";

import { toPng } from "html-to-image";
import { Download, PencilLine, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { restartAssessment } from "@/app/assessment/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { SavedValue } from "@/lib/db/schema";

export interface SessionSummary {
  id: string;
  createdAt: string;
  topValues: SavedValue[];
}

interface ProfileViewProps {
  sessions: SessionSummary[];
  hasActiveAssessment: boolean;
  celebrate: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProfileView({ sessions, hasActiveAssessment, celebrate }: ProfileViewProps) {
  const [selectedId, setSelectedId] = useState(sessions[0]?.id ?? null);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const selected = sessions.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (celebrate) {
      toast("Your values are saved. Come back anytime to reflect or reassess.");
    }
  }, [celebrate]);

  const exportImage = async () => {
    if (!exportRef.current || !selected) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#faf6f0",
      });
      const link = document.createElement("a");
      link.download = `my-values-${selected.createdAt.slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Could not export the image — please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-3xl tracking-tight">Your profile</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {hasActiveAssessment
            ? "You have an exercise in progress — pick up right where you left off."
            : "You haven't completed the values exercise yet."}
        </p>
        <Button className="mt-8" asChild>
          <Link href="/assessment">
            {hasActiveAssessment ? "Continue your exercise" : "Begin the exercise"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Your values</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessions.length === 1
              ? "1 completed exercise"
              : `${sessions.length} completed exercises`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild data-testid="reassess-link">
            <Link href="/profile/reassess">
              <PencilLine className="size-4" /> Reassess
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="retake-button">
                <RotateCcw className="size-4" /> Retake test
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start the full exercise over?</AlertDialogTitle>
                <AlertDialogDescription>
                  {hasActiveAssessment
                    ? "This discards your in-progress answers and starts a fresh exercise. Your completed results are kept."
                    : "This starts a fresh exercise from the beginning. Your completed results are kept."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form action={restartAssessment}>
                  <AlertDialogAction type="submit" data-testid="confirm-retake">
                    Start over
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {hasActiveAssessment ? (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-accent bg-accent/50 p-4 text-sm">
          <span>You have an exercise in progress.</span>
          <Button size="sm" variant="outline" asChild>
            <Link href="/assessment">Continue</Link>
          </Button>
        </div>
      ) : null}

      {sessions.length > 1 ? (
        <div className="mt-8 flex flex-wrap gap-2" data-testid="session-tabs">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                s.id === selectedId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-primary/50"
              }`}
            >
              {formatDate(s.createdAt)}
            </button>
          ))}
        </div>
      ) : null}

      {selected ? (
        <>
          <div ref={exportRef} className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              My ten values · {formatDate(selected.createdAt)}
            </p>
            <ol className="mt-5 space-y-4" data-testid="session-values">
              {selected.topValues.map((v, i) => (
                <li key={v.id} className="flex items-baseline gap-4">
                  <span className="font-display w-7 shrink-0 text-right text-xl text-primary/70 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-display text-base font-medium tracking-wide">
                        {v.name}
                      </h2>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        living it {v.rating}/10
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-most"
                        style={{ width: `${v.rating * 10}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={exportImage} disabled={exporting}>
              <Download className="size-4" />
              {exporting ? "Exporting…" : "Export Results"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
