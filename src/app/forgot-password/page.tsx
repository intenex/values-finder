import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCurrentUser } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("resetPassword") };
}

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/profile");
  const t = await getTranslations("auth");

  return (
    <>
      <div className="fixed right-3 top-3 z-50">
        <LanguageSwitcher />
      </div>
      <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl tracking-tight">{t("forgotTitle")}</h1>
        <p className="mt-2 mb-8 text-sm text-muted-foreground">{t("forgotSubtitle")}</p>
        <ForgotPasswordForm />
      </main>
    </>
  );
}
