import { test, expect } from '@playwright/test';

test.describe('Settings and Profile Features', () => {
  const timestamp = Date.now();
  const testEmail = `settings_${timestamp}@test.com`;

  // Helper to register a user
  async function registerUser(page, name, email, password) {
    await page.goto('/signup');
    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await Promise.all([
      page.waitForURL('**/login'),
      page.click('button[type="submit"]')
    ]);
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await Promise.all([
      page.waitForURL('**/'),
      page.click('button[type="submit"]')
    ]);
    await expect(page.locator('.avatar-warm').first()).toBeVisible();
  }

  test.skip('user can update account settings', async ({ page }) => {
    await registerUser(page, 'Settings User', testEmail, 'password123');

    // Go to settings
    await page.goto('/settings/account');
    
    // Toggle Private Account
    const privateToggle = page.locator('label', { hasText: 'Private Account' }).locator('input[type="checkbox"]');
    await expect(privateToggle).not.toBeChecked();
    await privateToggle.check();
    
    // Save
    await page.click('button:has-text("Save Settings")');
    await expect(page.locator('text=Settings updated successfully')).toBeVisible();

    // Reload page to verify persistence
    await page.reload();
    const privateToggleReloaded = page.locator('label', { hasText: 'Private Account' }).locator('input[type="checkbox"]');
    await expect(privateToggleReloaded).toBeChecked();
  });

  test('user can delete their account', async ({ page }) => {
    // Generate unique email for this test
    const deleteEmail = `delete_me_${Date.now()}@test.com`;
    await registerUser(page, 'Delete Me', deleteEmail, 'password123');

    // Go to settings
    await page.goto('/settings/account');
    
    // Click Delete Account
    await page.click('button:has-text("Delete Account")');

    // Click Confirm on the custom modal
    await page.click('button:has-text("Confirm")');

    // Wait to see if there's an error message on screen
    await page.waitForTimeout(2000);
    const hasError = await page.locator('.form-error').isVisible();
    if (hasError) {
      const text = await page.locator('.form-error').textContent();
      console.log("Form error:", text);
      throw new Error(`Failed to delete account: ${text}`);
    }

    // Verify user is redirected to home page
    await page.waitForURL(url => url.pathname === '/');
    
    // Force reload to bypass Next.js client router cache
    await page.reload();
    
    // Check that we are logged out (avatar shouldn't be visible)
    await expect(page.locator('.avatar-warm').first()).not.toBeVisible();
    
    // Attempt to login with deleted credentials should fail
    await page.goto('/login');
    await page.fill('input[type="email"]', deleteEmail);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show error and not redirect
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});
