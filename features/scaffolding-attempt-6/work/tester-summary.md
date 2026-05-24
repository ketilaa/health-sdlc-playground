# Tester Summary — scaffolding-attempt-6

## Status
OK

## Input Summary
- **Scope:** frontend
- **Scenarios:** 5 (Background shared across all)
- **Implementation:** Next.js static export served by `npx serve`. Two browser-based scenarios (app header title, dataset-selector placeholder), one document-title scenario, and two HTTP-level scenarios (200 for `/`, 404 for unknown route).

## Assumptions

- The application is served on `http://localhost:3000` (overridable via `APP_URL` env var).
- `run-e2e.sh` builds the Next.js app with `npm run build` inside `frontend/`, producing a static export in `frontend/out/`.
- `npx serve frontend/out` is available and correctly serves HTTP 404 for unmatched paths when a `404.html` exists in the output directory (produced by Next.js `next export`).
- No authentication or cookies are required to access `/` or any route.
- `data-testid="app-header"` and `data-testid="dataset-selector-placeholder"` are present in the server-rendered or hydrated HTML as stated in the developer summary.
- The document `<title>` is set to exactly `"Health Playground"` with no suffix or prefix on any route.
- `ts-node` is available in the `e2e/` node_modules for TypeScript step definitions (or is added by the e2e `package.json`).
- The Background steps (`repository is checked out`, `dependencies have been installed`) are environmental preconditions satisfied by `run-e2e.sh` before tests run; they are implemented as no-ops.
- Playwright's `request` context with `failOnStatusCode: false` accurately captures the raw HTTP status from `npx serve`.

## Decisions

- **HTTP tests via Playwright `request` fixture** (not browser navigation): Captures raw HTTP status codes reliably, matching the Gherkin intent of "a GET request is made to …" — a browser `goto` masks status codes.
- **Browser tests use `domcontentloaded` wait**: Sufficient for a statically exported app where the title and `data-testid` attributes are in the initial HTML; avoids unnecessary `networkidle` waits that could time out in CI.
- **Descendant CSS selector for nesting assertion**: `[data-testid="app-header"] [data-testid="dataset-selector-placeholder"]` directly encodes the nesting requirement from the Gherkin without fragile parent-traversal logic.
- **`waitFor({ state: 'attached' })` for placeholder**: The Gherkin says "is present" not "is visible" — the placeholder could be `opacity: 0` or off-screen per UX spec (reduced opacity), so `attached` is the correct assertion.
- **Separate `apiRequest` context per scenario**: Created fresh in `Before` hook, disposed in `After` — prevents state leakage between scenarios.
- **TypeScript for step definitions**: Consistent with the project's likely TypeScript frontend; provides type safety on the World interface.

## Alternatives Considered

- **Using `page.goto` for HTTP status assertions**: Ruled out because Playwright's browser navigation does not expose the raw HTTP response status — it would always appear successful from the test's perspective even on a 404 route in a SPA that returns 200 with client-side routing.
- **Using `networkidle` waitUntil**: Ruled out because static exports load fast and `networkidle` can be flaky in CI environments with slow DNS or CDN; `domcontentloaded` is deterministic for SSG output.
- **Polling document.title with `page.evaluate`**: Ruled out in favour of `expect(page).toHaveTitle()` which is Playwright's built-in polling assertion — more idiomatic and has automatic retry.
- **Single shared browser context across all scenarios**: Ruled out to avoid test pollution (cookies, navigation state, page title from previous test leaking).
- **Jest + Playwright** instead of Cucumber: Out of scope — the pipeline mandates Cucumber + Playwright.

## Gaps

1. **Static server 404 behaviour depends on `next export` producing `404.html`**: If the frontend uses a different build strategy (e.g. `next start` server-side rendering), `npx serve` would not handle 404s correctly and the HTTP 404 scenario would fail. The `run-e2e.sh` assumes static export. **Required fix if not static export: use `next start` and adjust `run-e2e.sh` accordingly.**
2. **No coverage of loading/skeleton state**: The UX spec defines a loading skeleton for the App Header, but no Gherkin scenario covers it. Intentionally untested.
3. **No coverage of error boundary state**: UX spec §4.4 defines a client-side error state ("Something went wrong."), but no Gherkin scenario covers it. Intentionally untested.
4. **No coverage of Not Found surface UI content**: The Gherkin only asserts HTTP 404 status, not the visual 404 page content (glyph, heading, "Go home" link). The UX spec describes it in detail but it is not tested. Intentionally untested per scope.
5. **`ts-node` dependency**: The step definitions are TypeScript and require `ts-node` to be available in `e2e/node_modules`. If the base `e2e/package.json` does not include it, `run-e2e.sh`'s `npm install` will not add it automatically. This should be declared as a dev dependency in `e2e/package.json`.

## Output Summary

- **Scenarios mapped:** 5 / 5
- **Step definitions written:** 9 step handlers across 2 files (`world.ts`, `scaffolding-attempt-6.steps.ts`)
- **Gaps identified:** 5 (4 intentional/out-of-scope, 1 environmental dependency on build strategy)
- **Files produced:** `run-e2e.sh`, `e2e/scaffolding-attempt-6/world.ts`, `e2e/scaffolding-attempt-6/scaffolding-attempt-6.steps.ts`, `e2e/scaffolding-attempt-6/cucumber.config.ts`