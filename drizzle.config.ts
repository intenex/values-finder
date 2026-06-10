import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// .env.local (local dev DB) must always beat .env (which may hold the
// production URL pulled via `vercel env`). drizzle-kit auto-loads .env
// before this file runs, so force the override.
config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
