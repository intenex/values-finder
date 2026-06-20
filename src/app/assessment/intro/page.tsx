import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Save } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { getActiveAssessment } from "@/lib/assessment";
import { requireUser } from "@/lib/auth/session";
import { VALUE_COUNT } from "@/lib/values";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("howItWorks") };
}

export default async function IntroPage() {
  const user = await requireUser("/assessment/intro");
  const active = await getActiveAssessment(user.id);
  const inProgress = Boolean(active && active.choices.length > 0);
  const t = await getTranslations("intro");

  const steps = [
    { icon: ArrowUp, title: t("step1Title"), body: t("step1Body", { count: VALUE_COUNT }) },
    { icon: ArrowDown, title: t("step2Title"), body: t("step2Body") },
    { icon: Pencil, title: t("step3Title"), body: t("step3Body") },
    { icon: Save, title: t("step4Title"), body: t("step4Body") },
  ];

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>

        <ol className="mt-10 space-y-5">
          {steps.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Icon className="size-4" />
              </span>
              <div>
                <h2 className="font-medium">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex items-center gap-3">
          <Button size="lg" asChild data-testid="begin-button">
            <Link href="/assessment">
              {inProgress ? t("continue") : t("begin")}
            </Link>
          </Button>
          {inProgress ? (
            <span className="text-sm text-muted-foreground">{t("inProgressNote")}</span>
          ) : null}
        </div>
      </main>
    </>
  );
}
