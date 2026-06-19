import { expect, test } from "@playwright/test";
import {
  login,
  seedCompletedSession,
  seedUser,
  signup,
  uniqueEmail,
  TEST_PASSWORD,
} from "./helpers";

test("signup creates an account and opens the exercise", async ({ page }) => {
  await signup(page, uniqueEmail("signup"));
  await expect(page).toHaveURL(/\/assessment/);
  await expect(page.getByText("Round 1 of")).toBeVisible();
});

test("legacy-style user (bcrypt cost 10) can log in; lands on profile when they have results", async ({
  page,
}) => {
  const email = uniqueEmail("legacy");
  const userId = await seedUser(email);
  await seedCompletedSession(userId);

  await login(page, email);
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByRole("heading", { name: "LEGACY VALUE 1", exact: true })).toBeVisible();
});

test("login with no completed results opens the exercise", async ({ page }) => {
  const email = uniqueEmail("fresh");
  await seedUser(email);
  await login(page, email);
  await expect(page).toHaveURL(/\/assessment/);
});

test("login is case-insensitive for legacy mixed-case emails", async ({ page }) => {
  // The old app stored emails exactly as typed; a lowercased lookup must still
  // find them (this is the bug that locked Janusz out of his account).
  const lower = uniqueEmail("caseci");
  const stored = lower.replace("caseci", "CaseCI").replace("@example.com", "@Example.com");
  await seedUser(stored);

  await login(page, lower);
  await expect(page).toHaveURL(/\/assessment/);
});

test("signup rejects a different-case duplicate of an existing email", async ({
  page,
}) => {
  const lower = uniqueEmail("dupecase");
  const stored = lower.replace("@example.com", "@Example.com");
  await seedUser(stored);

  await page.goto("/signup");
  await page.fill("#email", lower.toUpperCase());
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await expect(page.locator("p[role=alert]")).toContainText("already exists");
});

test("wrong password is rejected", async ({ page }) => {
  const email = uniqueEmail("wrongpw");
  await seedUser(email);
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", "not-the-password");
  await page.click("button[type=submit]");
  await expect(page.locator("p[role=alert]")).toContainText("Invalid email or password");
});

test("protected routes redirect to login", async ({ page }) => {
  await page.goto("/assessment");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login/);
});

test("logout signs the user out", async ({ page }) => {
  const email = uniqueEmail("logout");
  await seedUser(email);
  await login(page, email);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("/");
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login/);
});

test("duplicate signup is rejected", async ({ page }) => {
  const email = uniqueEmail("dupe");
  await seedUser(email);
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await expect(page.locator("p[role=alert]")).toContainText("already exists");
});
