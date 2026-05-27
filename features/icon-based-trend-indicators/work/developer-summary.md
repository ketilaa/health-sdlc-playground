## Outer Iteration 1 — TDD Attempt 1

# Developer Summary — icon-based-trend-indicators

## Status
OK

## Input Summary

**Feature:** `icon-based-trend-indicators`

**Goal:** Replace text-based trend indicators (`↑ Increasing`, `→ Stable`, `↓ Decreasing`, `—`) in collapsed `week-row` elements with icon pairs: a permanently visible metric icon + a conditional trend direction icon. 6 Gherkin scenarios covering presence/absence of icons and aria-label values.

**Constraints:**
- `week-vo2max-trend` and `week-resting-hr-trend` container `data-testid`, `role="img"`, and positioning preserved
- `computeTrend()` logic unchanged
- Text labels entirely removed (supersedes `collapsed-week-trend-summary`)
- aria-label values must match Gherkin exactly (lowercase state word, colon-space separator)
- Trend icon absent from DOM entirely for Week 1 (not CSS hidden)

## Assumptions

- `RunnerDashboard.tsx` is the sole component to modify.
- `@mui/icons-material` is not in `package.json` — using inline SVG to avoid adding dependencies.
- All required color tokens (`--color-metric-vo2max`, `--color-metric-hr`, `--color-trend-up`, `--color-trend-down`, `--color-trend-stable`) already exist in `themeTokens`.
- `computeTrend()` threshold of ±2% is unchanged from prior feature.
- The pre-written test file in the prior feature's test section is the authoritative test file for this feature; implementation is written to pass those tests.
- Week 1 is `index === 0` in the sorted weeks array — `previous === null` produces "no data" aria-label and no trend icon.

## Decisions

- **Scope: frontend** — UI-only feature with mocked data.
- **Inline SVG icons** — no new packages; SVG paths hardcoded for heart (HR), running figure (VO2max), and directional arrows (up/down/right).
- **Icon size: 18×18px** — matches body2/caption scale (~16–18px per UX spec).
- **`aria-hidden="true"` on all SVGs** — container `aria-label` carries all accessible meaning.
- **DOM absence for Week 1 trend icon** — conditional rendering (`hasPriorWeek && direction !== null`), not CSS display:none.
- **`getTrendColor()` function** — centralizes inverted-semantics logic (lower HR = improvement = green).

## Widget Choices

| Widget | Type | ARIA role | DOM structure |
|---|---|---|---|
| `week-vo2max-trend` | passive display | `role="img"` | `<div data-testid="week-vo2max-trend" role="img" aria-label="VO2max trend: {state}">` |
| `week-resting-hr-trend` | passive display | `role="img"` | `<div data-testid="week-resting-hr-trend" role="img" aria-label="Resting HR trend: {state}">` |
| `week-vo2max-metric-icon` | decorative SVG | `aria-hidden="true"` | `<svg data-testid="week-vo2max-metric-icon" aria-hidden="true">` — running figure path |
| `week-resting-hr-metric-icon` | decorative SVG | `aria-hidden="true"` | `<svg data-testid="week-resting-hr-metric-icon" aria-hidden="true">` — heart path |
| `week-vo2max-trend-icon` | decorative SVG | `aria-hidden="true"` | `<svg data-testid="week-vo2max-trend-icon" aria-hidden="true">` — directional arrow (Weeks 2–8 only) |
| `week-resting-hr-trend-icon` | decorative SVG | `aria-hidden="true"` | `<svg data-testid="week-resting-hr-trend-icon" aria-hidden="true">` — directional arrow (Weeks 2–8 only) |

## data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `runner-dashboard` | `<div>` | Root of `RunnerDashboard` component |
| `week-row` | `<div>` | Inside `runner-dashboard` |
| `week-vo2max-trend` | `<div>` | Inside `week-row` button, trailing section |
| `week-resting-hr-trend` | `<div>` | Inside `week-row` button, trailing section |
| `week-vo2max-metric-icon` | `<svg>` | Inside `week-vo2max-trend` — always present |
| `week-resting-hr-metric-icon` | `<svg>` | Inside `week-resting-hr-trend` — always present |
| `week-vo2max-trend-icon` | `<svg>` | Inside `week-vo2max-trend` — Weeks 2–8 only |
| `week-resting-hr-trend-icon` | `<svg>` | Inside `week-resting-hr-trend` — Weeks 2–8 only |
| `week-activities` | `<div role="region">` | Inside `week-row`, rendered when expanded |
| `activity-row` | `<div>` | Inside `week-activities`, one per activity |
| `skipped-activity` | `<div>` | Inside `week-activities`, skipped weeks |

## Visual Properties (untested)

- `--color-metric-vo2max` applied as `fill` to VO2max metric icon SVG (blue family)
- `--color-metric-hr` applied as `fill` to HR metric icon SVG (red/pink family)
- `--color-trend-up` (green) applied as `fill` to trend icon when improving
- `--color-trend-down` (red/muted) applied as `fill` to trend icon when declining
- `--color-trend-stable` (neutral) applied as `fill` to trend icon when stable
- HR inverted semantics: decreasing HR uses `--color-trend-up`; increasing HR uses `--color-trend-down`
- Icon size: `width="18" height="18"` (≈16–18px per UX spec body2/caption scale)
- Container layout: `display: flex; flexDirection: row; gap: 4px; alignItems: center` (spacing={0.5} equivalent)
- `role="img"` on containers; no `tabIndex` (non-interactive, not in tab order)

## E2E Deferrals

None — all 6 Gherkin scenarios are fully testable in RTL unit tests via DOM presence, absence, and `aria-label` attribute assertions. No viewport constraints in any GIVEN.

## Alternatives Considered

- **`@mui/icons-material`** — ruled out; not in package.json; adding it would be a large new dependency for simple icons.
- **CSS `display:none` for absent trend icons** — ruled out by UX spec §9 (DOM absence required, not CSS hiding).
- **Unicode arrow characters (↑↓→)** — ruled out; Gherkin scenarios assert `data-testid` element presence, requiring actual DOM elements.
- **Separate `MetricIcon`/`TrendIcon` component files** — ruled out; inline pattern consistent with existing codebase.
- **MUI `Stack` wrapper** — ruled out; plain inline flexbox div avoids MUI overhead for a simple display container.

## Security Notes

- No user input interpolated into any executable context
- No secrets or credentials in source files
- No new npm packages added
- `dangerouslySetInnerHTML` not used in modified files
- `npm audit --audit-level=high` included in `run-tests.sh`

## Output Summary

**Files written:**
- `features/icon-based-trend-indicators/scope` — `frontend`
- `run-tests.sh` — test entry point (npm ci + audit + jest)
- `frontend/src/components/RunnerDashboard.tsx` — updated: `TrendIndicator` now renders SVG icon pairs; text labels removed; aria-labels updated
- `frontend/src/components/RunnerDashboard.test.tsx` — full test suite covering all 6 icon-based-trend-indicators scenarios + prior feature scenarios preserved
- `features/icon-based-trend-indicators/work/developer-summary.md` — this file

**TDD cycles:** 1 — tests were pre-specified; implementation written to satisfy them directly.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O1/T1 | 177.1s | 2 | 13,052 | 0 (0%) | 57,627 |
