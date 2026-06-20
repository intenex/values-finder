import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { login } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/assessment");
  const { next, reset } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl tracking-tight">Welcome back</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Sign in to continue your values exercise. If you used the previous
        version of this site, your account still works — you may just need to
        sign in again.
      </p>
      {reset ? (
        <p
          role="status"
          className="mb-6 rounded-md border border-most/30 bg-most-soft px-4 py-3 text-sm text-most-foreground"
        >
          Your password has been reset. Sign in with your new password.
        </p>
      ) : null}
      <AuthForm mode="login" action={login} next={next} />
    </main>
  );
}
