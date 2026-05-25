# UX Specification — Runner Dataset with Consistent Improvement

## 1. Overview

This feature presents a runner's 8-week half-marathon training plan as a glanceable, vertically-stacked weekly overview with progressive drill-down into individual activities. The design emphasizes rhythm, consistency, and time-based reading (newest first), letting the user immediately perceive training cadence without parsing numbers.

The interface is built around a single primary surface: the **Training Overview**, accessed at the application root path. A top bar hosts the dataset selector. The body presents week aggregates as expandable rows.

---

## 2. Layout & Information Architecture

### 2.1 Global structure (root path `/`)

```
┌──────────────────────────────────────────────────────────┐
│  TOP BAR                                                 │
│  ┌─────────────────────────────────────────┐             │
│  │ [Dataset Selector ▾]                    │             │
│  └─────────────────────────────────────────┘             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  PAGE HEADER                                             │
│  Training Overview                                       │
│  8 weeks · most recent first                             │
│                                                          │
│  WEEK LIST (vertical stack, newest → oldest)             │
│  ┌────────────────────────────────────────────────┐      │
│  │ Week 8  ▸  [bar] 32 km · 3h 10m · 3 activities │      │
│  ├────────────────────────────────────────────────┤      │
│  │ Week 7  ▸  [bar] 30 km · 2h 55m · 3 activities │      │
│  ├────────────────────────────────────────────────┤      │
│  │ ...                                            │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Component hierarchy

- `AppShell`
  - `TopBar`
    - `DatasetSelector` (MUI `Select` / `Autocomplete`) — `data-testid="dataset-selector"`
  - `MainContent`
    - `PageHeader` (title + subtitle)
    - `WeekList`
      - `WeekRow` × 8 — `data-testid="week-row"`
        - When expanded: `WeekActivities` — `data-testid="week-activities"`
          - `ActivityRow` — `data-testid="activity-row"`
          - `SkippedActivity` — `data-testid="skipped-activity"` (sickness week only)

---

## 3. UI Elements

### 3.1 Dataset Selector (`data-testid="dataset-selector"`)

- **Base component:** MUI `Select` (or `Autocomplete` with `disableClearable`) inside the top bar.
- **Default state:** Displays the preselected dataset name as visible text: `Half-Marathon Build-Up — 8 Week Consistent Plan`.
- **Affordance:** Caret/chevron icon (`ArrowDropDownIcon`) signals dropdown.
- **Dropdown options (visible to end users):** Only live/production datasets. The test fixture **must not appear** in the list.
- **Test isolation rationale:** The test fixture is loaded via a non-UI mechanism (out of scope of this spec). The selector's option list filters it out.
- **Accessibility:**
  - `aria-label="Select dataset"`
  - Keyboard: `Enter` / `Space` opens dropdown; arrow keys navigate; `Esc` closes.
  - Focus ring visible on the selector trigger.
  - When opened, focus moves into the listbox; selected option has `aria-selected="true"`.

### 3.2 Page Header

- **Title:** `Training Overview` (MUI `Typography variant="h4"`).
- **Subtitle:** `8 weeks · most recent first` (MUI `Typography variant="body2"`, muted color).
- Purpose: communicates ordering convention visually so the user understands week 8 at top is intentional.

### 3.3 Week Row (`data-testid="week-row"`)

Each week is a horizontally-laid card-like row. Rows are stacked vertically with subtle dividers.

**Anatomy (left → right):**

| Region | Content | Notes |
|---|---|---|
| Week label | `Week 8`, `Week 7`, ... | Bold, prominent. MUI `Typography variant="h6"`. |
| Visual indicator | Horizontal volume bar | Width proportional to weekly distance. Color hint: full-strength accent for normal weeks; muted/desaturated for the sickness week. |
| Distance | `data-testid="week-total-distance"` | e.g., `32.0 km`. Numeric, mono-tabular font for alignment. |
| Duration | `data-testid="week-total-duration"` | e.g., `3h 10m`. |
| Activity count | `data-testid="week-activity-count"` | Text `3 activities` or `2 activities`. |
| Expand affordance | Chevron icon | Rotates 90° when expanded. |

**Sort order:** Week 8 first, Week 1 last. The first `week-row` in DOM order contains `Week 8`; the last contains `Week 1`.

**Excluded from week row (must not be rendered anywhere):**
- No `data-testid="week-average-pace"`
- No `data-testid="week-average-heart-rate"`
- No `data-testid="week-trend"`

**States:**
- **Default (collapsed):** Row shows aggregate fields only.
- **Hover:** Background tint shift (MUI `action.hover`); cursor pointer.
- **Focus (keyboard):** Visible focus outline on the entire row.
- **Expanded:** Chevron rotated; `WeekActivities` panel rendered immediately below within the same row container.
- **Sickness week visual cue:** The volume bar uses a muted color and a small icon (e.g., medical/pause glyph) appears next to the activity count to telegraph "something different here" — supports the 3-second glance rule.

**Accessibility:**
- Each week row is a `button` (or `role="button"` on a div) with `aria-expanded="true|false"` and `aria-controls` pointing to the activities panel's id.
- `aria-label` reads: `Week 8, 32 kilometers, 3 hours 10 minutes, 3 activities. Expand to see details.`
- Keyboard: `Enter` or `Space` toggles expansion.

### 3.4 Week Activities Panel (`data-testid="week-activities"`)

Rendered only when its parent week row is expanded. Indented or visually nested under the week row.

- Contains one `ActivityRow` per completed activity.
- For the sickness week, contains exactly two `ActivityRow` elements **plus** one `SkippedActivity` element.

**Accessibility:**
- `role="region"`, `aria-label="Activities for Week 8"`.
- Focus management on expand: focus remains on the week row; user can `Tab` into activities.

### 3.5 Activity Row (`data-testid="activity-row"`)

Each completed activity displayed as a compact horizontal row.

| Field | testid | Example |
|---|---|---|
| Date | `activity-date` | `Mon, Oct 14` |
| Type | `activity-type` | `Long run` / `Restorative run` / `Intervals` |
| Distance | `activity-distance` | `14.0 km` |
| Duration | `activity-duration` | `1h 20m` |

**Excluded from activity row (must not be rendered anywhere):**
- No `data-testid="activity-pace"`
- No `data-testid="activity-heart-rate"`

**Visual treatment:**
- Activity type rendered with a small leading icon (intervals: stopwatch; long run: distance pin; restorative: leaf/recovery glyph) to support visual scanning.
- Date in muted color; type prominent.

### 3.6 Skipped Activity (`data-testid="skipped-activity"`)

Rendered inside `week-activities` for the sickness week only.

- **Visual:** A row styled distinctly from `ActivityRow` — dashed border or low-opacity background, no numeric metrics.
- **Visible text:** `Skipped due to sickness`.
- **Leading icon:** Medical/cross or pause glyph for instant recognition.
- **Not a clickable element**; informational only.
- **Accessibility:** `role="note"`, screen-reader text confirms `Skipped activity due to sickness`.

### 3.7 Loading State (`data-testid="dataset-loading"`)

- Visible from the moment the root path is opened until the first `week-row` is rendered.
- **Visual:** MUI `Skeleton` rows (8 placeholder bars matching the week-row layout), plus a centered subtle progress indicator (`CircularProgress` or animated shimmer).
- **Text (screen-reader only):** `Loading training data`.
- **Disappears** the instant the first `week-row` is mounted to the DOM.
- **Accessibility:** `aria-live="polite"`, `aria-busy="true"` on the main content region while loading.

---

## 4. User Flows

### Flow A — Default landing

1. User navigates to `/`.
2. App fetches dataset.
3. `dataset-loading` is visible (skeleton + spinner).
4. Once data resolves, `dataset-loading` is removed; 8 `week-row` elements are rendered.
5. `dataset-selector` in the top bar displays `Half-Marathon Build-Up — 8 Week Consistent Plan`.
6. User can immediately scan weekly volumes top-to-bottom (newest first).

### Flow B — Drilling into a typical week (Week 8)

1. From the loaded overview, user clicks (or activates via keyboard) the week row containing `Week 8`.
2. Row's `aria-expanded` becomes `true`; chevron rotates.
3. `week-activities` panel appears beneath the row.
4. Panel contains 3 `activity-row` elements: `Long run`, `Restorative run`, `Intervals`.
5. User can read date, type, distance, duration for each.
6. Clicking the same week row again collapses the panel.

### Flow C — Drilling into the sickness week (Week 4)

1. User notices Week 4's muted volume bar / sickness glyph at a glance.
2. User clicks the Week 4 row.
3. `week-activities` panel opens.
4. Panel contains 2 `activity-row` elements **and** 1 `skipped-activity` element displaying `Skipped due to sickness`.
5. The visual contrast makes it obvious which activity was missed.

### Flow D — Inspecting the dataset selector

1. User clicks the `dataset-selector` in the top bar.
2. Dropdown opens, listing live datasets only.
3. No option with text containing `Test Fixture` appears.
4. User can `Esc` to dismiss or pick another dataset (out of scope for this feature beyond confirming absence of the test fixture).

### Flow E — Slow network

1. User opens `/` with throttled network.
2. `dataset-loading` element appears immediately.
3. No `week-row` exists in the DOM yet.
4. When data arrives, `week-row` elements mount and `dataset-loading` is unmounted in the same render cycle (or the loader is removed strictly before/at the moment any week-row appears such that the ordering invariant holds).

---

## 5. UI States Summary

| State | Trigger | What user sees |
|---|---|---|
| **Loading** | Initial fetch in progress | `dataset-loading` skeleton; no week rows |
| **Loaded — default** | Fetch complete | Top bar shows dataset name; 8 collapsed week rows |
| **Week expanded (typical)** | Click on Week 1–3 or 5–8 | Week row + 3 activity rows visible |
| **Week expanded (sickness)** | Click on Week 4 | Week row + 2 activity rows + 1 skipped activity marker |
| **Selector open