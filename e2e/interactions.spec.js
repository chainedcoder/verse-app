import { test, expect } from '@playwright/test';

test.describe('Interactions Flow (Likes & Follows)', () => {
  const testPassword = 'password123';
  let testEmail;

  test.beforeEach(async ({ page }) => {
    testEmail = `test-${Date.now()}-${Math.random()}@example.com`;
    // Register and login first
    await page.goto('/signup');
    await page.fill('input[type="text"]', 'Interaction User');
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
  });

  test('user can like a poem and it persists', async ({ page }) => {
    await page.goto('/');

    // Get the first poem card
    const firstPoemCard = page.locator('.poem-card-featured').first();
    const likeButton = firstPoemCard.locator('button[aria-label="Like"]');
    
    // Check initial state
    await expect(likeButton).not.toHaveClass(/liked/);
    const initialLikeText = await likeButton.locator('.like-count').textContent();
    const initialLikes = parseInt(initialLikeText, 10);

    // Click like
    await likeButton.click();

    // Verify UI updates optimistically
    await expect(likeButton).toHaveClass(/liked/);
    await expect(likeButton.locator('.like-count')).toHaveText((initialLikes + 1).toString());

    // Refresh page to ensure persistence
    await page.waitForTimeout(500);
    await page.reload();
    
    const reloadedFirstPoemCard = page.locator('.poem-card-featured').first();
    const reloadedLikeButton = reloadedFirstPoemCard.locator('button[aria-label="Like"]');
    
    await expect(reloadedLikeButton).toHaveClass(/liked/);
    await expect(reloadedLikeButton.locator('.like-count')).toHaveText((initialLikes + 1).toString());
  });

  test('user can follow an author and it persists', async ({ page }) => {
    await page.goto('/');

    // Get the first author link in the sidebar
    const firstAuthorLink = page.locator('.feed-sidebar .author-list-info a').first();
    
    // Navigate to author page
    await Promise.all([
      page.waitForNavigation(),
      firstAuthorLink.click()
    ]);

    // Get follow button
    const followButton = page.getByTestId('follow-button');
    
    // Check initial text
    await expect(followButton).toHaveText('Follow');

    // Click follow
    await followButton.click();

    // Verify UI updates optimistically
    await expect(followButton).toHaveText('Following');
    await expect(followButton).toHaveClass(/btn-primary/);

    // Refresh page to ensure persistence
    // Wait longer to ensure server action completes
    await page.waitForTimeout(2000);
    await page.reload();

    const reloadedFollowButton = page.getByTestId('follow-button');
    await expect(reloadedFollowButton).toHaveText('Following');
    await expect(reloadedFollowButton).toHaveClass(/btn-primary/);
  });

  test('user can view likers list modal on poem page', async ({ page }) => {
    await page.goto('/');

    // Get the first poem card
    const firstPoemCard = page.locator('.poem-card-featured').first();
    
    // Navigate to poem detail page by clicking the card
    await Promise.all([
      page.waitForNavigation(),
      firstPoemCard.click()
    ]);

    // Find the like count button
    const likeCountButton = page.locator('button:has-text("likes")');
    await likeCountButton.click();

    // Verify modal opens
    const modal = page.locator('h3:has-text("Likes")');
    await expect(modal).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button:has(i.ti-x)');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });
});
