import { Page } from '@playwright/test';
import { ManageLoginPage } from './manage-login.page';
import { SsoLoginPage } from './sso-login.page';

/**
 * Unified LoginPage class bridging Manage App landing and external QA SSO flow.
 */
export class LoginPage {
  readonly page: Page;
  readonly manage: ManageLoginPage;
  readonly sso: SsoLoginPage;

  constructor(page: Page) {
    this.page = page;
    this.manage = new ManageLoginPage(page);
    this.sso = new SsoLoginPage(page);
  }

  /**
   * Executes full end-to-end login flow:
   * 1. Navigates to Manage App entry URL
   * 2. Clicks 'Sign in' to allow natural redirect to SSO
   * 3. Fills SSO credentials and submits
   */
  async fullLogin(email: string, password: string) {
    await this.manage.navigate();
    await this.manage.clickSignIn();
    await this.sso.login(email, password);
    // Wait for redirect from SSO back to the application
    await this.page.waitForURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 45000 });
    const navElement = this.page.getByRole('button', { name: /Manage|Roles/i }).or(this.page.locator('.nav-item, app-navbar, header, nav'));
    await navElement.first().waitFor({ state: 'visible', timeout: 30000 });
  }
}

export { ManageLoginPage } from './manage-login.page';
export { SsoLoginPage } from './sso-login.page';
