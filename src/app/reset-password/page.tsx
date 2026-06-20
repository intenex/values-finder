import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  const invalid = !token || error === "INVALID_TOKEN";

  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl tracking-tight">Choose a new password</h1>
      {invalid ? (
        <>
          <p
            role="alert"
            className="mt-2 mb-8 text-sm text-muted-foreground"
          >
            This reset link is invalid or has expired. Request a new one to try
            again.
          </p>
          <Link
            href="/forgot-password"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Request a new reset link
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">
            Enter a new password for your account.
          </p>
          <ResetPasswordForm token={token!} />
        </>
      )}
    </main>
  );
}
