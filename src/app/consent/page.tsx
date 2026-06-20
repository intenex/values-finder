import type { Metadata } from "next";

export const metadata: Metadata = { title: "Authorize", robots: { index: false } };

// Placeholder consent screen. The OAuth provider only redirects here for
// NON-trusted clients; every first-party ecosystem app is registered with
// skip_consent, so this page is currently unreachable in normal flows. A full
// consent UI (calling authClient.oauth2.consent) ships with the first
// third-party client that needs it.
export default function ConsentPage() {
  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-sm flex-col justify-center px-6 py-16 text-center">
      <h1 className="font-display text-3xl tracking-tight">Authorize access</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This application isn&apos;t set up to request your consent yet. If you
        reached this page unexpectedly, please return to the app you came from.
      </p>
    </main>
  );
}
