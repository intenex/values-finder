import { type Page } from "@playwright/test";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Pool } from "pg";

export const TEST_PASSWORD = "test1234";

const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL ??
    `postgresql://${process.env.USER}@localhost:5432/janusz_values_dev`,
});

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}@example.com`;
}

/**
 * Insert a user the way the Better Auth migration leaves them: a `users` row
 * plus a matching `credential` account holding a bcrypt cost-10 hash (like a
 * legacy account that was back-filled). This is what Better Auth reads on login.
 */
export async function seedUser(email: string): Promise<string> {
  const id = randomUUID();
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (id, email, password, email_verified) VALUES ($1, $2, $3, true)`,
    [id, email, hash],
  );
  await pool.query(
    `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
     VALUES ($1, $2, 'credential', $3, $4, now(), now())`,
    [randomUUID(), id, id, hash],
  );
  return id;
}

/** Insert a completed old-format session, as the legacy app would have. */
export async function seedCompletedSession(userId: string): Promise<void> {
  // Custom names (isCustom: true) so they display verbatim. Non-custom values
  // re-localize to their canonical name by id, which would otherwise override
  // these fake "LEGACY VALUE N" labels.
  const topValues = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `LEGACY VALUE ${i + 1}`,
    description: `legacy description ${i + 1}`,
    rating: 6,
    score: 40 - i,
    isCustom: true,
  }));
  await pool.query(
    `INSERT INTO user_values_sessions (id, user_id, completed_at, top_values, all_values)
     VALUES ($1, $2, now(), $3::jsonb, $4::jsonb)`,
    [
      randomUUID(),
      userId,
      JSON.stringify(topValues),
      JSON.stringify(
        Array.from({ length: 93 }, (_, i) => ({ id: i + 1, score: 93 - i })),
      ),
    ],
  );
}

/** The most recent password-reset token Better Auth issued for a user. */
export async function latestResetToken(userId: string): Promise<string> {
  const { rows } = await pool.query(
    `SELECT identifier FROM verification
     WHERE value = $1 AND identifier LIKE 'reset-password:%'
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  if (!rows[0]) throw new Error("no reset token found for user");
  return String(rows[0].identifier).replace("reset-password:", "");
}

export async function login(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/(assessment|profile)/);
}

/** Sign up a fresh account and step through the intro into the rounds. */
export async function signup(page: Page, email: string): Promise<void> {
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/assessment\/intro/);
  await page.getByTestId("begin-button").click();
  await page.waitForURL(/\/assessment$/);
}

/** Sign up but stop on the intro page (for testing the intro itself). */
export async function signupToIntro(page: Page, email: string): Promise<void> {
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/assessment\/intro/);
}

/** Answer the currently shown round: first card = most, last card = least. */
export async function answerRound(page: Page): Promise<void> {
  const before = await page.getByTestId("answered-count").innerText();
  await page.locator('[data-testid="value-card"]').first().getByTestId("assign-most").click();
  await page.locator('[data-testid="value-card"]').last().getByTestId("assign-least").click();
  // Auto-advance fires ~350ms later and the server confirms the write.
  await page
    .getByTestId("answered-count")
    .filter({ hasNotText: before })
    .waitFor({ timeout: 15_000 })
    .catch(async () => {
      // Final round navigates away instead of incrementing the counter.
      await page.waitForURL(/\/assessment\/results/, { timeout: 15_000 });
    });
}

export async function currentRoundValues(page: Page): Promise<string[]> {
  return page.locator('[data-testid="value-card"] h3').allInnerTexts();
}
