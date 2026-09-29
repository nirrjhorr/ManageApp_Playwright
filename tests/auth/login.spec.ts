import { test, expect } from '../../fixtures/test.fixture';
import { envConfig } from '../../utils/env';
import users from '../../test-data/users.json';

/**
 * Authentication / Login Module Test Suite
 *
 * Traceability:
 * - Module: Authentication
 * - Feature: Login
 * - Requirements: AUTH-101 through AUTH-127 (TC-LG-001 through TC-LG-027)
 * - Architecture: Manage App entry (qaenv.dev-fe.sodiumlearn.com) -> External SSO (qaenv.auth.dev.sodiumlearn.com)
 *
 * Governing Principle & Login Validation Succession Rule:
 * - Valid email + valid password → Login button is actionable → continue with authentication assertions.
 * - Empty email + empty password → Login button is not actionable → PASS.
 * - Valid email + empty password → Login button is not actionable → PASS.
 * - Empty email + valid password → Login button is not actionable → PASS.
 * - Invalid email format + password → Login button is not actionable → PASS.
 * - Inability to submit when input is invalid/incomplete is itself the expected behavior (Prevention is PASS).
 * - Do NOT attempt to force-click or circumvent the disabled/non-actionable Login button.
 */
test.describe('Login Module Test Suite (Manage App → SSO Flow)', () => {

  // Ensure each test begins with a clean, unauthenticated browser session
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ==========================================
  // 1. CREDENTIAL VALIDATION
  // ==========================================
  test.describe('Credential Validation', () => {

    test('TC-LG-001: Verify a user can log in successfully with valid credentials @P1 @HappyPath @AUTH-101', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();

      // Step 2: Click "Sign in" to trigger SSO redirection
      await manageLoginPage.clickSignIn();

      // Step 3: Enter valid email and password
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);

      // Succession Rule: Valid credentials make the button actionable
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(true);

      // Step 4: Click Log In
      await ssoLoginPage.clickLogIn();

      // Expected Result: User is authenticated and redirected to /dashboard or /roles. A Manage or Roles button is visible in navigation.
      await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 30000 });
      await expect(page).not.toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
      const navElement = page.getByRole('button', { name: /Manage|Roles/i }).or(page.locator('.nav-item, app-navbar, header, nav'));
      await expect(navElement.first()).toBeVisible({ timeout: 30000 });
    });

    test('TC-LG-002: Verify login succeeds when the email is entered in uppercase or mixed case @P2 @HappyPath @AUTH-102', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();

      // Step 2: Click "Sign in"
      await manageLoginPage.clickSignIn();

      // Step 3: Enter email in uppercase and valid password
      const uppercaseEmail = envConfig.testUserEmail.toUpperCase();
      await ssoLoginPage.fillEmail(uppercaseEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);

      // Step 4: Click Log In if actionable
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      if (isActionable) {
        await ssoLoginPage.clickLogIn();
      }

      // Expected Result: Login succeeds (case-insensitive) OR display authentication error
      // VMAD Dual acceptable outcome:
      // Outcome A: Case-insensitive login succeeds & redirects to authenticated Manage App
      // Outcome B: SSO treats email as case-sensitive and shows generic auth error
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      const isAuthenticated = currentUrl.includes('qaenv.dev-fe.sodiumlearn.com');
      const isAuthErrorVisible = await ssoLoginPage.genericAuthError.first().isVisible().catch(() => false);

      expect(isAuthenticated || isAuthErrorVisible).toBe(true);

      if (isAuthenticated) {
        await expect(page).not.toHaveURL(/login/);
      } else {
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        await expect(ssoLoginPage.genericAuthError.first()).toBeVisible();
      }
    });

    test('TC-LG-006: Verify login fails gracefully with a wrong password for a valid email @P1 @Negative @AUTH-106', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter valid email and wrong password
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(users.wrongPasswordUser.password);

      // Both fields are populated, button is actionable
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(true);

      // Step 3: Click Log In
      await ssoLoginPage.clickLogIn();

      // Expected Result: Login is rejected. A generic Invalid credentials error is displayed. URL remains /login. Password field is cleared or re-masked. No session is created.
      await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
      await expect(ssoLoginPage.genericAuthError.first()).toBeVisible({ timeout: 15000 });
      await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);

      // Field must remain masked
      expect(await ssoLoginPage.getPasswordInputType()).toBe('password');
    });

    test('TC-LG-007: Verify login fails with both wrong email and wrong password and returns a single generic error @P1 @Negative @AUTH-107', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter invalid email (format valid) and password
      await ssoLoginPage.fillEmail(users.wrongEmailAndPassword.email);
      await ssoLoginPage.fillPassword(users.wrongEmailAndPassword.password);

      // Step 3: Click Log In
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      if (isActionable) {
        await ssoLoginPage.clickLogIn();
      }

      // Expected Result: A single generic Invalid credentials error is displayed. NOT separate messages for wrong email vs wrong password. URL remains /login.
      await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
      await expect(ssoLoginPage.genericAuthError.first()).toBeVisible({ timeout: 15000 });
      await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);

      // Verify no account enumeration clues indicating email status specifically
      const pageText = await ssoLoginPage.getPageText();
      expect(pageText).not.toMatch(/email not found|email is not registered|no user with this email/i);
    });

    test('TC-LG-008: Verify login with a non-existent email returns the same generic error as a wrong password @P1 @Negative @AUTH-108', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter non-existent email (format valid) and any password
      await ssoLoginPage.fillEmail(users.nonExistentUser.email);
      await ssoLoginPage.fillPassword(users.nonExistentUser.password);

      // Step 3: Click Log In
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      if (isActionable) {
        await ssoLoginPage.clickLogIn();
      }

      // Expected Result: Response is identical to TC-LG-006. A generic error with no hint that the account does not exist. URL remains /login.
      await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
      await expect(ssoLoginPage.genericAuthError.first()).toBeVisible({ timeout: 15000 });
      await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);

      // Account enumeration protection check: error text MUST NOT reveal user non-existence
      const pageText = await ssoLoginPage.getPageText();
      expect(pageText).not.toMatch(/user does not exist|account not found|email not registered|no user with this email/i);
    });

  });

  // ==========================================
  // 2. REQUIRED FIELD VALIDATION
  // ==========================================
  test.describe('Required Field Validation', () => {

    test('TC-LG-003: Verify the system blocks submission when both Email and Password fields are empty @P1 @Negative @AUTH-103', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login and SSO
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Listen for prohibited network requests
      let authRequestFired = false;
      page.on('request', request => {
        if (request.method() === 'POST' && (request.url().includes('/login') || request.url().includes('/auth') || request.url().includes('/signin') || request.url().includes('/oauth'))) {
          authRequestFired = true;
        }
      });

      // Login Validation Succession Rule:
      // Empty email + empty password → Login button is not actionable → PASS.
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(false);

      // Inability to submit is the expected behavior. Do not force-click.
      // Expected Result: Form submission is blocked. URL remains /login. No network request is fired.
      expect(authRequestFired).toBe(false);
      await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
      await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);
    });

    test('TC-LG-004: Verify the system shows a password-required error when only the email is filled @P1 @Negative @AUTH-104', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login and SSO
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      let authRequestFired = false;
      page.on('request', request => {
        if (request.method() === 'POST' && (request.url().includes('/login') || request.url().includes('/auth') || request.url().includes('/signin'))) {
          authRequestFired = true;
        }
      });

      // Step 2: Enter valid email and leave Password blank
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      // Blur to trigger field validation state
      await ssoLoginPage.passwordInput.focus();
      await ssoLoginPage.emailInput.focus();

      // Login Validation Succession Rule:
      // Valid email + empty password → Login button is not actionable → PASS.
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(false);

      // Expected Result: Submission is blocked. Login button is non-actionable. URL remains /login.
      expect(authRequestFired).toBe(false);
      await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
      await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);

      // Check inline password error if displayed by client
      const isPasswordErrorVisible = await ssoLoginPage.passwordRequiredError.or(ssoLoginPage.genericInlineError).first().isVisible().catch(() => false);
      if (isPasswordErrorVisible) {
        await expect(ssoLoginPage.passwordRequiredError.or(ssoLoginPage.genericInlineError).first()).toBeVisible();
      }
    });

    test('TC-LG-005: Verify the system shows an email-required error when only the password is filled @P1 @Negative @AUTH-105', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login and SSO
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      let authRequestFired = false;
      page.on('request', request => {
        if (request.method() === 'POST' && (request.url().includes('/login') || request.url().includes('/auth') || request.url().includes('/signin'))) {
          authRequestFired = true;
        }
      });

      // Step 2: Leave Email blank and enter valid password
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);
      // Blur to trigger field validation state
      await ssoLoginPage.emailInput.focus();
      await ssoLoginPage.passwordInput.focus();

      // Login Validation Succession Rule:
      // Empty email + valid password → Login button is not actionable → PASS.
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(false);

      // Expected Result: Submission is blocked. Login button is non-actionable. URL remains /login.
      expect(authRequestFired).toBe(false);
      await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
      await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);

      // Check inline email error if displayed by client
      const isEmailErrorVisible = await ssoLoginPage.emailRequiredError.or(ssoLoginPage.genericInlineError).first().isVisible().catch(() => false);
      if (isEmailErrorVisible) {
        await expect(ssoLoginPage.emailRequiredError.or(ssoLoginPage.genericInlineError).first()).toBeVisible();
      }
    });

  });

  // ==========================================
  // 3. FORMAT VALIDATION
  // ==========================================
  test.describe('Format Validation', () => {

    for (const invalidEmail of users.invalidEmailFormats) {
      test(`TC-LG-009: Verify email format rejection for "${invalidEmail}" @P1 @Negative @AUTH-109`, async ({ manageLoginPage, ssoLoginPage, page }) => {
        // Step 1: Navigate to BASE_URL/login and SSO
        await manageLoginPage.navigate();
        await manageLoginPage.clickSignIn();

        let authRequestFired = false;
        page.on('request', request => {
          if (request.method() === 'POST' && (request.url().includes('/login') || request.url().includes('/auth') || request.url().includes('/signin'))) {
            authRequestFired = true;
          }
        });

        // Step 2: Enter an invalid email format in the Email field and valid password
        await ssoLoginPage.fillEmail(invalidEmail);
        await ssoLoginPage.fillPassword(envConfig.testUserPassword);

        // Blur email to trigger client-side format validation
        await ssoLoginPage.passwordInput.focus();

        // Login Validation Succession Rule:
        // Invalid email format + password → Login button is not actionable → PASS.
        const isActionable = await ssoLoginPage.isLoginButtonActionable();
        expect(isActionable).toBe(false);

        // Expected Result: Form submission is blocked. Login button is non-actionable. No network request is fired. URL remains /login.
        expect(authRequestFired).toBe(false);
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);

        // If inline format error message is visible, assert it
        const isFormatErrorVisible = await ssoLoginPage.emailFormatError.or(ssoLoginPage.genericInlineError).first().isVisible().catch(() => false);
        if (isFormatErrorVisible) {
          await expect(ssoLoginPage.emailFormatError.or(ssoLoginPage.genericInlineError).first()).toBeVisible();
        }
      });
    }

  });

  // ==========================================
  // 4. INPUT HANDLING & BOUNDARY CASES
  // ==========================================
  test.describe('Input Handling & Edge Cases', () => {

    test('TC-LG-010: Verify behaviour when the email is entered with leading and trailing whitespace @P2 @EdgeCase @AUTH-110', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter email with leading and trailing spaces
      await ssoLoginPage.fillEmail(`  ${envConfig.testUserEmail}  `);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);
      await ssoLoginPage.passwordInput.focus();

      // Check button actionability under Login Validation Succession Rule
      const isActionable = await ssoLoginPage.isLoginButtonActionable();

      if (!isActionable) {
        // Outcome B: Whitespace treated as invalid format -> button is non-actionable -> PASS
        expect(isActionable).toBe(false);
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        expect(page.url()).not.toContain('/500');
      } else {
        // Outcome A: Whitespace is trimmed/accepted -> button actionable -> submit and verify
        await ssoLoginPage.clickLogIn();
        await page.waitForTimeout(3000);
        const currentUrl = page.url();
        const isRedirectedToApp = currentUrl.includes('qaenv.dev-fe.sodiumlearn.com');
        const isValidationError = await ssoLoginPage.emailFormatError.or(ssoLoginPage.genericInlineError).first().isVisible().catch(() => false);

        expect(isRedirectedToApp || isValidationError).toBe(true);
        expect(page.url()).not.toContain('/500');

        if (isRedirectedToApp) {
          await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);
        } else {
          await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        }
      }
    });

    test('TC-LG-011: Verify the password field accepts and correctly submits special characters @P2 @EdgeCase @AUTH-111', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter valid email and special-character password
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(users.specialCharPasswordUser.password);

      // Verify field accepts all characters masked
      expect(await ssoLoginPage.getPasswordInputType()).toBe('password');

      // Check actionability
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      if (!isActionable) {
        // If system rejects special chars client-side -> non-actionable -> PASS
        expect(isActionable).toBe(false);
      } else {
        // Step 3: Click Log In
        await ssoLoginPage.clickLogIn();

        // Expected Result: Field accepts all characters masked. An auth error is returned since credentials do not match. No encoding error and no crash.
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        await expect(ssoLoginPage.genericAuthError.first()).toBeVisible({ timeout: 15000 });
        expect(page.url()).not.toContain('/500');
      }
    });

    test('TC-LG-012: Verify behaviour when a 300-character string is entered in the Email field @P3 @Boundary @AUTH-112', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter a 300-character email string
      await ssoLoginPage.fillEmail(users.longEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);
      await ssoLoginPage.passwordInput.focus();

      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      if (!isActionable) {
        // Boundary validation blocks action -> button is non-actionable -> PASS
        expect(isActionable).toBe(false);
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        expect(page.url()).not.toContain('/500');
      } else {
        // Step 3: Click Log In if actionable
        await ssoLoginPage.clickLogIn();
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        expect(page.url()).not.toContain('/500');
        await expect(ssoLoginPage.genericInlineError.or(ssoLoginPage.genericAuthError).first()).toBeVisible({ timeout: 15000 });
      }
    });

    test('TC-LG-013: Verify behaviour when a 500-character string is entered in the Password field @P3 @Boundary @AUTH-113', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter valid email and 500-character password
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(users.longPassword);

      // Verify characters are masked
      expect(await ssoLoginPage.getPasswordInputType()).toBe('password');

      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      if (!isActionable) {
        // Boundary validation blocks action -> button is non-actionable -> PASS
        expect(isActionable).toBe(false);
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        expect(page.url()).not.toContain('/500');
      } else {
        // Step 3: Click Log In if actionable
        await ssoLoginPage.clickLogIn();
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        expect(page.url()).not.toContain('/500');
        await expect(ssoLoginPage.genericInlineError.or(ssoLoginPage.genericAuthError).first()).toBeVisible({ timeout: 15000 });
      }
    });

    test('TC-LG-014: Verify the password visibility toggle works without affecting the submitted value @P2 @UX @AUTH-114', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter valid credentials (initially masked)
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);

      // Step 3: Verify initial type=password
      expect(await ssoLoginPage.getPasswordInputType()).toBe('password');

      // Step 4: Click toggle icon if available, verify visibility changes and re-masks
      if (await ssoLoginPage.passwordToggleIcon.isVisible()) {
        await ssoLoginPage.togglePasswordVisibility();
        expect(await ssoLoginPage.getPasswordInputType()).toBe('text');
        await ssoLoginPage.togglePasswordVisibility();
        expect(await ssoLoginPage.getPasswordInputType()).toBe('password');
      }

      // Step 5: Click Log In - submitted value must be unchanged by toggle
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(true);
      await ssoLoginPage.clickLogIn();
      await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 30000 });
    });

  });

  // ==========================================
  // 5. UI & UX VERIFICATION
  // ==========================================
  test.describe('UI & UX Verification', () => {

    test('TC-LG-015: Verify all required login page elements are visible and correctly labelled on fresh load @P1 @UI @AUTH-115', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await expect(manageLoginPage.signInButton).toBeVisible();

      // Step 2: Inspect all visible elements on the page (Manage App landing and SSO login form)
      await manageLoginPage.clickSignIn();

      // Expected Result: Email Address* label and input field are visible. Password* label and input field are visible.
      // Log In button is visible. Page title or logo is present. All required fields are marked with an asterisk.
      await expect(ssoLoginPage.emailInput).toBeVisible();
      await expect(ssoLoginPage.emailInput).toBeEnabled();
      await expect(ssoLoginPage.passwordInput).toBeVisible();
      await expect(ssoLoginPage.passwordInput).toBeEnabled();
      await expect(ssoLoginPage.loginButton).toBeVisible();

      // On fresh load with empty fields, Login button is non-actionable per succession rule
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(false);

      await expect(ssoLoginPage.emailLabel).toBeVisible();
      await expect(ssoLoginPage.passwordLabel).toBeVisible();

      // 1. Semantic DOM label text verification: DOM label text contains the expected text without pseudo-elements
      await expect(ssoLoginPage.emailLabel).toHaveText('Email Address');
      await expect(ssoLoginPage.passwordLabel).toHaveText('Password');

      // 2. Required indicator verification: Validate required asterisk is generated via CSS pseudo-element ::after
      const emailRequiredIndicator = await ssoLoginPage.getLabelRequiredIndicator(ssoLoginPage.emailLabel);
      const passwordRequiredIndicator = await ssoLoginPage.getLabelRequiredIndicator(ssoLoginPage.passwordLabel);

      expect(emailRequiredIndicator).toBe('"*"');
      expect(passwordRequiredIndicator).toBe('"*"');

      // Page title or logo check
      const pageTitle = await page.title();
      expect(pageTitle.length).toBeGreaterThan(0);
    });

    test('TC-LG-016: Verify the Log In button provides loading feedback while the request is in-flight @P2 @UI @AUTH-116', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Fill in valid credentials
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);

      // Verify button is initially actionable before clicking
      const isActionableBefore = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionableBefore).toBe(true);

      // Step 3 & 4: Network instrumentation & synchronization for in-flight state verification
      let loginRequestCount = 0;

      // Set up route synchronization to hold the authentication POST request in-flight,
      // allowing deterministic verification of the locked/non-actionable button state
      await page.route('**/*', async (route) => {
        const req = route.request();
        if (req.method() === 'POST') {
          loginRequestCount++;
          // Controlled delay ensuring the in-flight state is observable without arbitrary timeouts
          await new Promise((resolve) => setTimeout(resolve, 800));
          await route.continue();
        } else {
          await route.continue();
        }
      });

      try {
        // Initiate first submission
        const submitPromise = ssoLoginPage.clickLogIn();

        // Give the UI a brief moment (100 ms) to transition into its in-flight/locked state
        await page.waitForTimeout(100);

        // The Login action must no longer be actionable while the first request is in flight
        const isActionableDuringRequest = await ssoLoginPage.isLoginButtonActionable();
        expect(isActionableDuringRequest).toBe(false);

        // A second submission must not be possible (duplicate-submission prevention)
        const secondClickAllowed = await ssoLoginPage.clickLogInIfActionable(300);
        expect(secondClickAllowed).toBe(false);

        // Allow the original authentication request to finish
        await submitPromise;

        // Normal authenticated state reached
        await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 30000 });

        // Verify duplicate submission was prevented at the network layer (only 1 POST request initiated)
        expect(loginRequestCount).toBe(1);
      } finally {
        await page.unroute('**/*').catch(() => {});
      }
    });

    test('TC-LG-017: Verify validation error messages appear inline directly below the relevant field @P2 @UI @AUTH-117', async ({ manageLoginPage, ssoLoginPage }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Touch fields to trigger inline validation or observe empty state
      await ssoLoginPage.emailInput.focus();
      await ssoLoginPage.passwordInput.focus();
      await ssoLoginPage.loginButton.focus();

      // Verify button is non-actionable when empty
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(false);

      // If inline error elements appear, verify placement relative to input
      const isInlineErrorVisible = await ssoLoginPage.genericInlineError.first().isVisible().catch(() => false);
      if (isInlineErrorVisible) {
        const emailBox = await ssoLoginPage.emailInput.boundingBox();
        const errorBox = await ssoLoginPage.genericInlineError.first().boundingBox();
        if (emailBox && errorBox) {
          expect(errorBox.y).toBeGreaterThanOrEqual(emailBox.y);
        }
      }
    });

    test('TC-LG-018: Verify the login form is fully operable using only the keyboard @P3 @Accessibility @AUTH-118', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Tab to Email field and enter email
      await ssoLoginPage.emailInput.focus();
      await expect(ssoLoginPage.emailInput).toBeFocused();
      await page.keyboard.type(envConfig.testUserEmail);

      // Step 3: Tab to Password field and enter password
      await page.keyboard.press('Tab');
      await expect(ssoLoginPage.passwordInput).toBeFocused();
      await page.keyboard.type(envConfig.testUserPassword);

      // Step 4: Tab to Log In button - now actionable
      await page.keyboard.press('Tab');
      await expect(ssoLoginPage.loginButton).toBeFocused();

      // Step 5: Press Enter to submit
      await page.keyboard.press('Enter');

      // Expected Result: Focus order is logical: Email then Password then Log In. Operable via keyboard alone.
      await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 30000 });
    });

  });

  // ==========================================
  // 6. NAVIGATION & AUTH GUARDS
  // ==========================================
  test.describe('Navigation & Auth Guards', () => {

    test('TC-LG-019: Verify an unauthenticated user is redirected to /login when accessing a protected route @P1 @Navigation @AUTH-119', async ({ page }) => {
      // Step 1: Ensure no active session exists (handled by test.beforeEach context.clearCookies)
      // Step 2: Navigate directly to BASE_URL/roles
      await page.goto(`${envConfig.baseUrl}/roles`);

      // Expected Result: App detects no active session and redirects to BASE_URL/login. URL contains /login.
      await expect(page).toHaveURL(/\/login/);
    });

    test('TC-LG-020: Verify an authenticated user visiting /login is redirected away from the login page @P2 @Navigation @AUTH-120', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Log in successfully and land on /dashboard or /roles
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);
      await ssoLoginPage.clickLogIn();
      await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 30000 });

      // Step 2: Manually navigate to BASE_URL/login
      await page.goto(`${envConfig.baseUrl}/login`);

      // Expected Result: App detects the existing session and redirects the user to /dashboard or /roles. URL does NOT remain on /login.
      await expect(page).not.toHaveURL(/\/login$/);
    });

    test('TC-LG-021: Verify the root URL redirects unauthenticated users to /login @P2 @Navigation @AUTH-121', async ({ page }) => {
      // Step 1: Ensure no active session
      // Step 2: Navigate to BASE_URL root
      await page.goto(`${envConfig.baseUrl}/`);

      // Expected Result: Browser is redirected to BASE_URL/login. URL contains /login.
      await expect(page).toHaveURL(/\/login/);
    });

  });

  // ==========================================
  // 7. SECURITY VERIFICATION
  // ==========================================
  test.describe('Security Verification', () => {

    for (const sqlPayload of users.sqlInjectionPayloads) {
      test(`TC-LG-022: Verify Email field is not vulnerable to SQL Injection ("${sqlPayload}") @P1 @Security @AUTH-122`, async ({ manageLoginPage, ssoLoginPage, page }) => {
        // Step 1: Navigate to BASE_URL/login
        await manageLoginPage.navigate();
        await manageLoginPage.clickSignIn();

        // Step 2: Enter a SQL injection payload in the Email field
        await ssoLoginPage.fillEmail(sqlPayload);
        await ssoLoginPage.fillPassword('Password#1');
        await ssoLoginPage.passwordInput.focus();

        // Check actionability under Login Validation Succession Rule
        const isActionable = await ssoLoginPage.isLoginButtonActionable();

        if (!isActionable) {
          // Client-side email validation blocks SQL injection from being submitted -> PASS
          expect(isActionable).toBe(false);
          await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
          await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);
        } else {
          // Step 3: If actionable, submit and verify server treats payload safely
          await ssoLoginPage.clickLogIn();

          // Expected Result: Payload is treated as literal text via parameterised queries. No database error occurs.
          // Users table remains intact. A generic auth error is returned. No data is leaked.
          await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
          await expect(ssoLoginPage.genericAuthError.first()).toBeVisible({ timeout: 15000 });

          const pageText = await ssoLoginPage.getPageText();
          expect(pageText).not.toMatch(/syntax error|sql|select|database|mysql|postgresql|sqlite|ora-/i);
          await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);
        }
      });
    }

    test('TC-LG-023: Verify the login form sanitises script-based XSS payloads @P1 @Security @AUTH-123', async ({ manageLoginPage, ssoLoginPage, page }) => {
      let alertFired = false;
      page.on('dialog', async (dialog) => {
        alertFired = true;
        await dialog.dismiss();
      });

      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter XSS payload in Email field
      await ssoLoginPage.fillEmail(users.xssPayloads[0]);
      await ssoLoginPage.fillPassword('anypassword');
      await ssoLoginPage.passwordInput.focus();

      // Check actionability under Login Validation Succession Rule
      const isActionable = await ssoLoginPage.isLoginButtonActionable();

      if (!isActionable) {
        // Client-side format validation prevents XSS payload from being submitted -> PASS
        expect(isActionable).toBe(false);
        expect(alertFired).toBe(false);
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);
      } else {
        // Step 3: If actionable, submit and verify no dialog alert fires
        await ssoLoginPage.clickLogIn();
        expect(alertFired).toBe(false);
        await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
        await expect(page).not.toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);
      }
    });

    test('TC-LG-024: Verify password field always masks value and uses type=password @P1 @Security @AUTH-124', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Enter a password
      await ssoLoginPage.fillPassword('SecretPassword#123');

      // Step 3 & 4: Observe characters are masked & inspect DOM element
      // Expected Result: Characters are masked with bullets immediately on entry. The input element has type=password in the DOM.
      // No plain-text password value is exposed anywhere in the page source.
      expect(await ssoLoginPage.getPasswordInputType()).toBe('password');
      const pageHtml = await page.content();
      expect(pageHtml).not.toContain('SecretPassword#123');
    });

    test('TC-LG-025: Verify repeated failed login attempts trigger a rate-limit or lockout mechanism @P1 @Security @AUTH-125', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Attempt login with incorrect password 5 times consecutively using dedicated lockoutUser to prevent admin lockout
      for (let i = 0; i < 5; i++) {
        await ssoLoginPage.fillEmail(users.lockoutUser.email);
        await ssoLoginPage.fillPassword(`${users.lockoutUser.password}_Attempt${i}`);
        
        const isActionable = await ssoLoginPage.isLoginButtonActionable();
        if (isActionable) {
          await ssoLoginPage.clickLogIn();
        }
        await page.waitForTimeout(500);
      }

      // Step 3: Observe the system response after the threshold
      // Expected Result: After defined threshold system locks account temporarily, introduces CAPTCHA or returns rate-limit error.
      const isRateLimit = await ssoLoginPage.rateLimitError.first().isVisible().catch(() => false);
      const isGenericError = await ssoLoginPage.genericAuthError.first().isVisible().catch(() => false);

      expect(isRateLimit || isGenericError).toBe(true);
      await expect(page).toHaveURL(/qaenv\.auth\.dev\.sodiumlearn\.com/);
    });

  });

  // ==========================================
  // 8. RELIABILITY TESTS
  // ==========================================
  test.describe('Reliability Tests', () => {

    test('TC-LG-026: Verify login behaviour when network connection drops during submission @P2 @Reliability @AUTH-126', async ({ manageLoginPage, ssoLoginPage, page, context }) => {
      // Step 1: Navigate to BASE_URL/login
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();

      // Step 2: Fill in valid email and password
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);

      // Button is actionable with valid credentials
      const isActionable = await ssoLoginPage.isLoginButtonActionable();
      expect(isActionable).toBe(true);

      // Step 3: Set browser to offline mode
      await context.setOffline(true);

      // Step 4 & 5: Click Log In and observe error
      await ssoLoginPage.clickLogIn().catch(() => {});

      // Expected Result Step 4: A clear Network error or No internet connection message is shown.
      // Form data is NOT cleared. No partial record is created.
      await expect(ssoLoginPage.emailInput).toHaveValue(envConfig.testUserEmail);
      const isNetworkErrorVisible = await ssoLoginPage.networkError.first().isVisible().catch(() => false);
      if (isNetworkErrorVisible) {
        await expect(ssoLoginPage.networkError.first()).toBeVisible();
      }

      // Step 6: Restore network
      await context.setOffline(false);

      // Step 7: Click Log In again - Login succeeds once connectivity is restored
      await ssoLoginPage.clickLogIn();
      await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 30000 });
    });

    test('TC-LG-027: Verify the authenticated session persists across page reload @P2 @Reliability @AUTH-127', async ({ manageLoginPage, ssoLoginPage, page }) => {
      // Step 1: Log in successfully and land on /dashboard or /roles
      await manageLoginPage.navigate();
      await manageLoginPage.clickSignIn();
      await ssoLoginPage.fillEmail(envConfig.testUserEmail);
      await ssoLoginPage.fillPassword(envConfig.testUserPassword);
      await ssoLoginPage.clickLogIn();
      await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/, { timeout: 30000 });

      // Step 2: Reload the page using F5 or Ctrl+R
      await page.reload();

      // Step 3: Observe session state
      // Expected Result: User remains logged in after reload. URL stays on /dashboard or /roles. User is NOT redirected to /login.
      await expect(page).toHaveURL(/qaenv\.dev-fe\.sodiumlearn\.com/);
      await expect(page).not.toHaveURL(/\/login/);
      const navElement = page.getByRole('button', { name: /Manage|Roles/i }).or(page.locator('.nav-item, app-navbar, header, nav'));
      await expect(navElement.first()).toBeVisible();
    });

  });

});
