# UX Specification: Enforce Visual Theme

---

## 1. Overview

This feature enforces that the design token system — established in the `visual-theme-overhaul` feature — is structurally wired to the DOM. It does so by requiring every activity row and skipped-activity marker to expose a `data-activity-type` attribute. The attribute value is the contract between the DOM and the CSS token system: CSS selectors target `[data-activity-type="long_run"]`, `[data-activity-type="intervals"]`, etc. to apply the correct colour token.

This UX specification defines no new visual components. It defines the **attribute contract** on existing components (`activity-row`, `skipped-activity`) and the observable states that result from that contract being honoured.

---

## 2. Design System Context

The established design system (from `visual-theme-overhaul`) defines the following colour tokens as CSS custom properties on `:root`:

| Token | Purpose |
|---|---|
| `--color-activity-long-run` | Accent colour for long run activities |
| `--color-activity-intervals` | Accent colour for interval sessions |
| `--color-activity-restorative-run` | Accent colour for restorative/recovery runs |
| `--color-activity-skipped` | Accent colour for skipped activity markers |
| `--color-surface` | Card/panel background |
| `--color-background` | Page background (dark) |

The `data-activity-type` attribute on each row is the **selector hook** that connects a rendered element to these tokens. Without it, the tokens exist but are never applied — the visual theme is broken in practice even if the CSS is present.

**No new tokens, colours, typography, or layout patterns are introduced by this feature.** This spec is purely about ensuring existing components carry the correct attribute.

---

## 3. Affected Components

### 3.1 Activity Row (`data-testid="activity-row"`)

This is an existing component rendered within `week-activities` when a week row is expanded. It already renders workout data (activity type label, distance, duration, etc.).

**New requirement:** Each `activity-row` element MUST carry a `data-activity-type` attribute whose value is a non-empty string identifying the activity type.

| Attribute | Required values |
|---|---|
| `data-activity-type` | `"long_run"` \| `"restorative_run"` \| `"intervals"` \| any other valid activity type |

The attribute value MUST be machine-readable (snake_case, lowercase) — not the display label. The display label ("Long Run", "Restorative Run") remains unchanged in the visible UI.

**Visual behaviour:** The attribute enables CSS to apply the correct left-border accent colour (or equivalent visual indicator) from the design token system. This is existing CSS behaviour from the `visual-theme-overhaul`; this feature ensures the DOM attribute is always present so that behaviour is never silently broken.

---

### 3.2 Skipped Activity Marker (`data-testid="skipped-activity"`)

This is an existing component rendered within `week-activities` for weeks with a skipped activity (e.g. Week 4 — sickness week).

**New requirement:** The `skipped-activity` element MUST carry a `data-activity-type` attribute with the value `"skipped"`.

| Attribute | Required value |
|---|---|
| `data-activity-type` | `"skipped"` |

The visual treatment (muted styling, "skipped" indicator) already exists from prior features; the attribute ensures the CSS token `--color-activity-skipped` is applied via the selector `[data-activity-type="skipped"]`.

---

## 4. UI States

These states apply to the `week-activities` panel (the expanded section within a week row).

### 4.1 Expanded Week — Activities Loaded (primary state)

All activity rows visible. Each `activity-row` carries a non-empty `data-activity-type` attribute. CSS accent colours are applied via the attribute selector. No new visual change from the user's perspective — this state is the correct baseline.

**Elements present:**
- One or more `activity-row` elements, each with `data-activity-type` set
- Optionally, a `skipped-activity` element with `data-activity-type="skipped"` (weeks with skipped entries)

### 4.2 Expanded Week — Skipped Activity Present

Shown for weeks such as Week 4. The `skipped-activity` marker is visible with `data-activity-type="skipped"`. The `--color-activity-skipped` token is applied via CSS. Visual appearance matches the skipped/muted styling established in `visual-theme-overhaul`.

### 4.3 Collapsed Week Row (default state before interaction)

`week-activities` is not visible. No `activity-row` or `skipped-activity` elements are in the DOM (or are hidden). No attribute assertions apply in this state.

### 4.4 Loading State

If week activities are fetched asynchronously: a skeleton or spinner is shown inside `week-activities`. No `activity-row` or `skipped-activity` elements are rendered during loading — the attribute requirement applies only to fully rendered activity elements.

### 4.5 Error State

If activity data cannot be loaded: an inline error message is displayed within `week-activities`. No `activity-row` elements are rendered. Error state visual treatment follows the existing design system (error colour token if defined, or MUI `Alert` component).

### 4.6 Empty State

If a week exists but has zero activities: `week-activities` is visible but contains no `activity-row` elements. An empty-state message ("No activities recorded") is displayed. This is not a regression — the absence of `activity-row` elements means the attribute requirement trivially passes.

---

## 5. User Flows

### Flow 1 — User Expands a Standard Week (e.g. Week 8)

