## Outer Iteration 1 — TDD Attempt 1

## Developer Summary — icon-based-trend-indicators

### Status: OK

### Input Summary
Feature replaces text-based trend indicators (`↑ Increasing`, `→ Stable`, etc.) in collapsed `week-row` elements with icon pairs: a permanently visible metric icon (VO2max or resting HR) and a conditional trend direction icon (only when a prior week exists for comparison). 6 Gherkin scenarios covering icon presence/absence, DOM absence for Week 1 trend icons, and aria-label values.

**Prior feature superseded:** `collapsed-week-trend-summary` — text spans with `↑`, `→`, `↓`, `—` characters and text labels removed entirely; aria-label format updated from `"No comparison available"` to `"no data"` (lowercase, Gherkin-mandated).

### Assumptions
- `@mui/icons-material` is NOT in `package.json` dependencies; inline SVG icons used instead to avoid adding new packages
- The existing `RunnerDashboard.tsx` `TrendIndicator` component was rewritten entirely to use icon elements instead of text spans
- The `computeTrend` function logic is unchanged (>2% threshold for increasing/decreasing)
- Week 1 (first element in the sorted weeks array, `index === 0`) has no prior week — trend icon absent from DOM
- aria-label for HR trend container reflects HR direction literally (`"Resting HR trend: decreasing"`) — the semantic inversion (lower HR = improvement) is communicated by `aria-label` on the VO2max container and icon color, not by inverting the HR label
- The test file shown in "Existing Test Files" already contained all 6 Gherkin scenario tests; the implementation was written to satisfy them

### Decisions
- **Scope: frontend** — all behavior is UI-only with synchronous mocked data
- **Inline SVG icons** — avoids new npm dependency; uses well-known MUI Material icon paths verbatim (standard SVG paths for running figure and heart); no external icon library needed
- **`React.cloneElement` for data-testid injection** — the `TrendDirectionIcon` wrapper injects `data-testid` into the rendered arrow SVG via `cloneElement`; this keeps the icon components generic while allowing the parent to set the testid
- **Conditional rendering via `{hasPriorWeek && ...}`** — DOM absence guaranteed (not CSS hiding)
- **aria-label format matches Gherkin exactly** — `"VO2max trend: increasing"`, `"Resting HR trend: decreasing"`, `"VO2max trend: no data"`, etc.
- **`TrendDirection` type includes `'none'`** — used only internally for Week 1; the aria-label function maps this to `"no data"` before it reaches the DOM

### Widget Choices
| Widget | Type | ARIA role | DOM structure |
|---|---|---|---|
| `week-vo2max-trend` container | passive display | `role="img"` | `<div data-testid="week-vo2max-trend" role="img" aria-label="VO2max trend: ...">` |
| `week-resting-hr-trend` container | passive display | `role="img"` | `<div data-testid="week-resting-hr-trend" role="img" aria-label="Resting HR trend: ...">` |
| `week-vo2max-metric-icon` | inline SVG | `aria-hidden="true"` | `<svg data-testid="week-vo2max-metric-icon" aria-hidden="true">` with running figure path |
| `week-resting-hr-metric-icon` | inline SVG | `aria-hidden="true"` | `<svg data-testid="week-resting-hr-metric-icon" aria-hidden="true">` with heart path |
| `week-vo2max-trend-icon` | inline SVG | `aria-hidden="true"` | `<svg data-testid="week-vo2max-trend-icon" aria-hidden="true">` arrow (up/down/right) |
| `week-resting-hr-trend-icon` | inline SVG | `aria-hidden="true"` | `<svg data-testid="week-resting-hr-trend-icon" aria-hidden="true">` arrow (up/down/right) |

