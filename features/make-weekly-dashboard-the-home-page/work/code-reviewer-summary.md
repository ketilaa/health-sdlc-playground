## Outer Iteration 1

STATUS: STOP

---

## Code Reviewer Summary

### Status: STOP

### Input summary
- **Scope:** `frontend`
- **Gherkin scenarios:** 7
- **Files examined:** `run-tests.sh`, `run-e2e.sh`, `frontend/src/app/page.tsx`, `frontend/src/app/page.test.tsx`, `frontend/src/app/not-found.tsx`, `frontend/src/app/not-found.test.tsx`, `frontend/src/app/weekly-dashboard/page.tsx`, `frontend/src/components/WeeklyDashboard.tsx`, `frontend/src/components/WeeklyDashboard.test.tsx`, `frontend/src/components/TrainingOverview.tsx`, `frontend/src/components/TrainingOverview.test.tsx`, `frontend/src/components/VisualTheme.test.tsx`, `frontend/src/data/weeklyDashboardData.ts`, `frontend/src/data/weeklyDashboardData.test.ts`, `frontend/src/app/layout.tsx`, `frontend/src/app/layout.test.tsx`

---

### Interpretation
- The developer summary explicitly defers Scenarios 1 (HTTP 200), 3 (308 redirect), 4 (redirect follow), 6 (viewport overflow), and 7 (HTTP 404) to E2E, noting that a static export cannot produce server-side HTTP semantics in unit tests.
- The review rules require that any Gherkin scenario with a viewport constraint must either have a unit test that **actually sets** that constraint, or have an **explicit "deferred to E2E" note** in the developer summary. The developer summary does include a deferral note for Scenario 6.
- `run-e2e.sh` is present and readable.

---

### Decisions

#### BLOCKING FAILURE 1 — `run-e2e.sh` references the wrong feature (Scenario 3, 4, 6, 7 coverage path is broken)

`run-e2e.sh` (repo root, lines shown) contains:

```bash
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'improve-weekly-aggregates-and-prepare-for-more-insights/**/*.steps.ts' \
  '../features/improve-weekly-aggregates-and-prepare-for-more-insights/**/*.feature' \
  --format progress
```

This runs the `improve-weekly-aggregates-and-prepare-for-more-insights` feature, **not** the `make-weekly-dashboard-the-home-page` feature. Any E2E scenarios for the current feature (Scenarios 1, 3, 4, 6, 7) will never be executed by `run-e2e.sh`. The developer summary states these are "deferred to E2E," but the E2E script does not run them. This means the deferred scenarios have **no executable verification path at all** — neither unit test nor E2E.

Per the review rules: "A missing or unreadable script is a blocking failure." The script exists and is readable, but it runs the wrong feature. The practical effect is equivalent: the deferred scenarios are entirely unexecuted. This is a blocking concern.

---

#### BLOCKING FAILURE 2 — Scenario 3: `/weekly-dashboard` issues a permanent 308 redirect — no test coverage and inadequate deferral

Gherkin Scenario 3:
> When the user navigates directly to `http://localhost:3000/weekly-dashboard` without following redirects  
> Then the response HTTP status is 308  
> And the response Location header is "/"

The developer summary acknowledges this cannot be satisfied by a static export and defers it to E2E. However:

1. The `run-e2e.sh` script does not run E2E tests for this feature (see Failure 1 above).
2. The implementation in `frontend/src/app/weekly-dashboard/page.tsx` is a **client-side `router.replace('/')`** — this will never produce an HTTP 308 response. The developer notes this in the summary ("308 deferred to E2E") but also notes in "Alternatives considered" that `next.config.js` redirects don't work with `output: 'export'`. The implementation does not satisfy the Gherkin scenario even in a non-static deployment — `router.replace` issues a client-side navigation, not an HTTP 308.

