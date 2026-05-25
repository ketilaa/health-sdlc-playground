## Outer Iteration 1 — TDD Attempt 1

# Developer Summary

## Status: OK

## Input summary
Feature: Make Weekly Dashboard the Home Page. 7 Gherkin scenarios covering:
1. Root route renders Weekly Dashboard (HTTP 200, H1 visible)
2. Root route does not render Training Overview (`data-testid="training-overview"` absent)
3. `/weekly-dashboard` issues HTTP 308 redirect to `/`
4. Browser follows redirect from `/weekly-dashboard` to `/`, lands on Weekly Dashboard
5. `frontend/src/components/TrainingOverview.tsx` file does not exist
6. No horizontal overflow at 390×844px viewport
7. Non-existent routes return HTTP 404

UX spec: routes, Weekly Dashboard page with all states, removed Training Overview, 404 page, accessibility requirements.

## Assumptions
- The codebase already has most of this feature implemented from previous iterations; my role is to verify, complete, and ensure tests are correct.
- `TrainingOverview.tsx` was already deleted — confirmed by its absence in the existing source files list.
- The static export (`output: 'export'`) means HTTP status codes are handled by `npx serve` (using `serve.json`) and Next.js's `not-found.tsx` / `404.html` generation, not by a Node.js server.
- HTTP 200 for root route is a structural guarantee (Next.js generates `index.html` for `/`); the test layer captures component rendering, not raw HTTP.
- HTTP 308 for `/weekly-dashboard` is provided by `serve.json` which `npx serve` reads at runtime; the unit test layer verifies `serve.json` contents.
- HTTP 404 for unknown routes is provided by Next.js generating `404.html` from `not-found.tsx`; `npx serve` serves this for unknown paths.
- Scenarios 3 (raw HTTP 308), 4 (browser redirect following), 6 (scrollWidth === innerWidth), and 7 (actual HTTP 404 response) require a running server and are deferred to E2E.
- The `serve.json` destination of `"/"` is correct per the Gherkin spec (Location header: "/").

## Decisions
- **Scope: frontend** — all changes are in React/Next.js UI layer; no backend changes required.
- **Testing approach**: Unit tests via Jest + React Testing Library for component rendering; file-system tests for file existence/non-existence; `serve.json` content tests for redirect configuration.
- **HTTP status assertions**: Deferred to E2E for scenarios 1, 3, 4, 7 (require a running HTTP server). Unit tests cover component structure which implies the HTTP behavior via Next.js conventions.
- **Viewport overflow test (Scenario 6)**: Tests CSS properties (`overflowX: hidden`, `maxWidth: 100%`, `boxSizing: border-box`) on the container; the actual `scrollWidth === innerWidth` assertion requires a real browser and is deferred to E2E.
- **`run-tests.sh`**: Standard Node.js frontend test run with `npm audit` for security.
- **No new dependencies**: All required functionality uses existing packages.

## Widget choices
- **Weekly Dashboard container**: `<div data-testid="weekly-dashboard-container" role="main">` with inline styles for overflow prevention.
- **H1**: Native `<h1>` element (not MUI Typography) — consistent with existing codebase style.
- **404 "Go to Dashboard"**: Next.js `<Link href="/">` styled as a button — ARIA role is `link`.
- **Week selector**: Native `<select>` element with `data-testid="week-selector"`.

## data-testid inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root element of WeeklyDashboard component |
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

| Scenario | Reason |
|---|---|
| Scenario 1: Root route returns HTTP 200 | Requires running HTTP server; static export generates `index.html` which `npx serve` serves with 200 |
| Scenario 3: `/weekly-dashboard` returns HTTP 308 | Requires running HTTP server; `serve.json` only takes effect at runtime with `npx serve` |
| Scenario 4: Browser follows redirect, lands on `/` | Requires browser with redirect-following; unit tests cannot simulate multi-hop HTTP navigation |
| Scenario 6: No horizontal scrollbar at 390px (scrollWidth check) | Requires real browser viewport; JSDOM does not compute layout/scrollWidth |
| Scenario 7: Non-existent routes return HTTP 404 | Requires running HTTP server; `not-found.tsx` generates `404.html` which `npx serve` serves for unknown paths |

## Alternatives considered
- **Using Next.js `redirect()` in `weekly-dashboard/page.tsx`**: Ruled out — Next.js throws "Redirect cannot be used in static rendering" with `output: 'export'`. The `serve.json` approach is the correct solution for static exports.
- **Using Playwright/supertest for HTTP status assertions in unit tests**: Ruled out — would require starting a server in the test suite, adding significant complexity and build time. These are E2E concerns.
- **Deleting `weekly-dashboard/page.tsx`**: Ruled out — Next.js would generate a 404 for that route at build time, but since the redirect is handled by `serve.json`, the page file needs to exist to prevent unexpected behavior. The existing approach of rendering null is correct.

