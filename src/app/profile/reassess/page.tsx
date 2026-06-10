import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLatestCompletedSession, saveReassessment } from "../actions";
import { ReassessForm } from "./ReassessForm";
import { SiteNav } from "@/components/SiteNav";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Reassess your values" };

export default async function ReassessPage() {
  const user = await requireUser("/profile/reassess");
  const latest = await getLatestCompletedSession(user.id);
  if (!latest) redirect("/profile");

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl tracking-tight">Reassess your values</h1>
        <p className="mt-3 mb-10 text-muted-foreground">
          Revisit your ten values: adjust their wording if your understanding
          has shifted, and re-rate how fully you&apos;re living each one today.
          This saves a new snapshot — your earlier results stay in your history.
        </p>
        <ReassessForm
          values={latest.topValues}
          action={saveReassessment}
        />
      </main>
    </>
  );
}
