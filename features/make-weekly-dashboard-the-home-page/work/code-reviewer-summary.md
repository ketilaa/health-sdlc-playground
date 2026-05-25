## Outer Iteration 1

STATUS: STOP

---

## Code Reviewer Summary

### Status: STOP

### Input Summary
- **Scope:** frontend
- **Files examined:** All frontend source files provided, including `WeeklyDashboard.tsx`, `WeeklyDashboard.test.tsx`, `page.tsx`, `page.test.tsx`, `not-found.tsx`, `not-found.test.tsx`, `TrainingOverview.test.tsx`, `redirect.test.ts`, `run-tests.sh`, `run-e2e.sh`, `serve.json`, `weeklyDashboardData.ts`, `weeklyDashboardData.test.ts`, and supporting modules.
- **Gherkin scenarios:** 7 scenarios reviewed

---

### Interpretation
- The developer summary explicitly defers Scenarios 1 (HTTP 200), 3 (308 without following), 4 (browser follows redirect), 6 (scrollWidth === innerWidth at 390px), and 7 (HTTP 404 status) to E2E.
- Per the review rules, viewport-constrained scenarios without an explicit "deferred to E2E" note in the developer summary are blocking. The developer summary **does** include such notes for all viewport and HTTP-level assertions.
- The `run-e2e.sh` file is provided and readable; I can inspect it directly.

---

### Decisions

#### BLOCKING FAILURE 1 — `run-e2e.sh` covers the wrong feature

The provided `run-e2e.sh` runs E2E tests for a **different feature**, not `make-weekly-dashboard-the-home-page`:

```bash
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'improve-weekly-aggregates-and-prepare-for-more-insights/**/*.steps.ts' \
  '../features/improve-weekly-aggregates-and-prepare-for-more-insights/**/*.feature' \
  --format progress
```

The `--require` glob and feature path both reference `improve-weekly-aggregates-and-prepare-for-more-insights`, not `make-weekly-dashboard-the-home-page`. This means:
- Scenarios 1, 3, 4, 6, and 7, which are **explicitly deferred to E2E** in the developer summary, have **no E2E coverage** that would actually execute for this feature.
- The developer summary's claim that these scenarios are "deferred to E2E" is only valid if `run-e2e.sh` actually runs the corresponding E2E step definitions. It does not.

**Gherkin scenarios affected:** 1 (HTTP 200), 3 (308 without following), 4 (browser follows redirect), 6 (no horizontal overflow at 390px), 7 (HTTP 404 status).

**File and location:** `run-e2e.sh`, lines 37–41.

---

#### BLOCKING FAILURE 2 — Scenario 6 viewport GIVEN not satisfied at unit-test level, and E2E not wired

**Gherkin Scenario 6:**
```gherkin
Given the browser viewport is set to 390 pixels wide and 844 pixels tall
When the user navigates to "http://localhost:3000/"
Then the page returns HTTP status 200
And the element with data-testid "weekly-dashboard-container" does not cause a horizontal scrollbar on the page
```

The developer summary defers this to E2E and provides a unit test that checks CSS properties (`overflowX: hidden`, `maxWidth: 100%`, `boxSizing: border-box`) as a proxy. Per the review rules:

> A Gherkin scenario whose GIVEN includes a viewport width constraint must either (a) have a unit test that actually sets that constraint, or (b) have an explicit "deferred to E2E" note in the developer summary.

The developer summary **does** have a deferral note, which satisfies condition (b). However, as established in Blocking Failure 1, the E2E script does not run any step definitions for this feature. The deferral note references an E2E that will never execute this scenario.

This compounds Blocking Failure 1 — the viewport scenario is effectively untested at any level that validates the actual behavioral assertion (`scrollWidth === innerWidth` at 390px).

---

#### BLOCKING FAILURE 3 — Scenario 3 and 4: `serve.json` redirect path mismatch with deployed basePath

The `next.config.js` sets `basePath: '/health-sdlc-playground'`, meaning the app is served under `/health-sdlc-playground/`. However, `serve.json` redirects from `/weekly-dashboard` and `/weekly-dashboard/` to `/`. With `npx serve frontend/out`, the static export structure under `out/` will have paths prefixed with `/health-sdlc-playground/`. The redirect rules in `serve.json` do not account for the `basePath` prefix:

