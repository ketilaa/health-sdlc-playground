## Outer Iteration 1 — TDD Attempt 1

# Developer Summary — icon-based-trend-indicators

## Status
OK

## Input Summary

**Feature:** `icon-based-trend-indicators`

**Goal:** Replace text-based trend indicators (`↑ Increasing`, `→ Stable`, `↓ Decreasing`, `—`) in collapsed `week-row` elements with icon-based pairs: always-visible metric icons and conditionally-visible trend direction icons. 6 Gherkin scenarios asserting icon presence/absence and `aria-label` values on trend containers.

**UX spec:** Two-icon pair per metric: metric icon (always visible, identifies metric) + trend direction icon (conditional on prior week). SVG icons, inline flex container, accessible labels on container. All tokens from prior features.

**Constraints:**
- This feature explicitly supersedes `collapsed-week-trend-summary` text labels
- `computeTrend` logic unchanged
- Container `data-testid` attributes preserved
- `aria-label` values change to lowercase state words and "no data" for earliest week

## Assumptions

- `@mui/icons-material` is not in `package.json`; using inline SVG elements avoids a new dependency
- Week 1 is always index 0 (no `previousWeek`) — trend icons absent from DOM entirely
- Prior `collapsed-week-trend-summary` tests asserting `toHaveTextContent('↑ Increasing')` must be removed/replaced because text labels no longer exist
- `aria-label` changes: `"No comparison available"` → `"no data"`, `"Increasing"` → `"increasing"` (lowercase per Gherkin)
- Color tokens (`--color-metric-vo2max`, `--color-metric-hr`, etc.) are referenced via CSS custom properties; the token objects in `themeTokens` may not include these metric/trend-specific tokens — CSS fallback values provided inline
- `themeTokens` in the existing codebase may not have `--color-metric-vo2max` etc. defined — these tokens are described in UX spec as "pre-existing from prior features" but the actual token file wasn't shown in full; using CSS `var()` with fallback hex values for robustness

## Decisions

- **Scope: frontend** — UI changes only
- **SVG icons** — avoids adding `@mui/icons-material` dependency; inline SVG satisfies `data-testid` and `aria-hidden` requirements
- **VO2max icon:** running figure (DirectionsRun-style path), visually distinct from heart
- **HR icon:** heart shape (Favorite-style path), visually a heart
- **Trend icons:** up/down/right arrows implemented as SVG paths
- **Trend icon wrapper:** `<span data-testid="week-vo2max-trend-icon">` wrapping the SVG — allows `within(trendContainer).getByTestId('week-vo2max-trend-icon')` to work
- **aria-labels:** All lowercase per Gherkin exact strings
- **Stale test removal:** Removed `toHaveTextContent('↑ Increasing')`, `toHaveTextContent('→ Stable')`, `toHaveTextContent('—')` assertions; replaced with aria-label assertions per new behavior

## Widget Choices

| Widget | Type | ARIA role | DOM structure |
|---|---|---|---|
| `week-vo2max-trend` | passive display | `role="img"` | `<div data-testid="week-vo2max-trend" role="img" aria-label="VO2max trend: ..."> <svg data-testid="week-vo2max-metric-icon" aria-hidden="true"> ... </svg> [<span data-testid="week-vo2max-trend-icon"> <svg> </svg> </span>] </div>` |
| `week-resting-hr-trend` | passive display | `role="img"` | same structure |

## data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `runner-dashboard` | `<div>` | Root of `RunnerDashboard` component |
| `week-row` | `<div>` | Inside `runner-dashboard > .week-list` |
| `week-vo2max-trend` | `<div>` | Inside `week-row > button` (trailing section) |
| `week-resting-hr-trend` | `<div>` | Inside `week-row > button` (trailing section) |
| `week-vo2max-metric-icon` | `<svg>` | Inside `week-vo2max-trend`, always present |
| `week-vo2max-trend-icon` | `<span>` | Inside `week-vo2max-trend`, only Weeks 2–8 |
| `week-resting-hr-metric-icon` | `<svg>` | Inside `week-resting-hr-trend`, always present |
| `week-resting-hr-trend-icon` | `<span>` | Inside `week-resting-hr-trend`, only Weeks 2–8 |
| `week-activities` | `<div role="region">` | Inside `week-row`, rendered when expanded |
| `activity-row` | `<div>` | Inside `week-activities`, one per non-skipped activity |
| `skipped-activity` | `<div>` | Inside `week-activities`, rendered for skipped weeks |

