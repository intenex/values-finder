import { getMessages } from "next-intl/server";

export interface ValueText {
  name: string;
  description: string;
}

/**
 * Server-side localized value lookup. The request config deep-merges English
 * under every locale, so `values[id]` always resolves (English at minimum) —
 * untranslated values never break. Use for the canonical (non-customized) text.
 */
export async function getValueText(): Promise<(id: number) => ValueText> {
  const messages = (await getMessages()) as {
    values: Record<string, ValueText>;
  };
  return (id: number) =>
    messages.values[String(id)] ?? { name: String(id), description: "" };
}
