# UX Specification: Collapsed Week Trend Summary

---

## 1. Overview

This feature adds two trend indicators — **VO2max trend** and **resting HR trend** — to each collapsed `week-row`. These indicators are visible at all times without requiring the user to expand a week row, making the most important fitness signals immediately glanceable in the weekly dashboard.

The trend indicators reuse the established arrow-and-label notation (`↑ Increasing`, `↓ Decreasing`, `→ Stable`, `—`) from the `improve-weekly-aggregates-and-prepare-for-more-insights` feature. This feature is purely additive: no existing component behaviour, colour tokens, or interaction patterns change.

---

## 2. Design System Context

The established design system defines the following relevant tokens and conventions:

| Token / Convention | Source feature | Purpose |
|---|---|---|
| `--color-metric-vo2max` | `improve-weekly-aggregates-and-prepare-for-more-insights` | Accent colour for VO2max metric |
| `--color-metric-hr` | `improve-weekly-aggregates-and-prepare-for-more-insights` | Accent colour for HR/resting HR metric |
| `--color-trend-up` | `improve-weekly-aggregates-and-prepare-for-more-insights` | Green — improving trend |
| `--color-trend-down` | `improve-weekly-aggregates-and-prepare-for-more-insights` | Red/muted — declining trend |
| `--color-trend-stable` | `improve-weekly-aggregates-and-prepare-for-more-insights` | Neutral — stable trend |
| `--color-text-muted` | `visual-theme-overhaul` | Muted text — used for `—` (no data) state |
| Arrow + label pattern | `improve-weekly-aggregates-and-prepare-for-more-insights` | `↑ Increasing` / `↓ Decreasing` / `→ Stable` / `—` |
| `week-row` accordion item | `runner-dataset-with-consistent-improvement` | Existing collapsed/expanded row component |
| `week-activities` | `runner-dataset-with-consistent-improvement` | Expanded detail panel — NOT visible by default |

**No new tokens, colours, or layout patterns are introduced.** The indicators use the exact text and arrow symbols already established. The semantic colour mapping for resting HR follows the same convention: `↓ Decreasing` resting HR is a positive signal and uses `--color-trend-up` (green); `↑ Increasing` resting HR is a negative signal and uses `--color-trend-down`.

---

## 3. Component: Collapsed Week Row (`data-testid="week-row"`)

### 3.1 Layout — Collapsed State (Default)

The collapsed week row is a single horizontal bar. The existing layout (from `runner-dataset-with-consistent-improvement`) already contains the week label and activity count. The two new trend indicators are appended to the right side of the collapsed row.

**Collapsed row layout (left → right):**

```
[ Week N label ] [ activity count ] ··· [ VO2max trend indicator ] [ Resting HR trend indicator ] [ expand chevron ]
```

The trend indicators sit in the trailing section of the row, before the expand/collapse chevron. They must be visible without interaction — no hover, no tooltip trigger required for the indicator label itself.

The trailing section containing both indicators is a MUI `Stack` with `direction="row"`, `spacing={2}`, and `alignItems="center"`. This groups the two indicators horizontally and applies consistent gap between them without requiring manual spacing logic.

### 3.2 VO2max Trend Indicator (`data-testid="week-vo2max-trend"`)

Each trend indicator is a MUI `Stack` with `direction="row"`, `spacing={0.5}`, and `alignItems="center"`. It is a passive display element: it uses no interactive MUI component (not `Chip`, not `Button`, not `IconButton`) and does **not** receive keyboard focus.

**Children of the `Stack`:**

| Child | Element | Detail |
|---|---|---|
| Arrow character | `<Typography component="span" aria-hidden="true">` | Renders `↑`, `↓`, `→`, or `—`; hidden from screen readers |
| Direction label | `<Typography component="span">` | Renders `Increasing`, `Decreasing`, `Stable`, or empty (when state is `—`) |

The full rendered text for each state:

| State | Arrow span | Label span | Applied colour token |
|---|---|---|---|
| Increasing | `↑` | `Increasing` | `--color-trend-up` |
| Decreasing | `↓` | `Decreasing` | `--color-trend-down` |
| Stable | `→` | `Stable` | `--color-trend-stable` |
| No comparison | `—` | _(empty)_ | `--color-text-muted` |

The colour token is applied to both child spans via the parent `Stack`'s `sx` prop, ensuring the arrow and label share the same colour.

The parent `Stack` carries:
- `data-testid="week-vo2max-trend"`
- `aria-label="VO2max trend: Increasing"` (or `Decreasing` / `Stable` / `No comparison available` depending on state)
- `role="img"` — declares the element as a static image/graphic to the accessibility tree, preventing screen readers from traversing into the individual arrow and label spans

Because `role="img"` is used, the element is not interactive and does not appear in the tab order. No `tabIndex` is set.

### 3.3 Resting HR Trend Indicator (`data-testid="week-resting-hr-trend"`)

