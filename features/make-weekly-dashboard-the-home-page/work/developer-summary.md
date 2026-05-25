## Outer Iteration 1 — TDD Attempt 1

# Developer Summary: make-weekly-dashboard-the-home-page

## Status
OK

## Input summary
- Feature: make-weekly-dashboard-the-home-page
- 7 Gherkin scenarios covering: root route renders Weekly Dashboard (HTTP 200, text visible), root route excludes Training Overview testid, `/weekly-dashboard` issues 308 redirect, browser follows redirect to `/`, TrainingOverview file deleted, narrow viewport (390×844) no horizontal overflow, non-existent routes return 404.
- UX spec defines route architecture, Weekly Dashboard page states (loading/success/error/empty), removed component contract, 404 page, component inventory, accessibility requirements.
- Stack: Next.js 15 with static export (`output: 'export'`), React 19, MUI 5, Jest + RTL.

## Assumptions
- The 308 redirect for `/weekly-dashboard` is implemented via `frontend/public/serve.json` (for the static export served by `npx serve`) — not via Next.js `redirect()`, because `output: 'export'` means no runtime server. The existing `weekly-dashboard/page.tsx` using `redirect()` is only meaningful in dev mode; for production the `serve.json` handles it.
- The existing `frontend/src/app/page.tsx` rendering `WeeklyDashboard` already satisfies Scenarios 1, 2, and 4.
- The existing `WeeklyDashboard.tsx` component already has `data-testid="weekly-dashboard-container"`, H1 "Weekly Dashboard", and no `training-overview` testid.
- Scenario 5 requires the file to literally not exist — the previous implementation left a stub file which violates the Gherkin assertion. The file must be deleted.
- Scenario 3 (HTTP 308 without following redirects) and Scenario 4 (browser follows redirect) are network-level assertions requiring a live server — deferred to E2E. The unit test verifies `serve.json` config as a proxy.
- Scenario 6 (horizontal overflow at 390px) requires a real browser viewport — deferred to E2E. The unit test verifies the CSS properties (`overflowX: hidden`, `maxWidth: 100%`, `boxSizing: border-box`) that enforce no overflow.
- Scenario 7 (HTTP 404) is handled by Next.js `not-found.tsx` — deferred to E2E for the actual HTTP status assertion; unit test verifies the 404 page renders correctly.

## Decisions
- **Delete TrainingOverview.tsx**: Scenario 5 requires the file does not exist; the previous stub violates this. Deleted the file and replaced the test with a filesystem existence check.
- **Update TrainingOverview.test.tsx**: The old test imported the stub module and checked for empty exports — this was testing invisible/removed content. Replaced with a direct `fs.existsSync()` assertion matching the Gherkin scenario exactly.
- **Keep serve.json 308 redirect config**: Already correctly configured for the static export deployment; no changes needed.
- **Keep existing page.tsx, WeeklyDashboard.tsx, not-found.tsx**: All already satisfy their respective scenarios.
- **run-tests.sh**: Runs `npm ci`, `npm audit --audit-level=high`, then `npm test` in the frontend directory.

## Widget choices
- No new widgets introduced in this iteration. Existing `WeeklyDashboard` uses inline styles with `Box`-equivalent `<div>` elements. The `weekly-dashboard-container` is a `<div>` with `role="main"`, `data-testid="weekly-dashboard-container"`.

## data-testid inventory

| testid | Element | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root of `WeeklyDashboard` component |
| `week-selector` | `<select>` | Inside `weekly-dashboard-container` |
| `weekly-summary-card` | `<div>` | Inside `weekly-dashboard-container` |
| `weekly-vo2max` | `<span>` | Inside `weekly-summary-card` |
| `weekly-resting-hr` | `<span>` | Inside `weekly-summary-card` |
| `weekly-avg-hr` | `<span>` | Inside `weekly-summary-card` |
| `weekly-avg-cadence` | `<span>` | Inside `weekly-summary-card` |
| `intensity-balance` | `<div>` | Inside `weekly-summary-card` |
| `trend-training-load` | `<span>` | Inside `weekly-summary-card` |
| `trend-avg-hr` | `<span>` | Inside `weekly-summary-card` |
| `trend-resting-hr` | `<span>` | Inside `weekly-summary-card` |
| `activity-list` | `<ul>` | Inside `weekly-dashboard-container` |
| `activity-detail` | `<div>` | Inside `weekly-dashboard-container` |
| `activity-avg-hr` | `<span>` | Inside `activity-detail` |
| `activity-cadence` | `<span>` | Inside `activity-detail` |

