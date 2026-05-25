# UX Specification: Improve Weekly Aggregates and Prepare for More Insights

## Overview

This specification covers the full UI for a weekly training dashboard. The interface allows users to browse weeks, view aggregated weekly metrics, inspect individual activity details, and understand training trends at a glance.

All data is synchronous and mocked. No async loading states are required unless otherwise noted. The interface must function correctly at both standard desktop widths and a minimum viewport width of 375px.

---

## Component Inventory

| Component | data-testid | MUI Base |
|---|---|---|
| Week Selector | `week-selector` | MUI Select / ToggleButtonGroup |
| Weekly Summary Card | `weekly-summary-card` | MUI Card |
| VO2max Display | `weekly-vo2max` | MUI Typography within Card |
| Resting HR Display | `weekly-resting-hr` | MUI Typography within Card |
| Avg HR Display | `weekly-avg-hr` | MUI Typography within Card |
| Avg Cadence Display | `weekly-avg-cadence` | MUI Typography within Card |
| Intensity Balance | `intensity-balance` | MUI Box / Chip group within Card |
| Trend: Training Load | `trend-training-load` | MUI Chip within Card |
| Trend: Avg HR | `trend-avg-hr` | MUI Chip within Card |
| Trend: Resting HR | `trend-resting-hr` | MUI Chip within Card |
| Activity List | `activity-list` | MUI List |
| Activity Detail | `activity-detail` | MUI Card / Drawer |
| Activity Avg HR | `activity-avg-hr` | MUI Typography within Detail |
| Activity Cadence | `activity-cadence` | MUI Typography within Detail |

---

## Page Layout

### Desktop (≥600px)

```
┌─────────────────────────────────────────────────────────┐
│  [Week Selector]                                        │
├──────────────────────────┬──────────────────────────────┤
│  Weekly Summary Card     │  Activity List               │
│  ─────────────────────   │  ─────────────────────────   │
│  VO2max | Resting HR     │  • Morning Run               │
│  Avg HR | Avg Cadence    │  • Interval Session          │
│  Intensity Balance       │  • Recovery Jog              │
│  Trends                  │  • Long Run                  │
└──────────────────────────┴──────────────────────────────┘
│  Activity Detail (expands below or inline on click)     │
└─────────────────────────────────────────────────────────┘
```

### Mobile (375px)

Single-column stacked layout:
1. Week Selector (full width)
2. Weekly Summary Card (full width, all metrics visible, scrollable if needed)
3. Activity List (full width)
4. Activity Detail (full width, expands inline below the list item or replaces list)

---

## UI States

### 1. Default / Week Selected State

**Trigger:** User lands on the page or selects a week.

**Visible elements:**
- Week Selector showing the selected week label (e.g. "Week 10, 2024")
- Weekly Summary Card fully populated
- Activity List showing all activities for the selected week
- No Activity Detail visible (collapsed / hidden)

### 2. Activity Detail Expanded State

**Trigger:** User clicks an activity in the Activity List.

**Visible elements:**
- Week Selector (unchanged)
- Weekly Summary Card (unchanged, still visible)
- Activity List (unchanged, selected item visually highlighted)
- Activity Detail visible, showing the selected activity's metrics

### 3. Missing Metric State (Dash Display)

**Trigger:** An activity has no `avg_hr` or `cadence` value.

**Visible elements:**
- Activity Detail is open
- `activity-avg-hr` displays "—" (em dash)
- `activity-cadence` displays "—" (em dash)
- All other populated fields display normally

### 4. No Prior Week State (Earliest Week)

**Trigger:** User selects the earliest week in the dataset (no prior week for comparison).

**Visible elements:**
- Trend indicators (`trend-training-load`, `trend-avg-hr`, `trend-resting-hr`) all display "—"
- All other weekly metrics display normally
- No error state; this is an expected, informational state

### 5. Stable Trend State

**Trigger:** Week-over-week change for a metric is within ±2%.

**Visible elements:**
- Affected trend indicators display "→ Stable"
- Visual treatment: neutral color (MUI `default` or grey chip)

---

## User Flows

### Flow 1: Browse Weeks and View Weekly Summary

**Entry point:** User navigates to `http://localhost:3000`

**Steps:**

1. **Page load** — Week Selector is visible. The most recent week is pre-selected (or the user sees an initial state). Weekly Summary Card and Activity List are populated for the default week.

