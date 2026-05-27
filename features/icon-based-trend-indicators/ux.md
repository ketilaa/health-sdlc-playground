# UX Specification: Icon-Based Trend Indicators

---

## 1. Overview

This feature replaces the text-based trend indicators (`↑ Increasing`, `→ Stable`, `↓ Decreasing`, `—`) in collapsed `week-row` elements with a two-icon pair:

1. **Metric icon** — always visible, identifies the metric (VO2max or resting HR)
2. **Trend direction icon** — conditionally visible, shown only when a prior week exists for comparison

The metric icon is permanently rendered for every week row including Week 1. The trend direction icon is rendered only for Weeks 2–8 (any week with a prior week available). Week 1 shows the metric icon only, with no trend direction icon.

All text labels (the words `Increasing`, `Decreasing`, `Stable`) are removed entirely. Accessible meaning is conveyed exclusively through `aria-label` on the container and visually through icon shape and color.

This feature supersedes the text-based pattern from `collapsed-week-trend-summary`. All previously established color tokens, spacing conventions, and container `data-testid` attributes are preserved.

---

## 2. Design System Context

All tokens below are inherited from prior features. No new tokens are introduced.

| Token | Value family | Purpose |
|---|---|---|
| `--color-metric-vo2max` | Blue family (established) | Accent color for VO2max metric icon |
| `--color-metric-hr` | Red/pink family (established) | Accent color for resting HR metric icon |
| `--color-trend-up` | Green family (established) | Improving trend direction icon |
| `--color-trend-down` | Red/muted family (established) | Declining trend direction icon |
| `--color-trend-stable` | Neutral family (established) | Stable trend direction icon |
| `--color-text-muted` | Muted/subdued (established) | Used when no trend data is available |
| `--color-surface` | Background surface (established) | Row background for contrast check |

**No new color tokens are introduced.** All icon colors draw from the existing token set.

---

## 3. Component: Trend Indicator Container

The outer container elements retain their existing `data-testid` values and `role="img"` semantics. Their internal DOM composition changes from text spans to icon elements.

### 3.1 VO2max Trend Container (`data-testid="week-vo2max-trend"`)

**Container attributes (unchanged from prior feature):**
- `data-testid="week-vo2max-trend"`
- `role="img"`
- `aria-label` — see Section 5

**Container layout:** horizontally arranged items with a small gap (`spacing={0.5}` equivalent), vertically centered. Passive display — not interactive, not in the tab order.

**Children:**

| Child | `data-testid` | Always present? | Description |
|---|---|---|---|
| Metric icon | `week-vo2max-metric-icon` | ✅ Yes — every week including Week 1 | A lung/heart-or-activity icon representing VO2max; colored `--color-metric-vo2max`; `aria-hidden="true"` |
| Trend direction icon | `week-vo2max-trend-icon` | ❌ No — only Weeks 2–8 (prior week exists) | A directional arrow icon representing the trend; colored per trend state; `aria-hidden="true"` |

### 3.2 Resting HR Trend Container (`data-testid="week-resting-hr-trend"`)

**Container attributes:**
- `data-testid="week-resting-hr-trend"`
- `role="img"`
- `aria-label` — see Section 5

**Container layout:** identical to 3.1 — horizontally arranged, small gap, vertically centered, passive display.

**Children:**

| Child | `data-testid` | Always present? | Description |
|---|---|---|---|
| Metric icon | `week-resting-hr-metric-icon` | ✅ Yes — every week including Week 1 | A heart/pulse icon representing resting HR; colored `--color-metric-hr`; `aria-hidden="true"` |
| Trend direction icon | `week-resting-hr-trend-icon` | ❌ No — only Weeks 2–8 (prior week exists) | A directional arrow icon representing the trend; colored per trend state; `aria-hidden="true"` |

---

## 4. Icon Design

### 4.1 Metric Icons

Metric icons identify the health metric and are always visible. They are decorative within the accessibility tree (the container `aria-label` carries the full meaning).