```json
{
  "source": "/weekly-dashboard",
  "destination": "/",
  "type": 308
}
```

In a live `npx serve frontend/out -p 3000` deployment, the actual path would be `/health-sdlc-playground/weekly-dashboard` (or the static file structure would be `out/health-sdlc-playground/weekly-dashboard/`). The `serve.json` redirect for `/weekly-dashboard` would not match because the basePath-prefixed route is `/health-sdlc-playground/weekly-dashboard`.

This means Scenario 3 (308 redirect without following) and Scenario 4 (browser follows redirect) may fail in E2E even if the E2E script were correctly pointed at this feature. The Gherkin background says the server is at `http://localhost:3000/` and navigates to `http://localhost:3000/weekly-dashboard` — but with `basePath: '/health-sdlc-playground'`, the app lives at `http://localhost:3000/health-sdlc-playground/`.

The developer summary acknowledges `serve.json` for the 308 redirect but does not address the `basePath` interaction. This is a blocking gap for Scenarios 3 and 4.

**File and location:** `frontend/public/serve.json` (redirect sources), `frontend/next.config.js` (basePath).

---

#### BLOCKING FAILURE 4 — No Gherkin backing for multiple existing implementation behaviors (speculative content)

The following behaviors are visible in the implementation but have **no corresponding Gherkin scenario** in this feature's spec:

1. **Week selector (`week-selector`)** — `WeeklyDashboard.tsx` renders a `<select>` to switch between weeks. No Gherkin scenario in the current spec covers week selection behavior.
2. **Weekly summary card metrics** (`weekly-vo2max`, `weekly-resting-hr`, `weekly-avg-hr`, `weekly-avg-cadence`, `intensity-balance`, trend indicators) — These are tested extensively in `WeeklyDashboard.test.tsx` with no corresponding Gherkin scenarios in this feature's spec file.
3. **Activity list and detail drill-down** (`activity-list`, `activity-detail`, `activity-avg-hr`, `activity-cadence`) — Implemented in `WeeklyDashboard.tsx`, tested in `WeeklyDashboard.test.tsx`, but not backed by any Gherkin scenario in this feature.
4. **Trend indicators** (`trend-training-load`, `trend-avg-hr`, `trend-resting-hr`) — Fully implemented and tested but not covered by any Gherkin scenario in this feature.
5. **strengthCrossTrainActivity export** — A `DashboardActivity` stub exported from `weeklyDashboardData.ts` with explicit comment "used in tests." No Gherkin scenario backs the cross-train display behavior.

Per the review rules: *"No implementation exists without a corresponding Gherkin scenario — flag any data, UI state, route, or behavior that has no Gherkin backing as a blocking failure; placeholder datasets, stub arrays, speculative UI states, and 'future extension' content all fall into this category."*

These behaviors are substantive and visible in the implementation files. They represent significant un-Gherkin-backed scope.

**Files and locations:** `WeeklyDashboard.tsx` (entire component body beyond container/H1/no-overflow), `WeeklyDashboard.test.tsx` (all describe blocks beyond "Container and heading"), `weeklyDashboardData.ts` (`strengthCrossTrainActivity`, `computeWeeklyAvgHr`, `computeWeeklyAvgCadence`, `computeTrend`, `trendLabel`, trend data for W08/W09/W10), `weeklyDashboardData.test.ts` (all tests beyond basic dataset existence).

---

#### NON-BLOCKING OBSERVATIONS (recorded for completeness)

- **`ActivityRow.tsx`, `DatasetSelector.tsx`, `LoadingState.tsx`, `SkippedActivity.tsx`, `WeekRow.tsx`, `TopBar.tsx`** — All are empty `export {}` stubs. These do not implement behavior, so they do not violate the "no implementation without Gherkin" rule. However, the stubs themselves are unnecessary noise.
- **`TopBar.test.tsx`** — Contains a trivially passing test (`expect(true).toBe(true)`). This is a non-meaningful test, but since it relates to removed code, it does not represent a behavioral gap per the current feature's Gherkin.
- **`dangerouslySetInnerHTML` in `layout.tsx`** — Uses only static `themeTokens` values (no user input). Not a security issue as stated in the developer summary.
- **`npm audit --audit-level=high`** — Present in `run-tests.sh`. Satisfies the security checklist requirement.
- **Scenario 5 (TrainingOverview file deleted)** — `TrainingOverview.test.tsx` correctly uses `fs.existsSync()` to assert file non-existence. This satisfies the Gherkin assertion.

