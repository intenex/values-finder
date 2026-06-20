"use client";

import { toPng } from "html-to-image";
import { Download, PencilLine, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useValueText } from "@/i18n/useValueText";
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
  unchanged: boolean;
}

export function ProfileView({
  sessions,
  hasActiveAssessment,
  celebrate,
  unchanged,
}: ProfileViewProps) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const valueText = useValueText();
  const [selectedId, setSelectedId] = useState(sessions[0]?.id ?? null);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const selected = sessions.find((s) => s.id === selectedId) ?? null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  // When two snapshots fall on the same calendar day, show the time so they can
  // be told apart; otherwise the date alone keeps the history uncluttered.
  const hasSameDaySnapshots = useMemo(() => {
    const days = sessions.map((s) =>
      new Date(s.createdAt).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
    return new Set(days).size !== days.length;
  }, [sessions, locale]);
  const label = hasSameDaySnapshots ? formatDateTime : formatDate;

  // Non-customized values re-localize to the active language; the user's own
  // edits are shown verbatim.
  const resolve = (v: SavedValue) =>
    v.isCustom ? { name: v.name, description: v.description } : valueText(v.id);

  useEffect(() => {
    if (celebrate) toast(t("savedToast"));
  }, [celebrate, t]);

  useEffect(() => {
    if (unchanged) toast(t("unchangedToast"));
  }, [unchanged, t]);

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
      toast.error(t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-3xl tracking-tight">{t("emptyTitle")}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {hasActiveAssessment ? t("emptyBodyActive") : t("emptyBodyIdle")}
        </p>
        <Button className="mt-8" asChild>
          <Link href="/assessment">
            {hasActiveAssessment ? t("continueExercise") : t("beginExercise")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{t("valuesHeading")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("completedCount", { count: sessions.length })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild data-testid="reassess-link">
            <Link href="/profile/reassess">
              <PencilLine className="size-4" /> {t("reassess")}
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="retake-button">
                <RotateCcw className="size-4" /> {t("retake")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("retakeDialogTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {hasActiveAssessment
                    ? t("retakeDialogBodyActive")
                    : t("retakeDialogBodyIdle")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <form action={restartAssessment}>
                  <AlertDialogAction type="submit" data-testid="confirm-retake">
                    {t("startOver")}
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("reassessRetakeHint")}</p>

      {hasActiveAssessment ? (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-accent bg-accent/50 p-4 text-sm">
          <span>{t("inProgressBanner")}</span>
          <Button size="sm" variant="outline" asChild>
            <Link href="/assessment">{t("continue")}</Link>
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
              {label(s.createdAt)}
            </button>
          ))}
        </div>
      ) : null}

      {selected ? (
        <>
          <div ref={exportRef} className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("myTenValues")} · {label(selected.createdAt)}
            </p>
            <ol className="mt-5 space-y-4" data-testid="session-values">
              {selected.topValues.map((v, i) => {
                const text = resolve(v);
                return (
                  <li key={v.id} className="flex items-baseline gap-4">
                    <span className="font-display w-7 shrink-0 text-right text-xl text-primary/70 tabular-nums">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h2 className="font-display text-base font-medium tracking-wide">
                          {text.name}
                        </h2>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {t("livingIt", { rating: v.rating })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{text.description}</p>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-most"
                          style={{ width: `${v.rating * 10}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={exportImage} disabled={exporting}>
              <Download className="size-4" />
              {exporting ? t("exporting") : t("exportResults")}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
