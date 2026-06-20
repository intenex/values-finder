import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("chooseNewPassword") };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  const t = await getTranslations("auth");

  const invalid = !token || error === "INVALID_TOKEN";

  return (
    <>
      <div className="fixed right-3 top-3 z-50">
        <LanguageSwitcher />
      </div>
      <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl tracking-tight">{t("resetTitle")}</h1>
        {invalid ? (
          <>
            <p role="alert" className="mt-2 mb-8 text-sm text-muted-foreground">
              {t("resetInvalid")}
            </p>
            <Link
              href="/forgot-password"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t("resetRequestNew")}
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 mb-8 text-sm text-muted-foreground">
              {t("resetSubtitle")}
            </p>
            <ResetPasswordForm token={token!} />
          </>
        )}
      </main>
    </>
  );
}