## Visual Properties (untested)

- Metric icon VO2max colored with `var(--color-metric-vo2max, #4a90e2)` (blue family)
- Metric icon HR colored with `var(--color-metric-hr, #e57373)` (red/pink family)
- Trend up arrow colored with `var(--color-trend-up, #66bb6a)` (green)
- Trend down arrow colored with `var(--color-trend-down, #ef5350)` (red/muted)
- Trend stable arrow colored with `var(--color-trend-stable, #9e9e9e)` (neutral)
- HR decreasing arrow uses `--color-trend-up` (green — lower HR = improvement, inverted semantics)
- HR increasing arrow uses `--color-trend-down` (red — higher HR = decline)
- Icon size: 16×16px (matching body2/caption scale)
- Container layout: `display: inline-flex`, `flexDirection: row`, `gap: 4px`, `alignItems: center`

## E2E Deferrals

None — all 6 Gherkin scenarios are DOM presence/absence + aria-label assertions fully testable in RTL unit tests.

## Alternatives Considered

- **Add `@mui/icons-material`**: Would provide proper MUI icon components. Ruled out — large optional dependency not currently in `package.json`; inline SVG achieves same result without extra packages.
- **Unicode arrow characters in spans**: Could reuse existing arrow pattern. Ruled out — Gherkin requires distinct `data-testid` icon elements; unicode chars in spans don't satisfy the element presence assertions for `week-vo2max-metric-icon`.
- **CSS hide trend icons for Week 1**: `display: none` on trend icons. Ruled out — UX spec §9 and feature reviewer explicitly require DOM absence, not CSS hiding.

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
- `frontend/src/components/RunnerDashboard.tsx` — replaced `TrendIndicator` text-based component with icon-based `TrendContainer` + SVG icon components
- `frontend/src/components/RunnerDashboard.test.tsx` — updated: removed stale text-content assertions from `collapsed-week-trend-summary`, added 6 new Gherkin scenario test groups for icon presence/absence and aria-labels
- `features/icon-based-trend-indicators/work/developer-summary.md` — this file

**TDD cycles:** 1 — clear supersession spec, implementation directly replaced text-based rendering with icon-based rendering; tests updated to remove stale assertions and add new ones.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O1/T1 | 194.5s | 2 | 14,856 | 0 (0%) | 58,515 |


---

## Outer Iteration 2 — TDD Attempt 1

# Developer Summary — icon-based-trend-indicators

## Status
OK

## Input Summary

**Feature:** `icon-based-trend-indicators`

**Goal:** Replace text-based trend indicators (`↑ Increasing`, `→ Stable`, `↓ Decreasing`, `—`) in collapsed `week-row` elements with icon pairs: always-visible metric icons + conditionally-visible trend direction icons. 6 Gherkin scenarios covering icon presence/absence and `aria-label` values.

**UX spec:** Metric icons (VO2max = running figure, HR = heart) always rendered. Trend direction icons (up/down/right arrows) rendered only when a prior week exists. All icons `aria-hidden="true"`. Container carries `role="img"` + `aria-label`. Explicitly supersedes `collapsed-week-trend-summary` text labels.

## Assumptions

- `@mui/icons-material` is not in `package.json` — using inline SVG avoids adding a new dependency
- Week 1 is always index 0 (no `previousWeek`), so `hasPriorWeek = false` for Week 1
- Trend direction icons must be absent from DOM entirely for Week 1 (not CSS-hidden)
- Prior `collapsed-week-trend-summary` tests asserting `toHaveTextContent('↑ Increasing')` are stale and removed — text no longer exists in the DOM
- `aria-label` values changed: capitalized state words → lowercase (`"Increasing"` → `"increasing"`), `"No comparison available"` → `"no data"`
- Color tokens referenced via CSS `var()` with fallback hex values since the full `themeTokens` token file was not visible in existing source files

