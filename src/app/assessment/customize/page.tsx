import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { saveCustomizations } from "../complete-actions";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getActiveAssessment } from "@/lib/assessment";
import { requireUser } from "@/lib/auth/session";
import { replay } from "@/lib/engine/replay";
import { getValue } from "@/lib/values";

export const metadata: Metadata = { title: "Make them yours" };

export default async function CustomizePage() {
  const user = await requireUser("/assessment/customize");
  const assessment = await getActiveAssessment(user.id);
  if (!assessment) redirect("/assessment");

  const state = replay(assessment.sets, assessment.choices);
  if (state.phase !== "customize") redirect("/assessment");

  return (
    <>
      <SiteNav email={user.email} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl tracking-tight">Make them yours</h1>
        <p className="mt-3 mb-10 text-muted-foreground">
          Reword any of your ten values so they speak in your own voice — or
          leave them exactly as they are.
        </p>

        <form action={saveCustomizations} className="space-y-8">
          {state.top10.map((id, i) => {
            const v = getValue(id);
            const custom = assessment.customizations?.[id];
            return (
              <fieldset key={id} className="rounded-xl border bg-card p-5 shadow-xs">
                <legend className="font-display px-2 text-sm text-muted-foreground">
                  #{i + 1}
                </legend>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`name-${id}`}>Name</Label>
                    <Input
                      id={`name-${id}`}
                      name={`name-${id}`}
                      defaultValue={custom?.name ?? v.name}
                      maxLength={60}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`description-${id}`}>What it means to you</Label>
                    <Textarea
                      id={`description-${id}`}
                      name={`description-${id}`}
                      defaultValue={custom?.description ?? v.description}
                      maxLength={240}
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </fieldset>
            );
          })}

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/assessment/results">Back</Link>
            </Button>
            <Button type="submit">Continue to reflection</Button>
          </div>
        </form>
      </main>
    </>
  );
}