Identical structure to section 3.2. A MUI `Stack` with `direction="row"`, `spacing={0.5}`, `alignItems="center"`. Passive display element — no interactive MUI component used, does **not** receive keyboard focus.

**Children:**

| Child | Element | Detail |
|---|---|---|
| Arrow character | `<Typography component="span" aria-hidden="true">` | Renders `↑`, `↓`, `→`, or `—`; hidden from screen readers |
| Direction label | `<Typography component="span">` | Renders `Increasing`, `Decreasing`, `Stable`, or empty |

The semantic colour logic is **inverted** because lower resting HR = better fitness:

| State | Arrow span | Label span | Applied colour token |
|---|---|---|---|
| Decreasing | `↓` | `Decreasing` | `--color-trend-up` (green — positive signal) |
| Increasing | `↑` | `Increasing` | `--color-trend-down` |
| Stable | `→` | `Stable` | `--color-trend-stable` |
| No comparison | `—` | _(empty)_ | `--color-text-muted` |

The parent `Stack` carries:
- `data-testid="week-resting-hr-trend"`
- `aria-label="Resting HR trend: Decreasing"` (or appropriate state label)
- `role="img"`

As with the VO2max indicator, `role="img"` makes the element non-interactive and removes it from the tab order.

### 3.4 Visual Separation

