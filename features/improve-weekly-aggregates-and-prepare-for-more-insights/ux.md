# UX Specification: Improve Weekly Aggregates and Prepare for More Insights

**Feature:** `improve-weekly-aggregates-and-prepare-for-more-insights`
**Version:** 1.2 (revised)
**Based on:** Gherkin feature spec + feature reviewer summary

---

## 1. Overview

This specification defines the UI states, components, and user flows for:
- Activity-level cadence and average HR fields (with graceful absent-value handling)
- Weekly-level VO2max and resting HR fields
- Computed weekly aggregates (average HR, average cadence)
- Derived indicators: intensity balance and week-over-week trend indicators
- Week browsing and workout drill-down
- Responsive layout at 375px viewport

All data is synchronous and mocked. No loading states are required.

---

## 2. Component Inventory

| Component | data-testid | MUI Base | Notes |
|---|---|---|---|
| Week Selector | `week-selector` | `Select` / `ToggleButtonGroup` | Navigation control |
| Weekly Summary Card | `weekly-summary-card` | `Card` | Container for all weekly metrics |
| VO2max display | `weekly-vo2max` | `Typography` within `Card` | Direct weekly field |
| Resting HR display | `weekly-resting-hr` | `Typography` within `Card` | Direct weekly field |
| Average HR display | `weekly-avg-hr` | `Typography` within `Card` | Aggregated from activities |
| Average Cadence display | `weekly-avg-cadence` | `Typography` within `Card` | Aggregated from activities |
| Intensity Balance | `intensity-balance` | `Box` with dot indicators + `Typography` | Binary low/high split |
| Training Load Trend | `trend-training-load` | `Box` with `Typography` | Text-only arrow + label |
| Avg HR Trend | `trend-avg-hr` | `Box` with `Typography` | Text-only arrow + label |
| Resting HR Trend | `trend-resting-hr` | `Box` with `Typography` | Text-only arrow + label |
| Activity List | `activity-list` | `List` | Clickable rows |
| Activity Detail | `activity-detail` | `Card` or full-width panel | Drill-down panel |
| Activity Avg HR | `activity-avg-hr` | `Typography` | Per-activity field |
| Activity Cadence | `activity-cadence` | `Typography` | Per-activity field |

---

## 3. Page Layout

### 3.1 Desktop Layout (≥ 600px)

```
┌─────────────────────────────────────────────────────────┐
│  [Week Selector]                                        │
├────────────────────────────┬────────────────────────────┤
│  Weekly Summary Card       │  Activity List             │
│  ┌──────────────────────┐  │  ┌─────────────────────┐  │
│  │ VO2max │ Resting HR   │  │  │ Morning Run         │  │
│  │ Avg HR │ Avg Cadence  │  │  │ Interval Session    │  │
│  │ Intensity Balance     │  │  │ Recovery Jog        │  │
│  │ Trend Indicators      │  │  │ Long Run            │  │
│  └──────────────────────┘  │  └─────────────────────┘  │
│                            │                            │
│                            │  [Activity Detail Panel]   │
│                            │  (appears when row clicked)│
└────────────────────────────┴────────────────────────────┘
```

### 3.2 Mobile Layout (375px viewport)

