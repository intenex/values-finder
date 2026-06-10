import { expect, test } from "@playwright/test";
import { answerRound, signup, uniqueEmail } from "./helpers";

// The full journey: 71 rounds → results → customize → rate → profile.
test("complete assessment end to end", async ({ page }) => {
  test.setTimeout(420_000);
  await signup(page, uniqueEmail("fullrun"));

  for (let i = 0; i < 71; i++) {
    await answerRound(page);
  }

  // Results page: top ten revealed.
  await page.waitForURL(/\/assessment\/results/);
  const topTen = await page.locator('[data-testid="top-ten"] h2').allInnerTexts();
  expect(topTen).toHaveLength(10);

  // Reload must show the identical ten (the original bug).
  await page.reload();
  expect(await page.locator('[data-testid="top-ten"] h2').allInnerTexts()).toEqual(
    topTen,
  );

  // Customize: rename the #1 value.
  await page.getByRole("link", { name: "Continue" }).click();
  await page.waitForURL(/\/assessment\/customize/);
  const firstId = await page
    .locator('input[id^="name-"]')
    .first()
    .getAttribute("id");
  await page.locator(`#${firstId}`).fill("MY OWN WORDS");
  await page.getByRole("button", { name: "Continue to reflection" }).click();

  // Rate: defaults are fine; the renamed value should appear.
  await page.waitForURL(/\/assessment\/rate/);
  await expect(page.getByText("MY OWN WORDS")).toBeVisible();
  await page.getByTestId("save-values").click();

  // Profile: the new session shows the customized value.
  await page.waitForURL(/\/profile/);
  await expect(page.getByTestId("session-values")).toContainText("MY OWN WORDS");
});
