import { expect, test } from "@playwright/test";
import { answerRound, currentRoundValues, signup, uniqueEmail } from "./helpers";

// Progress lives on the server: a brand-new browser session (same account)
// resumes at exactly the same round — crash-proof and cross-device.
test("a fresh browser context resumes exactly where the user left off", async ({
  page,
  browser,
}) => {
  const email = uniqueEmail("resume");
  await signup(page, email);

  for (let i = 0; i < 7; i++) {
    await answerRound(page);
  }
  await expect(page.getByText("Round 8 of")).toBeVisible();
  const values = await currentRoundValues(page);

  const fresh = await browser.newContext();
  const page2 = await fresh.newPage();
  await page2.goto("http://localhost:3000/login");
  await page2.fill("#email", email);
  await page2.fill("#password", "test1234");
  await page2.click("button[type=submit]");
  await page2.waitForURL(/\/assessment/);

  await expect(page2.getByText("Round 8 of")).toBeVisible();
  expect(await currentRoundValues(page2)).toEqual(values);
  await fresh.close();
});
