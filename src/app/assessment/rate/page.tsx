import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { completeAssessment } from "../complete-actions";
import { RateForm } from "./RateForm";
import { SiteNav } from "@/components/SiteNav";
import { getValueText } from "@/i18n/values-server";
import { getActiveAssessment } from "@/lib/assessment";
import { requireUser } from "@/lib/auth/session";
import { replay } from "@/lib/engine/replay";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("reflect") };
}

export default async function RatePage() {
  const user = await requireUser("/assessment/rate");
  const assessment = await getActiveAssessment(user.id);
  if (!assessment) redirect("/assessment");

  const state = replay(assessment.sets, assessment.choices);
  if (state.phase !== "customize") redirect("/assessment");

  const t = await getTranslations("rate");
  const valueText = await getValueText();

  const items = state.top10.map((id) => {
    const v = valueText(id);
    const custom = assessment.customizations?.[id];
    return {
      id,
      name: custom?.name ?? v.name,
      description: custom?.description ?? v.description,
      initial: assessment.ratings?.[id],
    };
  });

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl tracking-tight">{t("title")}</h1>
        <p className="mt-3 mb-10 text-muted-foreground">{t("subtitle")}</p>
        <RateForm items={items} action={completeAssessment} />
      </main>
    </>
  );
}
