import { expect, test } from "@playwright/test";
import { answerRound, currentRoundValues, signup, uniqueEmail } from "./helpers";

// The regression test for the original bug: back/refresh must never change
// which values appear.
test("reloading mid-assessment shows the exact same round and values", async ({
  page,
}) => {
  await signup(page, uniqueEmail("determinism"));

  for (let i = 0; i < 5; i++) {
    await answerRound(page);
  }
  await expect(page.getByText("Round 6 of")).toBeVisible();
  const before = await currentRoundValues(page);

  await page.reload();
  await expect(page.getByText("Round 6 of")).toBeVisible();
  expect(await currentRoundValues(page)).toEqual(before);

  // And again — determinism is not luck.
  await page.reload();
  expect(await currentRoundValues(page)).toEqual(before);
});

test("back shows the previous round with the saved answer preselected", async ({
  page,
}) => {
  await signup(page, uniqueEmail("backnav"));

  const firstRound = await currentRoundValues(page);
  await answerRound(page); // first card = most, last = least
  await expect(page.getByText("Round 2 of")).toBeVisible();

  await page.getByTestId("back-button").click();
  await expect(page.getByText("Round 1 of")).toBeVisible();
  expect(await currentRoundValues(page)).toEqual(firstRound);
  await expect(page.locator('[data-role="most"] h3')).toHaveText(firstRound[0]);
  await expect(page.locator('[data-role="least"] h3')).toHaveText(
    firstRound[firstRound.length - 1],
  );
});
