import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { login } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("signIn") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/assessment");
  const { next, reset } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <>
      <div className="fixed right-3 top-3 z-50">
        <LanguageSwitcher />
      </div>
      <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16">
        <h1 className="font-display text-3xl tracking-tight">{t("loginTitle")}</h1>
        <p className="mt-2 mb-8 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
        {reset ? (
          <p
            role="status"
            className="mb-6 rounded-md border border-most/30 bg-most-soft px-4 py-3 text-sm text-most-foreground"
          >
            {t("resetNotice")}
          </p>
        ) : null}
        <AuthForm mode="login" action={login} next={next} />
      </main>
    </>
  );
}
