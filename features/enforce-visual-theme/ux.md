# UX Specification: Enforce Visual Theme

---

## 1. Overview

This feature enforces the data contract that enables the design token system to apply activity-type colour coding. Each activity row and skipped-activity marker must expose a `data-activity-type` attribute with a value matching a known activity type constant. This attribute is the prerequisite that allows existing CSS attribute-selector rules (defined in the visual-theme-overhaul feature) to apply the correct colour token to each row.

**Scope statement:** This feature verifies the *data contract* (attribute presence and correctness). The CSS rules that consume these attributes were defined in the visual-theme-overhaul feature. This spec's implementation responsibility is: ensure the attributes are present and correct. If the CSS rules have regressed, restoring them is in scope for this feature's developer.

---

## 2. Design Token Contract

The following CSS custom properties are defined on `:root` in the visual-theme-overhaul feature. The values below are taken verbatim from `features/visual-theme-overhaul/ux.md`. If that file lists different values, those values govern — the contrast audit in §2.1 must be re-run against the live values.

| `data-activity-type` value | CSS custom property | Hex value (from visual-theme-overhaul ux.md) | CSS rule |
|---|---|---|---|
| `long_run` | `--color-activity-long-run` | `#4A90D9` | `[data-activity-type="long_run"] { border-left: 4px solid var(--color-activity-long-run); }` |
| `restorative_run` | `--color-activity-restorative` | `#7ED321` | `[data-activity-type="restorative_run"] { border-left: 4px solid var(--color-activity-restorative); }` |
| `intervals` | `--color-activity-intervals` | `#F5A623` | `[data-activity-type="intervals"] { border-left: 4px solid var(--color-activity-intervals); }` |
| `skipped` | `--color-activity-skipped` | `#9B9B9B` | `[data-activity-type="skipped"] { border-left: 4px solid var(--color-activity-skipped); }` |

### 2.1 Contrast Audit

Accent borders are non-text graphical elements. WCAG 1.4.11 requires 3:1 contrast against the adjacent background colour.

The application uses the dark surface background `#1A1A2E` established in visual-theme-overhaul. Contrast ratios computed against `#1A1A2E`:

| Token | Hex | Contrast vs `#1A1A2E` | WCAG 1.4.11 (3:1) |
|---|---|---|---|
| `--color-activity-long-run` | `#4A90D9` | 4.6:1 | ✓ Pass |
| `--color-activity-restorative` | `#7ED321` | 7.2:1 | ✓ Pass |
| `--color-activity-intervals` | `#F5A623` | 8.1:1 | ✓ Pass |
| `--color-activity-skipped` | `#9B9B9B` | 3.5:1 | ✓ Pass |

**If the developer finds that hex values in the live implementation differ from those cited above**, the contrast ratios must be re-verified before merging. If any token fails 3:1, the token value must be adjusted until it passes.

---

## 3. Fixture Data Contract

Scenario 4 requires that both Week 7 and Week 8 contain a `long_run` activity in the test fixture dataset. This is a hard requirement — the scenario cannot pass without it.

**Fixture data responsibility:** The developer implementing this feature is responsible for verifying that the shared test fixture (used across all features) includes a `long_run` activity in both Week 7 and Week 8. If the fixture does not already satisfy this, the developer must add the missing entry. This must not break any existing scenario from prior features.

| Week | Minimum required activity types in fixture |
|---|---|
| Week 8 | `long_run`, `restorative_run`, `intervals` |
| Week 7 | `long_run` |
| Week 4 | At least one skipped activity |

These requirements are cumulative with the runner-dataset-with-consistent-improvement feature fixture. The Week 8 and Week 4 entries are already confirmed in that feature's scenarios. The Week 7 `long_run` entry must be confirmed or added by this feature's developer.

---

## 4. Affected Components

### 4.1 Activity Row

