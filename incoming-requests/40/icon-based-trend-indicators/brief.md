# Feature Brief: icon-based-trend-indicators

## Feature Type
mixed

(Behavioral core: the indicator's rendering logic changes — metric icon always present, trend icon conditional on prior week existence, accessible label updated. Visual/technical aspect: two new CSS color tokens introduced for metric icon coloring; developer handles token wiring via unit tests.)

## Goal
After this feature, a user viewing collapsed week rows can immediately identify which indicator is HR vs VO2max by a permanently visible metric icon, and read the trend direction from a paired MUI trend icon — without needing text labels or expanding the row; the earliest week shows only the metric icon, signalling no comparison is available.

## Context
Builds directly on `collapsed-week-trend-summary`, which introduced `TrendIndicator` (inline in `RunnerDashboard.tsx`) and `computeTrend`. The existing `role="img"` + `aria-label` accessibility pattern is preserved and updated. The `TrendDirection` type (`'increasing' | 'decreasing' | 'stable' | 'none'`) remains unchanged. Two new color tokens (`--color-metric-hr`, `--color-metric-vo2max`) must be added to `tokens.ts` and injected via `layout.tsx`, consistent with the existing token system documented in the Design System section of state.md.

## Scope
frontend

## Affected System Areas
- **Pages / routes:** none
- **Components:** `TrendIndicator` (inline in `RunnerDashboard.tsx`) — icon composition and conditional rendering logic updated; `WeekRow.tsx` if it passes display props
- **Data model:** none — `TrendDirection` and `computeTrend` logic unchanged; `TrendResult.arrow` and `TrendResult.label` fields may become unused

## Out of Scope
- Any changes to `computeTrend` threshold logic or `TrendDirection` values
- Trend indicators in `WeeklyDashboard.tsx` (separate component, separate feature)
- Tooltip or hover behavior on icons
- Changes to week expansion behavior or activity rows
- Adding metric icons to any surface other than collapsed `week-row` trend indicators