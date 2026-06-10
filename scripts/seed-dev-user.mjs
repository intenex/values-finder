// Seeds a legacy-style test user (bcrypt cost 10, like accounts created by
// the old app) plus one completed values session, for dev and e2e tests.
// Usage: node scripts/seed-dev-user.mjs [database-url]
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import pg from "pg";

const url =
  process.argv[2] ??
  process.env.POSTGRES_URL ??
  `postgresql://${process.env.USER}@localhost:5432/janusz_values_dev`;

const EMAIL = "legacy-tester@example.com";
const PASSWORD = "test1234";

const pool = new pg.Pool({ connectionString: url });

const hash = await bcrypt.hash(PASSWORD, 10); // cost 10 = legacy accounts
const userId = randomUUID();

await pool.query(`DELETE FROM users WHERE email = $1`, [EMAIL]);
await pool.query(
  `INSERT INTO users (id, email, password) VALUES ($1, $2, $3)`,
  [userId, EMAIL, hash],
);

// A pre-existing completed session in the OLD format, to prove history renders.
const topValues = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `LEGACY VALUE ${i + 1}`,
  description: `legacy description ${i + 1}`,
  rating: 7,
  score: 40 - i,
  isCustom: i === 0,
}));
await pool.query(
  `INSERT INTO user_values_sessions (id, user_id, completed_at, top_values, all_values)
   VALUES ($1, $2, now() - interval '30 days', $3::jsonb, $4::jsonb)`,
  [
    randomUUID(),
    userId,
    JSON.stringify(topValues),
    JSON.stringify(Array.from({ length: 93 }, (_, i) => ({ id: i + 1, score: 93 - i }))),
  ],
);

console.log(`Seeded ${EMAIL} / ${PASSWORD} (user ${userId}) on ${url.split("@").pop()}`);
await pool.end();
