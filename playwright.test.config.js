import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test env explicitly to override config environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './e2e/global-setup.js',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  _webServer: {
    command: process.env.CI ? 'npm run start' : 'npx next dev -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    env: {
      AUTH_TRUST_HOST: 'true',
      DATABASE_URL: process.env.DATABASE_URL,
      PORT: '3000',
    }
  }
});
