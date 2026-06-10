"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface RatingItem {
  id: number;
  name: string;
  description: string;
  initial?: number;
}

interface RateFormProps {
  items: RatingItem[];
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}

export function RateForm({ items, action, submitLabel = "Save my values" }: RateFormProps) {
  const [ratings, setRatings] = useState<Record<number, number>>(
    Object.fromEntries(items.map((v) => [v.id, v.initial ?? 5])),
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
      {items.map((v, i) => (
        <div key={v.id} className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="mb-1 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-base font-medium tracking-wide">
              <span className="mr-2 text-muted-foreground">{i + 1}.</span>
              {v.name}
            </h2>
            <span
              className="font-display text-xl text-primary tabular-nums"
              data-testid={`rating-display-${v.id}`}
            >
              {ratings[v.id]}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{v.description}</p>
          <input type="hidden" name={`rating-${v.id}`} value={ratings[v.id]} />
          <Slider
            min={1}
            max={10}
            step={1}
            value={[ratings[v.id]]}
            onValueChange={([val]) => setRatings((r) => ({ ...r, [v.id]: val }))}
            aria-label={`How fully are you living ${v.name}?`}
          />
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Not living it yet</span>
            <span>Living it fully</span>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} data-testid="save-values">
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
