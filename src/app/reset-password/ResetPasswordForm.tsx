"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(resetPassword, {
    error: null,
  });
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">{t("resetNewPasswordLabel")}</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder={t("passwordPlaceholderSignup")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrength password={password} />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("resetSaving") : t("resetSet")}
      </Button>
    </form>
  );
}
