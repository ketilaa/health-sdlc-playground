# UX Specification: Home Page Structure (Step 1)

---

## 1. Overview

The Home Page is the primary entry point for the Health Playground application. It presents a persistent top bar and a two-column content layout below it. At this stage, all content sections display placeholder content. The layout establishes visual hierarchy and spatial relationships that subsequent steps will populate with real data.

---

## 2. Page Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR                                                     │
│  [Health Playground]              [Dataset Selector ▾]       │
├────────────────────────┬────────────────────────────────────┤
│  LEFT COLUMN           │  RIGHT COLUMN                       │
│                        │                                     │
│  ┌──────────────────┐  │  ┌──────────────────────────────┐  │
│  │ Training Overview│  │  │ Insights                     │  │
│  └──────────────────┘  │  │                              │  │
│                        │  │                              │  │
│  ┌──────────────────┐  │  └──────────────────────────────┘  │
│  │ Weekly Dashboard │  │                                     │
│  └──────────────────┘  │                                     │
│                        │                                     │
└────────────────────────┴────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Top Bar

| Property | Value |
|---|---|
| `data-testid` | *(implicit; top-level landmark)* |
| Position | Fixed or sticky at top of viewport |
| Height | Standard MUI AppBar height (64px desktop, 56px mobile) |
| Background | Primary brand color (to be defined in theme) |
| Elevation | MUI elevation 4 (box shadow) to separate from content below |

**Contents (left to right):**

1. **Application Title**
   - Text: `"Health Playground"`
   - Typography: MUI `h6` variant, rendered as `<h1>` semantically (page title)
   - Color: Contrasts with top bar background (WCAG AA minimum 4.5:1 for text)
   - Alignment: Left-aligned, vertically centered in bar
   - ARIA: No additional ARIA needed; rendered as heading landmark

2. **Dataset Selector**
   - `data-testid`: `dataset-selector`
   - Component: MUI `Select` or `Autocomplete` dropdown
   - Position: Right-aligned, vertically centered in bar
   - Label: Visible label "Dataset" above or inline (not icon-only)
   - ARIA: `aria-label="Select dataset"` on the control; label text associated via `htmlFor` / `aria-labelledby`
   - At this stage: may display a single placeholder option or empty state — no interaction required by this spec
   - Keyboard: Focusable via Tab; opens with Enter/Space; navigable with arrow keys; closes with Escape

---

### 3.2 Content Area

| Property | Value |
|---|---|
| `data-testid` | `content-area` |
| Layout | Two-column horizontal layout using MUI `Grid` container |
| Top spacing | Clears the top bar height (no content hidden behind bar) |
| Responsive behaviour | *(Not specified in Gherkin; see Assumptions)* |

---

### 3.3 Left Column

| Property | Value |
|---|---|
| `data-testid` | `left-column` |
| Layout | Single vertical stack |
| Child order | Training Overview **above** Weekly Dashboard (DOM order reflects visual order) |

**Children (top to bottom):**

1. **Training Overview card**
   - `data-testid`: `training-overview`
   - Component: MUI `Card` or `Paper`
   - Visible heading text: `"Training Overview"`
   - Typography: MUI `h2` (section heading within left column)
   - State at this stage: Placeholder — heading text is the only required content
   - ARIA: Section landmark or `role="region"` with `aria-labelledby` pointing to the heading

2. **Weekly Dashboard card**
   - `data-testid`: `weekly-dashboard`
   - Component: MUI `Card` or `Paper`
   - Visible heading text: *(not specified in Gherkin — no text assertion required)* — implementation may include a placeholder heading
   - State at this stage: Placeholder content
   - ARIA: Section landmark or `role="region"`; if a heading is present, use `aria-labelledby`

**Ordering constraint:** The DOM node for `training-overview` must appear before the DOM node for `weekly-dashboard` in document order, so that visual top-to-bottom order matches reading order for keyboard and screen reader users.

---

### 3.4 Right Column

| Property | Value |
|---|---|
| `data-testid` | `right-column` |
| Layout | Single vertical stack |

**Children:**

1. **Insights panel**
   - `data-testid`: `insights`
   - Component: MUI `Card` or `Paper`
   - Visible heading text: `"Insights"`
   - Typography: MUI `h2` (section heading within right column)
   - State at this stage: Placeholder — heading text is the only required content
   - ARIA: Section landmark or `role="region"` with `aria-labelledby` pointing to the heading