The Gherkin scenario explicitly tests the HTTP-level response (status 308, Location header). A client-side redirect component is categorically the wrong implementation for this scenario. There is no server-side 308 implemented, and the E2E coverage does not exist. This is a blocking gap that cannot be resolved by documentation alone.

---

#### BLOCKING FAILURE 3 — Scenario 5: `TrainingOverview.tsx` file does not exist — the Gherkin says the **file** does not exist; the implementation leaves the file present

Gherkin Scenario 5:
> Then the file "frontend/src/components/TrainingOverview.tsx" does not exist

The developer left `frontend/src/components/TrainingOverview.tsx` present in the codebase (as an empty stub). The file **does exist**. The test in `TrainingOverview.test.tsx` verifies only that the module has no default export — it does not verify file non-existence.

The developer summary acknowledges this: "Overwrite `TrainingOverview.tsx` with empty stub — Cannot delete files via write-only pipeline; stub satisfies import-safety while test verifies no default export."

This does **not** satisfy the Gherkin scenario. The scenario asserts a specific, verifiable condition: the file does not exist on disk. The test written verifies behavioral equivalence, but the Gherkin scenario is written as a structural/filesystem assertion. No test in the suite asserts `fs.existsSync('frontend/src/components/TrainingOverview.tsx') === false`. The developer explicitly ruled out an `fs.existsSync` test ("Would fail because the pipeline can only write files, not delete them") but did not obtain a Gherkin scope change. This is a blocking failure.

---

#### BLOCKING FAILURE 4 — Scenario 6: No horizontal overflow at 390px — viewport constraint not set in any test, deferral note present but E2E not wired

Gherkin Scenario 6:
> **Given** the browser viewport is set to 390 pixels wide and 844 pixels tall  
> When the user navigates to `http://localhost:3000/`  
> Then the element with `data-testid="weekly-dashboard-container"` does not cause a horizontal scrollbar

The developer summary defers this to E2E. However, `run-e2e.sh` runs a different feature's E2E suite (Failure 1), so the deferral to E2E has no execution path. Additionally, no unit test sets a 390px viewport. The `WeeklyDashboard.test.tsx` test "Scenario: Weekly summary card visible at 375px" merely checks DOM presence — it does not set a viewport width. Per the review rules: "A DOM-presence check without viewport configuration does not satisfy a viewport GIVEN. Flag the absence of a deferral note as a blocking gap."

The deferral note exists in the developer summary, but the E2E it defers to does not run this feature. Net result: the viewport GIVEN is unexecuted.

---

#### BLOCKING FAILURE 5 — Type mismatch between `ActivityData` (imported in test) and `DashboardActivity` (defined in data module)

`WeeklyDashboard.test.tsx` imports:
```ts
import {
  weeklyDashboardDataset,
  WeekData,
  strengthCrossTrainActivity,
} from '../data/weeklyDashboardData'
```

But also:
```ts
import { ActivityData } from '../data/weeklyDashboardData'  // (implied by usage: extraActivities?: ActivityData[])
```

Looking at `weeklyDashboardData.ts`, the exported interface is named `DashboardActivity`, **not** `ActivityData`. The `WeeklyDashboard.tsx` component prop type uses `ActivityData`:

```ts
interface WeeklyDashboardProps {
  extraActivities?: ActivityData[]
  overrideDataset?: WeekData[]
}
```

But `weeklyDashboardData.ts` does not export any type named `ActivityData` — it exports `DashboardActivity`. Either:
- `ActivityData` is an alias defined in `WeeklyDashboard.tsx` that isn't shown, or
- This is a TypeScript compilation error

Reviewing `WeeklyDashboard.tsx` imports:
```ts
import {
  weeklyDashboardDataset,
  WeekData,
  ActivityData,        // ← NOT exported from weeklyDashboardData.ts
  computeWeeklyAvgHr,
  ...
} from '../data/weeklyDashboardData'
```

