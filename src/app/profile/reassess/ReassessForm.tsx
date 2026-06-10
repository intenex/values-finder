"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { SavedValue } from "@/lib/db/schema";

interface ReassessFormProps {
  values: SavedValue[];
  action: (formData: FormData) => Promise<void>;
}

export function ReassessForm({ values, action }: ReassessFormProps) {
  const [ratings, setRatings] = useState<Record<number, number>>(
    Object.fromEntries(values.map((v) => [v.id, v.rating])),
  );
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        try {
          await action(formData);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-6"
    >
      {values.map((v, i) => (
        <fieldset key={v.id} className="rounded-xl border bg-card p-5 shadow-xs">
          <legend className="font-display px-2 text-sm text-muted-foreground">
            #{i + 1}
          </legend>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`name-${v.id}`}>Name</Label>
              <Input
                id={`name-${v.id}`}
                name={`name-${v.id}`}
                defaultValue={v.name}
                maxLength={60}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`description-${v.id}`}>What it means to you</Label>
              <Textarea
                id={`description-${v.id}`}
                name={`description-${v.id}`}
                defaultValue={v.description}
                maxLength={240}
                rows={2}
                required
              />
            </div>
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <Label>How fully are you living it?</Label>
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
                onValueChange={([val]) => setRatings((r) => ({ ...r, [v.id]: val }))}
                aria-label={`How fully are you living ${v.name}?`}
              />
            </div>
          </div>
        </fieldset>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} data-testid="save-reassessment">
          {submitting ? "Saving…" : "Save new snapshot"}
        </Button>
      </div>
    </form>
  );
}
