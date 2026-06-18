import { test, expect } from '@playwright/test'
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env') })
import { prisma } from '../lib/prisma.js'

test.describe('Admin Users Page — Custom Dropdowns and Dynamic Tag Filters', () => {
  const testEmail = `admin-e2e-filters-${Date.now()}@example.com`
  const testPassword = 'password123'

  test.beforeAll(async () => {
    // Clear any potential existing test user (safety net)
    try {
      await prisma.user.delete({ where: { email: testEmail } })
    } catch (e) {}
  })

  test.afterAll(async () => {
    try {
      await prisma.user.delete({ where: { email: testEmail } })
    } catch (e) {}
  })

  test('sign up, elevate, login, and verify custom filters/tagging behaves correctly', async ({ page }) => {
    // 1. Sign up a new user
    await page.goto('/signup')
    await page.fill('input[type="text"]', 'E2E Filter Admin')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/login')

    // 2. Programmatically elevate their role to ADMIN in PostgreSQL
    await prisma.user.update({
      where: { email: testEmail },
      data: { role: 'ADMIN' }
    })

    // 3. Create a secondary admin so that one actually appears in the list (since current user is excluded)
    const secondaryAdminEmail = `secondary-admin-${Date.now()}@example.com`
    await prisma.user.create({
      data: {
        name: 'Secondary Admin',
        email: secondaryAdminEmail,
        password: 'password123',
        role: 'ADMIN'
      }
    })

    // 4. Log in as ADMIN
    await page.goto('/login')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')

    // 5. Navigate to User Management Page
    await page.goto('/admin/users')
    await page.waitForTimeout(1000)

    // Ensure the table starts with multiple users of different roles
    const initialRoles = await page.locator('td.adt-td .role-display-text').allTextContents()
    console.log('INITIAL ROLES:', initialRoles)
    expect(initialRoles.length).toBeGreaterThan(1)
    expect(initialRoles.includes('User') && initialRoles.includes('Admin')).toBe(true)

    // 5. Test: Click on Custom Role Dropdown Pill
    const rolePill = page.locator('div.filter-pill-container', { hasText: 'Role' }).locator('button').first()
    await expect(rolePill).toBeVisible()
    await rolePill.click()

    // Expect custom dropdown popover to appear specifically matching class
    const rolePopover = page.locator('div.custom-dropdown-popover:has-text("All Roles")')
    await expect(rolePopover).toBeVisible()

    // Click on "User" option to filter
    const userOption = rolePopover.locator('button:has-text("User")')
    await expect(userOption).toBeVisible()
    await userOption.click()

    // Expect popover to be dismissed
    await expect(rolePopover).not.toBeVisible()
    await page.waitForTimeout(1000)

    // DEEP VALIDATION: Verify that ONLY "User" is shown in the Role column of the table (and no Admin is shown)!
    const filteredRoles = await page.locator('td.adt-td .role-display-text').allTextContents()
    console.log('FILTERED ROLES:', filteredRoles)
    expect(filteredRoles.length).toBeGreaterThan(0)
    for (const role of filteredRoles) {
      expect(role).toBe('User')
    }

    // Reset role filter back to ALL Roles to proceed with next tests
    await rolePill.click()
    const rolePopoverReopened = page.locator('div.custom-dropdown-popover:has-text("All Roles")')
    await rolePopoverReopened.locator('button:has-text("All Roles")').click()
    await page.waitForTimeout(500)

    // 6. Test: "Add filter" Column selection and Value refining (stopPropagation unmount test)
    const addFilterBtn = page.locator('button:has-text("Add filter")')
    await expect(addFilterBtn).toBeVisible()
    await addFilterBtn.click()

    // Expect Filter column selection popover to open specifically matching class
    const addFilterPopover = page.locator('div.custom-dropdown-popover:has-text("Filter column")')
    await expect(addFilterPopover).toBeVisible()

    // Click on column "Status" option inside the popover specifically
    const statusFieldBtn = addFilterPopover.locator('button:has-text("Status")')
    await expect(statusFieldBtn).toBeVisible()
    await statusFieldBtn.click()

    // Expect the next refining stage popover to display (contains back button/text "Back")
    const refiningPopover = page.locator('div.custom-dropdown-popover:has-text("Back")')
    await expect(refiningPopover).toBeVisible()

    // Click on "Suspended" (or "Banned") inside the refining popup to add tag
    // Since real database contains "Active" and "Inactive", our tag selector uses Status mapping (Active, Suspended, Banned).
    // In our paginatedUsers activeTags client filter logic:
    // tag status: BANNED -> filters by u.status === 'BANNED'
    // Let's filter by Status -> Active to check table results
    const activeValueBtn = refiningPopover.locator('button:has-text("Active")')
    await expect(activeValueBtn).toBeVisible()
    await activeValueBtn.click()

    // Expect popover to close and dynamic filter pill tag to be added to the DOM
    await expect(refiningPopover).not.toBeVisible()
    const filterTag = page.locator('div.filter-pill-container', { hasText: 'Status: Active' })
    await expect(filterTag).toBeVisible()
    await page.waitForTimeout(1000)

    // DEEP VALIDATION: Verify that ONLY "Active" status is displayed in the status column of the table!
    const filteredStatuses = await page.locator('td.adt-td .status-pill span:not(.status-dot)').allTextContents()
    console.log('FILTERED STATUSES:', filteredStatuses)
    expect(filteredStatuses.length).toBeGreaterThan(0)
    for (const status of filteredStatuses) {
      expect(status).toBe('Active')
    }

    // 7. Test: Click-Away popup dismissal
    await addFilterBtn.click()
    const reOpenedPopover = page.locator('div.custom-dropdown-popover:has-text("Filter column")')
    await expect(reOpenedPopover).toBeVisible()

    // Click on page breadcrumb (outside target) to dismiss
    const breadcrumb = page.locator('span.breadcrumb-active')
    await breadcrumb.click()

    // Expect popover to close on click-away
    await expect(reOpenedPopover).not.toBeVisible()

    // 8. Test: "Hide" Column checklist functionality
    const hideBtn = page.locator('button:has-text("Hide")')
    await expect(hideBtn).toBeVisible()
    await hideBtn.click()

    // Target the hide checklist popup
    // It contains columns list (name, email, role, status, createdAt)
    // Click on "Email" check box wrapper to toggle hide
    const hidePopover = page.locator('div[style*="position: absolute"]:has-text("Email")')
    await expect(hidePopover).toBeVisible()
    
    // Check that "@ Email" header is initially visible
    const emailHeader = page.locator('th:has-text("@ Email")')
    await expect(emailHeader).toBeVisible()

    // Click the "Email" option container inside the hide checklist to hide it
    const emailHideOpt = hidePopover.locator('div:has-text("Email")').first()
    await emailHideOpt.click()
    await page.waitForTimeout(500)

    // DEEP VALIDATION: Verify that the "@ Email" table column is completely HIDDEN from view!
    await expect(emailHeader).not.toBeVisible()
    await expect(page.locator('span.custom-premium-email-link')).not.toBeVisible()

    // Click the "Email" option again to unhide it
    await emailHideOpt.click()
    await page.waitForTimeout(500)

    // Expect column to be visible again
    await expect(emailHeader).toBeVisible()

    // Dismiss the hide checklist by clicking breadcrumb
    await breadcrumb.click()

    // 9. Test: Dismiss dynamic filter pill tag
    const dismissTagBtn = filterTag.locator('button')
    await dismissTagBtn.click()

    // Expect tag to be deleted from DOM
    await expect(filterTag).not.toBeVisible()
    await page.waitForTimeout(1000)

    // Verify statuses returned to multi-status state (non-filtered)
    const resetStatuses = await page.locator('td.adt-td .status-pill span:not(.status-dot)').allTextContents()
    console.log('RESET STATUSES:', resetStatuses)
    const hasActive = resetStatuses.includes('Active')
    const hasInactive = resetStatuses.includes('Inactive')
    expect(hasActive && hasInactive).toBe(true)
  })
})
