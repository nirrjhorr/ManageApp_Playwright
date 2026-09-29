# Chat Context Log: Login Validation Succession & UI Assertion Fixes

**Date:** 2026-09-14  
**Topic:** Implementation of Login Validation Succession Rules, VMAD Planning, and Fixes for TC-LG-015 and TC-LG-016

---

## 1. Summary of Changes

### A. VMAD QA Automation Planning
- Conducted full Sonnet Bird's-Eye Analysis and VMAD decomposition for all 27 CSV test cases (TC-LG-001 through TC-LG-027).
- Authored the comprehensive planning artifact [`vmad_login_qa_plan.md`](file:///C:/Users/mdhas/.gemini/antigravity-ide/brain/b7159992-2b03-4ae4-9621-1827ca729e13/vmad_login_qa_plan.md) with assertion oracles, E2E flow maps, locator maps, and coverage matrices.
- Added dedicated `lockoutUser` in [`test-data/users.json`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/test-data/users.json) to eliminate risk of admin account lockout during brute-force testing (TC-LG-025).

### B. Login Validation Succession Rule Integration
- **Rule Principle:** When form input is invalid or empty, client-side validation prevents submission by keeping the **Log in** button non-actionable (`disabled`). Inability to submit is itself the expected behavior (**Prevention is PASS**).
- **Fix Applied:**
  - Resolved 30-second actionability timeout hangs (e.g. in TC-LG-009) by asserting `isLoginButtonActionable() === false` instead of attempting to force-click.
  - Added `isLoginButtonDisabled()`, `isLoginButtonActionable()`, and `clickLogInIfActionable()` helper methods to [`SsoLoginPage`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/pages/sso-login.page.ts) evaluating HTML `disabled`, `aria-disabled`, `aria-busy`, CSS loading/disabled classes, and `pointer-events: none`.
  - Added network listeners (`page.on('request')`) across required/format validation tests to verify no authentication POST requests are dispatched on invalid input.

### C. TC-LG-015: Required Field Asterisk Assertion Fix
- **Root Cause:** The test previously used `expect(ssoLoginPage.emailLabel).toContainText('*')`. This failed because the asterisk is not DOM text; it is generated purely at render-time via CSS pseudo-element:
  ```css
  .label--required::after { content: "*"; color: #f04438; }
  ```
- **Fix Applied:**
  - Separated DOM text verification: `toHaveText('Email Address')` and `toHaveText('Password')`.
  - Added CSS pseudo-element verification: `getLabelRequiredIndicator()` evaluates `getComputedStyle(el, '::after').content === '"*"'`.
  - Updated `emailInput` and `passwordInput` locators in `SsoLoginPage` to use regex patterns (`/Email Address/i` and `/Password/i`) to ensure compatibility regardless of whether the accessibility tree includes the pseudo-element in the accessible name.

### D. TC-LG-016: In-Flight Loading Feedback & Duplicate Submit Prevention Fix
- **Root Cause:** The test previously called `expect(loginButton.or(emailInput)).toBeVisible()`, causing a Playwright strict-mode violation (multiple matching elements). Furthermore, checking actionability immediately after dispatching the click checked before the asynchronous UI state transition could complete.
- **Fix Applied:**
  - Removed `.or()` locator union.
  - Implemented request synchronization via `page.route` to create a controlled window with the POST request in flight.
  - Added a brief 100 ms wait (`page.waitForTimeout(100)`) post-click to allow the UI to transition into its locked state.
  - Verified `isLoginButtonActionable() === false` while in flight.
  - Verified duplicate-submission prevention: `clickLogInIfActionable(300) === false`.
  - Confirmed exactly 1 POST request was initiated at the network layer (`loginRequestCount === 1`).

---

## 2. Verification & Execution Status

- **Static Type Check:** `npm run typecheck` (`tsc --noEmit`) ➔ **PASSED (Exit code 0, 0 errors)**
- **Targeted Test Execution (User-Run):**
  ```powershell
  npx playwright test -g "TC-LG-015|TC-LG-016"
  ```
  - `TC-LG-015`: **PASSED**
  - `TC-LG-016`: **PASSED**
  - **Result:** **2 passed (12.9s)**
