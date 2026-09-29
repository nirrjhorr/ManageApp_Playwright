# Page Objects (`pages/`)

This directory contains Page Object Model (POM) classes representing web pages or key UI components.

## Guidelines & Conventions

- **File Naming**: Name files as `<feature>.page.ts` (e.g., `login.page.ts`, `dashboard.page.ts`).
- **Locator Strategy**: Prefer accessible roles (`page.getByRole`), text content (`page.getByText`), or specific IDs over fragile CSS or XPath selectors.
- **Web-First Assertions**: Use Playwright async assertions inside POM methods (`await expect(locator).toBeVisible()`).
- **Encapsulation**: Expose user actions as async methods (e.g., `login(username, password)`).

## Example Structure

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class ExamplePage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
  }

  async goto() {
    await this.page.goto('/');
  }

  async verifyPageLoaded() {
    await expect(this.heading).toBeVisible();
  }
}
```