The two trend indicators are grouped inside the trailing `Stack` (section 3.1) with `spacing={2}` between them. No divider line is used. The indicators are visually equal in size and weight — they use the same `Typography` variant (body2 or caption, consistent with the prior feature's metric label sizing).

---

## 4. UI States

### 4.1 Default (Collapsed) — Trend Data Available

Both trend indicators are visible. The row shows:
- Week label (e.g. "Week 8")
- Activity count (existing)
- `week-vo2max-trend` with coloured arrow + direction label
- `week-resting-hr-trend` with coloured arrow + direction label
- Expand chevron

This is the primary state for Weeks 2–8.

### 4.2 Default (Collapsed) — No Prior Week (Week 1)

Both trend indicators are visible but show `—` in `--color-text-muted`. The arrow span renders `—` and the label span is empty. The `aria-label` reads `"VO2max trend: No comparison available"` and `"Resting HR trend: No comparison available"` respectively.

### 4.3 Stable Trends (e.g. Week 3)

Both indicators show `→ Stable` in `--color-trend-stable`. The arrow span renders `→` and the label span renders `Stable`.

### 4.4 Expanded State

When the user expands a `week-row`, the `week-activities` panel becomes visible. The trend indicators **remain visible** in the row header — they are part of the persistent row header, not the expandable content area, and are not hidden or remounted on expansion.

### 4.5 Loading State

If weekly data is being fetched asynchronously: each trend indicator's `Stack` renders a MUI `Skeleton` child (variant `text`, width approximately `5rem`) in place of the arrow and label spans. The `data-testid` attribute and `aria-label` remain on the parent `Stack`; the `aria-label` reads `"VO2max trend: Loading"` during this state.

### 4.6 Error State

If weekly aggregate data cannot be computed or loaded: both indicators render the `—` / no-comparison state (`--color-text-muted`) with `aria-label="VO2max trend: No comparison available"`. This avoids a jarring error indicator inside a compact collapsed row.

### 4.7 Empty Week State

If a week row exists but has no activity data: both indicators render the `—` / no-comparison state, identical to State 4.2.

---

## 5. User Flows

### Flow 1 — User Lands on Home Page (Primary Path)

| Step | What the user sees |
|---|---|
| 1 | Home page loads. Weekly dashboard renders with all 8 week rows in collapsed state. |
| 2 | Each week row immediately shows VO2max trend and resting HR trend indicators without any interaction. |
| 3 | User scans trend indicators across weeks, reading the fitness trajectory at a glance. |
| 4 | Week 1 row shows `—` for both indicators (no prior week). Weeks 2–8 show directional arrows. |
| 5 | Week 8 row shows `↑ Increasing` (VO2max, green) and `↓ Decreasing` (resting HR, green). |
| 6 | Week 3 row shows `→ Stable` (both indicators, neutral colour). |

No user interaction is required to see the trend indicators. This is a passive, glanceable view.

### Flow 2 — User Expands a Week Row

| Step | What the user sees |
|---|---|
| 1 | User clicks or presses Enter/Space on a week row (e.g. Week 8). |
| 2 | `week-activities` panel expands below the row header. Activities become visible. |
| 3 | The trend indicators (`week-vo2max-trend`, `week-resting-hr-trend`) **remain visible** in the row header. They are not hidden by expansion. |
| 4 | User can read both the detailed activities and the summary trend indicators simultaneously. |
| 5 | User clicks/presses again to collapse. `week-activities` hides. Trend indicators remain. |

### Flow 3 — User Compares Trend Across Multiple Weeks

| Step | What the user sees |
|---|---|
| 1 | Home page loaded. All 8 week rows visible in collapsed state with trend indicators. |
| 2 | User scans down the list: Week 1 (`—`), Week 2 (directional), ..., Week 8 (`↑ Increasing`, `↓ Decreasing`). |
| 3 | User can visually track VO2max and resting HR trajectory across the 8-week block without expanding any row. |
| 4 | Colour progression reinforces the improvement narrative for the training block. |

---

## 6. Accessibility Requirements

| Requirement | Detail |
|---|---|
| `role="img"` on trend indicator | Each trend indicator `Stack` carries `role="img"`. This declares it as a static graphic to the accessibility tree: it is non-interactive, does not appear in the tab order, and screen readers read only the `aria-label` rather than traversing into child spans. |
| `aria-label` on trend indicators | Each indicator carries an `aria-label` that conveys both the metric name and the trend direction. Template: `"VO2max trend: Increasing"` / `"Resting HR trend: Decreasing"` / `"VO2max trend: Stable"` / `"VO2max trend: No comparison available"` / `"VO2max trend: Loading"` |
| Arrow characters are decorative | The `↑`, `↓`, `→`, and `—` characters are rendered inside `<Typography component="span" aria-hidden="true">`. Screen readers skip these spans and use the parent `aria-label` instead. |
| No keyboard focus | Trend indicators use no interactive MUI component. `role="img"` removes them from the tab order. No `tabIndex` is set. Users navigating by keyboard skip directly to the expand/collapse control for each row. |
| Colour is not the sole differentiator | The direction label text (`Increasing`, `Decreasing`, `Stable`) is always visible alongside the colour. Users who cannot perceive colour read the label directly. |
| Contrast | All trend indicator text must meet WCAG AA contrast ratio (4.5:1) against the row background (`--color-surface`). |
| Screen reader announcement of `—` state | The `aria-label` reads `"No comparison available"` rather than announcing the raw `—` character. |
| Keyboard navigation | No change from existing behaviour. Week rows remain keyboard-accessible (Enter/Space to expand/collapse). Trend indicators are passive and are skipped by keyboard focus. |

---

## 7. Gherkin Scenario → UI State Mapping

| Gherkin Scenario | UI Element / State | Flow |
|---|---|---|
| Scenario 1: Collapsed week rows display VO2max and resting HR trend indicators | Every `week-row` renders `week-vo2max-trend` and `week-resting-hr-trend` as child `Stack` elements — State 4.1 / 4.2 / 4.3 | Flow 1 |
| Scenario 2: Trend indicators visible without expanding; no `week-activities` visible | Both indicator `Stack` elements visible in collapsed state; `week-activities` absent from DOM/viewport — State 4.1 | Flow 1 |
| Scenario 3: Week 8 shows `↑ Increasing` VO2max and `↓ Decreasing` resting HR | Week 8 row: `week-vo2max-trend` text = `↑ Increasing`; `week-resting-hr-trend` text = `↓ Decreasing` — State 4.1 | Flow 1, Flow 3 |
| Scenario 4: Week 3 shows `→ Stable` for both indicators | Week 3 row: both indicator texts = `→ Stable` — State 4.3 | Flow 1, Flow 3 |
| Scenario 5: Week 1 shows `—` for both indicators | Week 1 row: both indicator texts = `—` — State 4.2 | Flow 1, Flow 3 |

All 5 Gherkin scenarios are covered.

---

## 8. Data Requirements

The trend computation logic (`computeTrend()`) is established in the `improve-weekly-aggregates-and-prepare-for-more-insights` feature. The fixture dataset must satisfy:

| Week | VO2max trend vs prior week | Resting HR trend vs prior week |
|---|---|---|
| Week 1 | `—` (no prior week) | `—` (no prior week) |
| Week 3 | `→ Stable` (within ±2%) | `→ Stable` (within ±2%) |
| Week 8 | `↑ Increasing` (>+2%) | `↓ Decreasing` (>−2%) |

Fixture data for Weeks 2, 4, 5, 6, 7 is not asserted by the Gherkin spec and may show any valid trend direction.

---

## 9. Component Dimensions and Spacing

These are guiding proportions, not hard implementation constraints:

- Each trend indicator `Stack` is inline and compact — visually equivalent in weight to the existing activity count badge in the row
- The two indicators are wrapped in a parent `Stack` with `direction="row"` and `spacing={2}`, providing consistent gap
- Typography variant: `caption` or `body2` — consistent with the metric label sizing established in the prior feature
- Minimum touch target does not apply (indicators are not interactive)
- At narrow viewports, the trailing indicator group may wrap below the week label if horizontal space is insufficient; both indicators must remain legible and fully rendered at all breakpoints

---

## 10. Out of Scope

- Changing the trend computation threshold (±2%) — established in `improve-weekly-aggregates-and-prepare-for-more-insights`
- Adding tooltips showing exact VO2max or resting HR values — not specified in the Gherkin
- Trend sparkline charts — not specified
- Animated transitions on trend indicator state changes — not specified
- Modifying the expanded `week-activities` view — not part of this feature
- Adding new CSS token definitions — tokens assumed to exist from prior features