import { expect, test } from "@playwright/test";
import { login, seedCompletedSession, seedUser, uniqueEmail } from "./helpers";

// Port of the old app's reassess-flow spec: returning users land on their
// profile and can reassess (edit wording + re-rate), which appends a new
// session rather than overwriting history.
test("returning user reassesses values into a new snapshot", async ({ page }) => {
  const email = uniqueEmail("reassess");
  const userId = await seedUser(email);
  await seedCompletedSession(userId);

  await login(page, email);
  await expect(page).toHaveURL(/\/profile/);

  await page.getByTestId("reassess-link").click();
  await page.waitForURL(/\/profile\/reassess/);

  // Rename the first value and save.
  const firstName = page.locator('input[id^="name-"]').first();
  await firstName.fill("RENAMED VALUE");
  await page.getByTestId("save-reassessment").click();

  await page.waitForURL(/\/profile$/);
  await expect(page.getByTestId("session-values")).toContainText("RENAMED VALUE");

  // Both snapshots exist (history is append-only).
  await expect(page.getByTestId("session-tabs").locator("button")).toHaveCount(2);
});

test("reassessing with no changes does not create a duplicate snapshot", async ({
  page,
}) => {
  const email = uniqueEmail("noop");
  const userId = await seedUser(email);
  await seedCompletedSession(userId);

  await login(page, email);
  await page.getByTestId("reassess-link").click();
  await page.waitForURL(/\/profile\/reassess/);

  // Save without editing anything.
  await page.getByTestId("save-reassessment").click();
  await page.waitForURL(/\/profile(\?|$)/);

  // Still a single snapshot — the no-op did not append history (tabs only
  // render when there is more than one completed session).
  await expect(page.getByTestId("session-tabs")).toHaveCount(0);
});

test("retake requires confirmation and starts a fresh exercise", async ({ page }) => {
  const email = uniqueEmail("retake");
  const userId = await seedUser(email);
  await seedCompletedSession(userId);

  await login(page, email);
  await page.getByTestId("retake-button").click();
  await expect(page.getByText("Start the full exercise over?")).toBeVisible();
  await page.getByTestId("confirm-retake").click();

  await page.waitForURL(/\/assessment/);
  await expect(page.getByText("Round 1 of")).toBeVisible();

  // Completed history is untouched.
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "LEGACY VALUE 1", exact: true })).toBeVisible();
});
