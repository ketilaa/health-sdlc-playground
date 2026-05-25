## Outer Iteration 1

# Tester Summary

## Status
OK

## Input Summary
- **Scope:** `frontend`
- **Scenarios:** 11 Gherkin scenarios across 6 logical flows
- **Implementation:** Next.js static export (output: 'export') served from `frontend/out/` via `npx serve`. All data is synchronous and baked into the frontend bundle. No API calls. Components use MUI with `data-testid` attributes. Developer built `weeklyDashboardData.ts`, `WeeklyDashboard.tsx`, and RTL unit tests.

## Assumptions

- The app is served as a static export from `frontend/out/` on port 3000 under the basePath `/health-sdlc-playground`.
- `npx serve` is available in the environment (transitively or globally installed).
- All mock data (including "Strength Cross-Train" with no avg_hr/cadence, W08/W09/W10 weekly records, stable W09 vs W08 trends) is present in the compiled bundle.
- Week "2024-W08" is the dataset's earliest week — no prior week exists for trend comparison.
- Week "2024-W09" values for training load, avg HR, and resting HR are all within ±2% of W08 values (this is a Given in the Gherkin, trusted as true in the bundle).
- The week-selector `data-testid` element wraps either an MUI Select (role="combobox") or a ToggleButtonGroup (role="group" with buttons).
- Week label text in the UI contains the week number (e.g. "W10", "10", "Week 10") allowing fuzzy matching.
- The `activity-list` items contain visible activity name text that can be matched with Playwright `locator('text=...')`.
- All `data-testid` values listed in the UX spec are present in the rendered HTML (`weekly-summary-card`, `weekly-vo2max`, `weekly-resting-hr`, `weekly-avg-hr`, `weekly-avg-cadence`, `intensity-balance`, `trend-training-load`, `trend-avg-hr`, `trend-resting-hr`, `activity-list`, `activity-detail`, `activity-avg-hr`, `activity-cadence`).
- No authentication is required to access the app.
- The Chromium browser can be installed via `npx playwright install chromium` in the CI environment.
- App becomes ready within 40 seconds (20 retries × 2s).
- The `e2e/package.json` already contains `@cucumber/cucumber`, `@playwright/test`, `playwright`, `ts-node`, `typescript`, and `@types/node` — no new dependencies were added.

## Decisions

- **Static export served via `npx serve`** — `next start` fails with `output: 'export'`; `npx serve` is the correct approach for Next.js static exports. Health check polls `/health-sdlc-playground/` (the basePath) rather than `/` to account for the rewrite.
- **Background steps are no-ops** — All "Given the mock dataset contains..." steps are informational constraints on the bundled data, not runtime-injectable state. Making them no-ops is correct since data is baked in at build time.
- **Week selector uses multi-strategy selection** — Because the UX spec allows either MUI Select or ToggleButtonGroup, the step definition detects which pattern is present (checks for role="combobox" or `<select>`) and adapts. This makes tests resilient to the implementation choice.
- **Week label matching is fuzzy** — Multiple label variants ("W10", "10", "Week 10") are tried in order. This tolerates different human-readable formats without hardcoding a single string.
- **`containsText` over exact match for trend arrows** — Substring matching tolerates surrounding whitespace, wrapper elements, or additional metadata text the developer may have added.
- **Shared browser, per-test context/page** — Browser is launched once in `BeforeAll` and closed in `AfterAll`. Each test gets a fresh context and page in `Before`/`After`. This balances speed (no browser cold start per test) with isolation (no shared cookies/localStorage).
- **Responsive test reopens context at 375px** — The responsive scenario requires a 375px viewport. Rather than a global viewport change (which would affect other tests), the step creates a new context with the narrower viewport and navigates fresh.
- **Duplicate step definition resolved** — Gherkin uses both "an element with data-testid X is visible" and "the element with data-testid X is visible" phrasings. Both are registered to the same assertion logic.

## Alternatives Considered

- **Using `page.setViewportSize()` mid-test for responsive scenario** — Possible, but creates a shared mutable state on the page. Creating a new context is cleaner and avoids any potential CSS/layout caching.
- **Injecting mock data via page.route() intercepts** — Would allow stable-trend and strength-cross-train scenarios to inject data rather than rely on the bundle. Ruled out because the app is a static export with no network calls — there are no API requests to intercept. Data lives in the JS bundle.
- **Exact text matching for trend indicators** — `toHaveText()` is stricter but fails if the element has child nodes with surrounding whitespace. `toContainText()` is more reliable for MUI Chip components that may render wrapper spans.
- **Using Playwright Test runner directly (no Cucumber)** — Would simplify the setup and eliminate the step mapping overhead. Ruled out — the pipeline contract requires Cucumber + Playwright, and the `.feature` file is the source of truth.
- **Polling for activity detail via `waitForSelector`** — Instead of the global `waitForSelector` after click, could use `locator.waitFor()`. Both are equivalent; the global selector was chosen for clarity.

## Gaps

1. **Week selector widget type is unknown** — The UX spec says "MUI Select or ToggleButtonGroup" without specifying which the developer chose. The multi-strategy step definition handles both but adds complexity. If neither pattern matches, the test will throw a descriptive error. **Improvement:** Developer should document the implementation choice in the summary.

2. **Stable-trend data (W09 vs W08) cannot be verified at E2E level** — The test assumes the bundled mock data satisfies the ±2% threshold. If the developer's W09/W08 data does not satisfy this, the stable-trend test will fail. There is no E2E mechanism to inspect or override the bundle data.

3. **"Strength Cross-Train" activity presence cannot be verified at E2E level** — Similarly, the test assumes this activity with null avg_hr/cadence is in the W10 bundle. The developer summary says it is present (`extraActivities` via props or data module), but the E2E test cannot confirm without clicking the activity.

4. **`basePath` in navigation URL** — The `run-e2e.sh` health check and `APP_URL` constant both include `/health-sdlc-playground`. If the developer changed the basePath, all navigation steps fail. This is a hard dependency on the Next.js config.

5. **Arrow characters in trend text (Unicode)** — The step definitions assert "↑ Increasing", "↓ Decreasing", "→ Stable" using the exact Unicode arrows from the Gherkin. If the developer used HTML entities or different Unicode code points, assertions fail even though the UI looks correct.

6. **MUI Select popup may render outside the `week-selector` container** — MUI Select renders its dropdown in a portal (appended to `<body>`), so the role="option" elements are outside the `[data-testid="week-selector"]` subtree. The step definition correctly searches the full page for role="option" after opening the combobox — this is intentional and correct.

## Output Summary

- **Scenarios mapped:** 11 / 11 (all scenarios covered)
- **Step definitions written:** 18 distinct step patterns in `improve-weekly-aggregates-and-prepare-for-more-insights.steps.ts`
- **Files produced:** `run-e2e.sh`, `e2e/improve-weekly-aggregates-and-prepare-for-more-insights/world.ts`, `e2e/improve-weekly-aggregates-and-prepare-for-more-insights/improve-weekly-aggregates-and-prepare-for-more-insights.steps.ts`, this summary
- **Gaps identified:** 6 (none blocking; all documented above with mitigations in place)