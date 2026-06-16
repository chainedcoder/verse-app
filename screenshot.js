const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/admin/employee', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'employee-screenshot.png' });
  await browser.close();
})();
