# Values

A guided personal-values exercise: work through 93 values in ~71 rounds of
"most / least important" choices (a MaxDiff card sort), surface your top ten,
put them in your own words, and rate how fully you're living each one.
Results are saved per account; you can revisit, reassess, and retake over time.

## Stack

- **Next.js (App Router)** + React, TypeScript, Tailwind v4, shadcn/ui
- **Neon Postgres** via Drizzle ORM (`POSTGRES_URL`)
- Custom email/password auth with httpOnly cookie sessions (bcrypt)
- Deployed on Vercel (zero config — no `vercel.json` needed)

## How the assessment stays deterministic

The original app regenerated its question sets with `Math.random()` on every
page load, so refreshing could change a user's results. The rewrite makes the
assessment a pure function of stored data:

- On start, round sets are generated from a stored 32-bit seed
  (`src/lib/engine/generate.ts`) and **persisted** in `assessments.sets`.
- Every answer is appended to `assessments.choices`.
- All state (current round, scores, top 25, top 10) is derived by replaying
  choices over the stored sets (`src/lib/engine/replay.ts`) — no randomness,
  no clocks. Refresh, back-navigation, and cross-device resume always agree.
- Users can go back and edit any earlier answer. Edits that change the top-25
  pool regenerate just the 15 refinement rounds; everything else is preserved
  (`src/lib/engine/edit.ts`).

Completed results are written to the `user_values_sessions` table in the same
format the original app used, so historical results render unchanged.

## Development

```bash
npm install
# point at a local database (never the production URL):
echo "POSTGRES_URL=postgresql://$USER@localhost:5432/janusz_values_dev" > .env.local
createdb janusz_values_dev
npm run db:migrate
node scripts/seed-dev-user.mjs   # legacy-tester@example.com / test1234
npm run dev
```

## Testing

```bash
npm test          # vitest — engine unit tests (determinism, scoring, edits)
npm run test:e2e  # playwright — auth, full 71-round flow, determinism,
                  # back-edit, resume, reassess (uses the local dev DB)
npm run check     # tsc --noEmit
```

## Database

Migrations live in `drizzle/` and are applied with `npm run db:migrate`
(`drizzle-kit migrate`). The baseline migration is idempotent: it no-ops on
tables that already exist in the production database. Do not use
`drizzle-kit push` against production.

Schema: `users`, `user_values_sessions` (results history, shared format with
the legacy app), `auth_sessions` (cookie sessions, hashed tokens),
`assessments` (in-flight exercises: seed, sets, choices, customizations,
ratings). `sessions` and `values` are legacy tables kept for safety and
unused by the app.
