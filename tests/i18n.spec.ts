import { expect, test } from "@playwright/test";

test("language switcher localizes the UI and persists via cookie", async ({ page }) => {
  await page.goto("/login");
  // Default English
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  // Switch to Japanese via the native <select> switcher
  await page.getByLabel("Choose language").selectOption("ja");
  await expect(page.getByRole("heading", { name: "おかえりなさい" })).toBeVisible({
    timeout: 10_000,
  });

  // Persists across navigation (cookie-based, no URL prefix)
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "あなたにとって、いちばん大切なものは何ですか？" }),
  ).toBeVisible();
  expect(page.url()).not.toContain("/ja");
});
