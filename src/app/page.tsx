import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { VALUE_COUNT } from "@/lib/values";

export default async function HomePage() {
  const user = await getCurrentUser();
  const t = await getTranslations("landing");

  return (
    <>
      <SiteNav email={user?.email} />
      <main className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mx-auto mt-4 max-w-2xl text-5xl leading-tight tracking-tight text-balance sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {t("body", { count: VALUE_COUNT })}
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link href={user ? "/assessment/intro" : "/signup"}>
                {user ? t("continue") : t("begin")}
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">{t("haveAccount")}</Link>
              </Button>
            )}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{t("footnote")}</p>
        </div>
      </main>
    </>
  );
}
