import { Page, Locator } from '@playwright/test';
import { envConfig } from '../utils/env';

export class ManageLoginPage {
  readonly page: Page;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Confirmed Codegen locator for Manage App landing screen
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  /**
   * Navigates to the Manage App login entry URL (baseUrl/login).
   */
  async navigate() {
    await this.page.goto(`${envConfig.baseUrl}/login`);
  }

  /**
   * Clicks 'Sign in' on Manage App and waits for the cross-origin navigation to the SSO app to complete.
   */
  async clickSignIn() {
    await this.signInButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.signInButton.click();
    await this.page.waitForURL(/qaenv\.auth\.dev\.sodiumlearn\.com/, { timeout: 30000 });
  }
}