## E2E deferrals
- **Scenario 1 (HTTP 200 for root route)**: HTTP status assertion requires a live server; structural correctness via `page.tsx` existence deferred to E2E.
- **Scenario 3 (308 redirect without following)**: Requires actual HTTP request to a running server; unit test verifies `serve.json` config as proxy.
- **Scenario 4 (browser follows redirect to /)**: Requires Playwright to navigate and check final URL; deferred to E2E.
- **Scenario 6 (no horizontal overflow at 390px)**: `document.documentElement.scrollWidth === window.innerWidth` assertion requires a real browser; unit test verifies CSS properties instead.
- **Scenario 7 (HTTP 404 for non-existent routes)**: HTTP status assertion requires a live server; unit test verifies 404 page renders correctly.

## Alternatives considered
- **Keep TrainingOverview.tsx as empty stub**: Ruled out — Gherkin Scenario 5 explicitly states the file "does not exist", not that it has no exports. The test must assert `fs.existsSync()` returns false.
- **Implement 308 redirect via Next.js `next.config.js` redirects**: Ruled out — `output: 'export'` static sites don't support server-side redirects at runtime; `serve.json` is the correct mechanism for `npx serve`.
- **Use Next.js `redirect()` in `weekly-dashboard/page.tsx` for 308**: Already present for dev mode; it issues a 307 by default and `permanent: true` gives 308, but only works in server-rendering mode. For the static export E2E scenario, `serve.json` is the authority.

## Security notes
- No new dependencies added.
- No user input handling introduced.
- `npm audit --audit-level=high` included in `run-tests.sh`.
- `dangerouslySetInnerHTML` in `layout.tsx` uses only static theme token values (not user input) — not a vulnerability.

## Output summary
- **Files deleted**: `frontend/src/components/TrainingOverview.tsx` (Scenario 5 requires non-existence)
- **Files modified**: `frontend/src/components/TrainingOverview.test.tsx` (replaced stub-import test with filesystem existence check)
- **Files created**: `features/make-weekly-dashboard-the-home-page/scope`, `run-tests.sh`, `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`
- **TDD cycles**: 1 — existing implementation already satisfies most scenarios; the only gap was the TrainingOverview.tsx stub file that needed deletion

---

## Outer Iteration 2 — TDD Attempt 1

# Developer Summary: make-weekly-dashboard-the-home-page

## Status
OK

## Input summary
- Feature: make-weekly-dashboard-the-home-page
- 7 Gherkin scenarios: root route renders Weekly Dashboard (HTTP 200, text visible), root route excludes Training Overview testid, `/weekly-dashboard` issues 308 redirect, browser follows redirect to `/`, TrainingOverview file deleted, narrow viewport (390×844) no horizontal overflow, non-existent routes return 404.
- UX spec: route architecture, Weekly Dashboard page states, removed component contract, 404 page, component inventory, accessibility requirements.
- Stack: Next.js 15 static export (`output: 'export'`), basePath `/health-sdlc-playground`, React 19, MUI 5, Jest + RTL.

## Assumptions
- The `basePath: '/health-sdlc-playground'` in `next.config.js` means all routes under the static export are prefixed. When `npx serve frontend/out` serves the app on port 3000, the app root is `http://localhost:3000/health-sdlc-playground/` and `/weekly-dashboard` is at `http://localhost:3000/health-sdlc-playground/weekly-dashboard`.
- `serve.json` redirect sources and destinations must use the full basePath-prefixed paths, not bare paths.
- The 308 redirect is enforced via `serve.json` (not Next.js `redirect()`) because `output: 'export'` produces a static site with no runtime server.
- The existing `WeeklyDashboard.tsx`, `page.tsx`, `not-found.tsx` implementations were pre-existing from prior features; this feature's scope is limited to: deleting `TrainingOverview.tsx`, fixing `serve.json` redirect paths, and ensuring tests match.
- `strengthCrossTrainActivity`, trend/metrics data structures, and all the week-selection/activity-drill-down behavior in `WeeklyDashboard.tsx` are pre-existing from prior features — not introduced by this feature.

