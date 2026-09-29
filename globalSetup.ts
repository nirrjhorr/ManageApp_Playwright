import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from './pages/login.page';
import usersData from './test-data/users.json';
import { envConfig } from './utils/env';

/**
 * Global setup to establish authenticated session state once for all Users module tests.
 * Authenticates against SSO, confirms return to application and session authorization,
 * and persists storageState to playwright/auth/admin.json.
 */
async function globalSetup(config: FullConfig) {
  const authDir = path.resolve(__dirname, 'playwright/auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const storageStatePath = path.join(authDir, 'admin.json');
  const baseURL = config.projects[0]?.use?.baseURL || envConfig.baseUrl || 'https://qaenv.dev-fe.sodiumlearn.com';
  const email = envConfig.testUserEmail || usersData.validUser.email;
  const password = envConfig.testUserPassword || usersData.validUser.password;

  const browser = await chromium.launch({ headless: envConfig.isHeadless });
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    const loginPage = new LoginPage(page);
    await loginPage.fullLogin(email, password);

    // Navigate directly to /users to confirm session cookies/tokens apply to the target module
    await page.goto('/users');
    await page.waitForLoadState('domcontentloaded');

    // Save complete authenticated storage state
    await context.storageState({ path: storageStatePath });
  } finally {
    await browser.close();
  }
}

export default globalSetup;
