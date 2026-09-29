# Test Fixtures (`fixtures/`)

This directory contains custom Playwright fixtures extending the base `test` object.

## Guidelines & Conventions

- **File Naming**: Primary fixture file is `test.fixture.ts`.
- **Purpose**: Instantiates and injects Page Object Models (POMs) or setup logic automatically into test functions.
- **Usage**: Import `test` and `expect` from `fixtures/test.fixture` in test files instead of `@playwright/test`.

## Example Usage in Specs

```typescript
import { test, expect } from '../fixtures/test.fixture';

test('sample test using custom fixture', async ({ examplePage }) => {
  await examplePage.goto();
  await examplePage.verifyPageLoaded();
});
```
