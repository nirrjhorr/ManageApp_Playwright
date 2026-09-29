# Test Specifications (`tests/`)

This directory contains test spec files written in Playwright TypeScript.

## Guidelines & Conventions

- **File Naming**: Name test spec files as `<feature>.spec.ts` (e.g., `login.spec.ts`, `checkout.spec.ts`).
- **Fixture Import**: Always import `test` and `expect` from `fixtures/test.fixture.ts` to access POM fixtures.
- **Data Isolation**: Load test data from `test-data/*.json` files. Do not hardcode credentials or mock data in specs.
- **Web-First Assertions**: Use web-first assertions (`await expect(locator).toBeVisible()`).

## Example Spec File

```typescript
import { test, expect } from '../fixtures/test.fixture';
import { envConfig } from '../utils/env';

test.describe('Example Suite', () => {
  test('should load page and verify heading', async ({ examplePage }) => {
    await examplePage.goto();
    await examplePage.verifyPageLoaded();
  });
});
```
