import { test, expect } from '@playwright/test';

test.describe('SEO and Metadata', () => {
  test('robots.txt returns correct content', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    
    const text = await response.text();
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /admin/');
    expect(text).toContain('/sitemap.xml');
  });

  test('sitemap.xml returns correct XML content', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain('<?xml');
    expect(text).toContain('<urlset');
    
    // Check for some static URLs
    expect(text).toContain('/collections');
    expect(text).toContain('/authors');
  });
});
