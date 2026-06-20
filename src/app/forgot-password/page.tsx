import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/profile");

  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl tracking-tight">Reset your password</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Enter the email you signed up with and we&apos;ll send you a link to
        choose a new password.
      </p>
      <ForgotPasswordForm />
    </main>
  );
}
