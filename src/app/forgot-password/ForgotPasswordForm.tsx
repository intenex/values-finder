"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(requestPasswordReset, {
    error: null,
    sent: false,
  });

  if (state.sent) {
    return (
      <p
        role="status"
        className="rounded-md border border-most/30 bg-most-soft px-4 py-3 text-sm text-most-foreground"
      >
        {t("forgotSent")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("forgotSending") : t("forgotSend")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("forgotRemembered")}{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t("forgotBackToSignIn")}
        </Link>
      </p>
    </form>
  );
}
