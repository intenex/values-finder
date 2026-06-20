"use client";

import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { customizeValue, editChoice, submitChoice, type Customizations } from "./actions";
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
import { getValue } from "@/lib/values";

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
  { at: 0.25, message: "A quarter of the way — you're building a clear picture." },
  { at: 0.5, message: "Halfway there. Take a breath — you're doing well." },
  { at: 0.75, message: "Three quarters done. Your top values are taking shape." },
];

export function AssessmentRunner({
  assessmentId,
  initialSets,
  initialChoices,
  initialCustomizations,
}: AssessmentRunnerProps) {
  const router = useRouter();
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
  const phaseLabel = cursor < screeningRounds ? "Discovering" : "Narrowing";

  // Resolve a value's display name/description, honouring any edit the user made.
  const display = useCallback(
    (id: number) => {
      const base = getValue(id);
      const custom = customizations[id];
      return {
        id,
        name: custom?.name ?? base.name,
        description: custom?.description ?? base.description,
        customized: Boolean(custom),
      };
    },
    [customizations],
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
      for (const { at, message } of MILESTONES) {
        const threshold = Math.ceil(total * at);
        if (prevCount < threshold && nextChoices.length >= threshold) {
          toast(message);
        }
      }
      if (
        prevCount < nextSets.screening.length &&
        nextChoices.length === nextSets.screening.length
      ) {
        toast("Discovery complete — these final rounds rank your top 25 values.");
      }
    },
    [choices.length],
  );

  const submitNew = useCallback(
    async (m: number, l: number) => {
      setSaving(true);
      const res = await submitChoice({ assessmentId, round: cursor, m, l });
      setSaving(false);
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong — please try again.");
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
    [assessmentId, cursor, router, syncFromServer],
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
      toast.error(res.error ?? "Something went wrong — please try again.");
      return;
    }
    syncFromServer(res.sets!, res.choices!);
    if (res.refinementInvalidated) {
      setInvalidationOpen(true);
    } else {
      toast("Answer updated.");
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
      toast.error(res.error ?? "Could not save — please try again.");
      return;
    }
    setCustomizations(res.customizations ?? {});
    setEditId(null);
    toast("Value updated.");
  };

  const resetEditorToOriginal = () => {
    if (editId === null) return;
    const base = getValue(editId);
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
            Round {Math.min(cursor + 1, totalRounds)} of {totalRounds}
            <span className="ml-2 text-muted-foreground">· {phaseLabel}</span>
          </span>
          <span className="text-muted-foreground" data-testid="answered-count">
            {answeredCount} answered
          </span>
        </div>
        <Progress value={(answeredCount / totalRounds) * 100} className="h-1.5" />
      </header>

      <div className="mt-6 mb-5 text-center">
        {isEditingPast ? (
          <p className="text-base text-muted-foreground">
            You answered this round before — change it if it no longer feels right.
          </p>
        ) : (
          <>
            <p className="text-base text-foreground">
              Choose the value that matters{" "}
              <strong className="font-semibold text-most-foreground">Most</strong> and{" "}
              <strong className="font-semibold text-least-foreground">Least</strong> to
              you.
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
              You can edit any value or definition anytime — just tap the
              <Pencil className="size-3.5" aria-hidden /> icon.
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
          <ArrowLeft className="size-4" /> Back
        </Button>

        {editDirty ? (
          <Button onClick={saveEdit} disabled={saving || sel.m === null || sel.l === null}>
            {saving ? "Saving…" : "Save change"}
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          disabled={cursor >= answeredCount || complete || saving}
          onClick={() => setCursor((c) => c + 1)}
          data-testid="forward-button"
        >
          {cursor + 1 < answeredCount ? "Forward" : "Continue"}{" "}
          <ArrowRight className="size-4" />
        </Button>
      </footer>

      <Dialog open={editId !== null} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit this value</DialogTitle>
            <DialogDescription>
              Reword the name or definition so it speaks in your own voice. Your
              wording is used everywhere this value appears.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={draftName}
                maxLength={60}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">What it means to you</Label>
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
              Reset to original
            </Button>
            <Button
              type="button"
              onClick={saveValueEdit}
              disabled={savingEdit || !draftName.trim() || !draftDesc.trim()}
            >
              {savingEdit ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={invalidationOpen} onOpenChange={setInvalidationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your top 25 changed</AlertDialogTitle>
            <AlertDialogDescription>
              That change reshuffled which values made your top 25, so the final
              ranking rounds have been reset — you&apos;ll redo just those{" "}
              {sets.refinement?.length ?? 15} quick rounds. Everything else is
              saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setInvalidationOpen(false);
                setCursor(choices.length);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
