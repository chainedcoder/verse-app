import { test, expect } from '@playwright/test';

test.describe('Comments Flow', () => {
  const testEmail = `commenter-${Date.now()}@example.com`;
  const testPassword = 'password123';
  const commentText = `Great poem! ${Date.now()}`;

  test('user can post and delete a comment on a poem', async ({ page }) => {
    // Register and login
    await page.goto('/signup');
    await page.fill('input[type="text"]', 'Commenter');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await Promise.all([
      page.waitForURL('**/login'),
      page.click('button[type="submit"]')
    ]);

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await Promise.all([
      page.waitForURL('**/'),
      page.click('button[type="submit"]')
    ]);

    // Go to the first poem in the feed
    await page.goto('/');
    // Click on the first poem link or title
    const featuredCards = page.locator('[data-testid="featured-poem-card"]');
    const regularCards  = page.locator('[data-testid="poem-card"]');
    const hasFeatured = await featuredCards.count();
    const card = hasFeatured > 0 ? featuredCards.first() : regularCards.first();
    
    await Promise.all([
      page.waitForURL('**/poem/**'),
      card.click()
    ]);

    // Hard navigation to bypass Next.js soft navigation race conditions with Server Actions
    await page.reload();
    
    // Ensure we are on a poem page
    await expect(page.url()).toContain('/poem/');
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    // Check that comment form is visible
    await expect(page.locator('textarea[placeholder="Add a comment..."]').first()).toBeVisible();

    // Post a comment
    await page.locator('textarea[placeholder="Add a comment..."]').first().fill(commentText);
    await page.locator('button:has-text("Post")').first().click();

    // Wait for the comment to appear (can take longer if db is slow)
    const commentCard = page.locator('.comment-card', { hasText: commentText });
    
    try {
      await expect(commentCard).toBeVisible({ timeout: 10000 });
    } catch (e) {
      console.log("COMMENT NOT VISIBLE. CURRENT URL:", page.url());
      throw e;
    }

    // Delete the comment
    await commentCard.locator('button:has-text("Delete")').click();

    // Ensure it's deleted
    await expect(commentCard).not.toBeVisible();
  });
});
