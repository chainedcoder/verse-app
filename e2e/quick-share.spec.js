import { test, expect } from '@playwright/test';

test.describe('Quick Anon Share Flow', () => {
  test('guest can create an anon share and gets redirected to export', async ({ page }) => {
    // Navigate directly to quick-share page
    await page.goto('/quick-share');

    // Check header
    await expect(page.getByRole('heading', { name: 'Quick Share' })).toBeVisible();

    // Fill the form
    await page.fill('input[placeholder="E.g., Whispers of the Wind"]', 'My Quick Share Title');
    await page.fill('textarea[placeholder="Write your poem here..."]', 'This is a quick anonymous share from e2e tests.');
    await page.fill('input[placeholder="E.g., Jane Doe"]', 'E2E Guest');

    // Wait for the navigation to happen after submit
    const responsePromise = page.waitForNavigation();
    
    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect to export page
    await responsePromise;

    // Verify we are on the export page
    await expect(page).toHaveURL(/\/export\/.+\?template=siteview/);
    
    // Wait for the Export engine to render the text
    await expect(page.getByText('This is a quick anonymous share from e2e tests.').first()).toBeVisible();
    await expect(page.getByText('My Quick Share Title').first()).toBeVisible();
    await expect(page.getByText('E2E Guest').first()).toBeVisible();
  });
});
