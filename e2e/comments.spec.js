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
    const featuredCards = page.locator('.featured-poem-card');
    const regularCards  = page.locator('.poem-card-featured');
    const hasFeatured = await featuredCards.count();
    const card = hasFeatured > 0 ? featuredCards.first() : regularCards.first();
    
    await Promise.all([
      page.waitForURL('**/poem/**'),
      card.click()
    ]);

    // Ensure we are on a poem page
    await expect(page.url()).toContain('/poem/');
    
    // Check that comment form is visible
    await expect(page.locator('textarea[placeholder="Add a comment..."]')).toBeVisible();

    // Post a comment
    await page.fill('textarea[placeholder="Add a comment..."]', commentText);
    await page.click('button:has-text("Post")');

    // Wait for the comment to appear
    const commentCard = page.locator('.comment-card', { hasText: commentText });
    await expect(commentCard).toBeVisible();

    // Delete the comment
    await commentCard.locator('button:has-text("Delete")').click();

    // Ensure it's deleted
    await expect(commentCard).not.toBeVisible();
  });
});
