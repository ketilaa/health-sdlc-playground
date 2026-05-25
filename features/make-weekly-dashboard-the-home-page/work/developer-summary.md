## Outer Iteration 1 — TDD Attempt 1

# Developer Summary: Make Weekly Dashboard the Home Page

## Status: OK

## Input summary
Feature requires: (1) root route renders Weekly Dashboard with H1 "Weekly Dashboard" and `data-testid="weekly-dashboard-container"`, (2) no `data-testid="training-overview"` at root, (3) `/weekly-dashboard` issues 308 redirect to `/`, (4) browser follows redirect and lands on `/`, (5) `TrainingOverview.tsx` deleted, (6) no horizontal overflow at 390px, (7) `/non-existent-route` returns HTTP 404.

## Assumptions
- All 7 scenarios are substantially already implemented in the codebase; the task is verification, gap-filling, and ensuring tests pass.
- `TrainingOverview.tsx` is confirmed absent from the listed source files — it has already been deleted.
- The app is a static export (`output: 'export'`) served via `npx serve` with `serve.json` handling the 308 redirect — `next/navigation`'s `redirect()` in `weekly-dashboard/page.tsx` also handles SSR-level redirect but for static export the `serve.json` is the authoritative redirect mechanism.
- HTTP status assertions (Scenarios 1, 3, 7) cannot be satisfied by unit tests against a running server in this static export setup — integration-level HTTP assertions require a running server and are deferred to E2E.
- Scenario 4 (browser final URL after redirect) and Scenario 6 (actual `scrollWidth === innerWidth` in a real browser at 390px) require a real browser environment and are deferred to E2E.
- The `not-found.tsx` Next.js file handles 404 responses — in static export, 404 is handled by the framework's not-found page convention; HTTP status assertion deferred to E2E.

## Decisions
- **Scope: frontend** — all changes are UI/routing-only, no backend involved.
- **run-tests.sh**: Uses `npm ci` + `npm audit --audit-level=high` + `jest --watchAll=false --forceExit` matching the existing stack.
- **Testing approach**: Existing test files already cover all scenarios at the unit/component level. No new tests needed beyond what was already present. Verified no stale tests remain.
- **TrainingOverview deletion**: Already deleted. `TrainingOverview.test.tsx` asserts the file doesn't exist on disk using `fs.existsSync` — this is the correct approach for Scenario 5.
- **308 redirect**: `serve.json` in `frontend/public/` handles the redirect for the static `npx serve` deployment. `weekly-dashboard/page.tsx` also calls `redirect('/')` for Next.js server-side compatibility.
- **No horizontal overflow**: `WeeklyDashboard.tsx` already has `overflowX: 'hidden'`, `maxWidth: '100%'`, and `boxSizing: 'border-box'` on the container. Unit test verifies these inline styles.

## Widget choices
- **Weekly Dashboard container**: plain `<div>` with inline styles (not MUI `Box`/`Container`) — consistent with existing codebase which avoids MUI for the main dashboard wrapper.
- **H1**: plain `<h1>` element with inline styles — `role="heading" level=1` DOM structure.
- **404 page**: plain semantic HTML with `role="main"`, `<h1>Page Not Found</h1>`, and Next.js `<Link>` for the CTA.

## data-testid inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root of `WeeklyDashboard` component, rendered by `page.tsx` |
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
| `color-probe` | `<div>` | `ColorProbe` component (hidden, for test token resolution) |

## E2E deferrals

| Scenario | Reason |
|---|---|
| Scenario 1: HTTP 200 at `/` | Static export — HTTP status requires a running server; unit tests cannot make HTTP requests |
| Scenario 3: Response HTTP status 308, Location header | Requires real HTTP server to inspect response headers; `serve.json` config tested structurally instead |
| Scenario 4: Browser final URL after redirect | Requires real browser navigation and address bar inspection |
| Scenario 6: `scrollWidth === innerWidth` at 390px | Requires real browser viewport; unit test checks CSS properties as proxy |
| Scenario 7: HTTP 404 for unknown routes | Static export 404 requires running server; `not-found.tsx` existence and content tested at component level |

## Alternatives considered
- **Using Next.js `permanentRedirect()`** instead of `serve.json` for the 308 redirect — ruled out because `output: 'export'` produces a static site served by `npx serve`, which doesn't run Next.js server-side code; `serve.json` is the correct mechanism.
- **MUI components for WeeklyDashboard** — ruled out; existing codebase uses plain HTML/inline styles for the dashboard, and switching would be a large refactor outside feature scope.
- **Integration test with `supertest`** for HTTP status assertions — ruled out; the app is a static export, not a Node.js server; Playwright E2E is the correct layer.

## Security notes
- No new dependencies added.
- No user input interpolated into shell/SQL/eval.
- No secrets hardcoded.
- `dangerouslySetInnerHTML` used only in `layout.tsx` for CSS custom property injection from static `themeTokens` object (not user data) — pre-existing, not introduced by this feature.
- `npm audit --audit-level=high` included in `run-tests.sh`.

## Output summary
- **Files written**: `features/make-weekly-dashboard-the-home-page/scope`, `run-tests.sh`, `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`
- **Files modified**: none (all implementation was already present)
- **Tests written**: none new (all test coverage already existed)
- **TDD cycles**: 0 new cycles needed — existing implementation and tests were complete and consistent
- **Iterations**: 1 (verification pass only)

---

## Outer Iteration 2 — TDD Attempt 1

# Developer Summary: Make Weekly Dashboard the Home Page

## Status: OK