```
┌─────────────────────────────┐
│  [Week Selector]            │
├─────────────────────────────┤
│  Weekly Summary Card        │
│  ┌───────────────────────┐  │
│  │ VO2max  │ Resting HR  │  │
│  │ Avg HR  │ Avg Cadence │  │
│  │ Intensity Balance     │  │
│  │ Trend Indicators      │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  Activity List              │
│  ┌───────────────────────┐  │
│  │ Morning Run           │  │
│  │ Interval Session      │  │
│  │ Recovery Jog          │  │
│  │ Long Run              │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

At 375px:
- Weekly Summary Card spans full width
- Metric pairs (VO2max / Resting HR, Avg HR / Avg Cadence) use a 2-column grid within the card
- Intensity Balance and Trend Indicators stack vertically below the metric grid
- Activity Detail opens as a full-width panel that replaces the Activity List view; back navigation returns to the list

---

## 4. UI Components: Detailed Specification

### 4.1 Week Selector (`week-selector`)

**Purpose:** Navigate between weeks
**MUI Base:** `Select` (dropdown) or `ToggleButtonGroup` (if ≤ 5 weeks)

**Behaviour:**
- Displays the current week label (e.g., "Week 10 · 2024" or "2024-W10")
- Selecting a week updates all downstream components synchronously
- If the Activity Detail panel is open when the user changes the week, the Activity Detail panel closes and the Activity List for the newly selected week is shown (see §5, Flow 4)
- Focused via keyboard Tab; activates on Enter/Space

**Accessibility:**
- `aria-label="Select training week"`
- Each option has descriptive text: e.g., "2024-W10 (March 4–10)"
- Current selection announced to screen reader on change
- On week change while Activity Detail is open, focus moves to the `activity-list` container

---

### 4.2 Weekly Summary Card (`weekly-summary-card`)

**Purpose:** Container for all weekly-level metrics and indicators
**MUI Base:** `Card` with `CardContent`

**Behaviour:** Updates synchronously when week changes

**Layout inside card:**

```
┌─────────────────────────────────────────┐
│  WEEKLY SUMMARY · 2024-W10              │
│  ┌──────────────┬──────────────┐        │
│  │  VO2max      │  Resting HR  │        │
│  │  54          │  52 bpm      │        │
│  ├──────────────┼──────────────┤        │
│  │  Avg HR      │  Avg Cadence │        │
│  │  147 bpm     │  170 spm     │        │
│  └──────────────┴──────────────┘        │
│                                         │
│  [Intensity Balance]                    │
│  ● ● ●  Low: 3        ●  High: 1        │
│                                         │
│  [Trend Indicators]                     │
│  Training Load   Increasing             │
│  Avg HR          Increasing             │
│  Resting HR      Decreasing             │
└─────────────────────────────────────────┘
```

**Accessibility:**
- Card has `aria-label="Weekly summary for 2024-W10"` (updated dynamically with selected week)
- Each metric section uses a `<dl>` structure (term + description) or equivalent semantic grouping

---

### 4.3 Metric Display Cells (VO2max, Resting HR, Avg HR, Avg Cadence)

Each metric is a self-contained cell within the 2-column grid:

| Element | Content |
|---|---|
| Label | Small, muted uppercase label (e.g., "VO2MAX", "RESTING HR") |
| Value | Large, bold typographic value (e.g., "54", "52") |
| Unit | Small muted unit text (e.g., "bpm", "spm") — appended after value, visually de-emphasised |

**Specific testid mappings:**
- `weekly-vo2max` — contains text "54"
- `weekly-resting-hr` — contains text "52"
- `weekly-avg-hr` — contains text "147"
- `weekly-avg-cadence` — contains text "170"

**Accessibility:**
- Each cell is wrapped in an element with an `aria-label` combining label + value + unit, e.g. `aria-label="VO2max: 54"`, `aria-label="Resting heart rate: 52 beats per minute"`
- Screen reader reads the full phrase even if the visual layout separates value and unit

---

### 4.4 Intensity Balance (`intensity-balance`)

**Purpose:** Show the split between low and high intensity sessions for the week
**MUI Base:** `Box` containing decorative dot indicators and `Typography` text

**Visual design:**
- Two groups side by side: "Low" (calm colour, e.g., teal/green) and "High" (accent colour, e.g., orange/red)
- Each group shows filled circle dots matching the count, plus a text label
- Text "Low: 3" and "High: 1" must be present as readable text (not only visual)

**Example visual:**
```
  ● ● ●  Low: 3        ●  High: 1
```

**States:**
- Normal: shows both counts with dot clusters
- Zero count for either group: dot cluster is empty; text still reads "Low: 0" or "High: 0"

**Gherkin assertion mapping:**
- Contains text "Low: 3" ✓
- Contains text "High: 1" ✓

**Accessibility:**
- `aria-label="Intensity balance: 3 low-intensity sessions, 1 high-intensity session"` — **required, exact match per Gherkin**
- Dot clusters are decorative: `aria-hidden="true"`; text labels carry the semantic meaning
- Role: `region` with the aria-label above

---

### 4.5 Trend Indicators (`trend-training-load`, `trend-avg-hr`, `trend-resting-hr`)

**Purpose:** Show week-over-week directional change for three metrics
**MUI Base:** `Box` per indicator with `Typography`

#### 4.5.1 Arrow character and screen reader treatment

The Gherkin spec requires each trend element to contain literal text such as "↑ Increasing", "↓ Decreasing", "→ Stable", or "—". Unicode arrow characters (↑ ↓ →) have inconsistent and often unhelpful announcements across screen readers (e.g., "upwards arrow" rather than "increasing"). To meet both requirements:

- The visible text node contains the arrow character followed by the label word: e.g., **↑ Increasing**
- The parent element carries an `aria-label` that spells out the full meaning in plain English: e.g., `aria-label="Training load trend: Increasing"`
- The arrow character itself is wrapped in a `<span>` with `aria-hidden="true"` so that screen readers read only the `aria-label` on the parent and do not also announce the symbol
- This pattern satisfies the Gherkin text assertion (the DOM text node contains "↑ Increasing") while ensuring screen readers announce a clean, unambiguous phrase

**Example DOM structure (illustrative, not prescriptive):**
```
<div data-testid="trend-training-load"
     aria-label="Training load trend: Increasing">
  <span aria-hidden="true">↑</span> Increasing