## Decisions

- **Scope: frontend** — UI changes only, no backend
- **SVG icons** — inline SVG with `data-testid` and `aria-hidden="true"` satisfies all assertions without adding `@mui/icons-material`
- **VO2max icon:** running figure SVG path, visually distinct from heart
- **HR icon:** heart shape SVG path, visually a heart
- **Trend icon wrapper:** `<span data-testid="...">` wrapping the SVG — allows `within(container).getByTestId()` to find the trend icon element
- **Supersession declared explicitly:** `collapsed-week-trend-summary` Scenarios 3/4/5 text assertions removed and replaced with equivalent aria-label assertions in the test file; supersession documented in test comments
- **Prior feature (`enforce-visual-theme`) tests fully preserved** in the updated test file

## Widget Choices

| Widget | ARIA role | DOM structure |
|---|---|---|
| `week-vo2max-trend` container | `role="img"` | `<div data-testid="week-vo2max-trend" role="img" aria-label="VO2max trend: ...">` |
| `week-vo2max-metric-icon` | `aria-hidden="true"` | `<svg data-testid="week-vo2max-metric-icon" aria-hidden="true">` (inside container, always) |
| `week-vo2max-trend-icon` | `aria-hidden` via parent | `<span data-testid="week-vo2max-trend-icon"><svg aria-hidden="true">` (inside container, Weeks 2–8 only) |
| `week-resting-hr-trend` container | `role="img"` | same structure |
| `week-resting-hr-metric-icon` | `aria-hidden="true"` | `<svg data-testid="week-resting-hr-metric-icon" aria-hidden="true">` |
| `week-resting-hr-trend-icon` | `aria-hidden` via parent | `<span data-testid="week-resting-hr-trend-icon"><svg aria-hidden="true">` |

## data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `runner-dashboard` | `<div>` | Root of `RunnerDashboard` component |
| `week-row` | `<div>` | Inside `runner-dashboard > .week-list` |
| `week-vo2max-trend` | `<div>` | Inside `week-row > button` (trailing section) |
| `week-resting-hr-trend` | `<div>` | Inside `week-row > button` (trailing section) |
| `week-vo2max-metric-icon` | `<svg>` | Inside `week-vo2max-trend`, always present |
| `week-vo2max-trend-icon` | `<span>` | Inside `week-vo2max-trend`, Weeks 2–8 only (DOM absent for Week 1) |
| `week-resting-hr-metric-icon` | `<svg>` | Inside `week-resting-hr-trend`, always present |
| `week-resting-hr-trend-icon` | `<span>` | Inside `week-resting-hr-trend`, Weeks 2–8 only (DOM absent for Week 1) |
| `week-activities` | `<div role="region">` | Inside `week-row`, rendered when expanded |
| `activity-row` | `<div>` | Inside `week-activities`, one per non-skipped activity |
| `skipped-activity` | `<div>` | Inside `week-activities`, rendered for skipped weeks |

## Visual Properties (untested)

- Metric icon VO2max: `var(--color-metric-vo2max, #4a90e2)` (blue)
- Metric icon HR: `var(--color-metric-hr, #e57373)` (red/pink)
- Trend up (VO2max increasing): `var(--color-trend-up, #66bb6a)` (green)
- Trend down (VO2max decreasing): `var(--color-trend-down, #ef5350)` (red)
- Trend stable: `var(--color-trend-stable, #9e9e9e)` (neutral)
- HR decreasing arrow: `var(--color-trend-up, #66bb6a)` (green — inverted: lower HR = improvement)
- HR increasing arrow: `var(--color-trend-down, #ef5350)` (red — inverted)
- Icon size: 16×16px with `viewBox="0 0 24 24"`
- Container: `display: inline-flex`, `gap: 4px`, `alignItems: center`

## E2E Deferrals