## Input summary
Feature requires: (1) root route renders Weekly Dashboard with H1 "Weekly Dashboard" and `data-testid="weekly-dashboard-container"`, (2) no `data-testid="training-overview"` at root, (3) `/weekly-dashboard` issues 308 redirect with `Location: "/"`, (4) browser follows redirect and lands on `/`, (5) `TrainingOverview.tsx` deleted, (6) no horizontal overflow at 390px, (7) `/non-existent-route` returns HTTP 404.

## Assumptions
- `TrainingOverview.tsx` was already absent from the codebase before this iteration.
- The Gherkin `Location header is "/"` is authoritative; `serve.json` destination is set to `"/"` to match it. This means E2E tests must handle the fact that `npx serve` will redirect to `http://localhost:3000/` (root of the server, not `/health-sdlc-playground/`). The Gherkin Background says the server runs at `http://localhost:3000` and Scenario 1 asserts `http://localhost:3000/` renders the Weekly Dashboard — implying the E2E test environment serves the app at `/` without a basePath prefix (i.e., `npx serve frontend/out/health-sdlc-playground` or equivalent), or the Gherkin accepts the `serve` root redirect landing on a blank page in practice. This is a known tension documented below.
- `output: 'export'` in Next.js 15 prohibits `redirect()` from `next/navigation` in page components during static generation — confirmed blocking finding, fixed by removing the call.
- `run-tests.sh` now includes `npm run build` to catch static-export build failures before jest runs.

## Decisions
- **F3 fix**: Replaced `weekly-dashboard/page.tsx` content with a no-op component (`export default function WeeklyDashboardPage() { return null }`). The 308 redirect is handled exclusively by `serve.json`. This satisfies the static export constraint.
- **F4 fix**: Updated `serve.json` destination from `"/health-sdlc-playground/"` to `"/"` to match the Gherkin's `Location header is "/"` assertion. Added corresponding test assertion.
- **run-tests.sh**: Added `npm run build` step to catch `output: 'export'` build failures (like the `redirect()` call that triggered F3) before they reach E2E.
- **redirect.test.ts**: Updated to assert `destination: "/"` and added a new test asserting `weekly-dashboard/page.tsx` does not import or call `redirect()`.

## Known tension: Location header vs basePath

The Gherkin specifies `Location: "/"` for Scenario 3. The app's `next.config.js` sets `basePath: '/health-sdlc-playground'`, so the compiled static output lives under that path prefix. When `npx serve frontend/out` serves the static export:
- The app pages are at `/health-sdlc-playground/`
- The redirect source `/health-sdlc-playground/weekly-dashboard` is correct
- The redirect destination `"/"` per Gherkin sends the browser to `http://localhost:3000/` — which is the server root, not the app root

This means Scenario 4 ("browser lands on `/` with Weekly Dashboard visible") may fail in E2E if `npx serve frontend/out` is used, because `/` serves the directory listing rather than the app. The E2E runner would need to either:
- Serve `frontend/out/health-sdlc-playground` directly on port 3000 (so `/` maps to the app root), or
- Accept that Scenario 3's Location header `"/"` is intentionally the basePath-stripped value

The Gherkin is treated as ground truth here. The E2E infrastructure should serve `frontend/out/health-sdlc-playground` as the root to make all scenarios pass consistently.

## Widget choices
- **Weekly Dashboard container**: plain `<div>` with inline styles — `role="main"`, `data-testid="weekly-dashboard-container"`.
- **H1**: plain `<h1>` — `role="heading" level=1`.
- **404 page**: `role="main"` container, `<h1>Page Not Found</h1>`, Next.js `<Link>` CTA to `/`.

## data-testid inventory

| data-testid | Element type | Parent context |
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
| `color-probe` | `<div>` | `ColorProbe` component (hidden) |

## E2E deferrals

| Scenario | Reason |
|---|---|
| Scenario 1: HTTP 200 at `/` | Static export — HTTP status requires running server |
| Scenario 3: HTTP 308 + Location header | Requires real HTTP server; `serve.json` config tested structurally; actual header value tested via E2E |
| Scenario 4: Browser final URL after redirect | Requires real browser navigation |
| Scenario 6: `scrollWidth === innerWidth` at 390px | Requires real browser viewport; CSS properties verified at unit level |
| Scenario 7: HTTP 404 for unknown routes | Static export 404 requires running server |

## Alternatives considered
- **Keep `destination: "/health-sdlc-playground/"`**: ruled out — Gherkin says `Location: "/"`, which is the authoritative spec.
- **Delete `weekly-dashboard/page.tsx` entirely**: considered but rejected — Next.js may generate a 404 for the route at build time if no page file exists, which could cause unexpected behavior; a no-op component is safer.
- **Use client-side redirect in `weekly-dashboard/page.tsx`**: considered but rejected — a `useEffect(() => { router.replace('/') }, [])` approach would require `'use client'` and would cause a flash; `serve.json` handles the redirect at the HTTP layer, making the page component truly unreachable in normal flow.

## Security notes
- No new dependencies added.
- No user input in shell/SQL/eval.
- No secrets hardcoded.
- `dangerouslySetInnerHTML` pre-existing in `layout.tsx` with static token values only.
- `npm audit --audit-level=high` included in `run-tests.sh`.

## Output summary
- **Files modified**: `run-tests.sh` (added `npm run build`), `frontend/src/app/weekly-dashboard/page.tsx` (removed `redirect()` call, replaced with no-op component), `frontend/public/serve.json` (destination changed to `"/"`), `frontend/src/app/weekly-dashboard/redirect.test.ts` (updated assertions for new destination, added build-safety test)
- **Files written**: `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`
- **TDD cycles**: 1 fix cycle addressing F3 and F4
- **Iterations**: 2 total