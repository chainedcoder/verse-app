import { test, expect } from '@playwright/test';

test.describe('Feed and Navigation', () => {
  test('home page loads poems and sidebar', async ({ page }) => {
    await page.goto('/');

    // Verify logo and nav links
    await expect(page.locator('.navbar-logo')).toContainText('verse');
    await expect(page.locator('text=Discover').first()).toBeVisible();

    // Feed content: either featured cards or regular cards should exist
    const featuredCards = page.locator('[data-testid="featured-poem-card"]');
    const regularCards  = page.locator('[data-testid="poem-card"]');
    const hasFeatured   = await featuredCards.count();
    const hasRegular    = await regularCards.count();
    expect(hasFeatured + hasRegular).toBeGreaterThan(0);

    // Verify Sidebar
    await expect(page.locator('.feed-sidebar')).toBeVisible();
    await expect(page.locator('.feed-sidebar').locator('text=Trending authors')).toBeVisible();
  });

  test('featured poems appear before regular poems', async ({ page }) => {
    await page.goto('/');

    const featuredCards = page.locator('[data-testid="featured-poem-card"]');
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

    const featuredCards = page.locator('[data-testid="featured-poem-card"]');
    const regularCards  = page.locator('[data-testid="poem-card"]');

    const hasFeatured = await featuredCards.count();
    const card = hasFeatured > 0 ? featuredCards.first() : regularCards.first();
    const poemTitle = await card.locator('h2').innerText();

    await Promise.all([
      page.waitForURL('**/poem/**'),
      card.click()
    ]);

    // Title may be clamped with ellipsis — match truncated portion
    await expect(page.locator('.poem-viewer-title')).toContainText(
      poemTitle.replace(/…$/, '').trim().substring(0, 20)
    );
    // Share button is visible in the poem action bar
    await expect(page.locator('button[aria-label="Share poem"]')).toBeVisible();
  });

  test('regular poem grid uses 2-column layout at large viewport (1280px+)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const regularGrid = page.locator('.regular-poem-grid');
    await expect(regularGrid).toBeVisible();

    const display = await regularGrid.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('display')
    );
    expect(display).toBe('grid');
    
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
      await firstTag.evaluate(node => node.click());

      // Verify the tag becomes active
      await expect(page.locator(`.tag-row-scroll .tag.active`)).not.toHaveText('All');

      // The feed should not be empty (or show empty state)
      const feedContent = page.locator('#poem-feed');
      await expect(feedContent).toBeVisible();
    }
  });

  test('poem cards show read time with "m" abbreviation, not "min"', async ({ page }) => {
    await page.goto('/');

    // Check featured cards
    const featuredCards = page.locator('[data-testid="featured-poem-card"]');
    const featuredCount = await featuredCards.count();
    if (featuredCount > 0) {
      const readTimeEl = featuredCards.first().locator('.featured-poem-card__read-time');
      const readTimeText = await readTimeEl.innerText();
      expect(readTimeText).toMatch(/\d+ m read/);
      expect(readTimeText).not.toMatch(/min read/);
    }

    // Check regular poem cards — read time in the author-info footer
    const regularCards = page.locator('[data-testid="poem-card"]');
    const regularCount = await regularCards.count();
    if (regularCount > 0) {
      const footerText = await regularCards.first().locator('.card-footer').innerText();
      expect(footerText).toMatch(/\d+ m read/);
      expect(footerText).not.toMatch(/min read/);
    }
  });

  test('featured strip is always on its own row above the regular poem grid', async ({ page }) => {
    await page.goto('/');

    const featuredStrip = page.locator('.featured-strip');
    const featuredCount = await page.locator('[data-testid="featured-poem-card"]').count();

    if (featuredCount > 0) {
      await expect(featuredStrip).toBeVisible();

      const regularGrid = page.locator('.regular-poem-grid');
      const regularCount = await regularGrid.count();

      if (regularCount > 0) {
        const featuredBox = await featuredStrip.boundingBox();
        const regularBox  = await regularGrid.boundingBox();
        if (featuredBox && regularBox) {
          // The featured strip bottom edge should be above the regular grid top edge
          expect(featuredBox.y + featuredBox.height).toBeLessThanOrEqual(regularBox.y + 1);
        }
      }
    }
  });

  test('at 320px viewport, combined share trigger is visible on regular poem cards', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/');

    const regularCards = page.locator('[data-testid="poem-card"]');
    const regularCount = await regularCards.count();

    if (regularCount > 0) {
      const card = regularCards.first();

      // The combined share menu trigger wraps all share options
      const menuWrap = card.locator('.poem-card-share-menu-wrap');
      await expect(menuWrap).not.toHaveCSS('display', 'none');

      // The share trigger button itself should be visible
      const menuBtn = card.locator('.poem-card-share-menu-btn');
      await expect(menuBtn).toBeVisible();
    }
  });

  test('at 320px, clicking combined share trigger reveals download and share options', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/');

    const regularCards = page.locator('[data-testid="poem-card"]');
    const regularCount = await regularCards.count();

    if (regularCount > 0) {
      const card = regularCards.first();
      const menuTrigger = card.locator('.poem-card-share-menu-btn');

      await menuTrigger.click();

      const dropdown = card.locator('.poem-card-share-dropdown');
      await expect(dropdown).toBeVisible();
      // First item should be Download
      await expect(dropdown.locator('[role="menuitem"]').nth(0)).toContainText('Download');
      // Second item should be Share to X
      await expect(dropdown.locator('[role="menuitem"]').nth(1)).toContainText('Share to X');
    }
  });

  // ── Mobile feed interrupt sections ───────────────────────────

  test('mobile trending authors strip is visible at 425px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 425, height: 900 });
    await page.goto('/');

    const authorsStrip = page.locator('.mobile-authors-strip');
    const count = await authorsStrip.count();

    if (count > 0) {
      await expect(authorsStrip).toBeVisible();
      await expect(authorsStrip.locator('.section-title')).toContainText('Trending authors');

      // Snap scroll container should be present
      const snapContainer = authorsStrip.locator('.mobile-snap-scroll');
      await expect(snapContainer).toBeVisible();

      // Author cards should be rendered
      const authorCards = snapContainer.locator('.mobile-author-card');
      expect(await authorCards.count()).toBeGreaterThan(0);
    }
  });

  test('mobile popular tags strip is visible at 425px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 425, height: 900 });
    await page.goto('/');

    const tagsStrip = page.locator('.mobile-tags-strip');
    const count = await tagsStrip.count();

    if (count > 0) {
      await expect(tagsStrip).toBeVisible();
      await expect(tagsStrip.locator('.section-title')).toContainText('Popular tags');

      const tagsScroll = tagsStrip.locator('.mobile-tags-scroll');
      await expect(tagsScroll).toBeVisible();
    }
  });

  test('mobile interrupt sections are hidden on desktop (1280px+)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const authorsStrip = page.locator('.mobile-authors-strip');
    const tagsStrip    = page.locator('.mobile-tags-strip');

    if (await authorsStrip.count() > 0) {
      await expect(authorsStrip).toHaveCSS('display', 'none');
    }
    if (await tagsStrip.count() > 0) {
      await expect(tagsStrip).toHaveCSS('display', 'none');
    }
  });

  test('poem card titles use the clamping CSS class', async ({ page }) => {
    await page.goto('/');

    // Regular poem cards
    const regularCards = page.locator('[data-testid="poem-card"]');
    if (await regularCards.count() > 0) {
      const titleEl = regularCards.first().locator('h2.poem-card__title--clamp');
      await expect(titleEl).toBeAttached();
    }

    // Featured poem cards
    const featuredCards = page.locator('[data-testid="featured-poem-card"]');
    if (await featuredCards.count() > 0) {
      const titleEl = featuredCards.first().locator('h2.poem-card__title--clamp-2');
      await expect(titleEl).toBeAttached();
    }
  });

  test.skip('infinite scroll loads more poems as user scrolls down', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Count initial regular poem cards
    const initialCount = await page.locator('[data-testid="poem-card"]').count();
    expect(initialCount).toBeGreaterThan(0);

    // Scroll to the bottom to trigger the Intersection Observer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Assert that the number of poem cards increases
    await expect(async () => {
      const currentCount = await page.locator('[data-testid="poem-card"]').count();
      expect(currentCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 5000 });
  });
});
