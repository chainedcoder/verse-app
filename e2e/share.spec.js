import { test, expect } from '@playwright/test';

test.describe('Web Share API', () => {
  test('share button on poem card copies link to clipboard when Web Share API is unavailable', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    await expect(page.locator('[data-testid="poem-card"]').first()).toBeVisible();

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Simulate no Web Share API (desktop environment)
    await page.evaluate(() => {
      delete navigator.share;
    });

    // Open the combined share menu on the first poem card
    const menuBtn = page.locator('.poem-card-share-menu-btn').first();
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Click "Copy link" from the dropdown
    const copyLinkItem = page.locator('.poem-card-share-dropdown [role="menuitem"]:has-text("Copy link")').first();
    await expect(copyLinkItem).toBeVisible();
    await copyLinkItem.click();

    // After copying, the share button icon changes to check (copied state)
    await expect(page.locator('.poem-card-share-menu-btn .ti-check').first()).toBeVisible({ timeout: 3000 });
  });

  test('share button triggers navigator.share when Web Share API is available', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="poem-card"]').first()).toBeVisible();

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

    // Open the share menu and click "Others" (which calls navigator.share)
    const menuBtn = page.locator('.poem-card-share-menu-btn').first();
    await menuBtn.click();

    const othersItem = page.locator('.poem-card-share-dropdown [role="menuitem"]:has-text("Others")').first();
    await othersItem.click();

    // Give the async share handler time to run
    await page.waitForTimeout(500);

    expect(shareCalls.length).toBeGreaterThan(0);
    expect(shareCalls[0]).toHaveProperty('url');
    expect(shareCalls[0].url).toContain('/poem/');
  });

  test('share button in poem detail page uses Web Share API when available', async ({ page }) => {
    // Navigate to any poem page
    await page.goto('/');
    const firstPoem = page.locator('[data-testid="poem-card"]').first();
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

    // Open the share dropdown on the poem detail page
    await page.click('button[aria-label="Share poem"]');

    // Click "Others" from the dropdown to trigger navigator.share
    const othersItem = page.locator('.poem-page-share-dropdown [role="menuitem"]:has-text("Others")');
    await expect(othersItem).toBeVisible({ timeout: 3000 });
    await othersItem.click();

    await page.waitForTimeout(500);

    expect(shareCalls.length).toBeGreaterThan(0);
    expect(shareCalls[0].url).toContain('/poem/');
  });
});
