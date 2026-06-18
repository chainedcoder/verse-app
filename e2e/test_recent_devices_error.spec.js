import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const adminAuthFile = path.join(process.cwd(), 'e2e', '.auth', 'admin.json')

test.use({ storageState: adminAuthFile })

test('capture recent devices error', async ({ page }) => {
  page.on('console', msg => {
    console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`)
  })

  page.on('pageerror', err => {
    console.error(`BROWSER ERROR: ${err.message}`)
    console.error(err.stack)
  })

  await page.goto('/admin/account/recent-devices')
  await page.waitForTimeout(2000)
})
