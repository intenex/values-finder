"use client";

import { useMessages } from "next-intl";
import { useCallback } from "react";
import type { ValueText } from "./values-server";

/**
 * Client-side localized value lookup. Returns canonical (non-customized) value
 * text for a given id, with automatic English fallback (the request config
 * merges English under every locale).
 */
export function useValueText(): (id: number) => ValueText {
  const messages = useMessages() as { values: Record<string, ValueText> };
  return useCallback(
    (id: number) => messages.values[String(id)] ?? { name: String(id), description: "" },
    [messages],
  );
}
