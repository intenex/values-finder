"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useValueText } from "@/i18n/useValueText";
import type { SavedValue } from "@/lib/db/schema";

interface ReassessFormProps {
  values: SavedValue[];
  action: (formData: FormData) => Promise<void>;
}

export function ReassessForm({ values, action }: ReassessFormProps) {
  const t = useTranslations("reassess");
  const valueText = useValueText();
  const router = useRouter();
  const [ratings, setRatings] = useState<Record<number, number>>(
    Object.fromEntries(values.map((v) => [v.id, v.rating])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Non-customized values pre-fill in the active language; a user's own edit
  // shows verbatim.
  const resolve = (v: SavedValue) =>
    v.isCustom ? { name: v.name, description: v.description } : valueText(v.id);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleCancel = () => {
    if (dirty) setConfirmLeave(true);
    else router.push("/profile");
  };

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        setDirty(false);
        try {
          await action(formData);
        } finally {
          setSubmitting(false);
        }
      }}
      onChange={() => setDirty(true)}
      className="space-y-6"
    >
      {values.map((v, i) => {
        const text = resolve(v);
        return (
          <fieldset key={v.id} className="rounded-xl border bg-card p-5 shadow-xs">
            <legend className="font-display px-2 text-sm text-muted-foreground">
              {i + 1}
            </legend>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`name-${v.id}`}>{t("nameLabel")}</Label>
                <Input
                  id={`name-${v.id}`}
                  name={`name-${v.id}`}
                  defaultValue={text.name}
                  maxLength={60}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`description-${v.id}`}>{t("meaningLabel")}</Label>
                <Textarea
                  id={`description-${v.id}`}
                  name={`description-${v.id}`}
                  defaultValue={text.description}
                  maxLength={240}
                  rows={2}
                  required
                />
              </div>
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <Label>{t("livingLabel")}</Label>
                  <span className="font-display text-lg text-primary tabular-nums">
                    {ratings[v.id]}
                  </span>
                </div>
                <input type="hidden" name={`rating-${v.id}`} value={ratings[v.id]} />
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[ratings[v.id]]}
                  onValueChange={([val]) => {
                    setRatings((r) => ({ ...r, [v.id]: val }));
                    setDirty(true);
                  }}
                  aria-label={t("livingAria", { name: text.name })}
                />
              </div>
            </div>
          </fieldset>
        );
      })}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={handleCancel} disabled={submitting}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={submitting} data-testid="save-reassessment">
          {submitting ? t("saving") : t("saveSnapshot")}
        </Button>
      </div>

      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("discardTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("discardBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keepEditing")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDirty(false);
                router.push("/profile");
              }}
            >
              {t("discard")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
