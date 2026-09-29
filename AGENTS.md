<!-- bmad:context -->
<!-- Verified 2026-09-13 against initial-draft. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## Manage app PW

Playwright TypeScript automation framework for end-to-end web testing. Uses Page Object Models (POM), custom fixtures, and environment-based configuration. Planning lives in `chat-context/` and `FRAMEWORK_GUIDE.md`.

## Policy

- Always verify changes with `npm run typecheck` and `npm test` before concluding tasks.
- Keep test data strictly in `test-data/` JSON files; do not hardcode mock credentials in test specs.
- Store sensitive values (`BASE_URL`, tokens) in `.env` and load them via `utils/env.ts`.

## Where things are

- Test specs: `tests/` — write `*.spec.ts` files here
- Page Object Models: `pages/` — locator classes (`*.page.ts`)
- Test Fixtures: `fixtures/test.fixture.ts` — extends Playwright `test` with pre-initialized POMs
- Environment & helpers: `utils/env.ts` — parses `.env` configurations
- Framework documentation: `FRAMEWORK_GUIDE.md`
- Chat session context: `chat-context/`

## Running and verifying

- `npm run typecheck` (`tsc --noEmit`) to verify TypeScript compiler compliance.
- `npm test` runs the Playwright test suite in headless mode.
- `npm run test:headed` runs tests with a visible browser window.
- `npm run test:ui` launches Playwright interactive UI mode.
- `npm run test:debug` starts Playwright inspector for step-by-step debugging.

## Conventions that differ from defaults

- Use Page Objects from `fixtures/test.fixture.ts` rather than instantiating classes directly inside `test()` blocks.
- Locator strategies prefer accessible roles or specific IDs over fragile XPath selectors.
- Assertions must use Playwright web-first assertions (`await expect(locator).toBeVisible()`).

## Known pitfalls

- Do not set `"ignoreDeprecations": "6.0"` in `tsconfig.json` — it is an invalid compiler option string.
- `.env` file must be present at project root; refer to `.env.example` when setting up new environments.

<!-- /bmad:context -->
