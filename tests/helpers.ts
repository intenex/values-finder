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

/** Insert a user directly (bcrypt cost 10, like legacy accounts). */
export async function seedUser(email: string): Promise<string> {
  const id = randomUUID();
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  await pool.query(`INSERT INTO users (id, email, password) VALUES ($1, $2, $3)`, [
    id,
    email,
    hash,
  ]);
  return id;
}

/** Insert a completed old-format session, as the legacy app would have. */
export async function seedCompletedSession(userId: string): Promise<void> {
  const topValues = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `LEGACY VALUE ${i + 1}`,
    description: `legacy description ${i + 1}`,
    rating: 6,
    score: 40 - i,
    isCustom: false,
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

export async function login(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/(assessment|profile)/);
}

export async function signup(page: Page, email: string): Promise<void> {
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/assessment/);
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
