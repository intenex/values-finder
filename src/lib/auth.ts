import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendResetPasswordEmail, sendVerificationEmail } from "@/lib/email";

// Existing accounts were hashed with native bcrypt at cost 10 ($2b$); new
// accounts get cost 12. Keeping bcrypt (not Better Auth's default scrypt) lets
// all 23 pre-existing users sign in with no password reset.
const COST = 12;
const normalizeBcrypt = (hash: string) =>
  hash.startsWith("$2y$") ? "$2b$" + hash.slice(4) : hash;

// First-party ecosystem apps are registered as trusted clients (skip_consent),
// so the consent page is not reached today; the route still exists as a stub.
const TRUSTED_CLIENT_IDS = (process.env.OAUTH_TRUSTED_CLIENT_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Explicit URL in production; fall back to the Vercel-provided deployment URL
// so preview builds (which don't get BETTER_AUTH_URL) still initialize cleanly.
const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    // Reuse the existing `users` table as Better Auth's `user` model so every
    // foreign key (assessments, snapshots) keeps pointing at the same ids.
    schema: { ...schema, user: schema.users },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // send-but-don't-block
    password: {
      hash: (password) => bcrypt.hash(password, COST),
      verify: ({ password, hash }) => bcrypt.compare(password, normalizeBcrypt(hash)),
    },
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail(user.email, url);
    },
  },
  plugins: [
    // jwt() signs the OAuth id_tokens and must precede the provider.
    jwt(),
    // OAuth 2.1 identity provider — the shared SSO foundation for the
    // ecosystem. Future apps on separate root domains delegate login here.
    oauthProvider({
      loginPage: "/login",
      consentPage: "/consent",
      cachedTrustedClients: new Set(TRUSTED_CLIENT_IDS),
      // The discovery documents are exposed at the standard well-known paths via
      // next.config rewrites, so this configuration warning is handled.
      silenceWarnings: { oauthAuthServerConfig: true },
    }),
    // nextCookies() must stay last so Set-Cookie from server actions flushes.
    nextCookies(),
  ],
});