| Metric | `data-testid` | Icon character / symbol | Color token | Size |
|---|---|---|---|---|
| VO2max | `week-vo2max-metric-icon` | A lung or activity icon (e.g. the MUI `DirectionsRun` or `Air` icon family — developer chooses; must be visually distinct from the HR icon) | `--color-metric-vo2max` | Same size as trend icon (uniform within the pair) |
| Resting HR | `week-resting-hr-metric-icon` | A heart icon (e.g. MUI `Favorite` or `MonitorHeart` icon family — developer chooses; must be visually a heart) | `--color-metric-hr` | Same size as trend icon |

Both metric icons:
- Have `aria-hidden="true"` — the container `aria-label` conveys metric identity and trend; the icon is purely visual
- Are sized to match the body2/caption scale established in the prior feature (approximately 16–18px)
- Do not receive keyboard focus

### 4.2 Trend Direction Icons

Trend direction icons are only rendered when a prior week exists. They are directional arrows that communicate increasing, decreasing, or stable movement.

| Trend state | Icon direction | Color token | Notes |
|---|---|---|---|
| VO2max increasing | Arrow pointing upward (`↑` equivalent icon) | `--color-trend-up` | Higher VO2max = improvement |
| VO2max decreasing | Arrow pointing downward (`↓` equivalent icon) | `--color-trend-down` | |
| VO2max stable | Arrow pointing right (`→` equivalent icon) | `--color-trend-stable` | |
| Resting HR decreasing | Arrow pointing downward (`↓` equivalent icon) | `--color-trend-up` | Lower HR = improvement (inverted semantics, same as prior feature) |
| Resting HR increasing | Arrow pointing upward (`↑` equivalent icon) | `--color-trend-down` | |
| Resting HR stable | Arrow pointing right (`→` equivalent icon) | `--color-trend-stable` | |

Trend direction icons:
- Have `aria-hidden="true"` — the container `aria-label` conveys direction
- Are sized identically to the metric icon (uniform pair appearance)
- Do not receive keyboard focus
- Are absent from the DOM entirely when no prior week exists (not hidden with CSS — not rendered)

---

## 5. Accessible Labels (`aria-label`)

The container `role="img"` element carries the full accessible label. The exact strings are mandated by the Gherkin spec and must match precisely (lowercase, colon-space separator):

### 5.1 VO2max Trend Container aria-labels

| Week / Condition | `aria-label` value |
|---|---|
| Weeks 2–8, VO2max increasing | `VO2max trend: increasing` |
| Weeks 2–8, VO2max decreasing | `VO2max trend: decreasing` |
| Weeks 2–8, VO2max stable | `VO2max trend: stable` |
| Week 1 (no prior week) | `VO2max trend: no data` |
| Loading state | `VO2max trend: loading` |

### 5.2 Resting HR Trend Container aria-labels

| Week / Condition | `aria-label` value |
|---|---|
| Weeks 2–8, HR decreasing | `Resting HR trend: decreasing` |
| Weeks 2–8, HR increasing | `Resting HR trend: increasing` |
| Weeks 2–8, HR stable | `Resting HR trend: stable` |
| Week 1 (no prior week) | `Resting HR trend: no data` |
| Loading state | `Resting HR trend: loading` |

**Note on casing:** The Gherkin spec uses lowercase for the state word (e.g. `"VO2max trend: increasing"`, `"Resting HR trend: decreasing"`). The `aria-label` values above match the Gherkin exactly. The metric name portion (`VO2max`, `Resting HR`) retains its standard casing as specified in the Gherkin.

---

## 6. Collapsed Week Row Layout

The collapsed row layout is unchanged from the prior feature. The trend indicator containers remain in the trailing section of the row. The internal composition of each container changes (icons instead of text spans) but their position and outer dimensions are equivalent.

**Collapsed row layout (left → right):**
```
[ Week N label ] [ activity count ] ··· [ VO2max trend container ] [ Resting HR trend container ] [ expand chevron ]
```

