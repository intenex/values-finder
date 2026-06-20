"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Lightweight strength estimate — length tiers + character-class variety, no
// heavyweight dependency. Purely advisory UI; the server enforces the minimum.
function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LABEL_KEYS = [
  "strengthTooShort",
  "strengthWeak",
  "strengthFair",
  "strengthGood",
  "strengthStrong",
] as const;
const COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-amber-500",
  "bg-amber-400",
  "bg-most",
] as const;

export function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("auth");
  const score = scorePassword(password);
  if (!password) return null;

  return (
    <div aria-live="polite" className="space-y-1.5">
      <div className="flex gap-1" data-testid="password-strength">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? COLORS[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t(LABEL_KEYS[score])} · {t("strengthHint")}
      </p>
    </div>
  );
}
