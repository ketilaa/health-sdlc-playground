## Outer Iteration 1 — TDD Attempt 1

# Developer Summary — collapsed-week-trend-summary

## Status
OK

## Input Summary

**Feature:** `collapsed-week-trend-summary`

**Goal:** Add two passive trend indicators (`week-vo2max-trend` and `week-resting-hr-trend`) to each collapsed `week-row` in `RunnerDashboard`, visible at all times without requiring row expansion. The indicators use the established arrow-and-label notation (`↑ Increasing`, `↓ Decreasing`, `→ Stable`, `—`).

**Gherkin scenarios (5):**
1. Every `week-row` contains both `week-vo2max-trend` and `week-resting-hr-trend` elements
2. Both indicators are visible in collapsed state; `week-activities` is not visible
3. Week 8 shows `↑ Increasing` (VO2max) and `↓ Decreasing` (resting HR)
4. Week 3 shows `→ Stable` for both indicators
5. Week 1 (earliest) shows `—` for both indicators

**Prior feature constraints:**
- `week-row`, `week-activities`, `activity-row`, `skipped-activity` testids from `runner-dataset-with-consistent-improvement` / `enforce-visual-theme`
- `computeTrend()` pattern from `improve-weekly-aggregates-and-prepare-for-more-insights`
- Fixture dataset is "Half-Marathon Build-Up — 8 Week Consistent Plan" (8 weeks, Week 4 skipped)

## Assumptions

