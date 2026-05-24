import { test, expect } from '@playwright/test';

test.describe('Content Creation Flow', () => {
  const testEmail = `create-${Date.now()}@example.com`;
  const testPassword = 'password123';

  test.beforeAll(async ({ browser }) => {
    // Setup logic can go here if needed
  });

  test('authenticated user can create a poem and is redirected to it', async ({ page }) => {
    // Register and login first
    await page.goto('/signup');
    await page.fill('input[type="text"]', 'Creator User');
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

    // Navigate to write page via Navbar
    await page.click('text=Write');
    await expect(page).toHaveURL(/.*\/write/);
    await expect(page.locator('h1')).toContainText('Write');

    // Fill out the poem form
    const poemTitle = `Automated Poem ${Date.now()}`;
    const poemBody = `This is a test poem.\nIt has multiple lines.\nHope it works!`;
    const poemTags = `automated, test, playwright`;

    await page.fill('input[name="title"]', poemTitle);
    await page.fill('textarea[name="fullText"]', poemBody);
    await page.fill('input[name="tags"]', poemTags);

    // Submit form
    await Promise.all([
      page.waitForURL('**/poem/*'),
      page.click('button[type="submit"]')
    ]);

    // Verify redirection and content
    await expect(page.locator('h1')).toContainText(poemTitle);
    const bodyText = await page.locator('.poem-viewer-text').innerText();
    expect(bodyText).toContain('This is a test poem.');
    expect(bodyText).toContain('It has multiple lines.');
    expect(bodyText).toContain('Hope it works!');
  });

  test('unauthenticated user is redirected to login from write page', async ({ page }) => {
    await page.goto('/write');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
