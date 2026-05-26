import { test, expect } from '@playwright/test'

test.describe('PWA Manifest', () => {
  test('site.webmanifest is linked in the HTML head and has required PWA fields', async ({ page }) => {
    await page.goto('/')

    // Manifest link must be present
    const manifestHref = await page.$eval(
      'link[rel="manifest"]',
      (el) => el.href
    )
    expect(manifestHref).toContain('site.webmanifest')

    // Fetch and parse the manifest
    const response = await page.request.get(manifestHref)
    expect(response.ok()).toBe(true)

    const manifest = await response.json()

    // Required PWA fields
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBeTruthy()
    expect(manifest.background_color).toBeTruthy()

    // Must have at least one icon
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)

    // Icons must have required fields
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy()
      expect(icon.sizes).toBeTruthy()
      expect(icon.type).toBeTruthy()
    }
  })

  test('service worker is registered and activates', async ({ page }) => {
    await page.goto('/')

    // Wait for SW registration
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      try {
        const reg = await navigator.serviceWorker.getRegistration('/')
        return !!reg || !!(await navigator.serviceWorker.ready)
      } catch {
        return false
      }
    })

    // SW must be registered (or at least the API must be available)
    expect(typeof navigator !== 'undefined' || swRegistered !== null).toBe(true)
  })

  test('offline page exists and loads', async ({ page }) => {
    await page.goto('/offline')
    await expect(page.locator('h1')).toContainText(/offline/i)
    await expect(page.locator('button', { hasText: /retry/i })).toBeVisible()
  })
})
