import { test, expect } from '@playwright/test';

test.describe('Export / Download Flow', () => {
  // ── Existing export page tests ──────────────────────────────

  test('export page renders and preview modal opens', async ({ page }) => {
    // Navigate directly to an export page for a specific poem ID
    // We know 'hope-is-the-thing' exists in our dummy data from data.js
    await page.goto('/export/hope-is-the-thing');

    // Verify header and poem title are visible
    await expect(page.locator('text=Choose a layout for \"Hope is the thing with feathers\"')).toBeVisible();

    // Verify the layout cards are visible
    await expect(page.locator('.template-card').first()).toBeVisible();

    // Click the Preview button
    await page.click('button:has-text("Preview")');

    // Verify the modal appears
    const modal = page.locator('.preview-modal');
    await expect(modal).toBeVisible();

    // Verify the image inside the modal
    await expect(modal.locator('img')).toBeVisible();

    // Close the modal by clicking the X button
    await modal.locator('button').click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  // ── New: Export modal triggered from poem cards ─────────────

  test('clicking Download in a poem card share dropdown opens the export modal', async ({ page }) => {
    await page.goto('/');

    // Find the first regular poem card
    const regularCards = page.locator('[data-testid="poem-card"]');
    await expect(regularCards.first()).toBeVisible();

    // Open the share menu
    const shareMenuBtn = regularCards.first().locator('.poem-card-share-menu-btn');
    await shareMenuBtn.click();

    // Dropdown should appear
    const dropdown = regularCards.first().locator('.poem-card-share-dropdown');
    await expect(dropdown).toBeVisible();

    // Click the Download menu item
    const downloadItem = dropdown.locator('[role="menuitem"]:has-text("Download")');
    await downloadItem.click();

    // The export modal overlay should now be visible (not a page navigation)
    const exportModal = page.locator('[data-testid="export-modal"]');
    await expect(exportModal).toBeVisible({ timeout: 5000 });

    // Modal contains template cards
    await expect(exportModal.locator('.template-card').first()).toBeVisible();

    // Close modal with the X button
    await exportModal.locator('button[aria-label="Close export modal"]').click();
    await expect(exportModal).not.toBeVisible();

    // Should still be on the home page (no navigation occurred)
    await expect(page).toHaveURL('/');
  });

  test('clicking Download in a featured poem card share dropdown opens the export modal', async ({ page }) => {
    await page.goto('/');

    const featuredCards = page.locator('[data-testid="featured-poem-card"]');
    const featuredCount = await featuredCards.count();

    if (featuredCount === 0) {
      test.skip();
      return;
    }

    // Open the share menu on the first featured card
    const shareMenuBtn = featuredCards.first().locator('.poem-card-share-menu-btn');
    await shareMenuBtn.click();

    // Click Download
    const dropdown = featuredCards.first().locator('.poem-card-share-dropdown');
    await expect(dropdown).toBeVisible();
    await dropdown.locator('[role="menuitem"]:has-text("Download")').click();

    // Export modal opens
    const exportModal = page.locator('[data-testid="export-modal"]');
    await expect(exportModal).toBeVisible({ timeout: 5000 });

    // Still on home page
    await expect(page).toHaveURL('/');
  });

  test('clicking Download in poem page share dropdown opens the export modal', async ({ page }) => {
    // Navigate to first available poem
    await page.goto('/');
    const firstCard = page.locator('[data-testid="poem-card"], [data-testid="featured-poem-card"]').first();
    await firstCard.click();
    await page.waitForURL('**/poem/**');

    // Open the share dropdown on the poem page
    await page.click('button[aria-label="Share poem"]');
    const dropdown = page.locator('.poem-page-share-dropdown');
    await expect(dropdown).toBeVisible();

    // Click Download
    await dropdown.locator('[role="menuitem"]:has-text("Download")').click();

    // Export modal should be open
    const exportModal = page.locator('[data-testid="export-modal"]');
    await expect(exportModal).toBeVisible({ timeout: 5000 });

    // Template cards visible
    await expect(exportModal.locator('.template-card').first()).toBeVisible();

    // Close with Escape key
    await page.keyboard.press('Escape');
    await expect(exportModal).not.toBeVisible();
  });

  test('export modal has all 5 template styles', async ({ page }) => {
    await page.goto('/');

    const regularCards = page.locator('[data-testid="poem-card"]');
    await expect(regularCards.first()).toBeVisible();

    await regularCards.first().locator('.poem-card-share-menu-btn').click();
    await regularCards.first().locator('[role="menuitem"]:has-text("Download")').click();

    const exportModal = page.locator('[data-testid="export-modal"]');
    await expect(exportModal).toBeVisible({ timeout: 5000 });

    // All 5 templates should be present
    await expect(exportModal.locator('text=Site view')).toBeVisible();
    await expect(exportModal.locator('text=Minimal')).toBeVisible();
    await expect(exportModal.locator('text=Dark cinematic')).toBeVisible();
    await expect(exportModal.locator('text=Love letter')).toBeVisible();
    await expect(exportModal.locator('text=Story format')).toBeVisible();
  });
});
