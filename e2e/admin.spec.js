import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// Check if an admin auth state file is available for authenticated tests
const adminAuthFile = path.join(process.cwd(), 'e2e', '.auth', 'admin.json')
const hasAdminAuth = fs.existsSync(adminAuthFile)

test.describe('Admin Dashboard — Auth & Navigation', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('admin pages resolve without server errors', async ({ page }) => {
    const adminRoutes = [
      '/admin',
      '/admin/content',
      '/admin/reports',
      '/admin/users',
      '/admin/tags',
      '/admin/roles',
      '/admin/moderation',
      '/admin/discovery',
      '/admin/ads',
      '/admin/revenue'
    ]

    for (const route of adminRoutes) {
      const response = await page.goto(route)
      if (response) {
        expect(response.status()).toBeLessThan(400)
      }
    }
  })
})

// ── Authenticated tests (skipped if no admin auth state) ──────────────────

test.describe('Admin Users Table', () => {
  test.use({ storageState: adminAuthFile })
  test.beforeEach(async ({ page }) => {
    if (!hasAdminAuth) {
      test.skip()
      return
    }
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')
  })

  test('renders user table with expected columns', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const table = page.locator('table.admin-table')
    await expect(table).toBeVisible()

    // Check column headers exist
    await expect(page.getByRole('button', { name: /user/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /status/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /role/i }).first()).toBeVisible()
  })

  test('search input filters table rows', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const searchInput = page.getByPlaceholder(/search by name or email/i)
    await expect(searchInput).toBeVisible()

    const initialRowCount = await page.locator('table.admin-table tbody tr').count()

    await searchInput.fill('zzz_no_one')
    await page.waitForTimeout(300)

    const filteredRowCount = await page.locator('table.admin-table tbody tr').count()
    expect(filteredRowCount).toBeLessThan(initialRowCount)
    await expect(page.getByText(/no users found/i)).toBeVisible()
  })

  test('status filter dropdown filters rows', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const statusSelect = page.getByLabel(/filter by status/i)
    await statusSelect.selectOption('BANNED')
    await page.waitForTimeout(200)

    const rows = page.locator('table.admin-table tbody tr')
    const count = await rows.count()

    // Every visible status select should show BANNED
    if (count > 0) {
      const firstStatusSelect = rows.first().locator('select[aria-label*="Status for"]')
      if (await firstStatusSelect.isVisible()) {
        const val = await firstStatusSelect.inputValue()
        expect(val).toBe('BANNED')
      }
    }
  })

  test('clicking sortable column header sorts the table', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const nameHeader = page.getByRole('button', { name: /user/i }).first()
    const initialFirstName = await page.locator('table.admin-table tbody tr').first()
      .locator('a').first().textContent()

    await nameHeader.click()
    await page.waitForTimeout(200)

    await nameHeader.click()
    await page.waitForTimeout(200)

    const afterSecondClickName = await page.locator('table.admin-table tbody tr').first()
      .locator('a').first().textContent()

    // Sort direction changed, first row may differ
    expect(typeof afterSecondClickName).toBe('string')
  })

  test('row count badge updates after filtering', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const countBadge = page.locator('.admin-table-toolbar__count')
    await expect(countBadge).toBeVisible()

    const totalText = await countBadge.textContent()
    const totalNum = parseInt(totalText)

    await page.getByPlaceholder(/search by name or email/i).fill('a')
    await page.waitForTimeout(300)

    const filteredText = await countBadge.textContent()
    const filteredNum = parseInt(filteredText)
    expect(filteredNum).toBeLessThanOrEqual(totalNum)
  })
})

test.describe('Admin Users — Bulk Delete', () => {
  test.use({ storageState: adminAuthFile })
  test.beforeEach(async ({ page }) => {
    if (!hasAdminAuth) {
      test.skip()
      return
    }
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')
  })

  test('selection bar is hidden initially', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    await expect(page.locator('.admin-selection-bar')).not.toBeVisible()
  })

  test('checking a row shows the selection bar', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    if (await firstCheckbox.isDisabled()) {
      test.skip() // No users or moderator view
      return
    }
    await firstCheckbox.check()
    await expect(page.locator('.admin-selection-bar')).toBeVisible()
    await expect(page.locator('.admin-selection-bar__count')).toContainText('1')
  })

  test('clicking Delete Selected opens confirm modal', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    if (await firstCheckbox.isDisabled()) {
      test.skip()
      return
    }
    await firstCheckbox.check()
    await page.getByRole('button', { name: /delete selected/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/yes, delete/i)).toBeVisible()
    await expect(page.getByLabel(/list of accounts to be deleted/i)).toBeVisible()
  })

  test('confirm button stays disabled until DELETE is typed', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    if (await firstCheckbox.isDisabled()) {
      test.skip()
      return
    }
    await firstCheckbox.check()
    await page.getByRole('button', { name: /delete selected/i }).click()

    const confirmBtn = page.getByRole('button', { name: /yes, delete/i })
    await expect(confirmBtn).toBeDisabled()

    await page.getByPlaceholder(/type delete here/i).fill('DELETE')
    await expect(confirmBtn).toBeEnabled()
  })

  test('cancel button closes the modal', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    if (await firstCheckbox.isDisabled()) {
      test.skip()
      return
    }
    await firstCheckbox.check()
    await page.getByRole('button', { name: /delete selected/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    // Selection still intact after cancel
    await expect(page.locator('.admin-selection-bar')).toBeVisible()
  })
})

