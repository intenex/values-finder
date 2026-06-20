import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getLatestCompletedSession, saveReassessment } from "../actions";
import { ReassessForm } from "./ReassessForm";
import { SiteNav } from "@/components/SiteNav";
import { requireUser } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("reassess") };
}

export default async function ReassessPage() {
  const user = await requireUser("/profile/reassess");
  const latest = await getLatestCompletedSession(user.id);
  if (!latest) redirect("/profile");
  const t = await getTranslations("reassess");

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl tracking-tight">{t("title")}</h1>
        <p className="mt-3 mb-10 text-muted-foreground">{t("subtitle")}</p>
        <ReassessForm values={latest.topValues} action={saveReassessment} />
      </main>
    </>
  );
}