---

### Alternatives Considered
- **Accepting the `run-e2e.sh` as-is since E2E scripts may be shared:** Ruled out — the script explicitly names a different feature in both `--require` and feature path arguments. It cannot run this feature's E2E steps.
- **Treating the extensive WeeklyDashboard behaviors as inherited from a prior feature:** Ruled out — the evidence rule requires visible Gherkin backing in this feature's spec. Prior feature specs are not in scope.
- **Treating the `basePath` mismatch as a known limitation:** Ruled out — it directly undermines the correctness of the 308-redirect scenarios which are central to this feature.

---

### Output Summary

**4 blocking failures identified:**

1. `run-e2e.sh` points to a different feature's step definitions and feature files — E2E deferrals for Scenarios 1, 3, 4, 6, 7 have no actual E2E execution path.
2. Scenario 6 viewport assertion is deferred to E2E but E2E is not wired to this feature (compound of Failure 1).
3. `serve.json` redirect sources (`/weekly-dashboard`) do not account for `basePath: '/health-sdlc-playground'` — Scenarios 3 and 4 would fail in actual E2E execution.
4. Extensive implementation (week selection, metrics cards, activity drill-down, trend indicators, dataset structures) has no Gherkin backing in this feature's spec — violates "no implementation without Gherkin" rule.

---

## Outer Iteration 2

STATUS: STOP

---

## features/make-weekly-dashboard-the-home-page/work/code-reviewer-summary.md

### Status: STOP

---

### Input summary

- **Scope:** `frontend`
- **Files examined:** all implementation files provided above, including `WeeklyDashboard.tsx`, `WeeklyDashboard.test.tsx`, `page.tsx`, `page.test.tsx`, `not-found.tsx`, `not-found.test.tsx`, `redirect.test.ts`, `TrainingOverview.test.tsx`, `serve.json`, `run-tests.sh`, `run-e2e.sh`, and supporting data/theme modules.
- **Gherkin scenarios:** 7 (root renders Weekly Dashboard; root excludes training-overview; /weekly-dashboard issues 308; browser follows redirect; TrainingOverview file deleted; no horizontal overflow at 390 px; non-existent routes return 404).

---

### Interpretation

- The static-export constraint (`output: 'export'`) means runtime HTTP semantics (status codes, redirects) cannot be tested in Jest; the developer's E2E deferral pattern is accepted where explicitly noted.
- The Gherkin GIVEN for Scenario 6 sets a viewport constraint; per review rules this must either have a unit test that actually sets that constraint, or an explicit "deferred to E2E" note in the developer summary.
- Evidence rule applied strictly: only code visible in provided files is evaluated.

---

### Decisions

#### BLOCKING FINDING 1 — Scenario 6 viewport GIVEN not satisfied by unit test

**Gherkin:**
> Given the browser viewport is set to 390 pixels wide and 844 pixels tall  
> When the user navigates to "http://localhost:3000/"  
> Then … the element with data-testid "weekly-dashboard-container" does not cause a horizontal scrollbar on the page

The unit test in `WeeklyDashboard.test.tsx` (`weekly-dashboard-container has overflow-x:hidden and max-width:100%`) sets only `window.innerWidth = 390` but does **not** set the viewport height to 844 px (`window.innerHeight`). More critically, it checks inline style properties (`container.style.overflowX`, `container.style.maxWidth`, `container.style.boxSizing`) rather than the actual browser layout outcome (`document.documentElement.scrollWidth === window.innerWidth`). This is a DOM-presence / style-attribute check, **not** a viewport constraint check.

The developer summary states:
> "Scenario 6 (no horizontal overflow at 390px): … unit test verifies CSS properties instead."

