import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const adminAuthFile = path.join(process.cwd(), 'e2e', '.auth', 'admin.json')

test.use({ storageState: adminAuthFile })

test('capture custom finance dashboard and expanded sidebar screenshots', async ({ page }) => {
  // Go to admin finance page
  await page.goto('/admin/finance')
  await page.waitForLoadState('networkidle')

  // Verify KPIs exist
  const mrrHeader = page.locator('span', { hasText: 'Monthly Revenue (MRR)' }).first()
  await expect(mrrHeader).toBeVisible()

  const subscribersHeader = page.locator('span', { hasText: 'Premium Subscribers' }).first()
  await expect(subscribersHeader).toBeVisible()

  // 1. Take a screenshot of the compact sidebar and clean finance dashboard
  await page.screenshot({ path: 'admin-finance-dashboard-collapsed.png' })
  console.log("Saved admin-finance-dashboard-collapsed.png")

  // 2. Expand the sidebar
  const toggleBtn = page.locator('[title="Expand Sidebar"]')
  await expect(toggleBtn).toBeVisible()
  await toggleBtn.click()
  await page.waitForTimeout(600) // Wait for width transition to finish

  // Verify it is expanded by checking brand name
  await expect(page.locator('text=Smart System')).toBeVisible()

  // Take an expanded sidebar screenshot showing visual tree lines and full layout!
  await page.screenshot({ path: 'admin-sidebar-expanded.png' })
  console.log("Saved admin-sidebar-expanded.png")
})