2. **User interacts with Week Selector** (`data-testid="week-selector"`) — Selects "2024-W10" from a dropdown or toggle group. Options are labeled by human-readable week names (e.g. "W10 2024") but the underlying value maps to ISO week codes.

3. **Weekly Summary Card updates** — The following metrics are immediately visible within `data-testid="weekly-summary-card"`:

   | Metric | data-testid | Displayed value |
   |---|---|---|
   | VO2max | `weekly-vo2max` | "54" |
   | Resting HR | `weekly-resting-hr` | "52" |
   | Avg HR | `weekly-avg-hr` | "147" |
   | Avg Cadence | `weekly-avg-cadence` | "170" |

4. **Intensity Balance is visible** — `data-testid="intensity-balance"` shows "Low: 3" and "High: 1" with `aria-label="Intensity balance: 3 low-intensity sessions, 1 high-intensity session"`.

5. **Trend indicators are visible** — All three trend elements show their computed direction for 2024-W10 vs 2024-W09:
   - `trend-training-load` → "↑ Increasing"
   - `trend-avg-hr` → "↑ Increasing"
   - `trend-resting-hr` → "↓ Decreasing"

6. **Activity List is visible** — `data-testid="activity-list"` contains the names of all activities for the selected week (e.g. "Morning Run", "Interval Session", etc.)

---

### Flow 2: Drill Down Into an Activity

**Entry point:** Week is selected; Activity List is visible.

**Steps:**

1. **User clicks an activity** (e.g. "Morning Run") within `data-testid="activity-list"`.

2. **Activity Detail appears** — `data-testid="activity-detail"` becomes visible. It contains the activity name "Morning Run" as a heading.

3. **Activity metrics are shown** — For a fully populated activity:
   - `data-testid="activity-avg-hr"` contains "148"
   - `data-testid="activity-cadence"` contains "172"

4. **User can return** — Back navigation (e.g. a Close button, back arrow, or clicking elsewhere) collapses the Activity Detail. Activity List remains visible and the selected activity highlight is cleared.

---

### Flow 3: View Activity With Missing Metrics

**Entry point:** Week 2024-W10 selected; Activity List visible.

**Steps:**

1. **User clicks "Strength Cross-Train"** in `data-testid="activity-list"`.

2. **Activity Detail appears** — `data-testid="activity-detail"` is visible.

3. **Missing metrics display gracefully:**
   - `data-testid="activity-avg-hr"` contains "—"
   - `data-testid="activity-cadence"` contains "—"

4. **All other available fields** (e.g. duration, type) display normally.

---

### Flow 4: Browse to Earliest Week (No Trend Data)

**Entry point:** User is on the dashboard.

**Steps:**

1. **User selects "2024-W08"** via `data-testid="week-selector"`.

2. **Weekly Summary Card updates** with W08 data.

3. **Trend indicators show no comparison:**
   - `trend-training-load` contains "—"
   - `trend-avg-hr` contains "—"
   - `trend-resting-hr` contains "—"

4. **No error message or warning** is shown. The "—" is the complete, correct presentation.

---

### Flow 5: View Stable Trends (Week 2024-W09)

**Entry point:** User is on the dashboard.

**Steps:**

1. **User selects "2024-W09"** via `data-testid="week-selector"`.

2. **Trend indicators reflect ±2% threshold:**
   - `trend-training-load` contains "→ Stable"
   - `trend-avg-hr` contains "→ Stable"
   - `trend-resting-hr` contains "→ Stable"

---

### Flow 6: Responsive View at 375px

**Entry point:** User opens the app on a 375px-wide viewport.

**Steps:**

1. **User selects "2024-W10"** via `data-testid="week-selector"`.

2. **Weekly Summary Card** (`data-testid="weekly-summary-card"`) is visible without horizontal scroll or overflow clipping.

3. **All key metrics remain visible:**
   - `weekly-vo2max`
   - `weekly-resting-hr`
   - `intensity-balance`
   - `trend-training-load`

4. **Metrics reflow into a tighter grid** — 2-column grid collapses to 1-column or 2-column with smaller typography. No metric is hidden or truncated. Labels and values are legible.

---

## Component Specifications

### Week Selector (`data-testid="week-selector"`)

