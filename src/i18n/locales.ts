// The languages offered in the switcher. `code` is the message-catalog file
// name (messages/<code>.json) and the value stored in the NEXT_LOCALE cookie;
// `label` is the language's own native name, shown in the dropdown.
export const locales = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文（简体）" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ko", label: "한국어" },
  { code: "pt", label: "Português (Brasil)" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const localeCodes = locales.map((l) => l.code) as Locale[];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (localeCodes as string[]).includes(value);
}
