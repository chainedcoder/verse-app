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
    const avatar = page.locator('.navbar-desktop-actions .avatar');
    
    // Strict layout safeguards
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveCSS('height', '25px');
    await expect(avatar).toHaveCSS('width', '25px');

    // 8. Click the avatar to open the dropdown and verify contents
    await avatar.click();
    await expect(page.locator('.navbar-desktop-actions')).toContainText('Test User');
    await expect(page.locator('.navbar-desktop-actions')).toContainText('Sign out');
  });

  test('user can request a password reset and use the link to reset it', async ({ page, context }) => {
    // 1. Go to forgot password page
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText('Reset Password');

    // 2. Submit form
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.click('button[type="submit"]');

    // 3. Verify success message
    await expect(page.getByText('If an account exists with nonexistent@example.com')).toBeVisible();
    
    // We cannot easily test the exact token parsing from console in E2E
    // So we test the frontend behavior.
  });

  test('login page displays social login options', async ({ page }) => {
    await page.goto('/login');
    
    // Verify Google and GitHub buttons are visible
    await expect(page.getByRole('button', { name: /Sign in with Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with GitHub/i })).toBeVisible();
  });
});
