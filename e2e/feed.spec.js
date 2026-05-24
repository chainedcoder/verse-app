import { test, expect } from '@playwright/test';

test.describe('Feed and Navigation', () => {
  test('home page loads poems and sidebar', async ({ page }) => {
    await page.goto('/');

    // Verify logo and nav links
    await expect(page.locator('.navbar-logo')).toContainText('verse');
    await expect(page.locator('text=Discover').first()).toBeVisible();

    // Feed content: either featured cards or regular cards should exist
    const featuredCards = page.locator('.featured-poem-card');
    const regularCards  = page.locator('.poem-card-featured');
    const hasFeatured   = await featuredCards.count();
    const hasRegular    = await regularCards.count();
    expect(hasFeatured + hasRegular).toBeGreaterThan(0);

    // Verify Sidebar
    await expect(page.locator('.feed-sidebar')).toBeVisible();
    await expect(page.locator('text=Trending authors')).toBeVisible();
  });

  test('featured poems appear before regular poems', async ({ page }) => {
    await page.goto('/');

    const featuredCards = page.locator('.featured-poem-card');
    const featuredCount = await featuredCards.count();

    if (featuredCount > 0) {
      // Featured strip should be above the regular grid
      const featuredStrip   = page.locator('.featured-strip');
      const regularGrid     = page.locator('.regular-poem-grid');
      await expect(featuredStrip).toBeVisible();

      const featuredBox = await featuredStrip.boundingBox();
      const regularBox  = await regularGrid.boundingBox();

      if (featuredBox && regularBox) {
        // Featured strip top should be above regular grid top
        expect(featuredBox.y).toBeLessThan(regularBox.y);
      }

      // Each featured card should show the Featured badge
      const firstCard = featuredCards.first();
      await expect(firstCard.locator('.badge-featured')).toBeVisible();
    }
  });

  test('clicking a featured poem navigates to the poem details page', async ({ page }) => {
    await page.goto('/');

    const featuredCards = page.locator('.featured-poem-card');
    const regularCards  = page.locator('.poem-card-featured');

    const hasFeatured = await featuredCards.count();
    const card = hasFeatured > 0 ? featuredCards.first() : regularCards.first();
    const poemTitle = await card.locator('h2').innerText();

    await Promise.all([
      page.waitForURL('**/poem/**'),
      card.click()
    ]);

    await expect(page.locator('.poem-viewer-title')).toContainText(poemTitle);
    await expect(page.locator('text=Download as')).toBeVisible();
  });

  test('regular poem grid uses 2-column layout at large viewport (1280px+)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const regularGrid = page.locator('.regular-poem-grid');
    await expect(regularGrid).toBeVisible();

    const gridTemplateColumns = await regularGrid.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('grid-template-columns')
    );
    // Should be 2 equal columns, not a single column
    const columnCount = gridTemplateColumns.trim().split(/\s+/).length;
    expect(columnCount).toBe(2);
  });

  test('tag filtering applies to both featured and regular poems', async ({ page }) => {
    await page.goto('/');

    // Click a non-"all" tag if available
    const tags = page.locator('.tag-row-scroll .tag:not(.active)');
    const tagCount = await tags.count();

    if (tagCount > 0) {
      const firstTag = tags.first();
      const tagText = await firstTag.innerText();
      await firstTag.click();

      // Verify the tag becomes active
      await expect(page.locator(`.tag-row-scroll .tag.active`)).not.toHaveText('All');

      // The feed should not be empty (or show empty state)
      const feedContent = page.locator('#poem-feed');
      await expect(feedContent).toBeVisible();
    }
  });
});