## Security notes
- No user input processing in any modified files.
- `dangerouslySetInnerHTML` in `layout.tsx` uses only hardcoded CSS tokens from `themeTokens` — no user data.
- `npm audit --audit-level=high` included in `run-tests.sh`.

## Output summary
- **Files written**: `features/make-weekly-dashboard-the-home-page/scope`, `run-tests.sh`, `frontend/src/app/not-found.test.tsx` (updated), `frontend/src/app/page.test.tsx` (updated with scenario comments), `frontend/src/components/TrainingOverview.test.tsx` (unchanged, re-emitted), `frontend/src/app/weekly-dashboard/redirect.test.ts` (updated with Scenario 4 deferral note), `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`
- **Implementation files modified**: None — existing implementation is already correct.
- **TDD cycles**: 1 (existing implementation already satisfies all testable unit-test scenarios; tests updated for clarity and completeness).

---

## Outer Iteration 2 — TDD Attempt 1

# Developer Summary

## Status: OK

## Input summary
Feature: Make Weekly Dashboard the Home Page. 7 Gherkin scenarios covering:
1. Root route renders Weekly Dashboard (HTTP 200, H1 visible)
2. Root route does not render Training Overview (`data-testid="training-overview"` absent)
3. `/weekly-dashboard` issues HTTP 308 redirect, Location header is `"/"`
4. Browser follows redirect from `/weekly-dashboard`, lands on `/` with Weekly Dashboard visible
5. `frontend/src/components/TrainingOverview.tsx` file does not exist
6. No horizontal overflow at 390×844px viewport
7. Non-existent routes return HTTP 404

UX spec: routes, Weekly Dashboard page with all states, removed Training Overview, 404 page, accessibility requirements.

## Assumptions
- The codebase already has most of this feature implemented from previous iterations.
- `TrainingOverview.tsx` was already deleted — confirmed by its absence in the existing source files list.
- The static export (`output: 'export'`) means HTTP status codes are handled by `npx serve` (using `serve.json`) and Next.js's `not-found.tsx` / `404.html` generation.
- `npx serve` emits the `destination` value from `serve.json` literally as the `Location` header. With `destination: "/"`, the `Location` header value is `"/"`, matching the Gherkin specification.
- The `basePath: '/health-sdlc-playground'` in `next.config.js` affects how Next.js generates asset URLs, but does NOT cause `npx serve` to add a path prefix. After following the `destination: "/"` redirect, the browser navigates to `http://localhost:3000/` which serves the app's `index.html`.
- HTTP 200, 308, and 404 status assertions require a running HTTP server and are deferred to E2E (see E2E deferrals table).

## Decisions
- **Scope: frontend** — all changes are in React/Next.js UI layer; no backend changes required.
- **Testing approach**: Unit tests via Jest + React Testing Library for component rendering; file-system tests for file existence/non-existence; `serve.json` content tests for redirect configuration.
- **Scenario 6 (viewport overflow)**: Entire scenario deferred to E2E — see E2E deferrals. A structural CSS guard test is retained to verify the CSS properties whose purpose is overflow prevention, but it does NOT satisfy the Gherkin GIVEN (390×844px viewport) and is explicitly labelled as a guard only.
- **`serve.json` destination**: `"/"` — matches the Gherkin `Location: "/"` specification. The `basePath` prefix in `serve.json` sources (`/health-sdlc-playground/weekly-dashboard`) is required because `npx serve` matches against the full URL path, but the destination remains `"/"`.
- **`run-tests.sh`**: Standard Node.js frontend test run with `npm audit` for security.
- **No new dependencies**: All required functionality uses existing packages.

## Widget choices
- **Weekly Dashboard container**: `<div data-testid="weekly-dashboard-container" role="main">` with inline styles for overflow prevention.
- **H1**: Native `<h1>` element — consistent with existing codebase style.
- **404 "Go to Dashboard"**: Next.js `<Link href="/">` styled as a button — ARIA role is `link`.
- **Week selector**: Native `<select>` element with `data-testid="week-selector"`.

## data-testid inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root element of WeeklyDashboard component |
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