- `datasets.ts` previously did not have `vo2max` and `restingHrAvg` fields on the `Week` interface. These were added as required fields since the trend computation depends on them and all weeks need values.
- Week 1 is the first element in the `weeks` array (index 0), so it has no prior week → shows `—`.
- The `computeTrend()` function uses >2% for increasing, <-2% for decreasing (exclusive), ±2% inclusive for stable — consistent with `improve-weekly-aggregates-and-prepare-for-more-insights`.
- Trend indicators are placed inside the `<button>` element of the collapsed row (to the right of the week label) rather than outside it. This keeps them within the `week-row` container and visible without expansion.
- Week 3 stable values: Week 2 (vo2max=41, restingHr=59), Week 3 (vo2max=41, restingHr=59) — exactly 0% change = stable.
- Week 8 improving values: Week 7 (vo2max=44, restingHr=56), Week 8 (vo2max=46, restingHr=54) — VO2max change = +4.5% > 2% → Increasing; resting HR change = -3.6% < -2% → Decreasing.
- Week 4 (skipped) also gets trend indicators since it exists in the `weeks` array. Its vo2max/restingHrAvg carry forward the Week 3 values but this is not asserted by any Gherkin scenario.
- MUI `Stack` and `Typography` are used as specified in the UX spec.
- The `TrendIndicator` component renders the arrow span always (with the arrow character or `—`), and only renders the label span when `trend.label` is non-empty (which it isn't for the `none`/`—` state).

## Decisions

- **Scope: frontend** — all behavior is UI component-only with mocked data
- **Added `vo2max` and `restingHrAvg` to `Week` interface in `datasets.ts`** — these are required for trend computation in RunnerDashboard; prior features did not need them in this fixture, but they are new required fields
- **`computeTrend()` implemented inline in `RunnerDashboard.tsx`** — mirrors the function in `weeklyDashboardData.ts` but scoped to `RunnerDashboard` to avoid cross-module coupling; DDD: each bounded context owns its own computation
- **Trend indicators placed inside `<button>` element** — this keeps them visible in the collapsed row header without requiring expansion, matching the UX spec requirement
- **`previousWeek` prop passed to `WeekRowItem`** — computed at the `RunnerDashboard` level by looking at `weeks[index - 1]`; first week gets `undefined` → shows `—`
- **MUI `Stack` + `Typography`** — exactly as specified in UX spec section 3.2/3.3
- **`role="img"` + `aria-label`** — applied per accessibility spec
- **Testing approach:** RTL unit tests using `within()` to scope queries to specific `week-row` elements; tests written before implementation (TDD)

## Widget Choices

| Widget | ARIA role | Key DOM structure |
|---|---|---|
| VO2max trend indicator | `role="img"` | `<div data-testid="week-vo2max-trend" role="img" aria-label="VO2max trend: ...">` containing MUI Stack with two Typography spans |
| Resting HR trend indicator | `role="img"` | `<div data-testid="week-resting-hr-trend" role="img" aria-label="Resting HR trend: ...">` containing MUI Stack with two Typography spans |

The outer MUI `Stack` renders as a `<div>` in the DOM (MUI's default for Stack).

## data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `runner-dashboard` | `<div>` | Root of `RunnerDashboard` component |
| `week-row` | `<div>` | Inside `runner-dashboard > .week-list` |
| `week-vo2max-trend` | `<div>` (MUI Stack) | Inside `week-row > button`, in trailing Stack |
| `week-resting-hr-trend` | `<div>` (MUI Stack) | Inside `week-row > button`, in trailing Stack |
| `week-activities` | `<div role="region">` | Inside `week-row`, rendered when expanded |
| `activity-row` | `<div>` | Inside `week-activities`, one per non-skipped activity |
| `skipped-activity` | `<div>` | Inside `week-activities`, rendered for skipped weeks |

## E2E Deferrals

- **Scenario 2 (visibility without expansion):** Unit tests assert element presence using `toBeInTheDocument()`. In jsdom, all elements are technically "visible" unless explicitly hidden. The test confirms the indicators are present in the DOM without requiring expansion. Full visibility testing (CSS rendering, actual viewport visibility) is deferred to E2E.
- No viewport-constrained scenarios in this feature.

## Security Notes

- No user input interpolated into any executable context
- No secrets or credentials in source files
- No new npm packages added (MUI `Stack` and `Typography` were already in `@mui/material`)
- `dangerouslySetInnerHTML` not used in modified files
- `npm audit --audit-level=high` included in `run-tests.sh`

## Alternatives Considered

- **Place trend indicators outside the `<button>`:** Placing them as siblings to the `<button>` inside `week-row` would avoid wrapping non-interactive elements inside an interactive one. However, this would require additional CSS to align them with the button content. The current approach (inside the button) is simpler and consistent with the existing layout structure. No accessibility issue arises since the indicators have `role="img"` and are not interactive themselves.
- **Extract `computeTrend` to a shared utility:** Could reuse the function from `weeklyDashboardData.ts`. Ruled out — `weeklyDashboardData.ts` is in a different bounded context; importing from it for `RunnerDashboard` would create coupling. Inline duplication is acceptable for a small pure function.
- **Store previous week reference in the `Week` object:** Would tightly couple data structure to display logic. Ruled out — computing the previous week at render time from array index is cleaner DDD.

## Output Summary

**Files created/modified:**
1. `features/collapsed-week-trend-summary/scope` — `frontend`
2. `run-tests.sh` — test entry point
3. `frontend/src/data/datasets.ts` — added `vo2max` and `restingHrAvg` fields to `Week` interface and all fixture weeks
4. `frontend/src/components/RunnerDashboard.tsx` — added `TrendIndicator` component, `computeTrend` function, `WeekRowItem` `previousWeek` prop, trend indicators in collapsed row
5. `frontend/src/components/RunnerDashboard.test.tsx` — updated with 10 new tests for the 5 Gherkin scenarios; preserved all prior feature tests
6. `frontend/src/data/datasets.test.ts` — updated with new assertions for `vo2max`/`restingHrAvg` fields and trend value verification
7. `features/collapsed-week-trend-summary/work/developer-summary.md` — this file

**TDD cycles:** 1 cycle — tests written first, then implementation aligned to make them pass

---

## Outer Iteration 1 — TDD Attempt 2

The issue is that MUI `Stack` props like `alignItems` and `spacing` are being passed to the underlying DOM element. This happens because MUI `Stack` in newer versions may not properly filter these props. The fix is to use plain `div` with inline styles instead of MUI `Stack` for the trend indicators, avoiding the DOM prop warning.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O1/T1 | 160.2s | 2 | 12,635 | 0 (0%) | 58,866 |
| Developer O1/T2 | 23.3s | 13,713 | 1,888 | 58,866 (429%) | 0 |
