"use client";

import { createAuthClient } from "better-auth/react";

// baseURL is inferred from the current origin in the browser. Setting
// NEXT_PUBLIC_APP_URL lets it work in non-browser contexts (tests) too.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, requestPasswordReset, resetPassword, useSession } =
  authClient;