The two trend containers are grouped horizontally with consistent spacing between them (equivalent to prior `spacing={2}`).

---

## 7. UI States

### 7.1 State: Trend Available (Weeks 2–8)

Both containers render:
- Metric icon (colored `--color-metric-vo2max` / `--color-metric-hr`)
- Trend direction icon (colored per trend state: `--color-trend-up`, `--color-trend-down`, or `--color-trend-stable`)

`aria-label` reflects the metric name and trend direction.

### 7.2 State: No Prior Week (Week 1)

Both containers render:
- Metric icon only (colored `--color-metric-vo2max` / `--color-metric-hr`)
- No trend direction icon element in DOM

`aria-label` reads `"VO2max trend: no data"` / `"Resting HR trend: no data"`.

The metric icon color remains its standard metric color (`--color-metric-vo2max` / `--color-metric-hr`). There is no muted/grey treatment applied to the metric icon in this state — it retains full color to indicate the metric is being tracked, just without a comparison point.

### 7.3 State: Stable (e.g. Week 3)

Both containers render:
- Metric icon
- Trend direction icon: right-pointing arrow in `--color-trend-stable`

`aria-label` reads `"VO2max trend: stable"` / `"Resting HR trend: stable"`.

### 7.4 State: Week 8 (Improving Signals)

- VO2max container: metric icon + upward arrow in `--color-trend-up`; `aria-label="VO2max trend: increasing"`
- Resting HR container: metric icon + downward arrow in `--color-trend-up` (green — lower HR is positive); `aria-label="Resting HR trend: decreasing"`

### 7.5 State: Loading

Each trend container renders a skeleton placeholder (text skeleton, width approximately 3rem) in place of the icon pair. `aria-label` reads `"VO2max trend: loading"` / `"Resting HR trend: loading"`.

### 7.6 State: Error

Both containers fall back to the "no data" state (metric icon only, no trend icon). `aria-label` reads `"VO2max trend: no data"` / `"Resting HR trend: no data"`. This avoids a jarring error treatment in a compact collapsed row.

### 7.7 State: Expanded Row

Trend containers remain visible in the row header when the row is expanded. They are not hidden or remounted by the expand/collapse interaction — identical to prior feature behavior.

---

## 8. User Flows

### Flow 1 — User Lands on Home Page

| Step | What the user sees |
|---|---|
| 1 | Home page loads. All 8 week rows render in collapsed state. |
| 2 | Every week row immediately shows the metric icon pair (VO2max icon + HR icon) in the trailing section. |
| 3 | Week 1: metric icons only — no trend arrows. Week 2–8: metric icons plus directional trend arrows. |
| 4 | Week 8: VO2max has an upward green arrow; resting HR has a downward green arrow — both positive signals. |
| 5 | Week 3: both metrics have a rightward neutral arrow — stable signals. |
| 6 | User scans the column of icon pairs down the list, reading the fitness trajectory at a glance without any interaction. |

### Flow 2 — User Expands a Week Row

| Step | What the user sees |
|---|---|
| 1 | User clicks or presses Enter/Space on a week row (e.g. Week 8). |
| 2 | Activity detail panel expands below the row header. |
| 3 | Trend indicator containers remain visible in the row header throughout — both metric icon and trend icon. |
| 4 | User collapses the row. Trend indicators remain. |

### Flow 3 — Screen Reader User Navigates the Dashboard

| Step | What the user hears |
|---|---|
| 1 | Screen reader moves to Week 8 row. |
| 2 | Focus on VO2max trend container: announces `"VO2max trend: increasing"`. Icon elements are skipped (all `aria-hidden`). |
| 3 | Focus on resting HR trend container: announces `"Resting HR trend: decreasing"`. |
| 4 | Screen reader moves to Week 1 row. |
| 5 | VO2max trend container: announces `"VO2max trend: no data"`. No trend icon is present in the DOM. |
| 6 | Resting HR trend container: announces `"Resting HR trend: no data"`. |

---

## 9. Accessibility Requirements

