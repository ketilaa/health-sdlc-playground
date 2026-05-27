- **Status:** OK
- **Input summary:** Replace Unicode arrow + text label trend indicators in collapsed RunnerDashboard week rows with MUI metric icons (always shown, metric-colored) plus conditional MUI directional trend icons; earliest week shows metric icon only; accessible label preserved as text.
- **Interpretation:** The `--color-metric-hr` and `--color-metric-vo2max` tokens are referenced in the issue but not present in `tokens.ts` — assumed they must be added as part of this feature. The `TrendResult.arrow` and `TrendResult.label` fields from `computeTrend` become vestigial but `computeTrend`'s core `direction` return value is still needed; the developer may clean up or leave unused fields.
- **Feature count:** 1
- **Sequencing rationale:** The entire change is localized to `TrendIndicator` within `RunnerDashboard.tsx` plus token additions — no multi-feature decomposition is warranted.
- **STOP considered:** Yes — the icon swap is primarily visual, which almost triggered STOP. Proceeded because: (1) new behavioral rule introduced (metric icon always present vs. trend icon absent on earliest week — a rendering logic change); (2) accessible label contract changes (label must now name the metric AND direction without visible text, a testable accessibility behavior); (3) two new design token definitions are required. This is a mixed feature with a genuine behavioral core, not a pure restyle.
- **Alternatives considered:** Splitting token addition from icon rendering — ruled out as over-decomposition; both are trivially co-located and the tokens only exist to serve this feature.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Planner | 32.3s | 6,310 | 1,288 | 0 (0%) | 1,376 |