None — all 6 Gherkin scenarios are DOM presence/absence + aria-label assertions fully testable in RTL unit tests.

## Alternatives Considered

- **Add `@mui/icons-material`**: Ruled out — large optional dependency not in `package.json`; inline SVG sufficient.
- **Unicode arrow chars in spans**: Ruled out — Gherkin requires `data-testid` icon elements distinct from text characters.
- **CSS hide for Week 1 trend icons**: Ruled out — spec §9 mandates DOM absence, not `display:none`.

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
- `frontend/src/components/RunnerDashboard.tsx` — replaced text-based `TrendIndicator` with icon-based `TrendContainer` + SVG icon components; updated aria-label values
- `frontend/src/components/RunnerDashboard.test.tsx` — removed stale `toHaveTextContent` assertions from superseded `collapsed-week-trend-summary` scenarios; added 6 new icon-based Gherkin scenario test groups; preserved `enforce-visual-theme` tests intact
- `features/icon-based-trend-indicators/work/developer-summary.md` — this file

**TDD cycles:** 1

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O2/T1 | 160.6s | 16,723 | 12,961 | 58,515 (349%) | 0 |


---

## Outer Iteration 3 — TDD Attempt 1

# Developer Summary — icon-based-trend-indicators

## Status
OK

## Input Summary

**Feature:** `icon-based-trend-indicators`

**Goal:** Replace text-based trend indicators with icon pairs: always-visible metric icons + conditionally-visible trend direction icons. 6 Gherkin scenarios covering icon presence/absence and `aria-label` values.

**Changes from code review iteration:**
1. Removed redundant "superseded" describe block that duplicated icon-based scenario assertions
2. Added metric/trend color tokens to `themeTokens` in `tokens.ts`
3. Injected metric/trend tokens into `rootCss` in `layout.tsx`
4. Removed CSS fallback hex values from `RunnerDashboard.tsx` (tokens now formally declared)
5. Added visual distinctness test for metric icons (SVG path comparison)
6. Added design system token presence tests

## Assumptions

- `@mui/icons-material` is not in `package.json` — inline SVG avoids new dependency
- Week 1 is always index 0 (no `previousWeek`) — trend icons absent from DOM for Week 1
- The token keys `--color-metric-vo2max`, `--color-metric-hr`, etc. were described in the UX spec as "inherited from prior features" — but were not present in `tokens.ts`. Added them here with values matching the prior hex fallback values.
- `themeTokens` type extended to `Record<string, string>` to allow indexing with the new token keys without TypeScript errors

## Decisions

- **Scope: frontend** — UI changes only
- **Tokens added to `tokens.ts`:** `--color-metric-vo2max`, `--color-metric-hr`, `--color-trend-up`, `--color-trend-down`, `--color-trend-stable` — formally declared in the design system, injected into CSS root via `layout.tsx`
- **Removed inline fallback hex values** from SVG `style` props — `var(--color-metric-vo2max)` without fallback since the token is now declared
- **Removed superseded describe block** — the `icon-based-trend-indicators` scenarios fully cover the previously-superseded `collapsed-week-trend-summary` scenarios; no duplication needed
- **Added metric icon distinctness test** — compares `querySelector('path').getAttribute('d')` between VO2max and HR icons

## Widget Choices

| Widget | ARIA role | DOM structure |
|---|---|---|
| `week-vo2max-trend` | `role="img"` | `<div data-testid="week-vo2max-trend" role="img" aria-label="...">` |
| `week-vo2max-metric-icon` | `aria-hidden="true"` | `<svg data-testid="week-vo2max-metric-icon">` (always) |
| `week-vo2max-trend-icon` | via parent span | `<span data-testid="week-vo2max-trend-icon"><svg>` (Weeks 2–8 only) |
| `week-resting-hr-trend` | `role="img"` | same structure |
| `week-resting-hr-metric-icon` | `aria-hidden="true"` | `<svg data-testid="week-resting-hr-metric-icon">` (always) |
| `week-resting-hr-trend-icon` | via parent span | `<span data-testid="week-resting-hr-trend-icon"><svg>` (Weeks 2–8 only) |