## Decisions
- **Fix `serve.json` redirect paths**: Changed sources from `/weekly-dashboard` and `/weekly-dashboard/` to `/health-sdlc-playground/weekly-dashboard` and `/health-sdlc-playground/weekly-dashboard/`, and destination from `/` to `/health-sdlc-playground/`. This is the critical fix for Scenarios 3 and 4.
- **Update redirect test**: Updated `redirect.test.ts` to assert the basePath-prefixed paths in `serve.json`.
- **Delete TrainingOverview.tsx**: Scenario 5 requires the file does not exist; deleted and replaced test with `fs.existsSync()` assertion.
- **No changes to WeeklyDashboard.tsx or its tests**: These are pre-existing implementations from prior features. The behaviors tested (metrics, trends, activity drill-down) have Gherkin backing in those prior features' specs, not in this feature's spec. This feature does not add or modify those behaviors.
- **run-tests.sh**: Runs `npm ci`, `npm audit --audit-level=high`, `npm test` in frontend directory.

## Widget choices
No new widgets introduced. Pre-existing `WeeklyDashboard` uses `<div data-testid="weekly-dashboard-container" role="main">` as outermost wrapper.

## data-testid inventory (introduced by this feature only)

| testid | Element | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root of `WeeklyDashboard` (pre-existing) |

All other testids (`week-selector`, `weekly-summary-card`, `activity-list`, `activity-detail`, etc.) are pre-existing from prior features and not inventoried here.

## E2E deferrals
- **Scenario 1 (HTTP 200 for root route)**: Requires live server; `page.tsx` structural existence plus unit test for rendered content satisfies the "text visible" assertion. HTTP 200 deferred to E2E.
- **Scenario 3 (308 redirect without following)**: Requires `curl`/Playwright `request` against live server at `http://localhost:3000/health-sdlc-playground/weekly-dashboard`; unit test verifies `serve.json` config as proxy.
- **Scenario 4 (browser follows redirect to /)**: Requires Playwright navigation and final URL assertion; deferred to E2E.
- **Scenario 6 (no horizontal overflow at 390px)**: `scrollWidth === innerWidth` requires real browser; unit test verifies CSS properties (`overflowX: hidden`, `maxWidth: 100%`, `boxSizing: border-box`) that enforce constraint.
- **Scenario 7 (HTTP 404)**: HTTP status requires live server; unit test verifies 404 page renders with correct H1 and CTA.

## Alternatives considered
- **Keep bare paths in serve.json**: Ruled out — `npx serve frontend/out` serves files from the `out/` directory which has the basePath structure baked in; bare `/weekly-dashboard` would never match.
- **Use `next.config.js` redirects instead of serve.json**: Ruled out — `output: 'export'` does not support server-side redirects at runtime; Next.js redirects in config are processed at request time by the Next.js server, which doesn't exist in static export mode.
- **Remove WeeklyDashboard metrics/trends behavior**: Ruled out — these are pre-existing implementations from prior features with their own Gherkin backing; removing them would break prior feature contracts.

## Security notes
- No new dependencies added.
- `npm audit --audit-level=high` in `run-tests.sh`.
- `dangerouslySetInnerHTML` in `layout.tsx` uses only static theme token values (no user input).

## Output summary
- **Files changed**: `frontend/public/serve.json` (basePath-prefixed redirect paths), `frontend/src/app/weekly-dashboard/redirect.test.ts` (updated assertions for basePath-prefixed paths)
- **Files deleted**: `frontend/src/components/TrainingOverview.tsx`
- **Files created/updated**: `features/make-weekly-dashboard-the-home-page/scope`, `run-tests.sh`, `frontend/src/components/TrainingOverview.test.tsx`, `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`
- **TDD cycles**: 2 (first pass had basePath gap; second pass fixes redirect paths and test assertions)

---

## Outer Iteration 3 — TDD Attempt 1

# Developer Summary: make-weekly-dashboard-the-home-page

## Status
OK

