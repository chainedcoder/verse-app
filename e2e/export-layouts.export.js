import { test, expect } from '@playwright/test'

for (const surface of ['modal', 'page']) {
  test(`${surface}: light stories, dark letters, and creative layouts preview and export`, async ({ page }, testInfo) => {
    await page.goto(`/iframe.html?id=export-layouts--${surface}&viewMode=story`)
    for (const [title, palette, background] of [
      ['Story format', 'White', 'rgb(255, 255, 255)'],
      ['Love letter', 'Midnight', 'rgb(23, 25, 35)'],
      ['Botanical press', 'Forest', 'rgb(20, 46, 38)'],
      ['Celestial', 'Daybreak', 'rgb(248, 245, 238)'],
      ['Solstice', 'Ember', 'rgb(43, 35, 39)'],
      ['Tidal', 'Deep sea', 'rgb(20, 44, 60)'],
      ['Editorial', 'Ink', 'rgb(32, 33, 36)'],
    ]) {
      const card = page.locator('.template-card').filter({ has: page.getByText(title, { exact: true }) })
      await card.click()
      const swatch = page.getByRole('button', { name: `${title}: ${palette}`, exact: true })
      await swatch.focus()
      await page.keyboard.press('Enter')
      await expect(swatch).toHaveAttribute('aria-pressed', 'true')
      await expect(card.locator(':scope > div').first()).toHaveCSS('background-color', background)
      await page.getByRole('button', { name: /Preview/ }).click()
      const preview = page.getByAltText('Poem preview')
      await expect(preview).toBeVisible()
      await expect(preview).toHaveJSProperty('complete', true)
      await expect(preview).not.toHaveJSProperty('naturalWidth', 0)
      await preview.screenshot({ path: testInfo.outputPath(`${title}.png`) })
      await page.locator('.preview-modal').click({ position: { x: 8, y: 8 } })
    }
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: /SVG/ }).click()
    expect((await download).suggestedFilename()).toMatch(/\.svg$/)
  })
}

test('mobile layout palette fits the card and long poetry scales inside the artwork', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/iframe.html?id=export-layouts--long-poem&viewMode=story')
  for (const title of ['Botanical press', 'Celestial', 'Solstice', 'Tidal', 'Editorial']) {
    await page.getByText(title, { exact: true }).click()
    const artwork = page.locator('[data-layout]').last()
    const bounds = await artwork.evaluate(el => {
      const content = el.getBoundingClientRect()
      const canvas = el.parentElement.parentElement.getBoundingClientRect()
      return { content: content.height, canvas: canvas.height, transform: el.parentElement.style.transform }
    })
    expect(bounds.content).toBeLessThanOrEqual(bounds.canvas)
    expect(bounds.transform).not.toBe('scale(1)')
  }
  const card = page.locator('.template-card').filter({ has: page.getByText('Love letter', { exact: true }) })
  await card.click()
  await page.getByRole('button', { name: 'Love letter: Charcoal', exact: true }).click()
  const overflow = await card.evaluate(el => el.scrollWidth > el.clientWidth)
  expect(overflow).toBe(false)
})


test('botanical leaves and stem fit fully inside the artwork viewport', async ({ page }) => {
  await page.goto('/iframe.html?id=export-layouts--modal&viewMode=story')
  await page.getByText('Botanical press', { exact: true }).click()
  const illustrations = page.locator('svg[data-artwork="botanical"]')
  expect(await illustrations.count()).toBe(2)
  for (const svg of await illustrations.all()) {
    const fits = await svg.evaluate(el => {
      const box = el.getBBox()
      const view = el.viewBox.baseVal
      const stroke = 1
      return box.x - stroke >= view.x && box.y - stroke >= view.y &&
        box.x + box.width + stroke <= view.x + view.width &&
        box.y + box.height + stroke <= view.y + view.height
    })
    expect(fits).toBe(true)
  }
})

// iOS Safari and Chrome on iOS ignore `download` on data: URLs, so image exports must be served from blob: URLs.
for (const [format, ext] of [['JPEG', 'jpg'], ['SVG', 'svg']]) {
  test(`mobile ${format} export downloads a non-empty file from a blob URL`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/iframe.html?id=export-layouts--modal&viewMode=story')
    const pending = page.waitForEvent('download')
    await page.getByRole('button', { name: new RegExp(`^${format}$`) }).click()
    const download = await pending
    expect(download.url()).toMatch(/^blob:/)
    expect(download.suggestedFilename()).toMatch(new RegExp(`^verse-.+\\.${ext}$`))
    const size = (await (await download.createReadStream()).toArray()).reduce((n, chunk) => n + chunk.length, 0)
    expect(size).toBeGreaterThan(0)
  })
}
