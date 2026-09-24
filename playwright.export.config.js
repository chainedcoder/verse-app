import { defineConfig, devices } from '@playwright/test'

// Exercise the real export components without a database or authenticated session.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'export-layouts.export.js',
  workers: 1,
  use: { baseURL: 'http://localhost:6006', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run storybook -- --ci --disable-telemetry',
    url: 'http://localhost:6006',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
