# Tester Summary

## Status
OK

## Input Summary
- **Scope:** `frontend`
- **Scenarios:** 5 Gherkin scenarios covering HTTP status codes (200, 404) and browser-rendered DOM assertions (header visibility, text content, nested placeholder, document title)
- **Implementation provides:** Next.js App Router application with `AppBar` component carrying `data-testid="app-header"`, a nested `data-testid="dataset-selector-placeholder"`, `metadata.title = 'Health Playground'` in the root layout, and `not-found.tsx` returning HTTP 404 for unmatched routes

## Assumptions
- The application is running and reachable at `http://localhost:3000` (or `APP_URL`) before any test step executes
- `npm run build && npm start` in the `frontend/` directory produces a production server on port 3000; `run-e2e.sh` performs this before launching tests
- `[data-testid="app-header"]` is placed on the root element of the `AppBar` component, not on an inner element — confirmed by developer summary
- `[data-testid="dataset-selector-placeholder"]` is a DOM descendant of `[data-testid="app-header"]` — confirmed by developer summary (placed inside Toolbar, which is inside AppBar)
- Next.js production server (`next start`) returns genuine HTTP 404 status codes for unmatched routes, as guaranteed by App Router behaviour
- No authentication or session state is required for any route
- No pre-seeded data is required for the scaffold scenarios
- The `<title>` element equals exactly "Health Playground" with no suffix/prefix — Next.js App Router `metadata.title` without a `template` satisfies this
- `ts-node` is available in the `e2e/` node_modules for TypeScript step definition compilation at runtime
- Playwright's `chromium` browser binary is installed (via `@playwright/test` post-install)

## Decisions
- **`next start` over `npx serve`:** Used `next start` (SSR mode) in `run-e2e.sh` rather than a static file server so that HTTP 404 status codes are returned by Next.js itself for unknown routes, not inferred from a static server's 404.html handling. This is more faithful to the Gherkin intent ("the response has HTTP status 404").
- **`maxRedirects: 0` on API requests:** Set to prevent Playwright's request context from silently following a redirect and returning a 200 when the original response was a 404 or vice versa.
- **`domcontentloaded` wait strategy:** Used `waitUntil: 'domcontentloaded'` for page navigation to ensure the DOM is parsed and `data-testid` attributes are present before assertions. `networkidle` was avoided as it can be slow/flaky with Next.js hydration requests.
- **Playwright `expect` for all DOM assertions:** Used `@playwright/test`'s `expect` rather than Node's `assert` to get automatic retry logic and readable failure messages.
- **Separate `Before`/`After` hooks instantiate browser per scenario:** Each scenario gets a fresh browser context for isolation. This is slightly slower than sharing a context but prevents state leakage between the HTTP-only and browser scenarios.
- **`data-testid` selector style:** Used `[data-testid="…"]` CSS attribute selectors throughout, matching the Gherkin specification exactly and the developer's implementation.
- **Parent→child assertion for placeholder:** Used `parentLocator.locator('[data-testid="dataset-selector-placeholder"]')` to assert DOM nesting, directly matching the Gherkin "is present inside" wording.

## Alternatives Considered
- **`npx serve` as static file server:** Ruled out because static servers handle 404 status codes inconsistently depending on configuration; `next start` guarantees the correct HTTP semantics from the framework itself.
- **`networkidle` wait strategy:** Ruled out because Next.js App Router makes background fetch requests during hydration that keep the network busy, causing `networkidle` waits to take longer than necessary and occasionally time out in CI.
- **Shared browser context across scenarios:** Ruled out because the HTTP-only scenarios (GET requests) do not use the browser, and sharing context between them and browser scenarios would add unnecessary coupling and potential state contamination.
- **Using `page.waitForSelector` instead of `expect(locator).toBeVisible()`:** Ruled out because Playwright's `expect` assertions include built-in retry logic with configurable timeouts, making them more robust than one-shot `waitForSelector` calls.
- **`page.evaluate(() => document.title)` for title assertion:** Ruled out in favour of `expect(page).toHaveTitle()` which is the idiomatic Playwright assertion and includes retry logic.

## Gaps
- **Loading/skeleton state (UX §4.4):** The UX spec defines a pre-hydration skeleton state. This state is not asserted by any Gherkin scenario and is extremely difficult to capture reliably with Playwright (it is transient and may not be observable after `domcontentloaded`). No test written; flagged as a UX spec → Gherkin gap.
- **Error boundary state (UX §4.4):** The UX spec defines a client-side rendering failure state ("Something went wrong." + Reload button). Not covered by Gherkin; would require deliberate injection of a React error, which is out of scope for E2E black-box testing. No test written.
- **Not-found page visual content:** Gherkin asserts only the HTTP 404 status for unknown routes. The UX spec defines a full visual surface (404 glyph, "Page not found" heading, "Go home" button). No Gherkin scenarios cover these elements, so no tests are written for them.
- **Responsive behaviour (UX §6):** The UX spec defines layout requirements at desktop, tablet, and mobile breakpoints. No Gherkin scenarios assert responsive behaviour; no viewport-switching tests are written.
- **`data-testid` availability at runtime:** The tests assume `data-testid` attributes survive the Next.js production build. If the build strips test IDs (e.g. via a babel plugin), the DOM assertions will fail. This is a configuration risk, not a test design gap.

## Output Summary
- **Scenarios mapped:** 5/5 — all Gherkin scenarios covered
- **Step definitions written:** 9 step definitions across 2 categories (HTTP API assertions, browser DOM assertions)
- **Files produced:** `run-e2e.sh`, `e2e/scaffolding-attempt-6/world.ts`, `e2e/scaffolding-attempt-6/scaffolding-attempt-6.steps.ts`, `e2e/cucumber.json`, `e2e/tsconfig.json`
- **Gaps identified:** 4 (loading state, error state, not-found visual content, responsive layout) — all stem from UX spec content not reflected in Gherkin scenarios