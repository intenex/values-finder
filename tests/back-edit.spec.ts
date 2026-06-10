import { expect, test } from "@playwright/test";
import { answerRound, signup, uniqueEmail } from "./helpers";

test("editing an earlier answer saves and keeps forward progress", async ({
  page,
}) => {
  await signup(page, uniqueEmail("edit"));

  for (let i = 0; i < 3; i++) {
    await answerRound(page);
  }
  await expect(page.getByText("Round 4 of")).toBeVisible();

  // Go back two rounds and flip the answer (second card most, first least).
  await page.getByTestId("back-button").click();
  await page.getByTestId("back-button").click();
  await expect(page.getByText("Round 2 of")).toBeVisible();
  await expect(page.getByText("You answered this round before")).toBeVisible();

  await page
    .locator('[data-testid="value-card"]')
    .nth(1)
    .getByTestId("assign-most")
    .click();
  await page
    .locator('[data-testid="value-card"]')
    .first()
    .getByTestId("assign-least")
    .click();
  await page.getByRole("button", { name: "Save change" }).click();
  await expect(page.getByText("Answer updated.")).toBeVisible();

  // The change persisted and the rest of the progress is intact.
  await page.reload();
  await expect(page.getByText("Round 4 of")).toBeVisible();
  await expect(page.getByTestId("answered-count")).toHaveText("3 answered");
  await page.getByTestId("back-button").click();
  await page.getByTestId("back-button").click();
  await expect(page.getByText("Round 2 of")).toBeVisible();
  await expect(page.locator('[data-role="most"]')).toBeVisible();
});
