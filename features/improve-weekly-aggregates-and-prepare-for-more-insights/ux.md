# UX Specification: Improve Weekly Aggregates and Prepare for More Insights

**Feature:** `improve-weekly-aggregates-and-prepare-for-more-insights`
**Version:** 1.2 (revised — all 6 blocking issues resolved)
**Date:** 2025

---

## 1. Overview

This specification covers the UI states, components, and user flows required to display enriched weekly training summaries. It encompasses:

- Activity-level fields: average heart rate, cadence (with explicit null handling)
- Weekly-level fields: VO2max, resting HR, aggregated avg HR, aggregated avg cadence
- Derived indicators: intensity balance (low/high session split), week-over-week trend indicators
- Responsive layout at 375px viewport width
- Full keyboard navigation, focus management, and screen reader support

All data is synchronous and mocked. No async loading states are required unless the spec is later extended.

---

## 2. Component Inventory

### 2.1 Week Selector (`data-testid="week-selector"`)

**Component:** MUI `Select`
**Purpose:** Allows the user to navigate between weeks
**Placement:** Top of page; `width: 100%` on mobile (xs), `minWidth: 240` on desktop (sm+)

**States:**

| State | Appearance |
|---|---|
| Default | Shows currently selected week label, e.g. "Week 10 · Mar 2024" |
| Open | Dropdown lists available weeks, most recent first |
| Selected | Active week highlighted; dropdown closes |

**Behaviour:**
- Selecting a new week simultaneously updates the Weekly Summary Card and Activity List
- Any open Activity Detail panel is dismissed without user action when the week changes
- After the new week's content renders, focus is programmatically moved to the `Select` trigger element (see §3.5 for the complete focus flow)
- The live announcement region (§2.5) is updated with the new week label

**Keyboard:**
- `Tab` to focus the `Select` trigger
- `Enter` or `Space` to open the dropdown
- `ArrowUp` / `ArrowDown` to navigate `MenuItem` options
- `Enter` to confirm selection
- `Escape` to dismiss without change; focus remains on the trigger

**Accessibility:**
- `aria-label="Select training week"` on the `Select` element
- Each `MenuItem` labelled as human-readable text, e.g. "Week 10, March 2024"
- Selected option carries `aria-selected="true"` via MUI's native `Select` behaviour

---

### 2.2 Weekly Summary Card (`data-testid="weekly-summary-card"`)

**Component:** MUI `Card` containing a MUI `Grid container`
**Purpose:** Single-glance overview of the selected week's key metrics
**Placement:** Directly below week selector; always visible when a week is selected

#### 2.2.1 Grid Structure

The card interior uses `Grid container spacing={2}`. Column assignments change at the MUI `sm` breakpoint (600px):

| Region | xs (< 600px) | sm (≥ 600px) |
|---|---|---|
| Each metric tile (4 tiles) | `xs={6}` (2 per row) | `sm={3}` (all 4 in one row) |
| Intensity Balance | `xs={12}` (full width) | `sm={5}` |
| Trend Indicators | `xs={12}` (full width) | `sm={7}` |

At 375px (below the MUI `sm` breakpoint of 600px):
- Row 1: VO2max tile + Resting HR tile (`xs={6}` each)
- Row 2: Avg HR tile + Avg Cadence tile (`xs={6}` each)
- Row 3: Intensity Balance (`xs={12}`)
- Row 4: Trend Indicators (`xs={12}`)

No content is hidden or truncated at any viewport width ≥ 320px.

#### 2.2.2 Mobile Layout Diagram (375px)

```
┌──────────────────────┐
│  Week 10 · Mar 2024  │  ← Typography variant="subtitle1"
├──────────┬───────────┤
│ VO2max   │ Resting HR│  ← Grid xs={6} + xs={6}
│   54     │  52 bpm   │
├──────────┼───────────┤
│ Avg HR   │ Avg Cad   │  ← Grid xs={6} + xs={6}
│ 147 bpm  │ 170 spm   │
├──────────┴───────────┤
│  Intensity Balance   │  ← Grid xs={12}
│  Low: 3 ████░  Hi: 1 │
├──────────────────────┤
│  Trend Indicators    │  ← Grid xs={12}
│  Training Load   ↑   │
│  Avg HR          ↑   │
│  Resting HR      ↓   │
└──────────────────────┘
```

#### 2.2.3 Metric Tiles

Each metric tile is a `Grid item` wrapping a borderless MUI `Box`. Internal layout uses `Stack direction="column" spacing={0.5}`.

