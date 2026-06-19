import { expect, test } from "@playwright/test";
import { signup, signupToIntro, uniqueEmail } from "./helpers";

test("the intro/explanation page shows before the exercise", async ({ page }) => {
  await signupToIntro(page, uniqueEmail("introtest"));
  await expect(page.getByRole("heading", { name: /Discover what matters most/ })).toBeVisible();
  await expect(page.getByText("Compare five at a time")).toBeVisible();
  await page.getByTestId("begin-button").click();
  await page.waitForURL(/\/assessment$/);
  await expect(page.getByText("Round 1 of")).toBeVisible();
});

test("a value edited mid-exercise persists across a reload", async ({ page }) => {
  await signup(page, uniqueEmail("inlineedit"));

  const firstCard = page.locator('[data-testid="value-card"]').first();
  const originalName = await firstCard.locator("h3").innerText();

  await firstCard.getByTestId("edit-value").click();
  await page.locator("#edit-name").fill("MY RENAMED VALUE");
  await page.locator("#edit-desc").fill("in my own words");
  await page.getByRole("button", { name: "Save", exact: true }).click();

  await expect(firstCard.locator("h3")).toHaveText("MY RENAMED VALUE");
  expect(await firstCard.locator("h3").innerText()).not.toBe(originalName);

  await page.reload();
  await expect(
    page.locator('[data-testid="value-card"]').first().locator("h3"),
  ).toHaveText("MY RENAMED VALUE");
});
