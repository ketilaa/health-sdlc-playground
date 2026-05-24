# Health Playground — UX Specification

## 1. Overview

Health Playground is a static, browser-based application scaffolded as a foundation for future health-data exploration features. This first release establishes the global application shell: a persistent top bar containing the product title and a placeholder for a dataset selector. No interactive data behaviour exists yet — this spec defines the visual frame, accessibility scaffolding, and states needed to satisfy the feature's contract and to host future functionality.

The UX must feel like the start of a confident, modern data product: spacious, calm, slightly expressive in colour and typography, and obviously not a generic admin template.

---

## 2. Global Layout

The application uses a single, full-viewport layout:

```
┌───────────────────────────────────────────────────────────────┐
│  TopBar  (data-testid="top-bar")                              │
│  ┌──────────────────────┐               ┌──────────────────┐  │
│  │  Logo + Title        │               │  Dataset         │  │
│  │  "Health Playground" │               │  Selector        │  │
│  │                      │               │  (placeholder)   │  │
│  └──────────────────────┘               └──────────────────┘  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Main Content Area                                            │
│  (Home page body — welcome / hero region)                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

- **TopBar**: fixed at the top of the viewport, full-width, elevated above content. Based on MUI `AppBar` with `position="sticky"`.
- **Main**: scrollable region beneath the TopBar.
- Layout is responsive: on narrow viewports (<600px) the dataset selector remains visible but may compress its label.

---

## 3. Components

### 3.1 TopBar
- **Identifier:** `data-testid="top-bar"`
- **Base component:** MUI `AppBar` + `Toolbar`
- **Contents (left to right):**
  1. **Brand cluster** — a small geometric mark (e.g. a stylised pulse/heartbeat glyph) + the product wordmark `"Health Playground"`.
  2. **Flexible spacer**
  3. **Dataset selector slot** (see §3.2)
- **Visual treatment:**
  - Background: a subtle gradient using a single accent hue (e.g. teal → indigo) to signal an experimental, playful product rather than a clinical dashboard.
  - Text: high-contrast on gradient; wordmark in a medium-weight display-adjacent typeface.
  - Elevation: soft shadow on scroll only.
- **Height:** 64px desktop, 56px mobile.
- **Accessibility:**
  - Rendered as `<header role="banner">`.
  - Title is the first focusable/landmark item; wordmark wrapped in an element with `aria-label="Health Playground — home"`.
  - All interactive controls reachable via Tab in left-to-right order.

### 3.2 Dataset Selector (placeholder)
- **Identifier:** `data-testid="dataset-selector"`, nested inside the element with `data-testid="top-bar"`.
- **Base component:** MUI `Select` (disabled) or `Button` styled as a select, with a downward chevron icon.
- **Visible content:** label text `"Select dataset"` plus chevron icon.
- **Behaviour in this release:** non-interactive placeholder.
  - Rendered in a visibly disabled state but legible (not faded into invisibility).
  - Clicking it does nothing; no menu opens.
  - Tooltip on hover/focus: `"Dataset selection coming soon"`.
- **Accessibility:**
  - `aria-disabled="true"`
  - `aria-label="Dataset selector (coming soon)"`
  - Remains in the tab order so screen-reader users discover the upcoming feature.
  - Focus ring matches MUI default focus-visible styling.

### 3.3 Main Content (Home page body)
A welcoming hero area beneath the TopBar:
- **Headline:** `"Health Playground"` (large, display weight)
- **Subhead:** short single sentence, e.g. `"A space to explore health datasets."`
- **Visual element:** an abstract, generous illustration or decorative shape using the accent palette — chosen to make the page feel intentional rather than empty.
- This region has no test-id requirements from the spec but must not be omitted; an empty page would feel broken.

---

## 4. States

Every view defines the following states explicitly.

### 4.1 Home page (`/`)

| State | Trigger | Presentation |
|---|---|---|
| **Default / Ready** | Page loads successfully | TopBar visible with title and disabled dataset selector; hero content rendered. This is the only runtime state in this release. |
| **Loading** | Initial hydration | Since the app is a static export, first paint already shows TopBar and hero. No spinner needed. If hydration is in progress, the dataset selector remains visually identical (disabled), so there is no perceptible loading flash. |
| **Empty** | No dataset selected (always true now) | The dataset selector shows the placeholder label `"Select dataset"`. The main content shows the hero, not a data view. This *is* the canonical empty state for the product. |
| **Error** | Static asset fails to load | Browser-level error; not handled in-app for this release. The TopBar must still render from the initial HTML payload, ensuring the brand is always visible. |
| **Partial data** | Not applicable | No data surface exists yet. |

### 4.2 Dataset selector

| State | Presentation |
|---|---|
| **Disabled (default)** | Greyed but legible; chevron present; tooltip on hover/focus. |
| **Focused** | Visible focus ring; tooltip announced via `aria-describedby`. |
| **Hover** | Subtle background tint change; cursor `not-allowed`. |
| **Enabled** | Out of scope for this release. |

---

## 5. User Flows

### Flow A — First visit to the home page
1. User navigates to `/`.
2. Browser receives a `200` response and renders `index.html` from the static build.
3. User sees the TopBar at the top of the viewport containing:
   - The "Health Playground" wordmark on the left.
   - The disabled dataset selector on the right.
4. User sees the hero content in the main area.
5. No action is required; the page is in its steady "empty/ready" state.

### Flow B — User attempts to use the dataset selector
1. User clicks or focuses the dataset selector.
2. Nothing opens; the tooltip `"Dataset selection coming soon"` appears.
3. Focus remains on the selector. User can Tab away.

### Flow C — Keyboard navigation
1. User presses Tab on page load.
2. Focus moves to the brand wordmark (if interactive as a home link) → then to the dataset selector.
3. Focus indicators are clearly visible on each.
4. Pressing Enter or Space on the disabled selector does nothing; screen reader announces "Dataset selector, coming soon, disabled".

### Flow D — Screen reader landing
1. Screen reader announces the `banner` landmark and reads `"Health Playground"`.
2. Reader then encounters the dataset selector announced as `"Dataset selector, coming soon, disabled"`.
3. Reader proceeds into `main` and reads the hero headline and subhead.

---

## 6. Accessibility Requirements

- **Landmarks:** `<header role="banner">` for the TopBar; `<main>` for content.
- **Color contrast:** All text on the gradient TopBar must meet WCAG AA (≥ 4.5:1 for body text, ≥ 3:1 for large display text). The disabled dataset selector's label must remain ≥ 3:1 against its background.
- **Focus management:** Visible focus ring on every interactive or focusable element; never suppressed.
- **Keyboard:** Full keyboard reachability; Tab order: brand → dataset selector → main content.
- **ARIA:**
  - TopBar: `role="banner"` (implicit via `<header>`).
  - Dataset selector: `aria-label="Dataset selector (coming soon)"`, `aria-disabled="true"`, `aria-describedby` pointing to the tooltip text.
- **Reduced motion:** Any hover/scroll elevation transitions respect `prefers-reduced-motion: reduce`.
- **Screen reader text:** The wordmark element includes an `aria-label` so the brand is read as a coherent phrase, not letter by letter.

---

## 7. Visual Design Notes

- **Palette:** one expressive accent gradient (suggested: teal `#0FB5A3` → indigo `#5B5BD6`) plus a neutral surface (off-white `#FAFAF7`) and a deep ink text colour. Avoids generic Material blue.
- **Typography:** sans-serif system stack for body; a slightly distinctive display face (or heavier weight + tighter tracking) for the wordmark and hero headline.
- **Spacing:** generous TopBar horizontal padding (24px desktop, 16px mobile). Hero region has at least 96px top padding on desktop.
- **Iconography:** a single custom or curated glyph for the brand mark; chevron icon from MUI for the selector.
- **Tone:** confident, calm, a touch experimental — closer to a research tool's landing page than to an enterprise admin shell.

---

## 8. Scenario → UX Mapping

| Gherkin Scenario | UX coverage |
|---|---|
| The application builds as a static site | Out of UX scope (build artifact). No UI implications beyond requiring that the home page renders from static HTML. |
| Home page displays application title in top bar | §3.1 TopBar with "Health Playground" wordmark; §4.1 Default state; Flow A. |
| Top bar contains a placeholder for the dataset selector | §3.2 Dataset Selector nested in TopBar; §4.2 Disabled state; Flow B. |
| GitHub Actions workflow configured for Pages | Out of UX scope (CI/CD). No UI implications. |
| Building with missing dependency fails clearly | Out of UX scope (developer-facing CLI). No UI implications. |

All scenarios with a UI surface are covered by at least one component definition, one state, and one flow.