Each tile contains:
- **Label** — `Typography variant="caption"` `color="text.secondary"`: e.g. "VO2max", "Resting HR"
- **Value** — `Typography variant="h5"` `color="text.primary"`: numeric value or "—"
- **Unit** — `Typography variant="caption"` `color="text.secondary"` rendered inline after value; omitted for VO2max (unitless) and omitted entirely when value is "—"

**Specific tiles:**

| Tile | `data-testid` | Label text | Unit |
|---|---|---|---|
| VO2max | `weekly-vo2max` | "VO2max" | — |
| Resting HR | `weekly-resting-hr` | "Resting HR" | "bpm" |
| Average HR | `weekly-avg-hr` | "Avg HR" | "bpm" |
| Average Cadence | `weekly-avg-cadence` | "Avg Cadence" | "spm" |

**Null / missing value display:** The `Typography variant="h5"` element renders "—" (U+2014 em dash). The unit element is not rendered when value is "—".

**Accessibility per tile:**
- Each tile `Box` has `role="region"` and `aria-label`:
  - Value present: `aria-label="VO2max: 54"`, `aria-label="Resting HR: 52 beats per minute"`, `aria-label="Average heart rate: 147 beats per minute"`, `aria-label="Average cadence: 170 steps per minute"`
  - Value absent: `aria-label="[Metric name]: not available"`
- Tiles are display-only and not keyboard focusable

---

### 2.3 Intensity Balance Indicator (`data-testid="intensity-balance"`)

**Component:** MUI `Box` in `Grid item` (xs={12} / sm={5})
**Purpose:** Shows the split between low and high intensity sessions at a glance

#### 2.3.1 Activity Type Classification

The following table defines which activity types map to which intensity category. This classification is exhaustive; any type not listed is treated as "low" by default.

| Activity type value | Intensity category |
|---|---|
| `run` | Low |
| `recovery` | Low |
| `long_run` | Low |
| `intervals` | High |
| `other` | Low (default) |

#### 2.3.2 Visual Structure

Internal layout: MUI `Stack direction="column" spacing={1}`:

1. **Count row** — `Stack direction="row" justifyContent="space-between"`:
   - Left: `Typography variant="body2"` `color="success.main"` — text `"Low: 3"`
   - Right: `Typography variant="body2"` `color="warning.main"` — text `"High: 1"`

2. **Proportional bar** — MUI `LinearProgress` variant `"determinate"`, `value={(lowCount / totalCount) * 100}`, `aria-hidden="true"` (decorative). The filled portion represents the low-intensity fraction; default MUI `LinearProgress` `color="success"` is used, with the track (`warning.light`) representing the high-intensity fraction.

**Displayed text (exact strings required by Gherkin spec):**
- `"Low: 3"` — total count of activities whose type maps to Low
- `"High: 1"` — total count of activities whose type maps to High

**Accessibility:**
- Outermost container `Box` has `aria-label="Intensity balance: 3 low-intensity sessions, 1 high-intensity session"`
- `LinearProgress` bar has `aria-hidden="true"`
- Screen readers announce the container `aria-label` directly; visual text is supplementary

**Edge cases:**

| Scenario | Low count | High count | Bar value | Colour behaviour |
|---|---|---|---|---|
| All low intensity | n | 0 | 100% | Low: `success.main`; High: `text.disabled` |
| All high intensity | 0 | n | 0% | High: `warning.main`; Low: `text.disabled` |
| No sessions recorded | 0 | 0 | 0% | Both: `text.disabled`; bar greyed |

When both counts are 0: `aria-label="Intensity balance: no sessions recorded"`.

---

### 2.4 Trend Indicators

**Container:** `Grid item` (xs={12} / sm={7}) wrapping `Stack direction="column" spacing={1}`
**Purpose:** Show week-over-week directional change for three metrics

Each indicator is a `Stack direction="row" alignItems="center" spacing={1}` containing:
1. **Metric label** — `Typography variant="body2"` `color="text.secondary"` with `sx={{ minWidth: 120 }}`
2. **Trend chip** — MUI `Chip size="small"` with `label` and `color` determined by the state table below

**Indicators and testids:**

| Indicator | `data-testid` | Metric label text |
|---|---|---|
| Training Load | `trend-training-load` | "Training Load" |
| Average HR | `trend-avg-hr` | "Avg HR" |
| Resting HR | `trend-resting-hr` | "Resting HR" |

#### 2.4.1 MUI Colour Token Assignment per State and Metric

`error` / red is never used for any trend state. The most alarming colour in use is MUI `warning` (amber).

