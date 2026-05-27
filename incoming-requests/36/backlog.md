# Backlog — Issue #36: collapsed week details

_Planned on 2026-05-27. 1 feature in sequence._

## Feature 1: collapsed-week-trend-summary
- **Goal:** When a week row is collapsed in the RunnerDashboard, users can see the total activity count, VO2max trend direction vs. the prior week, and resting HR trend direction vs. the prior week — each color-coded with domain-appropriate colors.
- **Scope:** frontend
- **Affected system areas:** `RunnerDashboard.tsx`, `WeekRow.tsx`, `frontend/src/theme/tokens.ts`, `WeekData` data model (vo2max / restingHrAvg already present)
- **Sequence rationale:** Self-contained; all required data fields (`vo2max`, `restingHrAvg`, activity count) already exist in `WeekData`. No prior feature in this batch is needed.
- **Dependencies:** none