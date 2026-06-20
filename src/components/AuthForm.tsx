"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "@/lib/auth/actions";

interface AuthFormProps {
  mode: "login" | "signup";
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next?: string;
}

export function AuthForm({ mode, action, next }: AuthFormProps) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          {mode === "login" ? (
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("forgotLink")}
            </Link>
          ) : null}
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          placeholder={mode === "signup" ? t("passwordPlaceholderSignup") : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "signup" ? <PasswordStrength password={password} /> : null}
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? mode === "login"
            ? t("signingIn")
            : t("creatingAccount")
          : mode === "login"
            ? t("signInCta")
            : t("createAccountCta")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            {t("newHere")}{" "}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t("createAccountLink")}
            </Link>
          </>
        ) : (
          <>
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t("signInLink")}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
