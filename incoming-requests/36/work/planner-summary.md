- **Status:** OK
- **Input summary:** Enhance collapsed week rows in RunnerDashboard to show activity count, VO2max trend (vs prior week), and resting HR trend (vs prior week) with directional arrows and domain-appropriate color coding; add color tokens for VO2max and HR.
- **Interpretation:** All required data fields (`vo2max`, `restingHrAvg`, activity count via `activities.length`) are already present in `WeekData`. The `computeTrend()` utility already exists from `improve-weekly-aggregates-and-prepare-for-more-insights`. This is purely a display addition to `WeekRow` plus two new tokens. Material Icons `TrendingUp`/`TrendingDown` are a developer implementation detail, not a Gherkin concern.
- **Feature count:** 1
- **Sequencing rationale:** Single cohesive feature — all data prerequisites exist, tokens are an implementation detail within the same PR, no external dependency.
- **STOP considered:** Yes — briefly considered STOP because adding CSS tokens alone would be a visual-only change. However, the token addition is bundled with a genuine behavioral change (new information displayed in collapsed rows), so the feature is behavioral with a mixed implementation. Proceeded as `mixed` type.
- **Alternatives considered:** Splitting into "add tokens" + "add collapsed row display" — rejected because the token feature alone has no user-observable outcome and would be a trivial one-liner with no Gherkin value. Keeping as one right-sized feature is correct.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Planner | 31.3s | 5,251 | 1,386 | 0 (0%) | 1,376 |
