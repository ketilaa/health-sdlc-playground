## Outer Iteration 1

# Tester Summary — home-page-structure-step-1

## Status
OK

## Input summary
- **Scope:** frontend
- **Scenarios:** 7 Gherkin scenarios covering top bar title, dataset selector visibility, two-column layout structure, DOM ordering of training-overview before weekly-dashboard, placeholder text in training-overview, insights visibility in right column, placeholder text in insights
- **Implementation provides:** `HomePage.tsx` with MUI AppBar + Flexbox Box layout; all 7 `data-testid` attributes present in DOM; static Next.js export served from `frontend/out`; basePath `/health-sdlc-playground`

## Assumptions
- The app is served at `http://localhost:3000/health-sdlc-playground/` — the Next.js `basePath` is `/health-sdlc-playground` per `next.config.js`, so the home page is NOT at `http://localhost:3000/` but at the basePath-prefixed URL
- No authentication or login required to reach the home page
- All structural elements render synchronously — no async data fetching means no loading state to wait through before assertions
- The `frontend/out` directory contains the built static export and is available after `npm run build` in `frontend/`
- Chromium is available for Playwright to install
- The `e2e/package.json` already declares all required dependencies; no new packages were added
- `data-testid` values match exactly what the developer summary documents: `dataset-selector`, `content-area`, `left-column`, `right-column`, `training-overview`, `weekly-dashboard`, `insights`
- The text "Health Playground" is rendered somewhere in the page DOM (not only in `<title>`) — the Gherkin step targets visible page text, not the document title
- The text "Training Overview" appears inside the `training-overview` element, and "Insights" inside the `insights` element, as per UX spec

## Decisions
- **DOM ordering assertion via `compareDocumentPosition`:** The Gherkin step "appears before" has no Playwright built-in equivalent. `page.evaluate()` with `Node.compareDocumentPosition()` is the most reliable and semantically correct approach for verifying document order.
- **Containment assertions via scoped locator:** `page.locator('[data-testid="parent"] [data-testid="child"]')` — direct CSS descendant selector avoids false positives from elements with matching testids outside the expected parent.
- **Browser lifecycle per scenario via `After` hook:** Each scenario gets a fresh browser context to ensure test isolation. Given only 7 scenarios and a static app, the overhead is acceptable.
- **`waitFor({ state: 'visible' })` before assertions:** All assertions call `waitFor` first to handle any React hydration delay, rather than assuming immediate DOM availability.
- **`getByText` with `exact: false`:** The Gherkin steps use plain text matching (not regex), and the text may be wrapped in child elements — partial matching is safer.

## Alternatives considered
- **`page.waitForSelector` instead of `locator.waitFor`:** `waitForSelector` is the older API; `locator.waitFor` is the current Playwright recommendation and integrates with auto-waiting — chose `locator.waitFor`
- **Single browser instance for all scenarios:** Would be faster but risks state leakage between scenarios if the page modifies any persistent state — chose per-scenario browser for isolation, acceptable for a static structural test
- **`first()` + bounding box comparison for ordering:** Could compare Y coordinates of elements to determine visual order, but DOM order is what the Gherkin and UX spec explicitly require (`compareDocumentPosition` is exact) — chose DOM order check
- **`page.locator('[data-testid="parent"]').locator('[data-testid="child"]')` chained locators vs CSS descendant:** Both are equivalent; CSS descendant string is slightly more readable in a single line — chose CSS descendant

## Gaps
- **No `data-testid` on the top bar itself:** The Gherkin step "the text 'Health Playground' is visible on the page" is a page-wide text search, which is sufficient. However, if there were multiple "Health Playground" strings on the page (e.g. in a meta tag rendered to DOM), the test could produce a false positive. The UX spec notes the top bar has no explicit `data-testid` — this is a minor gap but not blocking for this structural step.
- **`weekly-dashboard` text content:** The Gherkin has no text assertion for the weekly-dashboard element. The UX spec notes its heading text is "not specified in Gherkin". This is intentional and not a gap for the test suite.
- **Responsive layout:** The UX spec explicitly marks responsive behaviour as out of scope. No viewport-specific tests written.

## Output summary
- **Scenarios mapped:** 7 / 7
- **Step definitions written:** 5 unique step definitions covering all Gherkin step patterns
- **Files produced:** `e2e/home-page-structure-step-1/home-page-structure-step-1.steps.ts`, `e2e/home-page-structure-step-1/world.ts`, `run-e2e.sh`
- **Gaps identified:** 1 minor (no top-bar `data-testid`); 0 blocking