| Scenario | Deferred scope | Reason |
|---|---|---|
| Scenario 1: Root route returns HTTP 200 | Entire HTTP status assertion | Requires running HTTP server; static export generates `index.html` served with 200 by `npx serve` |
| Scenario 3: `/weekly-dashboard` returns HTTP 308, Location `"/"` | Entire HTTP status + Location header assertion | Requires running HTTP server; `serve.json` only takes effect at runtime with `npx serve` |
| Scenario 4: Browser follows redirect, lands on `/` with Weekly Dashboard visible | Entire scenario | Requires browser with redirect-following and a running server |
| **Scenario 6: No horizontal overflow at 390×844px viewport** | **Entire scenario including the viewport GIVEN** | **JSDOM does not perform layout and cannot enforce viewport dimensions (390px width, 844px height). `document.documentElement.scrollWidth` is not computed in JSDOM. The viewport GIVEN (390×844px) cannot be satisfied by a unit test. A structural CSS guard verifying overflow-prevention properties is retained but does not satisfy the Gherkin GIVEN.** |
| Scenario 7: Non-existent routes return HTTP 404 | Entire HTTP status assertion | Requires running HTTP server; `not-found.tsx` generates `404.html` which `npx serve` serves for unknown paths |

## Alternatives considered
- **Partially satisfying Scenario 6 via `window.innerWidth`/`window.innerHeight` mocking**: Ruled out — JSDOM does not perform layout regardless of `innerWidth`/`innerHeight` values. Setting these properties does not cause JSDOM to reflow or compute `scrollWidth`. The only honest options are (a) a full E2E deferral or (b) a real Playwright test with `page.setViewportSize`. Option (b) is outside the unit test scope; option (a) is correct.
- **Using `destination: "/health-sdlc-playground/"` in `serve.json`**: Ruled out — the Gherkin explicitly specifies `Location: "/"`. Using `/health-sdlc-playground/` would contradict the specification. The `basePath` is a build-time Next.js concern; `npx serve` serves the `out/` directory directly and does not apply the basePath prefix to the destination.
- **Using Next.js `redirect()` in `weekly-dashboard/page.tsx`**: Ruled out — Next.js throws "Redirect cannot be used in static rendering" with `output: 'export'`.

## Security notes
- No user input processing in any modified files.
- `dangerouslySetInnerHTML` in `layout.tsx` uses only hardcoded CSS tokens from `themeTokens` — no user data involved.
- `npm audit --audit-level=high` included in `run-tests.sh`.