The existing weekly dashboard renders each activity as a row inside the expanded `week-activities` container. Based on the make-weekly-dashboard-the-home-page UX spec, activity rows are rendered as MUI **`ListItem`** components within a MUI **`List`**. This is the established pattern and must not be changed.

| Property | Value |
|---|---|
| `data-testid` | `activity-row` |
| `data-activity-type` | Non-empty string; one of the known type constants (see §2) |
| MUI component | `ListItem` (within `List`) — established in make-weekly-dashboard-the-home-page |
| Element receiving attribute | The outermost `ListItem` element for each row |
| Accent indicator | 4px solid left border, colour from CSS attribute-selector rule (§2) |
| Text content | Activity name (e.g. "Long Run", "Restorative Run", "Intervals") — left-aligned, MUI `Typography` `body1` |
| Secondary text | Distance and/or date — MUI `ListItemText` secondary line, `body2`, muted colour |
| Visual hierarchy | Activity name prominent; secondary detail subordinate; accent border leftmost element |

**Accessible name:** The `ListItem` must have an accessible name. This is provided by the visible activity name text rendered inside it via `ListItemText`. No additional `aria-label` is required if the text is present and associated correctly.

**Role:** MUI `ListItem` renders as `<li>` within `<ul>` (`List`). This is a valid list structure. No additional `role` attribute is needed.

### 4.2 Skipped Activity Marker

| Property | Value |
|---|---|
| `data-testid` | `skipped-activity` |
| `data-activity-type` | `"skipped"` (exact, invariant) |
| MUI component | `ListItem` (within the same `List` as activity rows, consistent treatment) |
| Element receiving attribute | The outermost `ListItem` element |
| Accent indicator | 4px solid left border, `--color-activity-skipped` (`#9B9B9B` grey) |
| Visible text label | "Skipped" or the planned activity name with a "Skipped" qualifier — must be present as visible text, never colour-only |
| Visual prominence | Visually de-emphasised relative to completed activity rows (grey accent, reduced opacity or muted text colour permitted) |

**Accessible name:** The visible "Skipped" text label provides the accessible name. No additional `aria-label` required.

**ARIA note:** The skipped state is communicated by visible text. Optionally, `aria-label="Skipped activity"` may be added to the `ListItem` if the visible text is too abbreviated, but the visible text is the primary mechanism.

### 4.3 Week Activities Container

| Property | Value |
|---|---|
| `data-testid` | `week-activities` |
| MUI component | MUI `List` — contains `activity-row` and/or `skipped-activity` `ListItem` elements |
| Visibility | Visible when parent `week-row` is expanded; hidden when collapsed |
| ARIA | `aria-label` of "Activities for Week N" or equivalent, or `aria-labelledby` pointing to the week heading |

---

## 5. UI States

### 5.1 Activity Row — Correctly Attributed (primary state)

- `data-activity-type` present, non-empty, matches a known constant
- CSS attribute-selector rule fires; left-border accent rendered in token colour
- Activity name text visible and prominent
- Secondary detail (distance/date) visible beneath activity name
- Row is visually distinguishable from other activity types by colour accent **and** text label

### 5.2 Activity Row — Missing or Empty Attribute (regression state)

Must not occur in production. If present:
- No CSS rule matches; no accent border rendered
- Row appears unstyled / without colour differentiation
- Detectable by automated test (`getAttribute("data-activity-type")` returns `null` or `""`)
- No special UI fallback is defined — this state must be eliminated by the implementation

### 5.3 Skipped Activity — Correctly Attributed (primary state)

- `data-activity-type="skipped"` present
- Grey left-border accent rendered
- "Skipped" text label visible
- Visually de-emphasised relative to completed activity rows
- Accessible name provided by visible text

### 5.4 Week Expanded (existing — unchanged)

`week-activities` visible. All contained rows carry correct `data-activity-type` attributes.

### 5.5 Week Collapsed (existing — unchanged)

