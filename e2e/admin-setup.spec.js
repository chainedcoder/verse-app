import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

test('setup admin session', async ({ page }) => {
  test.setTimeout(90000)
  const adminEmail = 'admin-e2e@example.com'
  const adminPassword = 'Password123!'

  // 1. Go to signup page
  await page.goto('/signup')
  
  // 2. Fill out signup form (handle case where user might already exist, though setup is run once)
  // Fill the name, email, and password
  await page.fill('input[type="text"]', 'Admin E2E')
  await page.fill('input[type="email"]', adminEmail)
  await page.fill('input[type="password"]', adminPassword)
  
  // 3. Submit registration
  await page.click('button[type="submit"]')
  
  // Wait for either landing on login, or if user exists, we might get an error.
  // To handle both, we'll try to go directly to login if we can.
  await page.waitForTimeout(1000)
  
  // 4. Set the role to ADMIN using the local script (if registration succeeded or already existed)
  try {
    execSync(`node --env-file=.env scripts/set-role.mjs ${adminEmail} ADMIN`)
    console.log('Successfully set role to ADMIN via script')
  } catch (error) {
    console.error('Error setting role to ADMIN (might already exist):', error.message)
  }

  // 5. Navigate to login page and log in
  await page.goto('/login')
  await page.fill('input[type="email"]', adminEmail)
  await page.fill('input[type="password"]', adminPassword)

  // 6. Submit login
  await Promise.all([
    page.waitForURL('**/'),
    page.click('button[type="submit"]')
  ])

  // 7. Verify we are logged in
  const avatar = page.locator('.navbar-desktop-actions .avatar')
  await expect(avatar).toBeVisible()

  // 8. Save storage state
  const authDir = path.join(process.cwd(), 'e2e', '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }
  await page.context().storageState({ path: path.join(authDir, 'admin.json') })
  console.log('Successfully saved admin auth state')
})