However, the developer summary does **not** include an explicit "deferred to E2E" note for Scenario 6 in the E2E deferrals table. The table entry reads:
> "Scenario 6 (no horizontal overflow at 390px): scrollWidth === innerWidth requires real browser; unit test verifies CSS properties instead."

This is not a deferral note — it is a rationale for substituting a weaker assertion. Per the review rules: *"A DOM-presence check without viewport configuration does not satisfy a viewport GIVEN. Flag the absence of a deferral note as a blocking gap."*

Furthermore, `run-e2e.sh` exists but its Cucumber test suite references `improve-weekly-aggregates-and-prepare-for-more-insights` — **not** `make-weekly-dashboard-the-home-page`. There is no E2E step definition or Cucumber feature reference for Scenario 6 of this feature in `run-e2e.sh`. The script as written will not execute any of the 7 scenarios from this feature's Gherkin file. This means the deferral cannot actually be validated by E2E either.

**File/location:** `frontend/src/components/WeeklyDashboard.test.tsx`, test `weekly-dashboard-container has overflow-x:hidden and max-width:100% (Scenario 6)`; `run-e2e.sh` (root).

---

#### BLOCKING FINDING 2 — `run-e2e.sh` does not cover this feature

`run-e2e.sh` hard-codes the feature name `improve-weekly-aggregates-and-prepare-for-more-insights` in both `--require` and the feature file path:

```bash
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'improve-weekly-aggregates-and-prepare-for-more-insights/**/*.steps.ts' \
  '../features/improve-weekly-aggregates-and-prepare-for-more-insights/**/*.feature' \
  --format progress
```

None of the 7 Gherkin scenarios for `make-weekly-dashboard-the-home-page` will be exercised by this script. Scenarios 1, 3, 4, 6, and 7 are explicitly deferred to E2E in the developer summary, yet the E2E harness is not configured for this feature. The deferral is hollow.

**File/location:** `run-e2e.sh` at repo root.

---

#### BLOCKING FINDING 3 — Unrelated code/tests present without Gherkin backing in this feature

Multiple test describe-blocks and behaviors in `WeeklyDashboard.test.tsx` are clearly from prior features and have no Gherkin scenario in `make-weekly-dashboard-the-home-page.feature`. Examples:

- `Scenario: Activity records expose cadence and average heart rate fields` (Interval Session avgHr=168, cadence=180)
- `Scenario: Activity detail displays a dash when cadence or average heart rate is absent` (Strength Cross-Train)
- `Scenario: Weekly summary displays VO2max and average resting heart rate`
- `Scenario: Weekly summary shows average heart rate aggregated from activities`
- `Scenario: Weekly summary shows average cadence aggregated from activities`
- `Scenario: Weekly summary shows intensity balance`
- `Scenario: Trend indicators for W10 vs W09`
- `Scenario: Trend indicators show stable within 2%`
- `Scenario: No comparison available for earliest week`
- `Scenario: User can browse between weeks and drill down`
- `Scenario: Weekly summary card visible at 375px`

The developer summary notes these are "pre-existing from prior features" — but the review rule is explicit: *"No implementation exists without a corresponding Gherkin scenario — flag any data, UI state, route, or behavior that has no Gherkin backing as a blocking failure."* The scope declaration is `frontend`, and these test cases and the data structures (`weeklyDashboardData.ts`, `weeklyDashboardData.test.ts`, `datasets.ts`, `datasets.test.ts`) are all present in the frontend directory with no Gherkin backing in this feature's spec.

Per the review rules, speculative/prior-feature content that has no backing in the current Gherkin spec must be flagged as a blocking failure. The fact that prior features may have covered them cannot be verified from the files provided here, and the review rule says to only rely on evidence visible in the current source files.

**File/location:** `frontend/src/components/WeeklyDashboard.test.tsx` (multiple describe blocks); `frontend/src/data/weeklyDashboardData.ts`; `frontend/src/data/weeklyDashboardData.test.ts`; `frontend/src/data/datasets.ts`; `frontend/src/data/datasets.test.ts`.

---

#### BLOCKING FINDING 4 — Scenario 3 and Scenario 4 E2E coverage missing

