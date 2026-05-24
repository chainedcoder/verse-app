import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';

  test('user can register, log in, and see their name in the navbar', async ({ page }) => {
    // 1. Go to signup page
    await page.goto('/signup');
    await expect(page.locator('h1')).toContainText('Create account');

    // 2. Fill out signup form
    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // 3. Submit registration
    await Promise.all([
      page.waitForURL('**/login'),
      page.click('button[type="submit"]')
    ]);

    // 4. Verify redirected to login page
    await expect(page.locator('h1')).toContainText('Welcome back');

    // 5. Fill out login form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // 6. Submit login
    await Promise.all([
      page.waitForURL('**/'),
      page.click('button[type="submit"]')
    ]);

    // 7. Verify navbar shows authenticated state
    const navbar = page.locator('.navbar-actions');
    await expect(navbar).toContainText('Test User');
    await expect(navbar).toContainText('Sign out');
  });
});