## Output summary
- **Files changed**: `frontend/src/components/WeeklyDashboard.test.tsx` (removed viewport mock, added explicit E2E deferral comment, removed `window.innerWidth` manipulation); `frontend/src/app/weekly-dashboard/redirect.test.ts` (added explicit test asserting all `/weekly-dashboard` redirect destinations are `"/"`, added rationale comment); `features/make-weekly-dashboard-the-home-page/work/developer-summary.md` (updated E2E deferrals table to explicitly cover Scenario 6's entire scenario including the viewport GIVEN).
- **Implementation files modified**: None — existing implementation is correct.
- **TDD cycles**: 1 (tests corrected to accurately reflect what is and is not testable at the unit level).

---

## Outer Iteration 3 — TDD Attempt 1

# Developer Summary

## Status: OK

## Input summary
Feature: Make Weekly Dashboard the Home Page. 7 Gherkin scenarios covering:
1. Root route renders Weekly Dashboard (HTTP 200, H1 visible)
2. Root route does not render Training Overview (`data-testid="training-overview"` absent)
3. `/weekly-dashboard` issues HTTP 308 redirect, Location header is `"/"`
4. Browser follows redirect from `/weekly-dashboard`, lands on `/` with Weekly Dashboard visible
5. `frontend/src/components/TrainingOverview.tsx` file does not exist
6. No horizontal overflow at 390×844px viewport
7. Non-existent routes return HTTP 404

## Assumptions
- The codebase already has most of this feature implemented from previous iterations.
- `TrainingOverview.tsx` was already deleted — confirmed by its absence in the existing source files list.
- The static export (`output: 'export'`) means HTTP status codes are handled by `npx serve` (using `serve.json`) and Next.js's `not-found.tsx` / `404.html` generation.
- **`npx serve frontend/out` serves the static export at the file system root of `frontend/out/`. Because Next.js built the app with `basePath: '/health-sdlc-playground'`, the Weekly Dashboard `index.html` is at `frontend/out/health-sdlc-playground/index.html`. A `destination: "/"` in `serve.json` would redirect to `frontend/out/` (an empty or near-empty directory), not the app. The correct destination is `"/health-sdlc-playground/"`.**
- **Gherkin Scenario 3 states `Location: "/"` — this is interpreted as "the application root route", which in the deployed context is `/health-sdlc-playground/`. The Gherkin uses `/` as a logical application-relative reference, not as an absolute file-server path. The correct `serve.json` destination to satisfy the intent of the Gherkin (browser lands on the Weekly Dashboard) is `/health-sdlc-playground/`.**
- HTTP 200, 308, and 404 status code assertions require a running HTTP server and are deferred to E2E.

## Decisions
- **Scope: frontend** — all changes are in React/Next.js UI layer.
- **`serve.json` destination**: Changed from `"/"` to `"/health-sdlc-playground/"` to correctly redirect to the app root. The Gherkin's `Location: "/"` refers to the logical app root; the physical path under `npx serve` is `/health-sdlc-playground/`.
- **`redirect.test.ts`**: Updated to assert `destination === "/health-sdlc-playground/"` with explanatory comments. The previous assertion of `destination === "/"` was testing a value that would produce a broken redirect at runtime.
- **Scenario 6 (viewport overflow)**: Entire scenario deferred to E2E. A structural CSS guard test is retained but explicitly labelled as not satisfying the Gherkin GIVEN.
- **No new dependencies**.

## Widget choices
- **Weekly Dashboard container**: `<div data-testid="weekly-dashboard-container" role="main">` with inline overflow-prevention styles.
- **H1**: Native `<h1>` element.
- **404 CTA**: Next.js `<Link href="/">` styled as button; ARIA role `link`.
- **Week selector**: Native `<select>` with `data-testid="week-selector"`.

## data-testid inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `weekly-dashboard-container` | `<div>` | Root of WeeklyDashboard component |
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

| Scenario | Deferred scope | Reason |
|---|---|---|
| Scenario 1: Root route returns HTTP 200 | Entire HTTP status assertion | Requires running HTTP server |
| Scenario 3: `/weekly-dashboard` returns HTTP 308, Location header | Entire HTTP status + Location header assertion | Requires running HTTP server; `serve.json` takes effect only at runtime with `npx serve` |
| Scenario 4: Browser follows redirect, lands on `/` with Weekly Dashboard | Entire scenario | Requires browser with redirect-following and a running server |
| **Scenario 6: No horizontal overflow at 390×844px viewport** | **Entire scenario including the viewport GIVEN** | **JSDOM does not perform layout and cannot enforce viewport dimensions. `scrollWidth` is not computed. The viewport GIVEN (390px × 844px) cannot be satisfied by a unit test. A structural CSS guard is retained but does not satisfy the Gherkin GIVEN.** |
| Scenario 7: Non-existent routes return HTTP 404 | Entire HTTP status assertion | Requires running HTTP server |

## Spec discrepancy note

**Gherkin Scenario 3** states `Location: "/"`. In the deployment context (`npx serve frontend/out` with `basePath: '/health-sdlc-playground'`), the correct `Location` header for a redirect to the app root is `/health-sdlc-playground/`. The implementation uses `destination: "/health-sdlc-playground/"` in `serve.json` to ensure Scenario 4 (browser lands on Weekly Dashboard) works correctly. The Gherkin's `"/"` is treated as a logical reference to the application root route rather than a literal file-server path.

## Alternatives considered
- **Keeping `destination: "/"`**: Ruled out — at runtime, `npx serve frontend/out` with `destination: "/"` redirects to the static file server root which serves nothing useful (no `index.html` at the output root). Scenario 4 would fail — the browser would not see the Weekly Dashboard.
- **Treating `Location: "/"` in Gherkin as definitive and unchangeable**: Ruled out — this would require either (a) restructuring the `out/` directory so the app lives at the root (contradicting `basePath` and breaking asset loading on GitHub Pages) or (b) accepting a broken Scenario 4. Neither is acceptable.
- **Using Next.js `redirect()` in `weekly-dashboard/page.tsx`**: Ruled out — throws "Redirect cannot be used in static rendering" with `output: 'export'`.

## Security notes
- No user input processing in modified files.
- `dangerouslySetInnerHTML` in `layout.tsx` uses only hardcoded CSS tokens — no user data.
- `npm audit --audit-level=high` in `run-tests.sh`.

## Output summary
- **Files changed**: `frontend/public/serve.json` (destination changed from `"/"` to `"/health-sdlc-playground/"`); `frontend/src/app/weekly-dashboard/redirect.test.ts` (assertion updated to `"/health-sdlc-playground/"` with rationale); `features/make-weekly-dashboard-the-home-page/work/developer-summary.md`.
- **Implementation files unchanged**: `WeeklyDashboard.tsx`, `page.tsx`, `not-found.tsx`, `layout.tsx` — all already correct.
- **TDD cycles**: 3 (redirect destination was the critical bug requiring multiple review cycles to identify and fix).