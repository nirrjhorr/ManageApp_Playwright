import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  globalSetup: require.resolve('./globalSetup'),
  testDir: './tests',
  // Run tests sequentially (one test at a time)
  fullyParallel: false,
  workers: 1,
  // Global test timeout set to 60 seconds to eliminate premature timeouts
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  expect: {
    // Generous assertion timeout
    timeout: 15000,
  },
  use: {
    baseURL: process.env.BASE_URL || 'https://qaenv.dev-fe.sodiumlearn.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Generous action and navigation timeouts
    actionTimeout: 30000,
    navigationTimeout: 45000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
