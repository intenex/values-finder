"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/i18n/locales";

/** Persist the chosen language in a long-lived cookie. */
export async function setLocale(code: string): Promise<void> {
  if (!isLocale(code)) return;
  (await cookies()).set(LOCALE_COOKIE, code, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
