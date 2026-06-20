import { Pool } from "pg";

// TEMPORARY diagnostic route — surfaces why the serverless function errors in
// production. Remove after debugging.
export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {};

  // 1. Which env vars are visible at runtime?
  out.env = {
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    POSTGRES_URL_tail: (process.env.POSTGRES_URL || "").slice(-12),
    POSTGRES_URL_hasNewline: /\n/.test(process.env.POSTGRES_URL || ""),
    BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || null,
    VERCEL_URL: process.env.VERCEL_URL || null,
    NODE_VERSION: process.version,
  };

  // 2. Raw DB connectivity from inside the function.
  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 1,
      connectionTimeoutMillis: 8000,
    });
    const r = await pool.query("select count(*)::int n from users");
    out.db = { ok: true, users: r.rows[0].n };
    await pool.end();
  } catch (e) {
    out.db = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // 3. Can the Better Auth instance load + answer getSession?
  try {
    const { auth } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    await auth.api.getSession({ headers: await headers() });
    out.auth = { ok: true };
  } catch (e) {
    out.auth = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack?.split("\n").slice(0, 4) : undefined,
    };
  }

  return Response.json(out);
}