Scenarios 3 and 4 (308 redirect behavior) are deferred to E2E, but:
- `run-e2e.sh` does not reference this feature's steps or feature file (Finding 2 above).
- No E2E step definitions for `make-weekly-dashboard-the-home-page` are visible in the provided files.

The `redirect.test.ts` verifies `serve.json` JSON structure (a config-file assertion), but Scenario 3 requires an actual HTTP request returning status 308 and a `Location` header. Scenario 4 requires the browser following the redirect and landing on `/`. Neither is achievable via a `serve.json` structure check. The deferral is declared but the E2E harness is not wired to deliver it.

**File/location:** `frontend/src/app/weekly-dashboard/redirect.test.ts`; `run-e2e.sh`.

---

#### Non-blocking observation — `ActivityRow.tsx`, `DatasetSelector.tsx`, etc. are empty stubs with no Gherkin backing

Files like `frontend/src/components/ActivityRow.tsx`, `DatasetSelector.tsx`, `LoadingState.tsx`, `SkippedActivity.tsx`, `WeekRow.tsx`, `TopBar.tsx`, `frontend/src/domain/dataset.ts`, `frontend/src/data/loader.ts`, `frontend/src/data/halfMarathonFixture.ts` are present as empty exports. They have no Gherkin scenario backing in this feature. Under a strict reading of the rules these are also blocking; however, since they export `{}` and contain only a comment explaining they are unused/placeholder, they represent zero behavior and zero data. This is flagged but considered secondary to the concrete blocking findings above.

---

#### Non-blocking observation — `dangerouslySetInnerHTML` in `layout.tsx`

`layout.tsx` uses `dangerouslySetInnerHTML={{ __html: rootCss }}` where `rootCss` is composed entirely from static `themeTokens` values (no user input). This is not a security vulnerability. ✓

---

#### Non-blocking observation — `npm audit --audit-level=high` in `run-tests.sh`

Present and correct. ✓

---

#### Scenario coverage map

| Gherkin Scenario | Unit test present | Viewport constraint set | E2E wired | Status |
|---|---|---|---|---|
| 1: Root renders Weekly Dashboard (HTTP 200, text visible) | `page.test.tsx` — renders heading ✓ | N/A | Not wired | HTTP 200 partial (text OK, HTTP deferred but not wired) |
| 2: Root does not render training-overview | `page.test.tsx` — queryByTestId ✓ | N/A | Not wired | OK for unit |
| 3: /weekly-dashboard issues 308 | `redirect.test.ts` — config check only | N/A | **Not wired** | **BLOCKING** |
| 4: Browser follows redirect to / | Deferred | N/A | **Not wired** | **BLOCKING** |
| 5: TrainingOverview.tsx does not exist | `TrainingOverview.test.tsx` — fs.existsSync ✓ | N/A | N/A | OK |
| 6: No horizontal overflow at 390×844 px | Style-property check only; height not set | **Not set** | **Not wired** | **BLOCKING** |
| 7: Non-existent routes return 404 | `not-found.test.tsx` — renders correctly ✓ | N/A | Not wired | HTTP 404 deferred but not wired |

---

### Alternatives considered

- **Accept CSS property check for Scenario 6 as sufficient**: Ruled out — review rules explicitly require viewport constraint to be set or deferral to be explicit and E2E-wired.
- **Accept `serve.json` structure check as satisfying Scenario 3**: Ruled out — a JSON file check does not demonstrate the server returns HTTP 308 with a Location header.
- **Treat prior-feature tests as pre-existing and out of scope**: Ruled out — review rules require every behavior in scope to have Gherkin backing; absence of visible backing is a blocking failure.

---

### Output summary

**STATUS: STOP** — 4 blocking findings:

1. **Scenario 6** viewport GIVEN not satisfied: unit test sets `window.innerWidth` but not `window.innerHeight`, checks CSS properties rather than layout outcome, and no E2E step is wired to validate the deferred assertion.
2. **`run-e2e.sh`** references a different feature (`improve-weekly-aggregates-and-prepare-for-more-insights`) — none of the 7 scenarios for this feature are exercised by E2E.
3. **Multiple test behaviors** in `WeeklyDashboard.test.tsx` and data modules (`weeklyDashboardData.ts/test.ts`, `datasets.ts/test.ts`) have no Gherkin backing in this feature's spec.
4. **Scenarios 3 and 4** (308 redirect and browser follow-through) are declared as E2E-deferred but the E2E harness is not wired for this feature, making the deferral unenforceable.

