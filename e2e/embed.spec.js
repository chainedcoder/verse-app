import { test, expect } from '@playwright/test';

test.describe('Embed Feature', () => {
  const testEmail = `embed-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let poemUrl = '';

  test.beforeAll(async ({ browser }) => {
    // Create a test user and poem to embed
    const page = await browser.newPage();
    await page.goto('/signup');
    await page.fill('input[type="text"]', 'Embed Test User');
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

    // Create a poem
    await page.goto('/write');
    await page.fill('input[name="title"]', `Embed Test Poem ${Date.now()}`);
    await page.fill('textarea[name="fullText"]', 'Lines for embedding.\nSecond line here.');
    await Promise.all([
      page.waitForURL('**/poem/*'),
      page.click('button[name="publish"]')
    ]);
    poemUrl = page.url();
    await page.close();
  });

  test('embed page renders poem content without nav or sidebar', async ({ page }) => {
    expect(poemUrl).toMatch(/\/poem\//);
    const poemId = poemUrl.split('/poem/')[1];
    await page.goto(`/poem/${poemId}/embed`);

    // Should contain poem title in an h1
    await expect(page.locator('h1')).toBeVisible();

    // Should show the poem body text
    await expect(page.locator('.embed-body')).toBeVisible();
    await expect(page.locator('.embed-body')).toContainText('Lines for embedding.');

    // Embed page should show embed-specific card structure
    await expect(page.locator('.embed-card')).toBeVisible();

    // Should NOT have the main feed or sidebar (no app content outside the poem)
    await expect(page.locator('.feed-layout')).toHaveCount(0);
    await expect(page.locator('.feed-sidebar')).toHaveCount(0);

    // Should have the "verse" attribution link
    await expect(page.locator('.verse-logo')).toBeVisible();
  });

  test('embed modal opens and shows iframe snippet with correct URL', async ({ page }) => {
    expect(poemUrl).toMatch(/\/poem\//);
    await page.goto(poemUrl);

    // Click the Embed button
    await page.click('button[aria-label="Get embed code"]');

    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toContainText('Embed this poem');

    // Embed code textarea should contain an iframe
    const embedCode = await page.locator('[data-testid="embed-code"]').inputValue();
    expect(embedCode).toContain('<iframe');
    expect(embedCode).toContain('/embed');

    // Copy code button should be present
    await expect(page.locator('button', { hasText: /Copy code/i })).toBeVisible();

    // Preview link should open embed page
    const previewLink = page.locator('a', { hasText: /Preview/i });
    await expect(previewLink).toBeVisible();
  });

  test('embed modal can be closed by clicking outside', async ({ page }) => {
    expect(poemUrl).toMatch(/\/poem\//);
    await page.goto(poemUrl);

    await page.click('button[aria-label="Get embed code"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Click the backdrop (outside the dialog card)
    await page.mouse.click(10, 10);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});