`weeklyDashboardData.ts` exports: `ActivityType`, `DashboardActivity`, `WeekData`, `TrendDirection`, `isHighIntensity`, `computeWeeklyAvgHr`, `computeWeeklyAvgCadence`, `computeTrend`, `trendLabel`, `getWeekById`, `getPreviousWeek`, `strengthCrossTrainActivity`, `weeklyDashboardDataset`.

There is **no export named `ActivityData`** in `weeklyDashboardData.ts`. This means `WeeklyDashboard.tsx` imports a type that doesn't exist, and the test file that imports `ActivityData` would fail TypeScript compilation. This is a blocking concern — the code would not compile.

*(Examining again: the test file shown imports `{ weeklyDashboardDataset, WeekData, strengthCrossTrainActivity }` — `ActivityData` is imported in `WeeklyDashboard.tsx` component itself, not visibly in the test file. But `WeeklyDashboard.tsx` clearly imports `ActivityData` from the data module, which does not export that name.)*

---

#### Non-blocking observation — Scenario 7 (404) HTTP status: deferred to E2E with no execution path

Same pattern as Scenario 6: deferred to E2E, but `run-e2e.sh` runs a different feature. However, the `not-found.tsx` implementation and `not-found.test.tsx` do correctly verify the DOM structure (H1 "Page Not Found", decorative 404, link to `/`, `role="main"`). The HTTP 404 status assertion is legitimately a server concern. This would be acceptable if the E2E were wired correctly, so it's subsumed by Failure 1.

---

#### Non-blocking observation — Scenario 1 and 2: DOM content tests are present and valid

`page.test.tsx` correctly tests:
- H1 "Weekly Dashboard" present (Scenario 1 DOM portion)
- `weekly-dashboard-container` present (Scenario 6 DOM portion)
- `training-overview` absent (Scenario 2)
- "Training Overview" heading absent (Scenario 2)

These are meaningful assertions. HTTP 200 is legitimately deferred.

---

#### Non-blocking observation — `WeeklyDashboard.tsx` named export vs default export

`WeeklyDashboard.tsx` exports both `export function WeeklyDashboard` (named) and `export default WeeklyDashboard` (default). `page.tsx` imports the default. `VisualTheme.test.tsx` and `WeeklyDashboard.test.tsx` import the named export `{ WeeklyDashboard }`. This is consistent and not a defect.

---

#### Security checklist — no issues found

- No user input interpolated into shell/SQL/eval
- `dangerouslySetInnerHTML` in `layout.tsx` uses only `themeTokens` (static compile-time constants, not user-controlled)
- No hardcoded secrets
- No new npm packages added
- `run-tests.sh` includes `npm audit --audit-level=high`
- No auth bypass (no auth exists in this codebase)
- No data exposure issues

---

### Alternatives considered
- Accepting the E2E deferral as sufficient for Scenarios 3, 4, 6, 7 — ruled out because `run-e2e.sh` runs the wrong feature entirely, so deferral has no execution path
- Treating the `TrainingOverview.tsx` stub as satisfying Scenario 5 — ruled out because the Gherkin states "the file does not exist," which is a direct filesystem assertion the stub violates
- Treating the `ActivityData` import issue as a minor naming concern — ruled out because it is a compile-time error; the type name imported in `WeeklyDashboard.tsx` does not exist in the data module

---

### Output summary

**5 blocking failures identified:**

1. **`run-e2e.sh` runs the wrong feature** — deferred scenarios (1, 3, 4, 6, 7) have no E2E execution path
2. **Scenario 3 (308 redirect)** — client-side `router.replace` cannot satisfy an HTTP 308 + Location header assertion; no E2E coverage either
3. **Scenario 5 (file does not exist)** — `frontend/src/components/TrainingOverview.tsx` is present on disk; no test asserts file non-existence
4. **Scenario 6 (390px viewport)** — no unit test sets viewport width; E2E deferral has no execution path
5. **`ActivityData` type import error** — `WeeklyDashboard.tsx` imports `ActivityData` from `weeklyDashboardData.ts`, which does not export that type name; code will not compile