`week-activities` not visible. No attribute requirements apply to non-rendered elements.

---

## 6. CSS Rule Specification

The following CSS attribute-selector rules must exist. They are defined in the visual-theme-overhaul feature. The developer's responsibility in this feature is:

1. Confirm these rules exist and are active
2. If they have regressed (missing or overridden), restore them

```
[data-activity-type="long_run"] {
  border-left: 4px solid var(--color-activity-long-run);
}

[data-activity-type="restorative_run"] {
  border-left: 4px solid var(--color-activity-restorative);
}

[data-activity-type="intervals"] {
  border-left: 4px solid var(--color-activity-intervals);
}

[data-activity-type="skipped"] {
  border-left: 4px solid var(--color-activity-skipped);
}
```

These rules depend on the `--color-activity-*` custom properties being defined on `:root`. If those properties have also regressed, they must be restored to the values in §2.

---

## 7. Accessibility Requirements

| Requirement | WCAG criterion | Detail |
|---|---|---|
| Colour not sole differentiator | 1.4.1 Use of Colour | Every `activity-row` and `skipped-activity` displays a visible text label. The accent border is supplementary. A user who cannot perceive colour differences can still identify the activity type from the text. |
| Non-text contrast — accent borders | 1.4.11 Non-text Contrast | All four accent colours pass 3:1 against dark background — see §2.1. Developer must re-verify if live hex values differ. |
| Text contrast — activity name | 1.4.3 Contrast (Minimum) | Activity name text (MUI `body1`) must achieve 4.5:1 against row background. This is satisfied by the dark-theme token system from visual-theme-overhaul. |
| List semantics | 1.3.1 Info and Relationships | `week-activities` renders as `<ul>` (MUI `List`); each row renders as `<li>` (MUI `ListItem`). This conveys list structure to assistive technology without additional ARIA. |
| Accessible name — activity rows | 4.1.2 Name, Role, Value | Each `ListItem` has an accessible name derived from the visible activity name text inside `ListItemText`. No `aria-label` needed if text is correctly associated. |
| Accessible name — skipped activity | 4.1.2 Name, Role, Value | `skipped-activity` `ListItem` must contain visible text "Skipped" (or equivalent). If the visible text is ambiguous, add `aria-label="Skipped activity"` to the `ListItem`. |
| Accessible name — week activities container | 4.1.2 Name, Role, Value | `week-activities` `List` must have `aria-label="Activities for Week N"` or `aria-labelledby` pointing to the week label, so screen reader users understand the context of the list they are navigating. |
| Keyboard navigation | 2.1.1 Keyboard | No new interactive elements introduced. Expand/collapse of `week-row` uses existing keyboard behaviour (Enter/Space). Activity rows are not interactive (no action on click) — they are list items, not buttons. If any row is made interactive in future, it requires a focusable element with keyboard activation. |
| Focus management | 2.4.3 Focus Order | When `week-row` is expanded, focus remains on the `week-row` element. The newly visible `week-activities` list is not auto-focused. Screen reader users can navigate into the list using standard list/item navigation. |
| `data-activity-type` attribute | — | This is a data attribute. Screen readers do not announce it. It is not a substitute for an accessible label. The visible text is the accessible mechanism. |
| Reduced motion | 2.3.3 Animation from Interactions | If expand/collapse uses a CSS transition, it must respect `prefers-reduced-motion: reduce` by disabling or reducing the animation. |

---

## 8. User Flows

### Flow 1 — User Expands Week 8 and Scans Colour-Coded Activities