- **Type:** MUI Select (dropdown) or horizontal ToggleButtonGroup
- **Options:** Each week in the dataset rendered as a human-readable label (e.g. "W10 · 2024")
- **Behavior:** Selecting a week immediately updates the Weekly Summary Card and Activity List
- **Keyboard:** Fully navigable via keyboard (arrow keys for ToggleButtonGroup, or standard Select keyboard behavior)
- **ARIA:** `role="listbox"` or native `<select>`; each option has a descriptive label
- **Default selected:** Most recent week

---

### Weekly Summary Card (`data-testid="weekly-summary-card"`)

- **Type:** MUI Card with CardContent
- **Layout:** Metrics grid (2×2 or 2×3), Intensity Balance row, Trends row
- **Responsive:** At 375px, grid cells stack or shrink; no horizontal scroll

#### Metric Tiles (within the card)

Each metric tile contains:
- A label (e.g. "VO2max", "Resting HR", "Avg HR", "Avg Cadence")
- A prominent numeric value
- An optional unit label (e.g. "bpm", "spm")

| Metric | data-testid | Label | Unit |
|---|---|---|---|
| VO2max | `weekly-vo2max` | "VO2max" | "ml/kg/min" |
| Resting HR | `weekly-resting-hr` | "Resting HR" | "bpm" |
| Avg HR | `weekly-avg-hr` | "Avg HR" | "bpm" |
| Avg Cadence | `weekly-avg-cadence` | "Avg Cadence" | "spm" |

- **Typography hierarchy:** Label in small muted text; value in large bold text
- **Screen reader:** Each tile has a visually-implied but programmatically-explicit label via `aria-label` or associated `<label>` / heading element (e.g. `aria-label="VO2max: 54 ml/kg/min"`)

---

### Intensity Balance (`data-testid="intensity-balance"`)

- **Type:** MUI Box containing two MUI Chips or two labeled counts
- **Content:**
  - Chip/label: "Low: 3" (count of low-intensity sessions)
  - Chip/label: "High: 1" (count of high-intensity sessions)
- **Visual treatment:**
  - Low intensity: cool/muted color (e.g. MUI `info` or `default`)
  - High intensity: warm/accent color (e.g. MUI `warning` or `error`)
- **ARIA:** `aria-label="Intensity balance: 3 low-intensity sessions, 1 high-intensity session"` on the container element
- **Keyboard:** No interaction required (display-only); chips are non-interactive
- **Screen reader:** The `aria-label` on the container provides full context; individual chip text is supplementary

---

### Trend Indicators

Three trend chips, one per metric. Each shares the same visual grammar.

| Metric | data-testid |
|---|---|
| Training Load | `trend-training-load` |
| Avg HR | `trend-avg-hr` |
| Resting HR | `trend-resting-hr` |

**States and visual treatment:**

| State | Text content | Icon | MUI Chip color | Meaning |
|---|---|---|---|---|
| Increasing | "↑ Increasing" | ↑ arrow | `success` (green) or `error` (red) depending on metric | Change > +2% |
| Decreasing | "↓ Decreasing" | ↓ arrow | Opposite of Increasing | Change < −2% |
| Stable | "→ Stable" | → arrow | `default` (grey) | Change within ±2% |
| No data | "—" | None | `default` (grey) | Earliest week, no prior comparison |

> **Note on color semantics for trends:** The spec does not prescribe whether "increasing" is good or bad per metric. Color is used for direction only (up = one color, down = another). If the product adds valence (e.g. decreasing resting HR is good), color assignment should be revisited. For now, directional color only — no positive/negative valence applied.

- **ARIA:** Each chip has `aria-label` describing the metric and direction, e.g. `aria-label="Training load trend: Increasing"`, `aria-label="Average HR trend: Stable"`, `aria-label="Resting HR trend: no comparison available"` (for "—")
- **Keyboard:** Display-only; no interaction required

---

### Activity List (`data-testid="activity-list"`)

- **Type:** MUI List with MUI ListItem / ListItemButton per activity
- **Content per item:** Activity name, type badge (optional), duration
- **Interaction:** Each item is clickable/tappable and opens Activity Detail
- **Selected state:** Active/selected item is visually highlighted (MUI `selected` prop on ListItemButton)
- **Keyboard:** Arrow keys navigate list items; Enter/Space activates an item
- **ARIA:** `role="list"`; each item is `role="listitem"`; the clickable button within each item has `aria-label="Open [activity name] details"`
- **Focus management:** When an activity is clicked, focus moves to the Activity Detail heading

