const { test, expect } = require('@playwright/test');

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
});
