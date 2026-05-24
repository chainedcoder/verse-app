import { test, expect } from '@playwright/test';

test.describe('Feed and Navigation', () => {
  test('home page loads poems and sidebar', async ({ page }) => {
    await page.goto('/');

    // Verify logo and nav links
    await expect(page.locator('.navbar-logo')).toContainText('verse');
    await expect(page.locator('text=Discover').first()).toBeVisible();
    
    // Verify feed content
    await expect(page.locator('.poem-card-featured').first()).toBeVisible();
    
    // Verify Sidebar
    await expect(page.locator('.feed-sidebar')).toBeVisible();
    await expect(page.locator('text=Trending authors')).toBeVisible();
  });

  test('clicking a poem navigates to the poem details page', async ({ page }) => {
    await page.goto('/');

    // Click the first poem card
    const firstPoem = page.locator('.poem-card-featured').first();
    const poemTitle = await firstPoem.locator('h2').innerText();
    
    await Promise.all([
      page.waitForURL('**/poem/**'),
      firstPoem.click()
    ]);

    // Verify we are on the poem details page
    await expect(page.locator('.poem-viewer-title')).toContainText(poemTitle);
    await expect(page.locator('text=Download as')).toBeVisible();
  });
});
