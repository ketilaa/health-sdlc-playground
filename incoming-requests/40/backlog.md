# Backlog — Issue #40: Strengthen trend indicators

_Planned on 2026-05-27. 1 feature in sequence._

## Feature 1: icon-based-trend-indicators
- **Goal:** Collapsed week rows show a permanent metric icon (MUI Favorite for HR, MUI DirectionsRun for VO2max) alongside a directional trend icon (TrendingUp / TrendingDown / TrendingFlat), replacing Unicode arrows and text labels; the earliest week shows only the metric icon with no trend icon.
- **Scope:** frontend
- **Affected system areas:** `RunnerDashboard.tsx` (TrendIndicator inline component), `tokens.ts` (two new metric color tokens), `layout.tsx` (CSS custom property injection)
- **Sequence rationale:** Self-contained replacement of an existing component; no upstream dependencies needed.
- **Dependencies:** none