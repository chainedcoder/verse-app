const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin/employee', { waitUntil: 'networkidle' });
  const width = await page.evaluate(() => {
    const el = document.querySelector('.w-\\[320px\\]');
    return el ? window.getComputedStyle(el).width : 'not found';
  });
  console.log('Width:', width);
  const bgColor = await page.evaluate(() => {
    const el = document.querySelector('.bg-\\[\\#2a2a2a\\]');
    return el ? window.getComputedStyle(el).backgroundColor : 'not found';
  });
  console.log('BgColor:', bgColor);
  await browser.close();
})();
