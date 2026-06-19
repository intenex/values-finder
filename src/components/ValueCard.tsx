"use client";

import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValueDef } from "@/lib/values";

export type CardRole = "most" | "least" | null;

interface ValueCardProps {
  value: ValueDef;
  role: CardRole;
  /** True when some card in the round is already chosen as most / least. */
  mostChosen: boolean;
  leastChosen: boolean;
  customized?: boolean;
  disabled?: boolean;
  onTap: () => void;
  onAssign: (role: Exclude<CardRole, null>) => void;
  onEdit: () => void;
}

type ChipStyle = "solid" | "soft" | "muted";

const chipClasses: Record<"most" | "least", Record<ChipStyle, string>> = {
  most: {
    solid: "border-most bg-most text-white",
    soft: "border-most-soft bg-most-soft text-most-foreground hover:border-most",
    muted: "border-border bg-transparent text-muted-foreground hover:border-most/50",
  },
  least: {
    solid: "border-least bg-least text-white",
    soft: "border-least-soft bg-least-soft text-least-foreground hover:border-least",
    muted: "border-border bg-transparent text-muted-foreground hover:border-least/50",
  },
};

export function ValueCard({
  value,
  role,
  mostChosen,
  leastChosen,
  customized,
  disabled,
  onTap,
  onAssign,
  onEdit,
}: ValueCardProps) {
  // Once one dimension is chosen, that dimension's buttons fade to neutral on
  // the other cards, so only the colour you still need to pick stays vivid.
  const mostStyle: ChipStyle =
    role === "most" ? "solid" : role === "least" || mostChosen ? "muted" : "soft";
  const leastStyle: ChipStyle =
    role === "least" ? "solid" : role === "most" || leastChosen ? "muted" : "soft";

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
        disabled && "opacity-60",
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

      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onAssign("most");
          }}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
            chipClasses.most[mostStyle],
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
            chipClasses.least[leastStyle],
          )}
          data-testid="assign-least"
        >
          Least important
        </button>
        <button
          type="button"
          aria-label={`Edit ${value.name}`}
          title="Edit this value or its definition"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className={cn(
            "ml-auto rounded-md p-1.5 transition-colors hover:bg-muted",
            customized ? "text-primary" : "text-muted-foreground",
          )}
          data-testid="edit-value"
        >
          <Pencil className="size-4" />
        </button>
      </div>
    </div>
  );
}
