import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";

export async function SiteNav({ email }: { email?: string | null }) {
  const t = await getTranslations("nav");

  return (
    <nav className="border-b bg-card/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-lg tracking-tight">
          {t("brand")}
        </Link>
        <div className="flex items-center gap-1">
          {email ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/assessment">{t("exercise")}</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">{t("results")}</Link>
              </Button>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  {t("signOut")}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">{t("getStarted")}</Link>
              </Button>
            </>
          )}
          <LanguageSwitcher className="ml-1" />
        </div>
      </div>
    </nav>
  );
}
