import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

// Reuse the pool across hot reloads in dev and across invocations on
// Vercel's Fluid Compute, where module state persists between requests.
const globalForDb = globalThis as unknown as { __dbPool?: Pool };

const pool =
  globalForDb.__dbPool ??
  new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 5,
  });
globalForDb.__dbPool = pool;

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
export * as tables from "./schema";
