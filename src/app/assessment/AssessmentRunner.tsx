"use client";

import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { customizeValue, editChoice, submitChoice, type Customizations } from "./actions";
import { useValueText } from "@/i18n/useValueText";
import { ValueCard, type CardRole } from "@/components/ValueCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { AssessmentChoice, AssessmentSets } from "@/lib/db/schema";

interface AssessmentRunnerProps {
  assessmentId: string;
  initialSets: AssessmentSets;
  initialChoices: AssessmentChoice[];
  initialCustomizations: Customizations;
}

interface Selection {
  m: number | null;
  l: number | null;
}

const MILESTONES = [
  { at: 0.25, key: "milestone25" },
  { at: 0.5, key: "milestone50" },
  { at: 0.75, key: "milestone75" },
] as const;

export function AssessmentRunner({
  assessmentId,
  initialSets,
  initialChoices,
  initialCustomizations,
}: AssessmentRunnerProps) {
  const router = useRouter();
  const t = useTranslations("assessment");
  const valueText = useValueText();
  const [sets, setSets] = useState(initialSets);
  const [choices, setChoices] = useState(initialChoices);
  const [customizations, setCustomizations] = useState<Customizations>(initialCustomizations);
  const [cursor, setCursor] = useState(initialChoices.length);
  const [sel, setSel] = useState<Selection>({ m: null, l: null });
  const [saving, setSaving] = useState(false);
  const [invalidationOpen, setInvalidationOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const screeningRounds = sets.screening.length;
  const totalRounds = screeningRounds + (sets.refinement?.length ?? 15);
  const answeredCount = choices.length;
  const complete = answeredCount >= totalRounds;

  const viewSet = useMemo(() => {
    if (cursor < screeningRounds) return sets.screening[cursor];
    return sets.refinement?.[cursor - screeningRounds] ?? null;
  }, [sets, cursor, screeningRounds]);

  const existing = choices[cursor] as AssessmentChoice | undefined;
  const isEditingPast = cursor < answeredCount;
  const phaseLabel = cursor < screeningRounds ? t("phaseDiscovering") : t("phaseNarrowing");

  // Resolve a value's display name/description, honouring any edit the user made.
  // Non-customized text is localized to the active language; a user's own edit
  // is shown verbatim in whatever language they typed.
  const display = useCallback(
    (id: number) => {
      const base = valueText(id);
      const custom = customizations[id];
      return {
        id,
        name: custom?.name ?? base.name,
        description: custom?.description ?? base.description,
        customized: Boolean(custom),
      };
    },
    [customizations, valueText],
  );

  // Reset the selection whenever the viewed round changes.
  useEffect(() => {
    setSel(existing ? { m: existing.m, l: existing.l } : { m: null, l: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, answeredCount]);

  // Each new round should start at the top — long rounds otherwise open
  // scrolled mid-page. Instant (not smooth) so it doesn't animate mid-advance.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [cursor]);

  const syncFromServer = useCallback(
    (nextSets: AssessmentSets, nextChoices: AssessmentChoice[]) => {
      const prevCount = choices.length;
      setSets(nextSets);
      setChoices(nextChoices);

      const total = nextSets.screening.length + (nextSets.refinement?.length ?? 15);
      for (const { at, key } of MILESTONES) {
        const threshold = Math.ceil(total * at);
        if (prevCount < threshold && nextChoices.length >= threshold) {
          toast(t(key));
        }
      }
      if (
        prevCount < nextSets.screening.length &&
        nextChoices.length === nextSets.screening.length
      ) {
        toast(t("discoveryComplete"));
      }
    },
    [choices.length, t],
  );

  const submitNew = useCallback(
    async (m: number, l: number) => {
      setSaving(true);
      const res = await submitChoice({ assessmentId, round: cursor, m, l });
      setSaving(false);
      if (!res.ok) {
        toast.error(res.error ?? t("somethingWrong"));
        if (res.sets && res.choices) {
          syncFromServer(res.sets, res.choices);
          setCursor(res.choices.length);
        }
        return;
      }
      syncFromServer(res.sets!, res.choices!);
      const total = res.sets!.screening.length + (res.sets!.refinement?.length ?? 15);
      if (res.choices!.length >= total) {
        router.push("/assessment/results");
      } else {
        setCursor(res.choices!.length);
      }
    },
    [assessmentId, cursor, router, syncFromServer, t],
  );

  // Auto-advance shortly after both picks are made on a new round.
  useEffect(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (!isEditingPast && sel.m !== null && sel.l !== null && !saving) {
      const { m, l } = sel;
      autoAdvanceTimer.current = setTimeout(() => submitNew(m!, l!), 350);
    }
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, [sel, isEditingPast, saving, submitNew]);

  const saveEdit = async () => {
    if (sel.m === null || sel.l === null) return;
    setSaving(true);
    const res = await editChoice({ assessmentId, round: cursor, m: sel.m, l: sel.l });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? t("somethingWrong"));
      return;
    }
    syncFromServer(res.sets!, res.choices!);
    if (res.refinementInvalidated) {
      setInvalidationOpen(true);
    } else {
      toast(t("answerUpdated"));
    }
  };

  const openEditor = (id: number) => {
    const v = display(id);
    setEditId(id);
    setDraftName(v.name);
    setDraftDesc(v.description);
  };

  const saveValueEdit = async () => {
    if (editId === null) return;
    setSavingEdit(true);
    const res = await customizeValue({
      assessmentId,
      valueId: editId,
      name: draftName,
      description: draftDesc,
    });
    setSavingEdit(false);
    if (!res.ok) {
      toast.error(res.error ?? t("couldNotSave"));
      return;
    }
    setCustomizations(res.customizations ?? {});
    setEditId(null);
    toast(t("valueUpdated"));
  };

  const resetEditorToOriginal = () => {
    if (editId === null) return;
    const base = valueText(editId);
    setDraftName(base.name);
    setDraftDesc(base.description);
  };

  const roleFor = (id: number): CardRole =>
    sel.m === id ? "most" : sel.l === id ? "least" : null;

  const tapCard = (id: number) => {
    setSel((s) => {
      if (s.m === id) return { ...s, m: null };
      if (s.l === id) return { ...s, l: null };
      if (s.m === null) return { ...s, m: id };
      if (s.l === null) return { ...s, l: id };
      return { ...s, l: id }; // both taken: move "least" to the tapped card
    });
  };

  const assignRole = (id: number, role: "most" | "least") => {
    setSel((s) => {
      const cleared = {
        m: s.m === id ? null : s.m,
        l: s.l === id ? null : s.l,
      };
      return role === "most"
        ? { m: cleared.m === id ? null : id, l: cleared.l }
        : { m: cleared.m, l: id };
    });
  };

  const editDirty =
    isEditingPast && existing && (sel.m !== existing.m || sel.l !== existing.l);

  if (!viewSet) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 bg-background/90 px-4 pt-6 pb-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">
            {t("roundOf", { current: Math.min(cursor + 1, totalRounds), total: totalRounds })}
            <span className="ml-2 text-muted-foreground">· {phaseLabel}</span>
          </span>
          <span className="text-muted-foreground" data-testid="answered-count">
            {t("answered", { count: answeredCount })}
          </span>
        </div>
        <Progress value={(answeredCount / totalRounds) * 100} className="h-1.5" />
      </header>

      <div className="mt-6 mb-5 text-center">
        {isEditingPast ? (
          <p className="text-base text-muted-foreground">{t("editingPast")}</p>
        ) : (
          <>
            <p className="text-base text-foreground">
              {t.rich("prompt", {
                most: (chunks) => (
                  <strong className="font-semibold text-most-foreground">{chunks}</strong>
                ),
                least: (chunks) => (
                  <strong className="font-semibold text-least-foreground">{chunks}</strong>
                ),
              })}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
              {t("editHintPrefix")}
              <Pencil className="size-3.5" aria-hidden /> {t("editHintSuffix")}
            </p>
          </>
        )}
      </div>

      <div className="grid gap-3" data-testid="round-cards">
        {viewSet.map((id) => (
          <ValueCard
            key={`${cursor}-${id}`}
            value={display(id)}
            role={roleFor(id)}
            mostChosen={sel.m !== null}
            leastChosen={sel.l !== null}
            customized={Boolean(customizations[id])}
            disabled={saving}
            onTap={() => tapCard(id)}
            onAssign={(role) => assignRole(id, role)}
            onEdit={() => openEditor(id)}
          />
        ))}
      </div>

      <footer className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          disabled={cursor === 0 || saving}
          onClick={() => setCursor((c) => c - 1)}
          data-testid="back-button"
        >
          <ArrowLeft className="size-4" /> {t("back")}
        </Button>

        {editDirty ? (
          <Button onClick={saveEdit} disabled={saving || sel.m === null || sel.l === null}>
            {saving ? t("saving") : t("saveChange")}
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          disabled={cursor >= answeredCount || complete || saving}
          onClick={() => setCursor((c) => c + 1)}
          data-testid="forward-button"
        >
          {cursor + 1 < answeredCount ? t("forward") : t("continue")}{" "}
          <ArrowRight className="size-4" />
        </Button>
      </footer>

      <Dialog open={editId !== null} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editDialogTitle")}</DialogTitle>
            <DialogDescription>{t("editDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">{t("nameLabel")}</Label>
              <Input
                id="edit-name"
                value={draftName}
                maxLength={60}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">{t("meaningLabel")}</Label>
              <Textarea
                id="edit-desc"
                value={draftDesc}
                maxLength={240}
                rows={3}
                onChange={(e) => setDraftDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" onClick={resetEditorToOriginal}>
              {t("resetToOriginal")}
            </Button>
            <Button
              type="button"
              onClick={saveValueEdit}
              disabled={savingEdit || !draftName.trim() || !draftDesc.trim()}
            >
              {savingEdit ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={invalidationOpen} onOpenChange={setInvalidationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("invalidationTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("invalidationBody", { count: sets.refinement?.length ?? 15 })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setInvalidationOpen(false);
                setCursor(choices.length);
              }}
            >
              {t("invalidationContinue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
