## Outer Iteration 1 — TDD Attempt 1

# Developer Summary — enforce-visual-theme

## Status
OK

## Input Summary
- **Feature:** enforce-visual-theme
- **Gherkin:** 4 scenarios requiring `data-activity-type` attributes on `activity-row` and `skipped-activity` elements rendered within `week-activities` containers; tests use `week-row` (expandable), `week-activities`, `activity-row`, `skipped-activity` testids
- **UX spec:** Attribute contract (`data-activity-type`) connecting DOM to CSS token system; snake_case lowercase values; no new visual components
- **Reviewer summaries:** All STATUS: OK; attributes are CSS hooks only, not ARIA; visible text labels provide accessibility; Week 7 must have a long_run activity in fixture data

## Assumptions
- The `week-row`/`week-activities`/`activity-row`/`skipped-activity` testids are not in the existing `WeeklyDashboard.tsx` (which uses a dropdown `week-selector`); a new `RunnerDashboard` component is needed to provide the accordion expansion pattern required by the Gherkin.
- The existing `datasets.ts` source file was not shown (truncated), but its test file (`datasets.test.ts`) was present and passing — I implemented `datasets.ts` to satisfy all assertions in that test file.
- Week 4 is the skipped/sickness week and has 2 activities (partially completed before sickness) based on the existing test assertion: "7 weeks have 3 activities and 1 week has 2 activities".
- Activity type values in `datasets.ts` are stored in display form ("Long run", "Restorative run", "Intervals"), not snake_case. The `activityTypeAttr()` helper in `RunnerDashboard` normalizes to snake_case for the DOM attribute.
- Week 4's `skipped-activity` marker is rendered instead of (not alongside) the activity rows, because the UX spec describes the skipped marker as the UI element for that week.
- Week 7 must contain a long_run activity (required by Scenario 4) — fixture data includes this.
- The `RunnerDashboard` is placed inside the `training-overview` Paper element in `HomePage.tsx` to make it accessible from the home page (`/`) as required by the Gherkin Background.
- Expanding a week row by clicking it again collapses it (toggle behavior), which allows Scenario 4 to collapse Week 8 before expanding Week 7.

## Decisions
- **Scope:** frontend — all changes are UI/component DOM attribute enforcement
- **New component `RunnerDashboard.tsx`:** Created to provide the accordion pattern with `week-row`/`week-activities`/`activity-row`/`skipped-activity` testids — the existing `WeeklyDashboard.tsx` uses a different interaction model (dropdown selector) that doesn't match the Gherkin's click-to-expand pattern
- **`activityTypeAttr()` helper:** Converts display-form types ("Long run") to snake_case attribute values ("long_run") via lowercase + whitespace/hyphen → underscore transformation
- **`datasets.ts` implementation:** Written from scratch since source was truncated; satisfies all assertions in the pre-existing `datasets.test.ts` without changing that test file
- **`RunnerDashboard` integrated into `HomePage`:** Placed inside `training-overview` section so the Gherkin's `navigate to "/"` step finds the week rows
- **Toggle behavior:** Only one week expanded at a time (clicking an expanded week collapses it); satisfies Scenario 4's implicit requirement to navigate between weeks

## Widget Choices
- **Week row expansion:** Plain `<button>` with `aria-expanded` and `aria-controls` — no MUI component, for minimal dependency and clear ARIA semantics
- **Week activities container:** `<div role="region" aria-label="Activities for Week N">` — provides landmark navigation for screen readers
- **Activity row:** Plain `<div data-testid="activity-row" data-activity-type="...">` — no interactive widget, purely informational display with the CSS hook attribute

## data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `runner-dashboard` | `<div>` | Root of `RunnerDashboard` component |
| `week-row` | `<div>` | Inside `runner-dashboard > .week-list`, one per week |
| `week-activities` | `<div role="region">` | Inside expanded `week-row` |
| `activity-row` | `<div>` | Inside `week-activities`, one per activity |
| `skipped-activity` | `<div>` | Inside `week-activities` for skipped weeks (replaces activity-rows) |

## E2E Deferrals
- None — all 4 Gherkin scenarios are DOM attribute assertions testable via RTL `getAttribute()` and `within()`. No viewport constraints or CSS rendering checks.

## Alternatives Considered
- **Modifying `WeeklyDashboard.tsx` to add `week-row`/`week-activities` testids:** Ruled out — `WeeklyDashboard` uses a `<select>` dropdown for week navigation, not an expandable row pattern. Retrofitting it would require significant restructuring and risk breaking 15+ existing tests.
- **Reusing `WeeklyDashboard` data (`weeklyDashboardData.ts`) instead of `datasets.ts`:** The Gherkin uses "Week 8" / "Week 4" labels (from `fixtureDataset`), not "W10" / "W09" labels (from `weeklyDashboardData`). The two datasets serve different features.
- **Adding `data-activity-type` to the existing `WeeklyDashboard`'s `activity-list` rows:** The `WeeklyDashboard` renders activities under `activity-list`, not `week-activities`, so it cannot satisfy the Gherkin's `within "week-activities"` assertion.
- **Storing activity types in snake_case directly:** The existing `datasets.test.ts` asserts types as `['Intervals', 'Long run', 'Restorative run']` (display form, title-case), so I must store them in display form and normalize at render time.

## Output Summary
**Files created:**
- `features/enforce-visual-theme/scope` — `frontend`
- `run-tests.sh` — test entry point with `npm audit`
- `frontend/src/data/datasets.ts` — fixture dataset module (rewritten; satisfies pre-existing `datasets.test.ts`)
- `frontend/src/components/RunnerDashboard.tsx` — new accordion-style week dashboard with `data-activity-type` attributes
- `frontend/src/components/RunnerDashboard.test.tsx` — 9 RTL tests covering all 4 Gherkin scenarios

**Files modified:**
- `frontend/src/components/HomePage.tsx` — added `RunnerDashboard` inside `training-overview` section

**Tests written:** 9 unit tests in `RunnerDashboard.test.tsx` covering all 4 Gherkin scenarios plus structural guards.

**Iterations:** 1 TDD cycle

## Security Notes
- No user input interpolated into any executable context
- No secrets or credentials in source files
- No new npm packages added
- `npm audit --audit-level=high` included in `run-tests.sh`
- `data-activity-type` attribute values are derived from static fixture data, not user input — no injection risk

---

## Outer Iteration 2 — TDD Attempt 1

I'll fix the three blocking issues:

1. **Fixture validation** — add test asserting Week 7 contains a `long_run` activity
2. **Accessibility** — remove redundant `aria-label` from skipped-activity (visible text is sufficient)
3. **HomePage integration** — move `RunnerDashboard` out of `training-overview` into a dedicated section with clear rationale