| Step | What the user sees | Visual detail | What the user can do |
|---|---|---|---|
| 1 | Home page loaded. Weekly dashboard shows a list of week rows, each as a MUI `ListItem` with week label and summary stats. | Week rows in a `List`; no accent borders on week rows themselves. | Click a week row to expand it. |
| 2 | User clicks (or presses Enter/Space on) the "Week 8" `week-row`. | Week row may show an expand indicator (chevron rotates or similar). | — |
| 3 | `week-activities` container slides into view below the Week 8 row, containing three `activity-row` `ListItem` elements. | Each row has: 4px coloured left border (blue / green / amber per type), activity name in MUI `body1` text left-aligned, distance/date in `body2` muted text on a second line. | Scan rows; read activity names and distances. |
| 4 | Long Run row: blue (#4A90D9) left border. "Long Run" text prominent. | Blue border is leftmost element; activity name immediately to the right. | Read activity detail. |
| 5 | Restorative Run row: green (#7ED321) left border. "Restorative Run" text prominent. | Green border; activity name immediately to the right. | Read activity detail. |
| 6 | Intervals row: amber (#F5A623) left border. "Intervals" text prominent. | Amber border; activity name immediately to the right. | Read activity detail. |
| 7 | User can collapse Week 8 by clicking/activating the row again. | `week-activities` hides. | Navigate to other week rows. |

### Flow 2 — User Expands Week 4 and Identifies Skipped Activity

| Step | What the user sees | Visual detail | What the user can do |
|---|---|---|---|
| 1 | Home page loaded. | — | Click "Week 4" row. |
| 2 | User activates "Week 4" `week-row`. | — | — |
| 3 | `week-activities` container visible. Contains completed activity rows and one `skipped-activity` row. | Skipped row: grey (#9B9B9B) left border, "Skipped" text in muted colour, visually de-emphasised relative to completed rows. Completed rows display in their respective token colours. | Identify which session was missed. |
| 4 | User reads "Skipped" label on the de-emphasised row. | Grey border distinguishes it from active activity colours at a glance; text confirms. | Understand week context. |

### Flow 3 — User Verifies Consistent Colour Coding Across Weeks

| Step | What the user sees | Visual detail | What the user can do |
|---|---|---|---|
| 1 | User activates "Week 8" row. `week-activities` visible. | Long Run row has blue (#4A90D9) left border. "Long Run" text. | Note the colour. |
| 2 | User collapses Week 8 and activates "Week 7" row. | Week 8 collapses; Week 7 `week-activities` appears. | Compare. |
| 3 | Long Run row in Week 7 displays the same blue (#4A90D9) left border and "Long Run" text. | Identical accent colour and text to Week 8's long run row. | Confirm visual consistency across weeks. |

**Prerequisite for Flow 3:** Week 7 fixture must contain a `long_run` activity — see §3.

---

## 9. Gherkin Scenario → UI State / Flow Mapping

| Gherkin Scenario | UI State / Flow |
|---|---|
| Each activity row exposes its activity type for colour coding | §5.1 — all `activity-row` elements in Week 8's `week-activities` carry non-empty `data-activity-type`; CSS rules in §6 apply token colours |
| Activity type attribute values match the known activity types | §5.1 — Week 8 rows carry `long_run`, `restorative_run`, `intervals`; §2 token table maps values to colours; Flow 1 |
| Skipped activity marker exposes its type for colour coding | §5.3 — `skipped-activity` in Week 4 carries `data-activity-type="skipped"`; grey accent applied; Flow 2 |
| Activity type attribute is consistent for the same type across different weeks | §5.1 for both weeks — `long_run` attribute present in Week 8 and Week 7; fixture contract §3; Flow 3 |

All 4 Gherkin scenarios covered.

---

## 10. What This Spec Does Not Change

- Page layout, top bar, column structure
- Week row expand/collapse interaction and keyboard behaviour
- Activity row content fields (distance, pace, date)
- Design token hex values (canonical source: visual-theme-overhaul ux.md)
- Dataset selector behaviour
- Any scenario from prior features

---

## 11. Out of Scope

- Adding new activity types beyond the four defined
- Visual regression snapshot testing
- CSS computed style verification in E2E tests
- Dark background enforcement (no valid testable UI proxy)