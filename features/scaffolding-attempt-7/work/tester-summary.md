# Tester Summary — scaffolding-attempt-7

## Status
OK

## Input summary
- **Scope:** `frontend`
- **Scenarios:** 5 (build success, home served 200, top bar title, dataset selector placeholder nesting, 404 for unknown route)
- **Implementation:** Next.js 14 App Router with MUI v5; `data-testid="top-bar"` on AppBar root and `data-testid="dataset-selector-placeholder"` on Skeleton root; `not-found.tsx` returns real HTTP 404 via App Router.

## Assumptions

- The app is started with `next start -p 3000` (not `next dev`) so that App Router's server-side 404 mechanism returns a real HTTP 404 status code.
- `npm install` and `npm run build` have been executed inside `frontend/` before the server starts — both are performed inside `run-e2e.sh`.
- `frontend/node_modules` exists by the time Cucumber Background steps run.
- `frontend/.next` exists (or `frontend/out`) when the "application has been built" Given step runs.
- Node 18+ is present in the execution environment.
- No authentication is required on any route.
- Chromium (headless) is available via Playwright's bundled browsers after `npm install` in `e2e/`.
- `e2e/package.json` already has `@cucumber/cucumber` and `@playwright/test`; this tester adds `ts-node`, `typescript`, and `@types/node` only.
- `APP_URL` environment variable, if set, overrides `http://localhost:3000`.
- The "application is running" Given step makes a live GET request to `/` and accepts any HTTP response code as proof of server availability — not just 200 — because the scenario under test is what asserts the specific status code.

## Decisions

- **`next start` over `npx serve`:** The 404 scenario requires a server-side HTTP 404, not a client-side redirect. `next start` honours App Router's `not-found.tsx` and returns a real 404. `npx serve` would serve a static export and could not satisfy this requirement without additional CDN-level 404 configuration.
- **`execSync` for build scenario:** The "application builds successfully" Gherkin scenario is a CLI operation (exit code 0), not a browser test. Using `child_process.execSync` inside a Cucumber step is the most direct mapping. Note: because `run-e2e.sh` already builds the app before starting the server, this step re-runs the build. This is intentional: it independently verifies the build scenario as stated in the Gherkin, rather than relying on the `run-e2e.sh` side effect.
- **`waitFor` instead of sleeps:** All UI assertions use `locator.waitFor({ state: 'visible' })` and `page.waitForFunction` to wait for the DOM to be ready. No `sleep` calls anywhere.
- **`data-testid` selectors throughout:** All UI locators use `[data-testid="..."]` as specified by the UX spec and confirmed by the developer. No CSS class selectors, no text-only locators (except for inner text content assertions, which are secondary checks after element presence is confirmed).
- **API-level assertions for HTTP status codes:** The `request` fixture from Playwright is used for the HTTP 200 and 404 scenarios rather than inspecting `page.goto` response — this gives a clean, direct status code assertion without browser rendering concerns.
- **Nesting assertion uses `parent.locator(child)`:** Playwright's scoped locator `parent.locator('[data-testid="dataset-selector-placeholder"]')` correctly verifies DOM nesting (descendant within ancestor), matching the UX spec requirement precisely.
- **Background steps are structural guards:** `the repository is checked out` and `dependencies have been installed` are implemented as filesystem existence checks (`frontend/` dir, `frontend/node_modules`) rather than no-ops, so failures in environment setup surface clearly.

## Alternatives considered

- **`npx serve frontend/out` as the server:** Rejected because static export cannot return a real HTTP 404 for unmatched routes without CDN configuration; `next start` is the correct production server for App Router.
- **`page.goto` response status for HTTP scenarios:** Rejected — `page.goto` triggers browser navigation and inflates the test with UI concerns; `request` fixture gives a clean HTTP assertion.
- **Playwright Test runner (`@playwright/test` `test()` blocks) instead of Cucumber:** The pipeline requires Cucumber + Playwright as specified. Playwright Test runner alone would not produce Gherkin-mapped step definitions.
- **Separate `Before`/`After` per scenario tag:** Rejected as unnecessary — all scenarios share the same world setup (browser + API context). Tag-based hooks would add complexity without benefit.
- **Treating "application builds successfully" as a pass-through (no-op given run-e2e.sh already built):** Rejected — the Gherkin scenario explicitly states "the command exits with code 0" which is an assertion, not a precondition. The step must independently execute and verify the command.

## Gaps

1. **Build step re-executes the build:** The "application builds successfully" scenario runs `npm run build` a second time (after `run-e2e.sh` has already built). This adds ~1–2 minutes to the test run. There is no clean way to avoid this while independently satisfying the Gherkin's assertion that `npm run build` exits with code 0 — unless the Gherkin were changed to a pre-condition rather than a testable assertion.
2. **Narrow viewport state (UX §5.3) not tested:** No Gherkin scenario covers mobile breakpoint behaviour (title visible, placeholder shrinks to ~120px). This is a gap in the Gherkin spec, not in the implementation.
3. **Tooltip and accessibility assertions not tested:** UX §4.2 specifies tooltip text, `aria-label`, and `tabIndex={-1}` for the dataset selector placeholder. No Gherkin scenario covers these; they are verified only by unit tests.
4. **"Loading" state not directly observable:** UX §5.1 describes a brief loading state during hydration. This state is server-rendered in App Router so it is not a distinct observable UI state — no Gherkin scenario targets it and it cannot be reliably intercepted by E2E tests without artificial network throttling.
5. **`ts-node` dependency:** Step definitions are TypeScript; `ts-node` is added as a dev dependency in `e2e/package.json` additions. If the pipeline's base `e2e/package.json` already includes `ts-node`, this would be a harmless duplicate but could cause a version conflict if versions differ.

## Output summary
- **Scenarios mapped:** 5 of 5
- **Step definitions written:** 12 (Background ×2, build scenario ×2, HTTP GET ×2, HTTP status ×1, browser load ×1, element visible ×1, text in element ×1, element nesting ×1, application running ×1)
- **Files produced:** `run-e2e.sh`, `e2e/scaffolding-attempt-7/world.ts`, `e2e/scaffolding-attempt-7/scaffolding-attempt-7.steps.ts`, `features/scaffolding-attempt-7/work/tester-summary.md`
- **Gaps identified:** 5 (build re-execution, missing viewport scenario, missing a11y assertions, unobservable loading state, potential ts-node version conflict)