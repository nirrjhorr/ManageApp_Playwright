# Project Navigation & Customization Guide

Welcome to your **TypeScript Playwright Automation Framework**. This document provides a complete guide on how this environment is structured, how to navigate it, how to write and execute tests, and how to customize it for your project.

---

## 1. Directory Structure Overview

Here is the full layout of the workspace and what each folder is responsible for:

```text
Manage app PW/
├── .agents/               # AI Agent Skills & Playwright CLI automation configs
├── chat-context/          # Markdown context logs tracking every chat conversation session
├── fixtures/              # Custom Playwright test fixtures (e.g. pre-initialized POMs, auth sessions)
├── pages/                 # Page Object Model (POM) classes representing UI web pages
├── test-data/             # Static test data (JSON files for users, mock data, configuration)
├── tests/                 # Test suites (*.spec.ts) written in Playwright
├── utils/                 # Utilities, helper functions, and environment loader (env.ts)
├── .env                   # Environment variable secrets (BASE_URL, credentials, tokens)
├── .env.example           # Template for required environment variables
├── playwright.config.ts   # Main Playwright configuration (browsers, reporters, timeouts, baseURL)
├── tsconfig.json          # TypeScript compiler options
└── package.json           # Dependencies and npm script commands
```

---

## 2. Where to Find & Put What

| Goal | Directory / File | Instruction |
| :--- | :--- | :--- |
| **Configure Test Runner & Browsers** | [`playwright.config.ts`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/playwright.config.ts) | Change timeouts, retries, headless mode, screenshot policies, and browser projects (Chromium, Firefox, WebKit). |
| **Set App URL & Credentials** | [`.env`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/.env) & [`utils/env.ts`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/utils/env.ts) | Set `BASE_URL`, `ENV`, credentials. Access them in code via `envConfig` or `process.env`. |
| **Add UI Elements & Actions** | [`pages/`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/pages) | Create `*.page.ts` files containing locators and action methods for a specific page. |
| **Reuse Setup / Inject Page Objects** | [`fixtures/`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/fixtures) | Create `*.fixture.ts` files to auto-instantiate Page Objects or perform login before tests. |
| **Store Test Input Data** | [`test-data/`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/test-data) | Put JSON files here (`users.json`, `products.json`) for data-driven testing. |
| **Write Automated Test Cases** | [`tests/`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/tests) | Create `*.spec.ts` files containing Playwright `test.describe` and `test` blocks. |
| **Helper Utilities & API Clients** | [`utils/`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/utils) | Helper functions for date formatting, API requests, database calls, string generators. |
| **Track Conversation Memory** | [`chat-context/`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/chat-context) | Stores `YYYY-MM-DD-<topic>.md` logs of all chat interactions. |

---

## 3. How to Execute & Debug Tests

All test execution commands are managed via `npm` scripts in [`package.json`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/package.json):

```bash
# 1. Run all tests in headless mode (default)
npm test

# 2. Run tests in headed mode (opens browser window)
npm run test:headed

# 3. Run tests on a specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# 4. Interactive UI Mode (Playwright GUI test runner)
npm run test:ui

# 5. Debug Mode (Playwright Inspector with pause/step capabilities)
npm run test:debug

# 6. Typecheck TypeScript files
npm run typecheck

# 7. Open the HTML test report
npm run report
```

---

## 4. How to Customize for Your Project

### Step 1: Update Environment Configuration
Edit [`.env`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/.env) to point to your application:
```env
BASE_URL=https://your-app-domain.com
ENV=staging
HEADLESS=true
```
If you need additional environment properties, add them to [`utils/env.ts`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/utils/env.ts):
```typescript
export const envConfig = {
  baseUrl: process.env.BASE_URL || 'https://your-app-domain.com',
  env: process.env.ENV || 'development',
  apiToken: process.env.API_TOKEN || '',
};
```

### Step 2: Create a Page Object Model (POM)
Create a new file in `pages/` (e.g. [`pages/login.page.ts`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/pages)):
```typescript
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(user: string, pass: string) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}
```

### Step 3: Register Custom Fixtures (Optional but Recommended)
Extend Playwright's `test` fixture in [`fixtures/test.fixture.ts`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/fixtures/test.fixture.ts) so your Page Objects are automatically injected:
```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type CustomFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

### Step 4: Write Your Test Suite
Create a test file in `tests/` (e.g. [`tests/login.spec.ts`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/tests)):
```typescript
import { test, expect } from '../fixtures/test.fixture';
import users from '../test-data/users.json';

test.describe('Authentication Suite', () => {
  test('should log in successfully with valid credentials', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login(users.admin.username, users.admin.password);
    // Add assertions here
  });
});
```

---

## 5. Chat Context & Session Logging (`chat-context/`)

To keep track of modifications, decisions, and instructions across chat sessions:

1. **Context Log Files**: Stored in [`chat-context/`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/chat-context) with the format `YYYY-MM-DD-<topic>.md`.
2. **First Log**: See [`chat-context/2026-09-13-tsconfig-ignore-deprecations-fix.md`](file:///c:/Users/mdhas/Desktop/Manage%20app%20PW/chat-context/2026-09-13-tsconfig-ignore-deprecations-fix.md) for an example.
3. **Updating Context**: At the end of major task milestones or chat sessions, a new context file will be generated to document what was changed and the current state of the application.
