import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "./locales";

// Cookie-based locale (no URL routing) — keeps URLs clean and lets a signed-in
// user's choice follow them everywhere. Defaults to English. Missing keys in a
// non-English catalog fall back to the English message via `messages`.
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const fallback =
    locale === defaultLocale
      ? messages
      : (await import(`../../messages/${defaultLocale}.json`)).default;

  // Shallow+deep merge so any not-yet-translated key shows the English text
  // rather than a raw key.
  return { locale, messages: deepMerge(fallback, messages) };
});

function deepMerge<T>(base: T, override: T): T {
  if (
    typeof base !== "object" ||
    base === null ||
    typeof override !== "object" ||
    override === null
  ) {
    return override ?? base;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    out[key] = deepMerge(
      (base as Record<string, unknown>)[key],
      (override as Record<string, unknown>)[key],
    );
  }
  return out as T;
}
