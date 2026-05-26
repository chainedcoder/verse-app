import { test, expect } from '@playwright/test';

test.describe('Web Share API', () => {
  test('share button on poem card copies link to clipboard when Web Share API is unavailable', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    await expect(page.locator('.poem-card-container').first()).toBeVisible();

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Simulate no Web Share API (desktop environment)
    await page.evaluate(() => {
      delete navigator.share;
    });

    // Click the Share button on the first poem card (individual share button, visible on desktop)
    const shareBtn = page.locator('.poem-card-share-btn').first();
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // After clicking, icon changes to check (copied state)
    await expect(page.locator('.poem-card-share-btn .ti-check').first()).toBeVisible({ timeout: 3000 });
  });

  test('share button triggers navigator.share when Web Share API is available', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.poem-card-container').first()).toBeVisible();

    // Track share calls
    const shareCalls = [];
    await page.exposeFunction('recordShare', (data) => shareCalls.push(data));

    // Mock navigator.share
    await page.evaluate(() => {
      navigator.share = async (data) => {
        window.recordShare(data);
        return Promise.resolve();
      };
    });

    const shareBtn = page.locator('.poem-card-share-btn').first();
    await shareBtn.click();

    // Give the async share handler time to run
    await page.waitForTimeout(500);

    expect(shareCalls.length).toBeGreaterThan(0);
    expect(shareCalls[0]).toHaveProperty('url');
    expect(shareCalls[0].url).toContain('/poem/');
  });

  test('share button in poem detail page uses Web Share API when available', async ({ page }) => {
    // Navigate to any poem page
    await page.goto('/');
    const firstPoem = page.locator('.poem-card-container').first();
    await expect(firstPoem).toBeVisible();
    await firstPoem.click();
    await page.waitForURL('**/poem/**');

    const shareCalls = [];
    await page.exposeFunction('recordShare', (data) => shareCalls.push(data));

    await page.evaluate(() => {
      navigator.share = async (data) => {
        window.recordShare(data);
        return Promise.resolve();
      };
    });

    // Click the Share button on poem detail page
    await page.click('button[aria-label="Share poem"]');
    await page.waitForTimeout(500);

    expect(shareCalls.length).toBeGreaterThan(0);
    expect(shareCalls[0].url).toContain('/poem/');
  });
});