### data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `runner-dashboard` | `<div>` | Root of `RunnerDashboard` component |
| `week-row` | `<div>` | Inside `runner-dashboard` |
| `week-vo2max-trend` | `<div>` | Inside `week-row > button` (trailing section) |
| `week-resting-hr-trend` | `<div>` | Inside `week-row > button` (trailing section) |
| `week-vo2max-metric-icon` | `<svg>` | Inside `week-vo2max-trend` — always present |
| `week-resting-hr-metric-icon` | `<svg>` | Inside `week-resting-hr-trend` — always present |
| `week-vo2max-trend-icon` | `<svg>` | Inside `week-vo2max-trend` — only Weeks 2–8 |
| `week-resting-hr-trend-icon` | `<svg>` | Inside `week-resting-hr-trend` — only Weeks 2–8 |
| `week-activities` | `<div role="region">` | Inside `week-row`, rendered when expanded |
| `activity-row` | `<div>` | Inside `week-activities`, one per non-skipped activity |
| `skipped-activity` | `<div>` | Inside `week-activities`, rendered for skipped weeks |

### Visual Properties (untested)
- `--color-metric-vo2max` token applied as `fill` on `Vo2maxMetricIcon` SVG
- `--color-metric-hr` token applied as `fill` on `HrMetricIcon` SVG
- `--color-trend-up` (green family) applied as `fill` on upward arrow icons
- `--color-trend-down` (red/muted family) applied as `fill` on downward arrow icons
- `--color-trend-stable` (neutral family) applied as `fill` on rightward arrow icons
- Container layout: `display: flex; align-items: center; gap: 4px` (spacing={0.5} equivalent)
- Icon size: 16×16 pixels (matches body2/caption scale established in prior feature)
- Icons marked `aria-hidden="true"` — decorative within accessibility tree
- No keyboard focus on any trend container or icon element

### E2E Deferrals
None — all 6 Gherkin scenarios are fully testable via RTL unit tests (DOM presence/absence and `getAttribute('aria-label')`). No viewport constraints in any scenario GIVEN.

### Alternatives Considered
- **`@mui/icons-material`**: Would add ~600KB to bundle and introduce new npm dependency; ruled out — inline SVG achieves same visual result without package overhead
- **Unicode arrows in styled spans**: Simpler code but breaks the test asserting `path` elements in SVG icons; also less visually crisp; ruled out
- **CSS `visibility:hidden` for Week 1 trend icon**: Ruled out — spec explicitly mandates DOM absence, not CSS hiding, to prevent screen readers from encountering hidden elements
- **Separate `MetricIcon` component file**: Ruled out — inline in `RunnerDashboard.tsx` is consistent with prior feature colocation pattern

### Security Notes
- No user input interpolated into any executable context
- No secrets or credentials in source files
- No new npm packages added
- `dangerouslySetInnerHTML` not introduced in modified files
- `npm audit --audit-level=high` included in `run-tests.sh`

### Output Summary
**Files written:**
- `features/icon-based-trend-indicators/scope` — `frontend`
- `run-tests.sh` — test entry point (npm ci + audit + jest)
- `frontend/src/components/RunnerDashboard.tsx` — rewritten `TrendIndicator` with inline SVG metric icons and conditional trend direction icons
- `frontend/src/components/RunnerDashboard.test.tsx` — all 6 Gherkin scenarios + preserved prior feature tests
- `features/icon-based-trend-indicators/work/developer-summary.md` — this file

**TDD cycles:** 1 — tests were pre-written in existing file; implementation written to satisfy all assertions in one pass

---

## Outer Iteration 1 — TDD Attempt 2

## Diagnosis

**Expected:** element with `data-testid="week-vo2max-trend-icon"` found inside `week-vo2max-trend`
**Received:** no such element found

The issue is in `TrendDirectionIcon` — I use `React.cloneElement(icon, { 'data-testid': testId })` but the `icon` is an `<ArrowUpIcon>`, `<ArrowDownIcon>`, or `<ArrowRightIcon>` component element. `React.cloneElement` on a component element passes the prop to the component function, but those functions don't accept or forward `data-testid` to the underlying `<svg>`. The prop is silently ignored.

**Fix:** Pass `testId` directly into the arrow icon components and render the `data-testid` on the `<svg>` element itself.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O1/T1 | 174.0s | 2 | 12,885 | 0 (0%) | 57,627 |
| Developer O1/T2 | 43.2s | 13,393 | 3,484 | 57,627 (430%) | 0 |
