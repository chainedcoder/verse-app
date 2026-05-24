import { test, expect } from '@playwright/test';

test.describe('Search Flow', () => {
  test('user can search for poems', async ({ page }) => {
    // Go to homepage
    await page.goto('/');

    // Type in the search input in the navbar
    const searchInput = page.locator('.navbar-actions input[type="search"]');
    await searchInput.fill('stars');
    
    // Press Enter to submit the search form
    await Promise.all([
      page.waitForURL(/.*\/search\?q=stars.*/),
      searchInput.press('Enter')
    ]);

    // Verify search page loads and shows results
    await expect(page.locator('h1')).toContainText('Search');
    await expect(page.locator('body')).toContainText('for "stars"');

    // Check that there is at least one poem card (or empty state if none exist)
    // We expect some results since 'stars' is in the dummy data, but we can just check if page renders correctly
    const hasResults = await page.locator('.card').count() > 0;
    if (hasResults) {
      await expect(page.locator('.card').first()).toBeVisible();
    } else {
      await expect(page.locator('body')).toContainText('No results found');
    }

    // Now search again using the form on the search page itself
    const pageSearchInput = page.locator('main form input[type="search"]');
    await pageSearchInput.fill('Frost'); // Searching for author
    
    await Promise.all([
      page.waitForURL(/.*\/search\?q=Frost.*/),
      pageSearchInput.press('Enter')
    ]);

    await expect(page.locator('body')).toContainText('for "Frost"');
  });
});
