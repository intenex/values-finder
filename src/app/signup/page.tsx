import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { signup } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/assessment");
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl tracking-tight">Create your account</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Your progress is saved continuously, so you can pause anytime and pick
        up where you left off — on any device.
      </p>
      <AuthForm mode="signup" action={signup} next={next} />
    </main>
  );
}