| Metric | State | Chip label text | MUI `Chip color` prop | Rationale |
|---|---|---|---|---|
| Training Load | Increasing | "↑ Increasing" | `warning` | Higher load = increased stress; amber signals attention without alarm |
| Training Load | Decreasing | "↓ Decreasing" | `info` | Lower load = informational; not inherently positive or negative |
| Training Load | Stable | "→ Stable" | `default` | Neutral; no meaningful change |
| Training Load | No data | "—" | `default` | No prior week to compare |
| Avg HR | Increasing | "↑ Increasing" | `warning` | Rising avg HR may indicate fatigue; amber |
| Avg HR | Decreasing | "↓ Decreasing" | `info` | Informational; context-dependent |
| Avg HR | Stable | "→ Stable" | `default` | Neutral |
| Avg HR | No data | "—" | `default` | No prior week to compare |
| Resting HR | Increasing | "↑ Increasing" | `warning` | Rising resting HR may signal fatigue or illness; amber |
| Resting HR | Decreasing | "↓ Decreasing" | `success` | Decreasing resting HR = positive fitness adaptation; green |
| Resting HR | Stable | "→ Stable" | `default` | Neutral |
| Resting HR | No data | "—" | `default` | No prior week to compare |

#### 2.4.2 Stability Threshold

Change within ±2% (inclusive) of the previous week's value renders as "Stable". Change exceeding +2% renders as "Increasing". Change exceeding −2% renders as "Decreasing".

**Text rendering (exact strings required by Gherkin spec):**
- `"↑ Increasing"` — U+2191 up arrow, space, word
- `"↓ Decreasing"` — U+2193 down arrow, space, word
- `"→ Stable"` — U+2192 right arrow, space, word
- `"—"` — U+2014 em dash (no arrow, no word)

**Accessibility per indicator:**
- The outer `Stack` row has `aria-label`:
  - `aria-label="Training load trend: Increasing compared to last week"`
  - `aria-label="Average heart rate trend: Stable compared to last week"`
  - `aria-label="Resting heart rate trend: Decreasing compared to last week"`
  - `aria-label="Training load trend: No comparison available"` (earliest week — no prior week exists)
- The arrow Unicode character inside each `Chip` label is wrapped in `<span aria-hidden="true">` so screen readers announce only the word ("Increasing", "Decreasing", "Stable"), not the glyph
- For the no-data state the `Chip` label is "—"; `aria-label` on the row communicates "No comparison available"
- Trend indicators are display-only and not keyboard focusable

---

### 2.5 Live Announcement Region

**Component:** MUI `Box` rendered visually off-screen using MUI `sx` utility pattern (equivalent to `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); whiteSpace: nowrap`)
**`aria-live="polite"`**, **`aria-atomic="true"`**
**Purpose:** Announces the newly selected week to screen readers after every week change

**Announced text format:** `"Now showing week 10, March 2024"` — updated on every week selector change.

This region is always present in the DOM, never visible, and not part of the tab order.

---

### 2.6 Activity List (`data-testid="activity-list"`)

**Component:** MUI `List` rendered as `<ul>`
**Purpose:** Shows all activities for the selected week
**Placement:** Below Weekly Summary Card; full width on mobile

**Each activity row** is a MUI `ListItemButton` rendered as `<li>` containing:
- **Primary text:** `ListItemText primary={activityName}` — bold
- **Secondary text:** `ListItemText secondary="{duration} min · {distance} km"` — e.g. "45 min · 8.2 km"
- **Type badge:** `Chip size="small"` labelled with the activity type string (e.g. "run", "intervals", "recovery", "long_run", "other")

**States:**

| State | Appearance |
|---|---|
| Default | All `ListItemButton` rows visible |
| Row hovered | MUI `action.hover` background |
| Row focused | Visible MUI focus ring (not suppressed) |
| Row active (detail open) | `selected={true}` on `ListItemButton`; `action.selected` background; `aria-expanded="true"` |
| Empty week | `Typography variant="body2"` centred: "No activities recorded for this week" |

**Keyboard navigation:**
- `Tab` moves focus into the list at the first `ListItemButton`
- `Tab` / `Shift+Tab` move between rows
- `Enter` or `Space` on a focused row opens the Activity Detail panel (see §3.3 for focus management)
- Each `ListItemButton` is natively in the tab order; no roving `tabindex` is used

**Accessibility:**
- `List` has `aria-label="Activities for [week label]"` updated on each week change, e.g. `aria-label="Activities for week 10, March 2024"`
- Each `ListItemButton` has `aria-label` combining all available fields, e.g. `aria-label="Morning Run, run, 45 minutes, 8.2 kilometres"`
- Active row (detail open): `