---

### Activity Detail (`data-testid="activity-detail"`)

- **Type:** MUI Card (inline expansion below list item) or MUI Drawer (mobile)
- **Trigger:** Opens on activity click; closes on close button, Escape key, or second click on the same activity
- **Content:**
  - Activity name as heading (`<h2>` or equivalent heading level in context)
  - Type, duration, distance
  - Avg HR field (`data-testid="activity-avg-hr"`)
  - Cadence field (`data-testid="activity-cadence"`)
  - Close/back control

**Metric rows within Activity Detail:**

Each metric row contains:
- Label (e.g. "Avg HR", "Cadence")
- Value (`data-testid` as specified) — either a number or "—" (em dash)
- Unit label (e.g. "bpm", "spm") — hidden when value is "—"

**Missing value display:**
- Value shown: "—" (em dash character U+2014)
- Unit label: not shown alongside "—"
- Screen reader text for missing value: `aria-label="Average heart rate: not available"` / `aria-label="Cadence: not available"` on the value element

**Focus management:**
- On open: focus moves to the Activity Detail container or its heading
- On close: focus returns to the list item that triggered the detail

**Keyboard:**
- Escape closes Activity Detail and returns focus to the triggering list item
- Tab navigates within the detail before cycling back to the list

---

## Accessibility Requirements Summary

| Requirement | Implementation |
|---|---|
| All interactive elements keyboard-accessible | Week Selector, Activity List items, Activity Detail close button |
| Focus management on drill-down open/close | Focus to detail heading on open; focus to list item on close |
| ARIA labels on display-only data elements | `intensity-balance`, all trend chips, metric tiles, missing value fields |
| Screen reader text for "—" values | `aria-label="[Metric]: not available"` |
| Color is not the sole means of conveying information | Trend chips include directional arrow and text label alongside color |
| Sufficient color contrast | All text/background combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text) |
| Responsive layout does not hide required elements | All `data-testid` elements remain visible at 375px |
| Heading hierarchy maintained | Activity name in detail is a logical heading; summary card section is labelled |

---

## Edge Cases Covered

| Edge case | Handling |
|---|---|
| Activity has no `avg_hr` | `activity-avg-hr` shows "—"; unit label hidden; ARIA says "not available" |
| Activity has no `cadence` | `activity-cadence` shows "—"; unit label hidden; ARIA says "not available" |
| Earliest week selected (no prior week) | All three trend indicators show "—"; no error or warning |
| Week change within ±2% | Trend indicator shows "→ Stable" with neutral visual treatment |
| 375px viewport | All required elements visible; layout reflows to single column |
| Week switch while detail open | Activity Detail closes (or resets); new week's Activity List is shown |

---

## Scenario-to-UI-State Mapping

| Gherkin Scenario | UI State / Flow |
|---|---|
| Activity records expose cadence and avg HR fields | Flow 2: Drill Down → Activity Detail expanded, fields populated |
| Activity detail displays dash when fields absent | Flow 3: Missing Metrics → "—" in `activity-avg-hr` and `activity-cadence` |
| Weekly summary displays VO2max and resting HR | Flow 1: Weekly Summary Card, metric tiles `weekly-vo2max` and `weekly-resting-hr` |
| Weekly summary shows avg HR aggregated from activities | Flow 1: Metric tile `weekly-avg-hr` = "147" |
| Weekly summary shows avg cadence aggregated from activities | Flow 1: Metric tile `weekly-avg-cadence` = "170" |
| Weekly summary shows intensity balance | Flow 1: `intensity-balance` shows "Low: 3" and "High: 1" with ARIA label |
| Trend indicators for increasing load, avg HR, decreasing resting HR | Flow 1 (W10): Trend chips show "↑ Increasing", "↑ Increasing", "↓ Decreasing" |
| Trend indicators show stable within 2% | Flow 5 (W09): All trend chips show "→ Stable" |
| Trend indicators show no comparison for earliest week | Flow 4 (W08): All trend chips show "—" |
| User can browse weeks and drill down into a workout | Flow 1 + Flow 2 combined; week selector switches content; activity detail opens |
| Weekly summary card readable at 375px | Flow 6: Responsive layout; all required elements visible at 375px viewport |