</div>
```

#### 4.5.2 State table

| State | Visible text | `aria-label` value | Colour | When |
|---|---|---|---|---|
| Increasing | "↑ Increasing" | "[Metric] trend: Increasing" | Amber (neutral-to-caution) | Change > +2% |
| Decreasing (resting HR) | "↓ Decreasing" | "Resting heart rate trend: Decreasing" | Green (positive valence) | Resting HR change < −2% |
| Decreasing (other) | "↓ Decreasing" | "[Metric] trend: Decreasing" | Amber or neutral grey | Training load or avg HR change < −2% |
| Stable | "→ Stable" | "[Metric] trend: Stable" | Neutral grey | Change within ±2% |
| No data | "—" | "[Metric] trend: No comparison available" | Neutral grey | Earliest week in dataset |

**Colour note:** Colour conveys valence but is never the sole indicator. The text label ("Increasing", "Decreasing", "Stable") and the directional arrow character are always present in the visible text.

#### 4.5.3 Layout

Displayed as a vertical list of three rows inside the Weekly Summary Card:

```
┌─────────────────────────────────┐
│  Training Load   ↑ Increasing   │
│  Avg HR          ↑ Increasing   │
│  Resting HR      ↓ Decreasing   │
└─────────────────────────────────┘
```

Each row has a left-aligned metric name label and a right-aligned trend value. The metric name label is visually muted; the trend value uses the colour from §4.5.2.

#### 4.5.4 Gherkin text assertion mapping

- `trend-training-load` → "↑ Increasing" / "→ Stable" / "—"
- `trend-avg-hr` → "↑ Increasing" / "→ Stable" / "—"
- `trend-resting-hr` → "↓ Decreasing" / "→ Stable" / "—"

---

### 4.6 Activity List (`activity-list`)

**Purpose:** Display all activities for the selected week
**MUI Base:** `List` with `ListItem` + `ListItemButton`

**Each row displays:**
- Activity name (primary text)
- Activity type badge (secondary text or `Chip`)
- Duration (right-aligned secondary text)

**Behaviour:**
- Clicking a row opens the Activity Detail view
- Active/focused row is visually highlighted
- Keyboard: Tab to list, arrow keys to navigate rows, Enter/Space to activate

**Accessibility:**
- `aria-label="Activities for week 2024-W10"` on the list container (updated with selected week)
- Each `ListItemButton` has `aria-label` including the activity name: e.g., `aria-label="View Morning Run details"`
- When a row is activated, focus moves to the Activity Detail panel heading

---

### 4.7 Activity Detail (`activity-detail`)

**Purpose:** Display full detail for a selected activity
**MUI Base:** `Card` panel inline on desktop; full-width panel replacing the list on mobile

**Content layout:**
```
┌─────────────────────────────────────────┐
│  [← Back to list]                       │
│  Morning Run                            │
│  Type: Run  ·  Duration: 45 min         │
│  Distance: 8.2 km                       │
│                                         │
│  ┌──────────────┬──────────────┐        │
│  │  Avg HR      │  Cadence     │        │
│  │  168 bpm     │  180 spm     │        │
│  └──────────────┴──────────────┘        │
└─────────────────────────────────────────┘
```

**Absent value state:**
When `avg_hr` or `cadence` is absent (e.g., "Strength Cross-Train"):
- The value cell displays "—" (em dash, not a hyphen)
- The label is still shown; the cell is not hidden or removed
- Screen reader reads: "Average heart rate: not available" / "Cadence: not available"

**Specific testid mappings:**
- `activity-avg-hr` — contains "168" (present) or "—" (absent)
- `activity-cadence` — contains "180" (present) or "—" (absent)

**Week change while Activity Detail is open:**
- If the user changes the selected week via `week-selector` while Activity Detail is visible, the Activity Detail panel closes immediately
- The Activity List for the newly selected week