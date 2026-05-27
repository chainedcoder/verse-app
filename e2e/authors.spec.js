import { test, expect } from '@playwright/test';

test.describe('Authors Page', () => {
  test('displays a list of authors', async ({ page }) => {
    // Navigate to the Authors page
    await page.goto('/authors');

    // Wait for the main heading
    await expect(page.locator('h1.serif')).toHaveText('Authors');

    // Check if at least one author card is visible in the grid
    const authorCards = page.locator('.author-list-grid .card');
    await expect(authorCards.first()).toBeVisible();

    // Check if the author name element is rendered inside the card
    const firstAuthorName = authorCards.first().locator('.author-name');
    await expect(firstAuthorName).toBeVisible();
    
    // Check if the avatar is rendered
    const firstAvatar = authorCards.first().locator('.avatar');
    await expect(firstAvatar).toBeVisible();
  });
});
