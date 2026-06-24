import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Poem Deletion Flow', () => {
  const testEmail = `delete-${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testName = `Delete Tester`;

  test('user can delete their own poem', async ({ page }) => {
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

    // 2. Create a poem
    await page.goto('/write');
    await page.fill('input[name="title"]', 'Poem to Delete');
    await page.fill('textarea[name="fullText"]', 'This poem will be deleted shortly.');
    
    await page.click('button[name="publish"]');
    await expect(page).toHaveURL(/.*\/poem\/.*/);
    
    const poemUrl = page.url();
    
    // 3. Go to edit page
    await page.click('text=Edit');
    await expect(page).toHaveURL(/.*\/edit\/.*/);

    // 4. Delete the poem
    await page.click('button:has-text("Delete")');

    // 5. Verify redirect to home
    await expect(page).toHaveURL(/.*\/$/, { timeout: 15000 });
  });
});