---

## 4. UI States

Because all content at this stage is structural/placeholder, the primary states are limited:

### 4.1 Default / Loaded State (primary state)
All elements visible as described in Section 3. Placeholder headings rendered. No loading, no data-fetch required at this structural step.

### 4.2 Loading State
*(Not triggered by this spec — no async data is required for structural layout. If a future step adds data-fetching, a loading state will be defined at that stage.)*

For completeness, a placeholder skeleton (MUI `Skeleton`) should be shown inside `training-overview`, `weekly-dashboard`, and `insights` if component mounting itself is async. The outer structural containers (`content-area`, `left-column`, `right-column`) must be visible immediately — they are never in a loading state.

### 4.3 Error State
*(Not triggered by this spec. Top bar and layout structure must always render regardless of downstream errors.)*

### 4.4 Empty State
Not applicable at this stage — placeholder text satisfies the "not empty" requirement.

---

## 5. User Flows

### Flow 1 — User Opens the Home Page

| Step | What the user sees | What the user can do |
|---|---|---|
| 1 | Page loads. Top bar appears immediately with "Health Playground" title on the left and the Dataset Selector on the right. | Read the page title; tab to the Dataset Selector |
| 2 | Below the top bar, two columns appear side by side. | Scroll (if content exceeds viewport) |
| 3 | Left column shows Training Overview card (with text "Training Overview") above Weekly Dashboard card. | Tab through section headings |
| 4 | Right column shows Insights card (with text "Insights"). | Tab through section headings |

### Flow 2 — Keyboard Navigation Across Page Landmarks

| Step | Key press | Focus destination |
|---|---|---|
| 1 | Tab (from address bar) | Top bar — Application Title or first focusable element |
| 2 | Tab | Dataset Selector control |
| 3 | Tab | First interactive element in left column (or next landmark) |
| 4 | Tab | First interactive element in right column (or next landmark) |

Screen reader users can navigate by landmark (`<header>`, `<main>`, `role="region"`) and by heading level to jump between Training Overview, Weekly Dashboard, and Insights.

---

## 6. Accessibility Requirements

| Requirement | Detail |
|---|---|
| Page title | `<title>` element reads "Health Playground" |
| Heading hierarchy | `<h1>` for "Health Playground" in top bar; `<h2>` for each section heading (Training Overview, Insights, Weekly Dashboard) |
| Landmark regions | `<header>` wraps top bar; `<main>` wraps content area; each card uses `role="region"` with an accessible name |
| Color contrast | All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text) against their respective backgrounds |
| Focus indicators | Visible focus ring on Dataset Selector and all interactive elements; MUI default focus ring is acceptable if contrast meets 3:1 |
| Keyboard trap | None — no modal or overlay in this spec |
| Dataset Selector label | Associated text label "Dataset" — not icon-only |
| DOM order = visual order | `training-overview` node precedes `weekly-dashboard` node; columns are ordered left-before-right in DOM |
| Reduced motion | No animations specified at this stage; if transitions are added, they must respect `prefers-reduced-motion` |

---

## 7. Gherkin Scenario → UI State Mapping

| Gherkin Scenario | UI Element / State |
|---|---|
| Top bar displays the application title | Top bar → Application Title text "Health Playground" — Default Loaded State |
| Top bar contains the dataset selector | Top bar → Dataset Selector (`data-testid="dataset-selector"`) — Default Loaded State |
| Page layout contains a two-column content area | Content Area (`data-testid="content-area"`) containing Left Column + Right Column — Default Loaded State |
| Left column contains Training Overview above Weekly Dashboard | Left Column → Training Overview card (DOM-first) then Weekly Dashboard card — Default Loaded State |
| Training Overview shows placeholder content | Training Overview card → visible heading text "Training Overview" — Placeholder State |
| Right column contains the Insights component | Right Column → Insights panel (`data-testid="insights"`) — Default Loaded State |
| Insights component shows placeholder content | Insights panel → visible heading text "Insights" — Placeholder State |

All 7 Gherkin scenarios are covered.

---

## 8. Open Questions / Out of Scope for Step 1

- Responsive / mobile breakpoint behaviour (single column on small screens vs. stacked)
- Dataset Selector options, interaction, and data source
- Real content for Training Overview, Weekly Dashboard, and Insights (future steps)
- Theme colours (primary, surface, text) — to be defined in theme configuration