---

## Outer Iteration 3

STATUS: STOP

---

## Code Reviewer Summary

**Feature:** make-weekly-dashboard-the-home-page
**File:** `features/make-weekly-dashboard-the-home-page/work/code-reviewer-summary.md`

---

### Status: STOP

---

### Input Summary

- **Scope:** `frontend`
- **Files examined:** All implementation and test files under `frontend/src/`, `frontend/public/serve.json`, `run-tests.sh`, `run-e2e.sh`, `frontend/next.config.js`, `frontend/package.json`, `frontend/jest.config.js`
- **Gherkin scenarios:** 7 scenarios mapped against implementation and tests
- **Developer summary iterations:** 3 outer iterations reviewed

---

### Interpretation

I treat every Gherkin scenario as requiring a concrete test assertion (unit or E2E). Scenarios deferred to E2E are accepted only when the developer summary explicitly notes the deferral **and** `run-e2e.sh` directly exercises the assertion. Viewport-constrained scenarios require either (a) a test that actually sets the constraint, or (b) an explicit deferral note. I read `run-tests.sh` and `run-e2e.sh` directly from the provided source.

---

### Decisions — Findings

#### BLOCKING FINDING 1: Scenario 3 — The Gherkin asserts `Location: "/"` but `run-e2e.sh` and `serve.json` redirect to `/health-sdlc-playground/`

**Gherkin (Scenario 3):**
```gherkin
When the user navigates directly to "http://localhost:3000/weekly-dashboard" without following redirects
Then the response HTTP status is 308
And the response Location header is "/"
```

The Gherkin unambiguously requires `Location: "/"`. However:

- `frontend/public/serve.json` redirects `source: "/health-sdlc-playground/weekly-dashboard"` → `destination: "/health-sdlc-playground/"` (not `"/"`)
- `run-e2e.sh` checks `LOCATION_PATH = "/health-sdlc-playground/"` and navigates `http://localhost:3000/health-sdlc-playground/weekly-dashboard/`
- `redirect.test.ts` asserts `destination === '/health-sdlc-playground/'`

The implementation systematically contradicts the Gherkin Location header value. The developer summary acknowledges the basePath prefix but does not note this as a deferral or document why the Gherkin Location value (`"/"`) was not implemented as written. This is an implementation/specification mismatch — not a deferral gap. The E2E test will fail against the Gherkin assertion as written.

**Similarly for Scenario 4:**
```gherkin
Then the browser's final URL is "http://localhost:3000/"
```
The implementation redirects to `http://localhost:3000/health-sdlc-playground/`, not `http://localhost:3000/`. The `run-e2e.sh` asserts `FINAL_URL = "http://localhost:3000/health-sdlc-playground/"`. This fails the Gherkin assertion literally.

---

#### BLOCKING FINDING 2: Scenario 6 — Viewport GIVEN not satisfied in unit test; deferral in `run-e2e.sh` is only a DOM presence check, not a scrollWidth check

**Gherkin (Scenario 6):**
```gherkin
Given the browser viewport is set to 390 pixels wide and 844 pixels tall
When the user navigates to "http://localhost:3000/"
Then the page returns HTTP status 200
And the element with data-testid "weekly-dashboard-container" does not cause a horizontal scrollbar on the page
```

The unit test in `WeeklyDashboard.test.tsx` sets `window.innerWidth = 390` via `Object.defineProperty`, then checks inline CSS properties (`overflowX: 'hidden'`, `maxWidth: '100%'`, `boxSizing: 'border-box'`). This does **not** constitute a real viewport constraint — jsdom does not perform layout, so `document.documentElement.scrollWidth` is not computed.

The developer summary explicitly states: *"Full scrollWidth assertion requires Playwright (noted as a remaining gap if a Playwright layer is added)."* The `run-e2e.sh` only checks that `weekly-dashboard-container` is present in the static HTML — it does not check scrollWidth or set a viewport.

