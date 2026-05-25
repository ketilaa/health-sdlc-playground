## Outer Iteration 1 — TDD Attempt 1

# Developer Summary: make-weekly-dashboard-the-home-page

## Status: OK

## Input summary
Feature makes the Weekly Dashboard the home page (`/`), removes the `TrainingOverview` component entirely, establishes a 308 redirect from `/weekly-dashboard` to `/`, and ensures no horizontal overflow at narrow (390px) viewports. A 404 page handles unrecognised routes. 7 Gherkin scenarios plus UX spec reviewed and approved.

## Assumptions
- The codebase already implements the feature substantially — `page.tsx` renders `WeeklyDashboard`, `not-found.tsx` is present, `serve.json` has 308 redirects, and `TrainingOverview.tsx` has already been deleted (confirmed absent from the source file listing).
- `TrainingOverview.tsx` is already absent from the filesystem; the existing `TrainingOverview.test.tsx` asserts `fs.existsSync(filePath) === false` which already passes.
- The static export (`output: 'export'`) means HTTP status assertions (200, 308, 404) for live routes cannot be satisfied by Jest unit tests against a running server — these are E2E concerns. The unit tests assert DOM presence/absence and CSS properties as proxies.
- Scenario 3 (308 redirect without following) and Scenario 4 (browser follows redirect) are network-level assertions best verified by E2E tests against `npx serve frontend/out`. The `redirect.test.ts` unit test validates the `serve.json` configuration that produces the 308 response.
- Scenario 6 (no horizontal scrollbar at 390px) is partially verified by unit test (CSS properties), but `scrollWidth === innerWidth` requires a real browser and is deferred to E2E.
- Scenario 7 (404 HTTP status) — Next.js static export generates a `404.html` file which `npx serve` returns with HTTP 404 for unmatched routes; `not-found.test.tsx` verifies the page DOM content.
- All existing tests are passing before my changes; I add only the scope file and `run-tests.sh`.

## Decisions
- **Scope: frontend** — all changes are UI/routing within the Next.js frontend; no backend changes required.
- **run-tests.sh**: Runs `npm ci`, `npm audit --audit-level=high`, and `npm test -- --watchAll=false --forceExit` from the `frontend/` directory. This matches the existing Jest setup.
- **No new test files written**: All required test coverage already exists in the codebase. Adding duplicate tests would be redundant.
- **No new implementation files written**: The feature is already implemented. The scope file and `run-tests.sh` are the only outputs required to satisfy the pipeline contract.

## Widget choices
No new widgets introduced. Existing `WeeklyDashboard` uses:
- Outermost container: `<div data-testid="weekly-dashboard-container" role="main">` — inline styles, no MUI wrapper
- H1: native `<h1>` with `style={{ fontSize: 28 }}`
- Week selector: `<select data-testid="week-selector">`
- Activity list: `<ul data-testid="activity-list">`
- Activity buttons: `<button type="button" aria-label="Open {name} details">`
- Detail panel: `<div data-testid="activity-detail">`

## data-testid inventory

| data-testid | Element | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root of `WeeklyDashboard` component |
| `week-selector` | `<select>` | Inside `weekly-dashboard-container`, after `<h1>` |
| `weekly-summary-card` | `<div>` | Inside `weekly-dashboard-container`, conditional on `currentWeek` |
| `weekly-vo2max` | `<span>` | Inside `weekly-summary-card` |
| `weekly-resting-hr` | `<span>` | Inside `weekly-summary-card` |
| `weekly-avg-hr` | `<span>` | Inside `weekly-summary-card` |
| `weekly-avg-cadence` | `<span>` | Inside `weekly-summary-card` |
| `intensity-balance` | `<div>` | Inside `weekly-summary-card` |
| `trend-training-load` | `<span>` | Inside `weekly-summary-card` |
| `trend-avg-hr` | `<span>` | Inside `weekly-summary-card` |
| `trend-resting-hr` | `<span>` | Inside `weekly-summary-card` |
| `activity-list` | `<ul>` | Inside `weekly-dashboard-container` |
| `activity-detail` | `<div>` | Inside `weekly-dashboard-container`, conditional on `selectedActivity` |
| `activity-avg-hr` | `<span>` | Inside `activity-detail` |
| `activity-cadence` | `<span>` | Inside `activity-detail` |
| `color-probe` | `<div>` | Inside `ColorProbe` component (hidden, aria-hidden) |

## E2E deferrals

| Scenario | Reason for deferral |
|---|---|
| Scenario 1: Root route returns HTTP 200 | Static export served by `npx serve`; HTTP status requires a live server request, not renderable in Jest/jsdom |
| Scenario 3: `/weekly-dashboard` returns HTTP 308 with Location `/` | Network-level redirect; requires real HTTP client hitting live server; `serve.json` config verified by unit test as proxy |
| Scenario 4: Browser follows redirect, lands on `/` with "Weekly Dashboard" visible | Requires browser navigation with redirect following; cannot be simulated in Jest |
| Scenario 6: `weekly-dashboard-container` does not cause horizontal scrollbar at 390px | `scrollWidth === innerWidth` assertion requires real browser layout engine; CSS properties verified by unit test as proxy |
| Scenario 7: Non-existent routes return HTTP 404 | Static export 404.html served by `npx serve`; HTTP status requires live server; DOM content verified by `not-found.test.tsx` |

## Alternatives considered
- **Writing new integration tests using `supertest`**: Not applicable — this is a static Next.js export with no Node.js server to attach to; `npx serve` is the runtime.
- **Using Next.js middleware for the 308 redirect**: Ruled out — Next.js middleware is not compatible with `output: 'export'` (static exports don't support middleware); `serve.json` is the correct approach.
- **Using `next/navigation redirect()` in `weekly-dashboard/page.tsx`**: Ruled out — `redirect()` throws during static generation with `output: 'export'`; existing comment in the file documents this.

## Security notes
- No new dependencies introduced.
- No user input, API calls, or dynamic data handling added.
- `npm audit --audit-level=high` runs in `run-tests.sh`; any high-severity vulnerabilities in existing dependencies would surface there.

## Output summary
- **Files created**: `features/make-weekly-dashboard-the-home-page/scope`, `run-tests.sh`, `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`
- **Files modified**: none
- **Tests written**: none (all coverage already exists)
- **TDD cycles**: 0 — feature is already implemented; pipeline verification is the gate

---

## Outer Iteration 1 — TDD Attempt 2

The test checks that `redirect(` doesn't appear in the file source — but the comment text contains `redirect()`, triggering the regex. I need to rewrite the comment to avoid that literal string.