| Step | What the user sees | Attribute state |
|---|---|---|
| 1 | Home page loaded. Week rows visible in weekly dashboard. | No `week-activities` visible |
| 2 | User clicks "Week 8" row (`data-testid="week-row"`). | — |
| 3 | `week-activities` panel expands. Three activity rows appear: Long Run, Restorative Run, Intervals. Each row shows accent colour from design token. | Each `activity-row` has `data-activity-type` set to `"long_run"`, `"restorative_run"`, `"intervals"` respectively |
| 4 | User can click another week row or collapse Week 8. | — |

### Flow 2 — User Expands a Week with a Skipped Activity (e.g. Week 4)

| Step | What the user sees | Attribute state |
|---|---|---|
| 1 | Home page loaded. Week rows visible. | No `week-activities` visible |
| 2 | User clicks "Week 4" row (`data-testid="week-row"`). | — |
| 3 | `week-activities` panel expands. A skipped activity marker appears with muted/greyed styling (from `--color-activity-skipped` token). | `skipped-activity` element has `data-activity-type="skipped"` |
| 4 | User can click another week row or collapse Week 4. | — |

### Flow 3 — User Compares Activity Types Across Weeks (Consistency Check)

| Step | What the user sees | Attribute state |
|---|---|---|
| 1 | User expands Week 8. Long run row visible with long-run accent colour. | `activity-row` with `data-activity-type="long_run"` |
| 2 | User collapses Week 8 (or directly) clicks Week 7 row. | — |
| 3 | Week 7 expands. Long run row visible with the same long-run accent colour. | `activity-row` with `data-activity-type="long_run"` (same value, same visual treatment) |

The accent colour applied to long run activities is identical across weeks because it derives from the same CSS token (`--color-activity-long-run`) via the same attribute selector — not from inline styles or per-row logic.

---

## 6. Attribute Value Reference

This is the normative list of `data-activity-type` values. These are the machine-readable identifiers used as CSS selector hooks.

| Display label | `data-activity-type` value |
|---|---|
| Long Run | `long_run` |
| Restorative Run | `restorative_run` |
| Intervals | `intervals` |
| Skipped | `skipped` |

Additional activity types (e.g. tempo runs, easy runs) that may exist in the dataset must also carry a non-empty `data-activity-type` value, even if no specific colour token is defined yet. A fallback/default token or colour must be applied in that case to prevent unstyled elements.

---

## 7. Accessibility Requirements

These requirements apply to the `activity-row` and `skipped-activity` components. No new accessibility constraints are introduced beyond what already exists; this section confirms the existing requirements are not broken by the attribute addition.

| Requirement | Detail |
|---|---|
| Attribute is decorative, not semantic | `data-activity-type` is a CSS hook, not an ARIA attribute. It must NOT be used as a substitute for accessible labelling. |
| Activity type communicated to screen readers | The activity type (e.g. "Long Run") must be conveyed via visible text or `aria-label` — not via `data-activity-type`. The attribute is invisible to screen readers. |
| Colour is not the sole differentiator | The accent colour applied via `data-activity-type` CSS selectors must be supplemented by the visible text label for each activity type. Users who cannot perceive colour differences can still identify activity types by reading the label. |
| Focus management | Expanding a week row moves focus to the `week-activities` container or its first child, consistent with the interaction pattern established in `make-weekly-dashboard-the-home-page`. |
| Skipped activity label | The `skipped-activity` element must include visible text or an `aria-label` communicating that the activity was skipped — `data-activity-type="skipped"` alone is not sufficient. |
| Keyboard navigation | No change from existing behaviour. Week rows remain keyboard-accessible; expanding/collapsing via Enter/Space. |

---

## 8. Gherkin Scenario → UI State Mapping

| Gherkin Scenario | UI Element / State |
|---|---|
| Each activity row exposes its activity type for colour coding | Week 8 expanded → each `activity-row` within `week-activities` has non-empty `data-activity-type` — Flow 1, State 4.1 |
| Activity type attribute values match the known activity types | Week 8 expanded → `activity-row` elements with `data-activity-type="long_run"`, `"restorative_run"`, `"intervals"` visible — Flow 1, State 4.1 |
| Skipped activity marker exposes its type for colour coding | Week 4 expanded → `skipped-activity` element has `data-activity-type="skipped"` — Flow 2, State 4.2 |
| Activity type attribute is consistent for the same type across different weeks | Week 8 + Week 7 both show `data-activity-type="long_run"` on long run rows — Flow 3, State 4.1 |

All 4 Gherkin scenarios are covered.

---

## 9. Out of Scope

- Changing visual appearance of activity rows (colour, typography, spacing) — established in `visual-theme-overhaul`
- Adding new activity types beyond those in the fixture dataset
- Responsive layout changes
- Animation or transition effects
- Changes to the CSS custom property definitions themselves