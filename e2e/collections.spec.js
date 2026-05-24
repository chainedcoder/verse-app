import { test, expect } from '@playwright/test';

test.describe('Collections Flow', () => {
  const testEmail = `collections-${Date.now()}@example.com`;
  const testPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    // Setup logic can go here if needed
  });

  test('authenticated user can create a collection and add a poem to it', async ({ page }) => {
    // Register and login first
    await page.goto('/signup');
    await page.fill('input[type="text"]', 'Collection User');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await Promise.all([
      page.waitForURL(/.*\/login/),
      page.click('button[type="submit"]')
    ]);

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    await Promise.all([
      page.waitForURL('http://localhost:3000/'),
      page.click('button[type="submit"]')
    ]);

    // Create a new collection
    await page.goto('/collections/create');
    
    const collectionName = `My E2E Collection ${Date.now()}`;
    await page.fill('input[name="name"]', collectionName);
    await page.fill('textarea[name="description"]', 'A test collection');
    
    await Promise.all([
      page.waitForURL(/.*\/collections\/.+/),
      page.click('button[type="submit"]')
    ]);

    await expect(page.locator('h1')).toContainText(collectionName);
    await expect(page.locator('body')).toContainText('This collection is empty.');

    // Go to a poem and add it to the collection
    await page.goto('/');
    
    // Get the first poem card link
    const firstPoemLink = page.locator('.card-clickable').first();
    
    await Promise.all([
      page.waitForURL(/.*\/poem\/.+/),
      firstPoemLink.click()
    ]);

    // Click "Save"
    await page.click('button:has-text("Save")');
    
    // Check the collection in the modal
    const collectionCheckbox = page.locator(`input[type="checkbox"]`);
    await collectionCheckbox.check();

    // Verify toast
    await expect(page.locator('text=Saved to collection')).toBeVisible();

    // Go back to collections
    await page.goto('/collections');
    
    // Click the new collection
    await page.click(`text=${collectionName}`);
    
    // Verify the poem is there (the collection shouldn't be empty anymore)
    await expect(page.locator('body')).not.toContainText('This collection is empty.');
    await expect(page.locator('.card').first()).toBeVisible();
  });
});
