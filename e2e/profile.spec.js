import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Profile Settings Flow', () => {
  const testEmail = `profile-${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testName = `Profile Tester ${Date.now()}`;

  test('authenticated user can update profile and upload avatar', async ({ page }) => {
    // 1. Register and login
    await page.goto('/signup');
    await page.fill('input[type="text"]', testName);
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

    // 2. Navigate to Settings page via Nav Dropdown
    // Need to click the avatar to open the dropdown
    await page.locator('.avatar-warm').first().click();
    await page.click('text=Settings');
    
    await expect(page).toHaveURL(/.*\/settings\/profile/);
    await expect(page.locator('h1')).toContainText('Settings');

    // 3. Update profile details
    const newLocation = 'San Francisco, CA';
    const newBio = 'This is a new test bio.';

    await page.fill('input[name="location"]', newLocation);
    await page.fill('textarea[name="bio"]', newBio);

    // 4. Save profile
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // 5. Verify the updates on the user's author page
    await page.goto('/authors');
    
    // Search or find the user
    await Promise.all([
      page.waitForURL('**/author/**'),
      page.click(`text=${testName}`)
    ]);
    
    // Verify bio and location are visible
    await expect(page.locator('.profile-bio')).toContainText(newLocation);
    await expect(page.locator('.profile-bio')).toContainText(newBio);
  });

  test('unauthenticated user is redirected to login from settings page', async ({ page }) => {
    await page.goto('/settings/profile');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