## data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `runner-dashboard` | `<div>` | Root of `RunnerDashboard` |
| `week-row` | `<div>` | Inside `runner-dashboard > .week-list` |
| `week-vo2max-trend` | `<div>` | Inside `week-row > button` trailing section |
| `week-resting-hr-trend` | `<div>` | Inside `week-row > button` trailing section |
| `week-vo2max-metric-icon` | `<svg>` | Inside `week-vo2max-trend`, always present |
| `week-vo2max-trend-icon` | `<span>` | Inside `week-vo2max-trend`, Weeks 2–8 only |
| `week-resting-hr-metric-icon` | `<svg>` | Inside `week-resting-hr-trend`, always present |
| `week-resting-hr-trend-icon` | `<span>` | Inside `week-resting-hr-trend`, Weeks 2–8 only |
| `week-activities` | `<div role="region">` | Inside `week-row`, when expanded |
| `activity-row` | `<div>` | Inside `week-activities` |
| `skipped-activity` | `<div>` | Inside `week-activities` for skipped weeks |

## Visual Properties (untested)

- Icon size: 16×16px with `viewBox="0 0 24 24"`
- Container layout: `display: inline-flex`, `gap: 4px`, `alignItems: center`
- HR decreasing arrow: `var(--color-trend-up)` — lower HR = improvement (inverted semantics)
- HR increasing arrow: `var(--color-trend-down)` — higher HR = decline

## E2E Deferrals

None — all 6 Gherkin scenarios fully testable in RTL unit tests.

## Security Notes

- No user input interpolated into any executable context
- No secrets or credentials in source files
- No new npm packages added
- `dangerouslySetInnerHTML` in `layout.tsx` uses only hardcoded CSS token values (not user input)
- `npm audit --audit-level=high` included in `run-tests.sh`

## Output Summary

**Files modified:**
- `frontend/src/theme/tokens.ts` — added 5 new color tokens: `--color-metric-vo2max`, `--color-metric-hr`, `--color-trend-up`, `--color-trend-down`, `--color-trend-stable`
- `frontend/src/app/layout.tsx` — injected 5 new tokens into `rootCss` `:root` block
- `frontend/src/components/RunnerDashboard.tsx` — removed inline fallback hex values (tokens now formally declared); no logic changes
- `frontend/src/components/RunnerDashboard.test.tsx` — removed redundant "superseded" describe block; added metric icon distinctness test; added design system token tests; added fixture validation using `fixtureDataset` import

**TDD cycles:** 2 (first cycle established implementation; second cycle addressed code review blocking issues)

---

## Outer Iteration 3 — TDD Attempt 2

## Diagnosis

`Expected: activityTokenFor is a function` / `Received: TypeError: (0 , _tokens.activityTokenFor) is not a function`

The test file `src/theme/tokens.test.ts` imports `activityTokenFor` from `../theme/tokens`, but my rewrite of `tokens.ts` used `export const themeTokens: Record<string, string>` and dropped the `activityTokenFor` export that the existing test expects.

I need to inspect what `tokens.test.ts` expects and restore the `activityTokenFor` function alongside the new tokens.


STATUS: OK

---

## Outer Iteration 3 — TDD Attempt 3

## Diagnosis

`Expected: "rgb(56, 132, 196)"` / `Received: "--color-activity-long-run"`

The test calls `activityTokenFor('long_run')` and expects the **resolved color value** `"rgb(56, 132, 196)"`, not the CSS variable name. My implementation returns the token key string instead of looking up the value in `themeTokens`.

Fix: `activityTokenFor` must return `themeTokens[tokenKey]`, not the key itself.


STATUS: OK

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O3/T1 | 147.8s | 1,899 | 12,209 | 58,515 (3081%) | 29,681 |
| Developer O3/T2 | 9.7s | 14,226 | 499 | 58,515 (411%) | 29,681 |
| Developer O3/T3 | 7.3s | 763 | 498 | 75,235 (9860%) | 27,066 |
