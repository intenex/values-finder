"use client";

import { Check, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/locale-actions";
import { locales } from "@/i18n/locales";
import { cn } from "@/lib/utils";

/**
 * Language picker. Uses a native <select> so it renders the OS wheel picker on
 * mobile (the most accessible, touch-friendly control), styled to match the
 * site. Setting the locale writes a cookie server-side, then refreshes so every
 * server component re-renders in the new language.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = locales.find((l) => l.code === locale) ?? locales[0];

  function onChange(code: string) {
    if (code === locale) return;
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  return (
    <label
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        pending && "opacity-60",
        className,
      )}
    >
      {pending ? (
        <Check className="size-4 animate-pulse" aria-hidden />
      ) : (
        <Globe className="size-4" aria-hidden />
      )}
      <span className="pointer-events-none hidden select-none sm:inline" aria-hidden>
        {current.label}
      </span>
      <select
        aria-label="Choose language"
        value={locale}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
