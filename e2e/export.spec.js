import { test, expect } from '@playwright/test';

test.describe('Export Page', () => {
  test('export page renders and preview modal opens', async ({ page }) => {
    // Navigate directly to an export page for a specific poem ID
    // We know 'hope-is-the-thing' exists in our dummy data from data.js
    await page.goto('/export/hope-is-the-thing');

    // Verify header and poem title are visible
    await expect(page.locator('text=Choose a layout for "Hope is the thing with feathers"')).toBeVisible();

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
});
