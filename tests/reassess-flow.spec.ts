import { test, expect } from '@playwright/test';

test.describe('Reassess Values Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:5173/');
  });

  test('should redirect returning users to profile', async ({ page }) => {
    // Login as test user
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('test123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Should be redirected to profile page
    await expect(page).toHaveURL('http://localhost:5173/profile');
    
    // Should see the completed values session
    await expect(page.getByText('Your Values History')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
    
    // Should see the top values with ratings
    await expect(page.getByText('INNER HARMONY')).toBeVisible();
    await expect(page.getByText('8/10')).toBeVisible();
  });

  test('should allow reassessing values', async ({ page }) => {
    // Login and navigate to profile
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('test123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL('http://localhost:5173/profile');

    // Click Reassess Values button
    await page.getByRole('button', { name: 'Reassess Values' }).click();
    await expect(page).toHaveURL('http://localhost:5173/reassess');

    // Should see the reassess page
    await expect(page.getByText('Reassess Your Values')).toBeVisible();
    await expect(page.getByText('Update your values and rate how well you\'re living by them')).toBeVisible();

    // Should see all 10 values
    await expect(page.getByText('Value #1')).toBeVisible();
    await expect(page.getByText('Value #10')).toBeVisible();

    // Edit a value
    const firstValueInput = page.locator('input[placeholder="Value name"]').first();
    await firstValueInput.clear();
    await firstValueInput.fill('INNER PEACE');

    // Change a rating
    const firstSlider = page.locator('[role="slider"]').first();
    await firstSlider.click(); // This will set it to a middle position

    // Save reassessment
    await page.getByRole('button', { name: 'Save Reassessment' }).click();

    // Should redirect back to profile
    await expect(page).toHaveURL('http://localhost:5173/profile');
  });

  test('should show warning when retaking full test', async ({ page }) => {
    // Login and navigate to profile
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('test123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL('http://localhost:5173/profile');

    // Click Retake Full Test button
    await page.getByRole('button', { name: 'Retake Full Test' }).click();
    await expect(page).toHaveURL('http://localhost:5173/start-test');

    // Should see warning message
    await expect(page.getByText('This will start a completely new values assessment from scratch')).toBeVisible();
    await expect(page.getByText('Your previous results will be saved in your history')).toBeVisible();

    // Click Start New Assessment
    await page.getByRole('button', { name: 'Start New Assessment' }).click();

    // Should navigate to comparison page
    await expect(page).toHaveURL('http://localhost:5173/comparison');
    
    // Should see the first comparison set
    await expect(page.getByText('Round 1 of 56')).toBeVisible();
  });

  test('should handle cancellation properly', async ({ page }) => {
    // Login and navigate to reassess page
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('test123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('button', { name: 'Reassess Values' }).click();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Should return to profile
    await expect(page).toHaveURL('http://localhost:5173/profile');
  });

  test('should show proper layout for values in profile', async ({ page }) => {
    // Login and check profile layout
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('test123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Check that values are displayed with proper formatting
    const firstValue = page.locator('.border.rounded-lg').first();
    await expect(firstValue).toContainText('1');
    await expect(firstValue).toContainText('INNER HARMONY');
    await expect(firstValue).toContainText('to be at peace with myself');
    await expect(firstValue).toContainText('8/10');
    await expect(firstValue).toContainText('Rating');
  });
});