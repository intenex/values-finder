"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValueDef } from "@/lib/values";

export type CardRole = "most" | "least" | null;

interface ValueCardProps {
  value: ValueDef;
  role: CardRole;
  disabled?: boolean;
  onTap: () => void;
  onAssign: (role: Exclude<CardRole, null>) => void;
}

export function ValueCard({ value, role, disabled, onTap, onAssign }: ValueCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={role !== null}
      onClick={() => !disabled && onTap()}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-1.5 rounded-xl border bg-card p-4 text-left shadow-xs transition-all duration-200 select-none",
        "hover:-translate-y-0.5 hover:shadow-md",
        role === "most" && "border-most bg-most-soft ring-1 ring-most",
        role === "least" && "border-least bg-least-soft ring-1 ring-least",
        disabled && "pointer-events-none opacity-60",
      )}
      data-testid="value-card"
      data-value-id={value.id}
      data-role={role ?? "none"}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-medium tracking-wide">
          {value.name}
        </h3>
        {role === "most" && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-most px-2 py-0.5 text-xs font-medium text-white">
            <ArrowUp className="size-3" /> Most
          </span>
        )}
        {role === "least" && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-least px-2 py-0.5 text-xs font-medium text-white">
            <ArrowDown className="size-3" /> Least
          </span>
        )}
      </div>
      <p className="text-sm leading-snug text-muted-foreground">{value.description}</p>

      <div
        className={cn(
          "mt-1 flex gap-2 transition-opacity",
          role === null ? "opacity-100 sm:opacity-0 sm:group-hover:opacity-100" : "opacity-100",
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onAssign("most");
          }}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
            role === "most"
              ? "border-most bg-most text-white"
              : "border-border text-muted-foreground hover:border-most hover:text-most-foreground",
          )}
          data-testid="assign-most"
        >
          Most important
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onAssign("least");
          }}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
            role === "least"
              ? "border-least bg-least text-white"
              : "border-border text-muted-foreground hover:border-least hover:text-least-foreground",
          )}
          data-testid="assign-least"
        >
          Least important
        </button>
      </div>
    </div>
  );
}
