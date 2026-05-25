STATUS: OK

**Status:** OK
**Input summary:** Extend the data model and weekly aggregation layer to support richer metrics (cadence, average HR at activity level; VO2max, average resting HR at weekly level), compute weekly aggregates for avg HR and avg cadence from activities, add derived indicators (intensity balance, week-over-week trend indicators), and retain existing week-browsing and workout drill-down capability.

**Interpretation:**
- "Intensity balance" is interpreted as a count and ratio of low-intensity vs high-intensity sessions per week, where activity type maps to intensity: `recovery` → low, `long_run` → low, `run` → moderate (counted as low for balance), `intervals` → high. More precisely: low = recovery + long_run + run; high = intervals. A visible label or ratio is the observable signal.
- "Trend indicators compared to previous week" covers: training load (total duration or distance), average HR, and resting HR — each showing whether the value increased, decreased, or is stable relative to the prior week. The current week (most recent) is compared to the immediately preceding week.
- "Stable" means change is within ±2% (a reasonable threshold for wearable data noise); "increasing" or "decreasing" otherwise.
- VO2max at weekly level is the value recorded for that week (not derived from activities — it is a direct field on the weekly summary, consistent with how wearables report it).
- Average resting HR at weekly level is the mean of daily resting HR values for that week.
- Cadence and average HR are optional fields at activity level (not all activity types report them); the UI should handle absent values gracefully (display "—").
- The existing week selector and workout drill-down remain functional and are covered by a scenario.
- No backend; all data is mocked in-app.
- Loading/skeleton states: since data is mocked and synchronous, no async loading states are expected — noted as out of scope.
- Accessibility: ARIA labels are included for trend indicators and intensity balance region as these carry semantic meaning.
- Narrow viewport: the weekly summary card must remain readable at 375px width; included as a scenario.

**Decisions:**
- Intensity balance observable signal: visible text showing counts, e.g. "Low: 3 | High: 1" within `data-testid="intensity-balance"`.
- Trend indicator observable signal: visible directional label ("↑ Increasing", "↓ Decreasing", "→ Stable") within `data-testid="trend-<metric>"` elements.
- VO2max and resting HR are displayed in the weekly summary card alongside existing metrics.
- Cadence and avg HR appear in the workout detail/drill-down view.
- "No previous week" edge case (first week of data): trend indicators display "—" (no comparison available).

**Alternatives considered:**
- Using percentage change text instead of directional labels — ruled out as harder to assert concisely.
- Deriving VO2max from activities — ruled out; wearables report it as a weekly/periodic value, not per-activity.
- Treating `run` as moderate intensity separate from low/high — ruled out for simplicity; binary low/high split is sufficient for this feature.

**Output summary:** 11 scenarios written, covering data model fields, weekly aggregates, intensity balance, trend indicators (normal case, stable case, first-week edge case), existing navigation, workout drill-down with new fields, missing-field graceful display, and narrow-viewport layout.