| Requirement | Detail |
|---|---|
| `role="img"` on containers | Both trend containers carry `role="img"`. Non-interactive, not in tab order. Screen readers read only `aria-label`. |
| `aria-label` precision | Must match Gherkin exactly: lowercase state word, colon-space separator, correct metric name casing (`VO2max`, `Resting HR`). |
| All icons `aria-hidden="true"` | Both the metric icon and the trend direction icon carry `aria-hidden="true"`. The container `aria-label` is the sole accessible label. |
| No keyboard focus | Trend containers are passive. No `tabIndex`. Keyboard navigation skips to the row's expand/collapse control. |
| Color not sole differentiator | Icon shape (direction of arrow) provides directional information independently of color. Users who cannot perceive color can still distinguish increasing (up arrow) from decreasing (down arrow) from stable (right arrow). |
| Contrast | All icons must meet WCAG AA contrast ratio (4.5:1) against `--color-surface`. Token values from prior features are assumed to satisfy this; developer must verify if icon size falls below 24px (large text threshold). |
| Metric icon identity | Metric icons must be visually distinct from each other and from trend icons. VO2max and HR icons must not be interchangeable. |
| DOM absence for missing trend | When no trend data exists (Week 1), the trend icon element must be absent from the DOM — not hidden with `display:none` or `visibility:hidden`. This ensures screen readers do not encounter a hidden element that could confuse assistive technology. |

---

## 10. Gherkin Scenario → UI State Mapping

| Gherkin Scenario | UI Element / State |
|---|---|
| Scenario 1: Metric icons always visible regardless of trend availability | Every `week-row` → both metric icons (`week-vo2max-metric-icon`, `week-resting-hr-metric-icon`) always in DOM — State 7.1, 7.2, 7.3 |
| Scenario 2: Trend icons visible for weeks with a prior week (Week 8, Week 3) | Weeks 2–8 → trend icon elements (`week-vo2max-trend-icon`, `week-resting-hr-trend-icon`) present in DOM — State 7.1, 7.3, 7.4 |
| Scenario 3: Earliest week shows no trend icon; metric icons still present | Week 1 → metric icons present, trend icon elements absent from DOM — State 7.2 |
| Scenario 4: Week 8 aria-labels reflect increasing VO2max and decreasing HR | Week 8 containers: `aria-label="VO2max trend: increasing"`, `aria-label="Resting HR trend: decreasing"` — State 7.4 |
| Scenario 5: Week 3 aria-labels reflect stable trends | Week 3 containers: `aria-label="VO2max trend: stable"`, `aria-label="Resting HR trend: stable"` — State 7.3 |
| Scenario 6: Week 1 aria-labels indicate no comparison available | Week 1 containers: `aria-label="VO2max trend: no data"`, `aria-label="Resting HR trend: no data"` — State 7.2 |

All 6 Gherkin scenarios are covered.

---

## 11. Superseded Behavior

The following behavior from `collapsed-week-trend-summary` is explicitly replaced by this feature:

| Prior behavior | Replacement |
|---|---|
| Text spans rendering `↑`, `↓`, `→`, `—` with `aria-hidden="true"` | Removed entirely |
| Text spans rendering `Increasing`, `Decreasing`, `Stable` labels | Removed entirely |
| `aria-label` values using `"No comparison available"` | Replaced with `"no data"` (lowercase, Gherkin-mandated) |
| `aria-label` casing: `"VO2max trend: Increasing"` (capitalized state word) | Replaced with `"VO2max trend: increasing"` (lowercase state word, Gherkin-mandated) |

The outer container structure (`data-testid`, `role="img"`, positioning within the row) is preserved unchanged.

---

## 12. Out of Scope

- Tooltips showing exact VO2max or resting HR values
- Trend sparklines or numeric badges
- Animated icon transitions
- Modifying the expanded `week-activities` panel
- Changes to `computeTrend()` threshold logic
- New CSS color token definitions (all tokens pre-exist)
- Hover states on metric or trend icons (indicators are passive)