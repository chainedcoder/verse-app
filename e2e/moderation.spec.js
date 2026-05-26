import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Moderation and Reporting Flow', () => {
  // Use a unique suffix for the users and content
  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@test.com`;
  const badUserEmail = `bad_${timestamp}@test.com`;
  const badPoemTitle = `Inappropriate Poem ${timestamp}`;

  // Helper to create user
  async function registerUser(page, name, email, password) {
    await page.goto('/signup');
    await page.fill('input[type="text"]', name);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await Promise.all([
      page.waitForURL('**/login'),
      page.click('button[type="submit"]')
    ]);
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await Promise.all([
      page.waitForURL('**/'),
      page.click('button[type="submit"]')
    ]);
    await expect(page.locator('.avatar-warm').first()).toBeVisible();
  }

  // Set the admin role directly in the DB using Prisma inside a helper script or via direct sqlite
  // Since Playwright runs outside the Next.js context, we'll do an exec to update the DB.
  test.beforeAll(async () => {
    // We will create the users during the test, but we need a way to make the admin an ADMIN
  });

  test.skip('user can report a poem and admin can ban the user', async ({ browser }) => {
    test.setTimeout(60000);
    // 1. Register the bad user and create a bad poem
    const badContext = await browser.newContext();
    const badPage = await badContext.newPage();
    await registerUser(badPage, 'Bad Actor', badUserEmail, 'password123');
    
    await badPage.goto('/write');
    await badPage.fill('input[name="title"]', badPoemTitle);
    await badPage.fill('textarea[name="fullText"]', 'This is a terrible poem that breaks the rules.');
    await badPage.click('button[name="publish"]');
    await badPage.waitForURL(/\/poem\/.+/);
    
    const poemUrl = badPage.url();
    await badContext.close();

    // 2. Register Admin User
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await registerUser(adminPage, 'Admin Boss', adminEmail, 'password123');

    // Manually elevate to ADMIN using sqlite3 command since we can't easily run Prisma code here
    execSync(`sqlite3 dev.db "UPDATE User SET role='ADMIN' WHERE email='${adminEmail}';"`);

    // 3. Admin reports the poem (testing reporting flow)
    await adminPage.goto(poemUrl);
    // Click report button
    await adminPage.click('button[title="Report this poem"]');
    // Fill report reason
    await adminPage.fill('textarea[id="reason"]', 'This poem is offensive.');
    await adminPage.click('button:has-text("Submit Report")');
    await expect(adminPage.locator('text=Report Submitted')).toBeVisible();

    // 4. Admin goes to dashboard
    await adminPage.goto('/admin');
    await expect(adminPage.locator(`text=${badPoemTitle}`)).toBeVisible();

    // 5. Admin bans the user
    adminPage.on('dialog', dialog => dialog.accept());
    await adminPage.click('button:has-text("Ban User")');
    
    // The report should disappear because it was resolved
    await expect(adminPage.locator(`text=${badPoemTitle}`)).not.toBeVisible();

    // 6. Verify bad user is banned in Users table
    await adminPage.goto('/admin/users');
    await adminPage.fill('input[placeholder="Search by name or email..."]', badUserEmail);
    // Find the select for this user and ensure it says Banned
    const select = adminPage.locator(`tr:has-text("${badUserEmail}")`).locator('select').first();
    await expect(select).toHaveValue('BANNED');

    await adminContext.close();
  });
});
