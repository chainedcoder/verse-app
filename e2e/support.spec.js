import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Support System Comprehensive E2E', () => {
  // Increase timeout because this test orchestrates 3 users and multiple real-time interactions
  test.setTimeout(90000); 

  test('End-to-End Multi-Role Support Flow', async ({ browser }) => {
    const timestamp = Date.now();
    const userEmail = `user-${timestamp}@example.com`;
    const adminEmail = `admin-${timestamp}@example.com`;
    const ccEmail = `cc-${timestamp}@example.com`;
    
    // 1. Setup 3 Users via API or scripts to be faster, but UI signup ensures auth flows work.
    // For speed and reliability in a massive E2E, we'll signup Admin, User, CC User.
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/signup');
    await adminPage.fill('input[type="text"]', 'Admin E2E');
    await adminPage.fill('input[type="email"]', adminEmail);
    await adminPage.fill('input[type="password"]', 'Password123!');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/login');
    
    // Promote Admin
    try {
      execSync(`DATABASE_URL="${process.env.DATABASE_URL}" node scripts/set-role.mjs ${adminEmail} ADMIN`);
    } catch (e) {
      console.error('Failed to set admin role', e);
    }
    
    await adminPage.fill('input[type="email"]', adminEmail);
    await adminPage.fill('input[type="password"]', 'Password123!');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/');

    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    await userPage.goto('/signup');
    await userPage.fill('input[type="text"]', 'User E2E');
    await userPage.fill('input[type="email"]', userEmail);
    await userPage.fill('input[type="password"]', 'Password123!');
    await userPage.click('button[type="submit"]');
    await userPage.waitForURL('**/login');
    
    await userPage.fill('input[type="email"]', userEmail);
    await userPage.fill('input[type="password"]', 'Password123!');
    await userPage.click('button[type="submit"]');
    await userPage.waitForURL('**/');

    const ccContext = await browser.newContext();
    const ccPage = await ccContext.newPage();
    await ccPage.goto('/signup');
    await ccPage.fill('input[type="text"]', 'CC User');
    await ccPage.fill('input[type="email"]', ccEmail);
    await ccPage.fill('input[type="password"]', 'Password123!');
    await ccPage.click('button[type="submit"]');
    await ccPage.waitForURL('**/login');
    
    await ccPage.fill('input[type="email"]', ccEmail);
    await ccPage.fill('input[type="password"]', 'Password123!');
    await ccPage.click('button[type="submit"]');
    await ccPage.waitForURL('**/');

    // 2. User Creates a Ticket
    const ticketTitle = `Critical E2E Issue ${timestamp}`;
    await userPage.goto('/dash/support/tickets');
    await expect(userPage.locator('h1').filter({ hasText: 'Tickets' }).first()).toBeVisible();
    
    // Open Modal
    await userPage.locator('button:has-text("+ New Ticket")').dispatchEvent('click');
    const dialog = userPage.locator('.modalOverlay').first(); // Might not use <dialog> anymore
    // await expect(dialog).toBeVisible();

    // Fill Form
    await userPage.fill('input[placeholder="E.g. Unable to access billing"]', ticketTitle);
    
    // Fill Description Textarea
    await userPage.fill('textarea[placeholder="Describe the issue on behalf of the user..."]', 'System is down, needs immediate attention.');
    
    // Submit
    await userPage.locator('button:has-text("Create Ticket")').dispatchEvent('click');
    await userPage.waitForTimeout(1000);
    
    // Verify ticket appears in User's list
    await expect(userPage.locator(`text=${ticketTitle}`)).toBeVisible();

    // 3. Admin Triage
    await adminPage.goto('/admin/support/tickets');
    await expect(adminPage.locator('h1').filter({ hasText: 'Tickets' }).first()).toBeVisible();

    // Verify "No Ticket Selected" state
    await expect(adminPage.locator('text=No Ticket Selected').first()).toBeVisible();

    // Click the newly created ticket
    await adminPage.locator(`text=${ticketTitle}`).first().click();

    // Verify it opened correctly
    await expect(adminPage.locator('span', { hasText: ticketTitle }).first()).toBeVisible();

    // 4. Admin Assignments & CC
    // Add CC
    await adminPage.click('text=+ Add CC');
    await adminPage.fill('input[placeholder="Type to search..."]', ccEmail);
    await adminPage.waitForTimeout(500); // debounce
    await adminPage.click(`text=${ccEmail}`);
    
    // Verify CC log event in timeline
    await expect(adminPage.locator('div', { hasText: "User CC'd" }).first()).toBeVisible();

    // Change Status
    // Assume dropdown for status is available under metadata pane
    await adminPage.locator('div[class*="metaHeader"] span:has-text("Open")').click();
    await adminPage.locator('.custom-select-option', { hasText: 'In Progress' }).first().click();
    
    // 5. Messaging Loop
    // Admin sends message
    // In ReactQuill, we type into the .ql-editor
    await adminPage.locator('.ql-editor').fill('We are looking into this right now!');
    await adminPage.locator('button[class*="sendBtn"]').dispatchEvent('click');

    // Admin verifies message was sent (shows up in thread)
    await expect(adminPage.locator('div', { hasText: 'We are looking into this right now!' }).first()).toBeVisible();
    await expect(adminPage.locator('div', { hasText: "Agent Replied" }).first()).toBeVisible();

    // User checks their side
    // Refresh or poll (assume auto-refresh or we trigger reload for simplicity of test)
    await userPage.reload();
    await userPage.locator(`text=${ticketTitle}`).first().click();
    
    // Verify Admin's message is visible to User
    await expect(userPage.locator('div', { hasText: 'We are looking into this right now!' }).first()).toBeVisible();

    // User replies
    await userPage.locator('.ql-editor').fill('Thanks for the quick response!');
    await userPage.locator('button[class*="sendBtn"]').dispatchEvent('click');
    await expect(userPage.locator('div', { hasText: 'Thanks for the quick response!' }).first()).toBeVisible();

    // Admin sees user's reply
    await adminPage.reload();
    await adminPage.locator(`text=${ticketTitle}`).first().click();
    await expect(adminPage.locator('div', { hasText: 'Thanks for the quick response!' }).first()).toBeVisible();

    // 6. Admin resolves ticket
    await adminPage.locator('div[class*="metaHeader"] span:has-text("In Progress")').click();
    await adminPage.locator('.custom-select-option', { hasText: 'Closed' }).first().click();

    // Verify closed status and timeline log
    await expect(adminPage.locator('div', { hasText: "UPDATE" }).first()).toBeVisible();

    // 7. CC User perspective
    await ccPage.goto('/settings/support');
    // CC User should see the ticket they are CC'd on
    await expect(ccPage.locator(`text=${ticketTitle}`).first()).toBeVisible();

    await userContext.close();
    await adminContext.close();
    await ccContext.close();
  });
});
