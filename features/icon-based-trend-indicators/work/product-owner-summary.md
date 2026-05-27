## Pre-flight Check

1. **New user action?** No explicit click/submit, but the user *views* collapsed week rows — the rendering logic changes what is displayed. ✓ (passive view is a valid user action in this context: navigating to the page and observing the output)
2. **New data or content shown?** Yes — a permanently visible metric icon (HR or VO2max), a conditional MUI trend icon replacing the arrow+text label.
3. **New state?** Yes — earliest week now shows metric icon only (no trend icon), vs. prior weeks showing metric icon + trend icon.
4. **Verifiable without CSS/computed styles?** Yes — icon presence/absence and accessible labels are observable via DOM (data-testid, aria-label, element presence).

All four: YES. Proceeding.

---

STATUS: OK

**Status:** OK
**Input summary:** Replace the existing text-based `TrendIndicator` (arrow + label text) in collapsed `week-row` elements with an icon-based pair: a permanently visible metric icon (HR or VO2max) and a conditional trend direction icon. The metric icon is always present; the trend icon is only shown when a prior week exists for comparison. The earliest week shows metric icon only. Accessible `aria-label` updated accordingly. Two new CSS color tokens (`--color-metric-hr`, `--color-metric-vo2max`) are out of scope for Gherkin (developer unit tests). `computeTrend` logic unchanged.

**Interpretation:**
- "Metric icon always present" = an icon element is visible regardless of trend direction, including Week 1 (no prior week).
- "Trend icon conditional on prior week existence" = the trend direction icon is visible for Weeks 2–8 but absent/not rendered for Week 1.
- The existing `data-testid="week-vo2max-trend"` and `data-testid="week-resting-hr-trend"` containers remain (they are the outer wrappers); what changes is their internal composition.
- Accessible labels update: when no prior week, aria-label reflects metric only; when trend available, aria-label reflects metric + direction.
- "Icon-based" means the arrow+text label (`↑ Increasing`, `→ Stable`, `↓ Decreasing`, `—`) is replaced with icon elements. No text labels needed — the icon *is* the indicator.
- Week 8 (increasing VO2max, decreasing HR) and Week 3 (stable both) are retained as fixture reference weeks from prior feature.

**Decisions:**
- Scenarios test icon *presence* via `data-testid` on the metric icon element and the trend icon element separately, avoiding CSS.
- Accessible `aria-label` on the outer container is the primary verifiable signal for semantic correctness.
- Text content scenarios from `collapsed-week-trend-summary` (`↑ Increasing`, `→ Stable`, `—`) are superseded — the new feature explicitly replaces text labels with icons. New scenarios do not assert those old text strings.
- Trend icon testids: `week-vo2max-trend-icon` and `week-resting-hr-trend-icon` for the direction icons; `week-vo2max-metric-icon` and `week-resting-hr-metric-icon` for the metric icons.
- Color token scenarios omitted (visual/CSS concern → developer unit tests).
- No tooltip/hover scenarios (explicitly out of scope).

**Alternatives considered:**
- Asserting icon component names (e.g. `TrendingUpIcon`) — ruled out; internal implementation detail.
- Asserting CSS color values on icons — ruled out; belongs in developer unit tests per Gherkin boundaries.
- Reusing the old `↑ Increasing` text assertions — ruled out; this feature explicitly removes text labels.

**Output summary:** 6 scenarios written — 1 structural (metric icons always present), 1 trend icons visible for non-earliest weeks, 1 trend icon absent for earliest week, 1 accessible label for increasing/decreasing, 1 accessible label for stable, 1 accessible label for earliest week (metric-only). Visual/CSS token aspects (color tokens) are out of scope for Gherkin and belong in developer unit tests.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Product Owner | 34.8s | 11,543 | 2,141 | 0 (0%) | 2,407 |