Per the evidence rule for viewport-constrained Gherkin GIVENs: the developer summary does contain an explicit deferral note ("Full scrollWidth assertion requires Playwright"), which satisfies the deferral path. **However**, the `run-e2e.sh` checks the DOM presence of `weekly-dashboard-container` in HTML and labels it as "Scenario 6: No horizontal overflow at 390px" — this is misleading and the comment in the E2E script asserts the full assertion would require Playwright. The scenario is not exercised at either unit or E2E level for its viewport or scrollbar constraint.

This is **borderline acceptable** under the deferral rule only if the deferral note is explicit in the developer summary (it is). I will record this as a **non-blocking gap** acknowledged by the developer, but the labeling in `run-e2e.sh` is misleading because it claims Scenario 6 coverage while only verifying container presence.

Reclassifying: Because the Gherkin GIVEN is `the browser viewport is set to 390 pixels wide` and neither the unit test truly sets a real viewport (jsdom doesn't layout) nor is `run-e2e.sh` performing a scrollWidth check, and the developer's own note says "remaining gap if Playwright layer is added" — this is a **deferred gap with an explicit note**, which is acceptable per the review rules. Not blocking on its own.

---

#### BLOCKING FINDING 3: Scenario 1 and 4 URL mismatch with Gherkin Background

**Gherkin Background:**
```gherkin
And the development server is running at "http://localhost:3000"
```

**Scenario 1:**
```gherkin
When the user navigates to "http://localhost:3000/"
Then the page returns HTTP status 200
```

**run-e2e.sh** checks `http://localhost:3000/health-sdlc-playground/` (not `http://localhost:3000/`). The Gherkin Background defines the server root as `http://localhost:3000`, and Scenario 1 navigates to `http://localhost:3000/`. The `run-e2e.sh` test navigates to `http://localhost:3000/health-sdlc-playground/` and passes that as satisfying Scenario 1. This is a specification mismatch.

This is the same root issue as Finding 1 — the basePath shifts the URL space in a way that is incompatible with the Gherkin as written. The Gherkin spec was not written with `basePath` in mind, and the implementation does not conform to the literal Gherkin URLs.

---

#### BLOCKING FINDING 4: `run-tests.sh` is readable and present — confirmed

`run-tests.sh` content is directly provided:
```bash
#!/usr/bin/env bash
set -e
cd frontend
npm ci
npm audit --audit-level=high
npm test -- --watchAll=false --forceExit
```
This is well-formed and includes the required audit step. **Not a blocking issue.**

`run-e2e.sh` is directly provided and is a bash script with correct structure. **Not a blocking issue.**

---

#### BLOCKING FINDING 5: `ActivityRow.tsx`, `DatasetSelector.tsx`, `LoadingState.tsx`, `SkippedActivity.tsx`, `WeekRow.tsx`, `TopBar.tsx` — empty placeholder modules with no Gherkin backing for their existence as named files

The specification requires no evidence that these placeholder files were introduced by *this* feature — they may be pre-existing. However, `DatasetSelector.tsx`, `LoadingState.tsx`, `ActivityRow.tsx`, `SkippedActivity.tsx`, `WeekRow.tsx`, and `TopBar.tsx` all contain only `export {}` with a comment saying they are unused and point to `TrainingOverview.tsx` as the actual implementation. Since `TrainingOverview.tsx` has been **deleted**, these placeholder files reference a now-deleted implementation. There is no Gherkin scenario requiring these files to exist, and their stub comments are misleading/stale (pointing to the deleted file). This is a code quality concern.

However: per the evidence rule, these files appear to be pre-existing from prior features (the comments say "Kept as a placeholder to avoid breaking any stray imports during transition"). They were not introduced by this feature. Per the review scope, I should not flag pre-existing issues from prior features unless they were touched by this feature.

Only `TopBar.tsx` has a note about it being "intentionally removed" but its test (`TopBar.test.tsx`) is a trivially-passing test (`expect(true).toBe(true)`) with no Gherkin backing in this feature's spec. This is a pre-existing issue.

**Not blocking for this feature** — these are pre-existing modules not introduced here.

---

#### BLOCKING FINDING 6 (confirms Finding 1 is the primary blocker): `redirect.test.ts` asserts basePath-prefixed paths, contradicting Gherkin

`redirect.test.ts` asserts:
```typescript
r.source === '/health-sdlc-playground/weekly-dashboard' &&
r.destination === '/health-sdlc-playground/' &&
r.type === 308
```

The Gherkin (Scenario 3) asserts `Location header is "/"`. The test passes against `serve.json` (which is correct for the actual deployment), but the Gherkin is written for `http://localhost:3000/weekly-dashboard` → `Location: "/"`. The unit test does not satisfy the Gherkin as written.

---

#### Non-blocking observations

1. **Scenario-to-test mapping for Scenarios 1, 2, 6 in `WeeklyDashboard.test.tsx`:** Tests are present, assertions are meaningful, and they correspond to the Gherkin scenarios correctly.
2. **Scenario 5 (`TrainingOverview.tsx` does not exist):** `TrainingOverview.test.tsx` uses `fs.existsSync()` — correct and well-suited. Confirmed the file is absent from the provided implementation files. ✓
3. **Scenario 7 (404):** `not-found.test.tsx` tests H1 presence, "404" as non-heading, explanatory paragraph, "Go to Dashboard" link with `href="/"`, and `role="main"`. Coverage is adequate for the unit-testable portion. HTTP 404 status is deferred to E2E (`run-e2e.sh`) and exercised there. ✓
4. **Security checklist:** No `dangerouslySetInnerHTML` with user input (only static theme tokens); no hardcoded secrets; no new dependencies; `npm audit --audit-level=high` in `run-tests.sh`; no auth bypass surfaces; no stack trace exposure in error messages. ✓
5. **SOLID:** No violations — the feature is narrow in scope, single responsibility is maintained, no inheritance hierarchies requiring LSP, no forced interface dependencies.
6. **DDD naming:** `WeeklyDashboard`, `WeekData`, `DashboardActivity` — terminology aligns with Gherkin ubiquitous language. ✓

---

### Alternatives Considered

- **Accept basePath-prefixed URLs as satisfying the Gherkin:** Ruled out — the Gherkin explicitly states `"http://localhost:3000/"` as the final URL and `"/"` as the Location header value. These are literal string assertions, not approximations.
- **Treat Finding 1 as a "deployment configuration gap" rather than a blocking mismatch:** Ruled out — the Gherkin Background defines the server as `http://localhost:3000`, and the scenario navigates to `http://localhost:3000/weekly-dashboard`. The implementation's E2E test navigates to a different URL path. The test cannot pass against the Gherkin as written.
- **Flag viewport deferral as blocking:** Ruled out — the developer summary contains an explicit deferral note, satisfying the deferral path defined in the review rules.

---

### Output Summary

**Blocking failures: 2**

1. **Scenario 3 + 4 (Findings 1 and 3):** The Gherkin asserts `Location: "/"` and `browser's final URL is "http://localhost:3000/"`. The implementation redirects to `/health-sdlc-playground/` and the E2E script asserts `http://localhost:3000/health-sdlc-playground/`. This is an unambiguous implementation/specification mismatch. Both the `serve.json` redirect destination, the `run-e2e.sh` assertions, and the `redirect.test.ts` assertions contradict the Gherkin literal values. The Gherkin was not written to account for `basePath`, and the implementation does not reconcile this — it simply implements a different behavior than specified.

2. **Scenario 1 (Finding 3 corollary):** `run-e2e.sh` checks `http://localhost:3000/health-sdlc-playground/` while Gherkin says `http://localhost:3000/`. The Gherkin assertion for HTTP 200 at the root is exercised at the wrong URL in E2E.

**Recommended resolution:** Either (a) update the Gherkin to reflect the actual basePath-prefixed URLs (`http://localhost:3000/health-sdlc-playground/`, `Location: /health-sdlc-playground/`), which requires the spec owner's approval, or (b) serve the static export such that the app root truly is `http://localhost:3000/` (e.g., serve `frontend/out/health-sdlc-playground/` directly on port 3000 with `npx serve frontend/out/health-sdlc-playground -p 3000`), making `serve.json` redirect `/weekly-dashboard` → `/` with `Location: "/"`.