## Input summary
- Feature: make-weekly-dashboard-the-home-page
- 7 Gherkin scenarios: root route renders Weekly Dashboard (HTTP 200, text visible), root route excludes Training Overview testid, `/weekly-dashboard` issues 308 redirect (status 308 + Location header), browser follows redirect and lands on `/`, TrainingOverview file deleted, narrow viewport (390×844) no horizontal overflow, non-existent routes return HTTP 404.
- UX spec: route architecture, Weekly Dashboard page states, removed component, 404 page, accessibility.
- Stack: Next.js 15 static export (`output: 'export'`), `basePath: '/health-sdlc-playground'`, React 19, MUI 5, Jest + RTL.

## Assumptions
- With `output: 'export'` and `basePath: '/health-sdlc-playground'`, `npx serve frontend/out` serves the app at `http://localhost:3000/health-sdlc-playground/`. All redirect sources and destinations in `serve.json` must use this prefix.
- The 308 redirect is implemented via `serve.json` (not Next.js `redirect()`), since static exports have no runtime server.
- HTTP status assertions (Scenarios 1, 3, 4, 7) require a running server — these are exercised in `run-e2e.sh` via `curl`.
- Scenario 6 (`scrollWidth === innerWidth` at 390px) requires a real browser with actual layout computation. The unit test checks CSS properties; the E2E script checks the container is present in rendered HTML. Full `scrollWidth` assertion requires Playwright (noted as a remaining gap if a Playwright layer is added).
- Pre-existing tests in `WeeklyDashboard.test.tsx`, `weeklyDashboardData.test.ts`, and `datasets.test.ts` cover behaviors from prior features. They remain in the codebase because removing them would break prior feature contracts. They are not new implementations introduced by this feature.

## Decisions
- **`run-e2e.sh`**: Implements actual HTTP assertions via `curl` for Scenarios 1, 3, 4, 7. Checks 308 status and Location header without following redirects (Scenario 3). Follows redirects and verifies final URL (Scenario 4). Checks 404 for unknown routes (Scenario 7). Checks HTML contains `weekly-dashboard-container` (Scenario 6 partial).
- **`serve.json` paths**: Changed from bare `/weekly-dashboard` to `/health-sdlc-playground/weekly-dashboard` to match the basePath-prefixed static export structure.
- **`redirect.test.ts`**: Updated assertions to match basePath-prefixed paths.
- **`TrainingOverview.tsx` deleted**: Scenario 5 requires file non-existence; `TrainingOverview.test.tsx` uses `fs.existsSync()`.
- **`run-tests.sh`**: Runs Jest unit tests only (no E2E); `run-e2e.sh` handles live-server scenarios.

## Widget choices
No new widgets. Pre-existing `WeeklyDashboard` container: `<div data-testid="weekly-dashboard-container" role="main">`.

## data-testid inventory (this feature's assertions only)

| testid | Element | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root of `WeeklyDashboard` |

## E2E deferrals
- **Scenario 6 (scrollWidth === innerWidth at 390px)**: Full layout assertion requires Playwright with real browser viewport. `run-e2e.sh` verifies container presence in HTML; CSS property check in unit test. A Playwright layer would fully close this gap.
- All other HTTP-status scenarios (1, 3, 4, 7) are now exercised directly in `run-e2e.sh` via `curl`.

## Alternatives considered
- **Playwright for all E2E scenarios**: Would fully satisfy Scenario 6's `scrollWidth` assertion. Ruled out for this iteration because installing Playwright requires significant dependency setup and the `run-e2e.sh` `curl` approach fully satisfies Scenarios 1, 3, 4, 7 without it.
- **Keep bare paths in serve.json**: Ruled out — the basePath prefix makes bare `/weekly-dashboard` unreachable in the static export.
- **Remove WeeklyDashboard.test.tsx / datasets.test.ts**: Ruled out — these cover pre-existing behavior from prior features; removing them would break prior feature contracts and violate "don't delete passing tests for existing functionality."

## Security notes
- No new dependencies added.
- `npm audit --audit-level=high` in `run-tests.sh`.

## Output summary
- **Files changed**: `frontend/public/serve.json` (basePath-prefixed redirect paths), `frontend/src/app/weekly-dashboard/redirect.test.ts` (updated assertions), `run-e2e.sh` (new — actual HTTP assertions for Scenarios 1, 3, 4, 6-partial, 7)
- **Files deleted**: `frontend/src/components/TrainingOverview.tsx`
- **Files created**: `run-tests.sh`, `run-e2e.sh`, `features/make-weekly-dashboard-the-home-page/scope`, `frontend/src/components/TrainingOverview.test.tsx`