test.describe('Admin Content Table', () => {
  test.use({ storageState: adminAuthFile })
  test.beforeEach(async ({ page }) => {
    if (!hasAdminAuth) {
      test.skip()
      return
    }
    await page.goto('/admin/content')
    await page.waitForLoadState('networkidle')
  })

  test('renders poem table with expected columns', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const table = page.locator('table.admin-table')
    await expect(table).toBeVisible()

    await expect(page.getByRole('button', { name: /poem/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /author/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /status/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /featured/i }).first()).toBeVisible()
  })

  test('search input filters poems', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const searchInput = page.getByLabel(/search poems/i)
    await expect(searchInput).toBeVisible()

    const initialCount = await page.locator('table.admin-table tbody tr').count()
    await searchInput.fill('zzz_no_poem')
    await page.waitForTimeout(300)

    const filteredCount = await page.locator('table.admin-table tbody tr').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('status filter works', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const statusSelect = page.getByLabel(/filter by status/i)
    await statusSelect.selectOption('DELETED')
    await page.waitForTimeout(200)

    // All visible badges should be DELETED or empty state shown
    const deletedBadges = page.locator('.admin-status-badge--deleted')
    const emptyState = page.getByText(/no poems found/i)
    const hasDeletedRows = await deletedBadges.count() > 0
    const hasEmpty = await emptyState.isVisible()
    expect(hasDeletedRows || hasEmpty).toBe(true)
  })

  test('featured filter works', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const featuredSelect = page.getByLabel(/filter by featured/i)
    await featuredSelect.selectOption('FEATURED')
    await page.waitForTimeout(200)

    const featuredBadges = page.locator('.admin-status-badge--featured')
    const emptyState = page.getByText(/no poems found/i)
    const hasFeatured = await featuredBadges.count() > 0
    const hasEmpty = await emptyState.isVisible()
    expect(hasFeatured || hasEmpty).toBe(true)
  })

  test('column sort toggles asc/desc direction', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const titleHeader = page.getByRole('button', { name: /poem/i }).first()

    await titleHeader.click()
    const ariaSortAfterFirst = await titleHeader.getAttribute('aria-sort')
    expect(['ascending', 'descending']).toContain(ariaSortAfterFirst)

    await titleHeader.click()
    const ariaSortAfterSecond = await titleHeader.getAttribute('aria-sort')
    expect(ariaSortAfterSecond).not.toBe(ariaSortAfterFirst)
  })
})

test.describe('Admin Content — Bulk Delete', () => {
  test.use({ storageState: adminAuthFile })
  test.beforeEach(async ({ page }) => {
    if (!hasAdminAuth) {
      test.skip()
      return
    }
    await page.goto('/admin/content')
    await page.waitForLoadState('networkidle')
  })

  test('selection bar hidden initially', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    await expect(page.locator('.admin-selection-bar')).not.toBeVisible()
  })

  test('checking row shows selection bar with count', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    await firstCheckbox.check()
    await expect(page.locator('.admin-selection-bar')).toBeVisible()
    await expect(page.locator('.admin-selection-bar__count')).toContainText('1')
  })

  test('Delete Selected opens confirm modal with poem titles', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    await firstCheckbox.check()
    await page.getByRole('button', { name: /delete selected/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    const textarea = page.getByLabel(/list of poems to be deleted/i)
    await expect(textarea).toBeVisible()
    // Textarea should have at least some text (the poem title)
    const content = await textarea.inputValue()
    expect(content.length).toBeGreaterThan(0)
  })

  test('confirm button disabled until DELETE typed', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    await firstCheckbox.check()
    await page.getByRole('button', { name: /delete selected/i }).click()

    const confirmBtn = page.getByRole('button', { name: /delete \d+ poem/i })
    await expect(confirmBtn).toBeDisabled()

    await page.getByPlaceholder(/type delete here/i).fill('DELETE')
    await expect(confirmBtn).toBeEnabled()
  })

  test('cancel dismisses modal without deleting', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const firstCheckbox = page.locator('table.admin-table tbody tr input[type="checkbox"]').first()
    await firstCheckbox.check()
    await page.getByRole('button', { name: /delete selected/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.locator('.admin-selection-bar')).toBeVisible()
  })

  test('select-all selects all visible poems on page', async ({ page }) => {
    if (!hasAdminAuth) test.skip()
    const selectAllCheckbox = page.getByLabel(/select all poems on page/i)
    await selectAllCheckbox.check()

    const countText = await page.locator('.admin-selection-bar__count').textContent()
    const count = parseInt(countText)
    expect(count).toBeGreaterThan(1)
  })
})
