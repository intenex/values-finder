import { expect, test } from "@playwright/test";
import {
  latestResetToken,
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

test("login is case-insensitive in the typed email", async ({ page }) => {
  // Emails are stored lowercase (the migration lowercased legacy mixed-case
  // rows — the bug that locked Janusz out). Signing in must work regardless of
  // how the user types the casing, because Better Auth lowercases the input.
  const email = uniqueEmail("caseci");
  await seedUser(email);

  await login(page, email.toUpperCase());
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

test("show/hide toggle reveals the password", async ({ page }) => {
  await page.goto("/login");
  const input = page.locator("#password");
  await input.fill("hunter2pass");
  await expect(input).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(input).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(input).toHaveAttribute("type", "password");
});

test("password strength meter shows on signup, not on login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("password-strength")).toHaveCount(0);

  await page.goto("/signup");
  await expect(page.getByTestId("password-strength")).toHaveCount(0); // hidden until typing
  await page.fill("#password", "abc");
  await expect(page.getByTestId("password-strength")).toBeVisible();
});

test("forgot-password shows a neutral confirmation", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.waitForURL(/\/forgot-password/);
  await page.fill("#email", uniqueEmail("forgot"));
  await page.click("button[type=submit]");
  await expect(page.getByRole("status")).toContainText("If an account exists");
});

test("a user can reset their password and sign in with the new one", async ({ page }) => {
  const email = uniqueEmail("reset");
  const userId = await seedUser(email);

  // Request the reset through the real form, then read the issued token.
  await page.goto("/forgot-password");
  await page.fill("#email", email);
  await page.click("button[type=submit]");
  await expect(page.getByRole("status")).toBeVisible();

  const token = await latestResetToken(userId);
  await page.goto(`/reset-password?token=${token}`);
  await page.fill("#password", "BrandNewPass123!");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/login\?reset=1/);
  await expect(page.getByRole("status")).toContainText("password has been reset");

  // Old password no longer works; the new one does.
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click("button[type=submit]");
  await expect(page.locator("p[role=alert]")).toContainText("Invalid email or password");

  await page.fill("#email", email);
  await page.fill("#password", "BrandNewPass123!");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/\/assessment/);
});
