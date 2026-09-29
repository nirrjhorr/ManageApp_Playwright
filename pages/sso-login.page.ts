import { Page, Locator } from '@playwright/test';

export class SsoLoginPage {
  readonly page: Page;

  // Confirmed Codegen Locators for External QA SSO
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly passwordToggleIcon: Locator;

  // Form Labels
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;

  // Error Message Locators
  readonly emailRequiredError: Locator;
  readonly passwordRequiredError: Locator;
  readonly emailFormatError: Locator;
  readonly genericAuthError: Locator;
  readonly rateLimitError: Locator;
  readonly genericInlineError: Locator;
  readonly networkError: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form Input Locators (regex handles both raw label text and pseudo-element computed accessible names)
    this.emailInput = page.getByRole('textbox', { name: /Email Address/i });
    this.passwordInput = page.getByRole('textbox', { name: /Password/i });
    this.loginButton = page.getByRole('button', { name: 'Log in' });

    this.passwordToggleIcon = page
      .locator('app-generic-input .eye-icon, button.toggle-password, i.fa-eye, i.eye-icon')
      .or(page.getByRole('button', { name: /show|hide|toggle/i }));

    this.emailLabel = page.locator('label').filter({ hasText: /Email Address/i });
    this.passwordLabel = page.locator('label').filter({ hasText: /Password/i });

    // Validation Locators
    this.emailRequiredError = page
      .locator('[role="alert"], .alert, .error-message, .error, .invalid-feedback, app-generic-input')
      .filter({ hasText: /email is required|email address is required|enter an email/i })
      .or(page.getByText(/email is required|email address is required/i));

    this.passwordRequiredError = page
      .locator('[role="alert"], .alert, .error-message, .error, .invalid-feedback, app-generic-input')
      .filter({ hasText: /password is required|enter a password/i })
      .or(page.getByText(/password is required/i));

    this.emailFormatError = page
      .locator('[role="alert"], .alert, .error-message, .error, .invalid-feedback, app-generic-input')
      .filter({ hasText: /enter a valid email|invalid email|email format/i })
      .or(page.getByText(/valid email/i));

    this.genericInlineError = page.locator(
      '.invalid-feedback, .error-message, app-generic-input .error, small.text-danger, .error, [role="alert"], .alert'
    );

    this.genericAuthError = page
      .locator('[role="alert"], .alert, .alert-danger, .toast, .toast-error, .error-banner, .error-message, .error, form .error')
      .or(page.getByText(/invalid|wrong|incorrect|failed|unauthorized|error/i));

    this.rateLimitError = page
      .locator('[role="alert"], .alert, .alert-danger, .toast, .toast-error, .error-banner, .error-message')
      .filter({ hasText: /too many attempts|rate limit|locked|lockout/i })
      .or(page.getByText(/too many attempts|rate limit|locked/i));

    this.networkError = page
      .locator('[role="alert"], .alert, .alert-danger, .toast, .toast-error, .error-banner, .error-message, .error')
      .filter({ hasText: /network|internet|offline|connection/i })
      .or(page.getByText(/network error|no internet|offline/i));
  }

  /**
   * Explicitly awaits the SSO form email input to become visible after redirect.
   */
  async waitForFormLoad() {
    await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Fills the email field after explicitly waiting for it to be visible on the DOM.
   */
  async fillEmail(email: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.emailInput.fill(email);
  }

  /**
   * Fills the password field after explicitly waiting for it to be visible on the DOM.
   */
  async fillPassword(password: string) {
    await this.passwordInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.passwordInput.fill(password);
  }

  /**
   * Checks whether the Log In button is disabled / non-actionable.
   * Evaluates standard disabled attribute, aria-disabled, aria-busy,
   * CSS loading/disabled classes, or CSS pointer-events styling.
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    const disabled = await this.loginButton.isDisabled().catch(() => false);
    if (disabled) return true;

    const ariaDisabled = await this.loginButton.getAttribute('aria-disabled').catch(() => null);
    if (ariaDisabled === 'true') return true;

    const ariaBusy = await this.loginButton.getAttribute('aria-busy').catch(() => null);
    if (ariaBusy === 'true') return true;

    const classAttr = await this.loginButton.getAttribute('class').catch(() => '');
    if (classAttr && /(disabled|loading|is-loading|btn-loading|locked)/i.test(classAttr)) return true;

    const isPointerEventsNone = await this.loginButton.evaluate((el) => {
      return window.getComputedStyle(el).pointerEvents === 'none';
    }).catch(() => false);
    if (isPointerEventsNone) return true;

    return false;
  }

  /**
   * Checks whether the Log In button is currently actionable (visible & enabled).
   */
  async isLoginButtonActionable(): Promise<boolean> {
    const isVisible = await this.loginButton.isVisible().catch(() => false);
    const isDisabled = await this.isLoginButtonDisabled();
    return isVisible && !isDisabled;
  }

  /**
   * Attempts to click the Log In button only if actionable.
   * If non-actionable/locked, returns false without throwing a timeout error.
   */
  async clickLogInIfActionable(timeout = 1000): Promise<boolean> {
    const isActionable = await this.isLoginButtonActionable();
    if (!isActionable) {
      return false;
    }
    try {
      await this.loginButton.click({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clicks the SSO 'Log in' button after waiting for it to be visible.
   */
  async clickLogIn() {
    await this.loginButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.loginButton.click();
  }

  /**
   * Performs full SSO form submission step-by-step with explicit element waiting.
   */
  async login(email?: string, password?: string) {
    await this.waitForFormLoad();
    if (email !== undefined) {
      await this.fillEmail(email);
    }
    if (password !== undefined) {
      await this.fillPassword(password);
    }
    await this.clickLogIn();
  }

  /**
   * Toggles password visibility using eye icon.
   */
  async togglePasswordVisibility() {
    if (await this.passwordToggleIcon.isVisible()) {
      await this.passwordToggleIcon.click();
    }
  }

  /**
   * Gets password input HTML type attribute.
   */
  async getPasswordInputType(): Promise<string | null> {
    await this.passwordInput.waitFor({ state: 'visible', timeout: 30000 });
    return await this.passwordInput.getAttribute('type');
  }

  /**
   * Evaluates the CSS 'content' value of the ::after pseudo-element for a given label locator.
   */
  async getLabelRequiredIndicator(label: Locator): Promise<string> {
    return await label.evaluate((el) => window.getComputedStyle(el, '::after').content);
  }

  /**
   * Gets the inner text of the entire page body for negative assertions.
   */
  async getPageText(): Promise<string> {
    return (await this.page.locator('body').innerText()).toLowerCase();
  }
}

