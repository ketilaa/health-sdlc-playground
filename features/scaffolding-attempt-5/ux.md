# UX Specification — Health Playground Scaffolding

## 1. Overview

This feature establishes the visual and structural foundation of the Health Playground application. The scaffolding consists of a persistent top bar containing the application's identity (title) and a reserved area for a future dataset selector. The home page serves as the landing surface, and unknown routes display a friendly not-found state.

The design intent is to feel modern, calm, and slightly experimental — leaning on generous spacing, a single accent color, and clear hierarchy rather than dense dashboard chrome.

---

## 2. Information Architecture

```
App Shell
├── Top Bar (persistent across all routes)
│   ├── App Title ("Health Playground")
│   └── Dataset Selector Placeholder (reserved slot, right-aligned)
└── Main Content Area
    ├── Home (/) — Welcome surface
    └── Not Found (any unknown route) — 404 surface
```

The top bar is part of the global layout and appears on every route, including the 404 page.

---

## 3. Global Layout

### 3.1 App Shell
- **Structure:** Fixed-height top bar at the top of the viewport; main content area fills the remaining vertical space below.
- **Background:** Soft neutral surface (light mode default). Subtle gradient or single tinted color to break the "default white" feel.
- **Width:** Top bar spans full viewport width. Main content is centered with a max content width (~1200px) and comfortable horizontal padding.

### 3.2 Top Bar (`data-testid="top-bar"`)
- **Component basis:** MUI `AppBar` with `Toolbar` inside.
- **Height:** ~64px on desktop, ~56px on mobile.
- **Elevation:** Flat (no drop shadow) with a 1px bottom border in a low-contrast neutral, OR a very subtle elevation. Choose flat to feel modern.
- **Layout (left → right):**
  1. **App title** — "Health Playground" — left-aligned, with comfortable left padding (24px desktop, 16px mobile).
     - Typography: MUI `Typography` variant `h6` or equivalent, semi-bold weight, slightly tightened letter-spacing.
     - Color: Primary text color, high contrast against the bar background.
     - Optional: a small decorative mark (e.g., a colored dot or minimalist icon) to the left of the text to add visual personality. This is decorative only and must be marked `aria-hidden`.
  2. **Flexible spacer** — pushes the placeholder to the right edge.
  3. **Dataset selector placeholder** (`data-testid="dataset-selector-placeholder"`) — right-aligned, with comfortable right padding.
     - Visual: A non-interactive, disabled-looking control suggesting a future dropdown. E.g., a pill/chip-shaped container with the muted label "Dataset" and a chevron-down icon, all in a low-contrast/disabled style.
     - Component basis: MUI `Chip` or a `Box` styled as a disabled `Select`. Must be present in the DOM and visible.
     - State: Visually inert (no hover, no focus ring, not in tab order). It is a placeholder only.
     - Accessibility: `aria-hidden="false"` but `aria-disabled="true"`; screen reader text reads "Dataset selector (coming soon)" via an `aria-label` or visually hidden helper text.

- **Top bar accessibility:**
  - Top bar element has `role="banner"` (implicit if using `<header>`).
  - App title is the page's primary brand text; it is **not** a heading (since each page provides its own `<h1>`), but is reachable by screen readers as part of the banner landmark.

### 3.3 Main Content Area
- **Component basis:** MUI `Container` with `maxWidth="lg"`.
- **Padding:** Generous top padding (48–64px on desktop) to let content breathe below the bar.
- **Focus management:** On route change, focus moves to the main heading of the new page (programmatic focus via `tabIndex={-1}` on the `<h1>`).

---

## 4. Page: Home (`/`)

### 4.1 Purpose
Confirms the application is running and introduces Health Playground. At this scaffolding stage, content is intentionally minimal but visually intentional — not a blank page.

### 4.2 Layout
- **Main heading (`<h1>`):** A welcoming phrase such as "Welcome to Health Playground."
  - Typography: Large display variant (MUI `Typography` `h3`–`h4`), with relaxed line-height.
  - Receives focus on initial load.
- **Supporting subtext:** A short one-line description, e.g., "An exploratory space for health data." Muted color, smaller size.
- **Visual anchor:** A single decorative element to set tone — e.g., a soft colored shape, abstract illustration, or oversized typographic accent — positioned to the side or behind the heading. Marked `aria-hidden="true"`.
- **No primary CTA** at this stage (scaffolding only). Reserved vertical space below for future content.

### 4.3 States

| State | Trigger | Appearance |
|---|---|---|
| **Default (success)** | Page loads, HTTP 200 | Heading + subtext + decorative anchor rendered as above. Top bar visible. |
| **Loading** | Initial render before hydration | Top bar visible immediately (server-rendered). Main content area shows a skeleton: a wide rectangular shimmer where the heading will be, and a narrower one for the subtext. Skeleton uses MUI `Skeleton` components. |
| **Empty** | N/A at this stage | The home page itself is the "empty/welcome" state by design; no separate empty treatment needed. |
| **Error** | Unexpected runtime error in the home page | Fallback within the main content area: an icon, the message "Something went wrong loading this page.", and a "Reload" text button. Top bar remains visible. The error state must not crash the top bar. |

### 4.4 Accessibility
- `<h1>` is the first focusable element in the main region after the banner.
- Decorative elements have `aria-hidden="true"`.
- Color contrast for all text meets WCAG AA (4.5:1 for body, 3:1 for large text).

---

## 5. Page: Not Found (unknown route, e.g. `/this-route-does-not-exist`)

### 5.1 Purpose
Communicates clearly that the requested page does not exist while keeping the user oriented within the app. The HTTP response is 404.

### 5.2 Layout
- **Top bar:** Visible as on all other pages (identical content and behavior).
- **Main content area:**
  - **Visual indicator:** A large, expressive 404 treatment — oversized "404" numerals as a typographic centerpiece, in the primary accent color at low opacity, OR an abstract "lost" illustration. Marked `aria-hidden="true"`.
  - **Main heading (`<h1>`):** "Page not found."
  - **Supporting text:** "The page you're looking for doesn't exist or has been moved."
  - **Primary action:** A button labeled "Go to home" that navigates to `/`. Component: MUI `Button` variant `contained`.
  - Layout is centered vertically and horizontally within the main area, with generous whitespace.

### 5.3 States

| State | Trigger | Appearance |
|---|---|---|
| **Default** | Unknown route requested, server returns 404 | As described above. |
| **Loading** | Brief render delay | Top bar visible; main area shows a centered skeleton block. |

### 5.4 Accessibility
- The `<h1>` "Page not found." receives focus on load.
- "Go to home" button is keyboard-reachable via `Tab`, activatable via `Enter` / `Space`.
- Decorative 404 numerals are hidden from screen readers.
- Page `<title>` is set to "Page not found — Health Playground" so the browser tab and screen reader announce the error context.

---

## 6. User Flows

### Flow A: First-time visit to home
1. User navigates to the app root URL.
2. Server responds with HTTP 200 and renders the page.
3. User immediately sees the top bar (with title and dataset selector placeholder) and the home page heading.
4. Focus lands on the `<h1>`.
5. End state: User is on the home page.

**Mapped Gherkin:** "Home page is served successfully", "Top bar displays the application title and a dataset selector placeholder".

### Flow B: Hitting an unknown URL
1. User navigates to a URL that does not match any defined route (e.g., `/this-route-does-not-exist`).
2. Server responds with HTTP 404 and renders the Not Found page.
3. User sees the top bar (unchanged) and the 404 surface with heading, message, and a "Go to home" button.
4. Focus lands on the `<h1>` "Page not found."
5. User presses `Tab` → focus moves to "Go to home". User presses `Enter`.
6. User is navigated to `/` and Flow A's end state is reached.

**Mapped Gherkin:** "Unknown route returns 404".

### Flow C: Developer / CI build verification (no UI surface)
1. Developer or CI runs `npm run build`.
2. Build completes with exit code 0.
3. No UI rendered for this flow; it is a tooling outcome.

**Mapped Gherkin:** "Production build succeeds". *(No UX surface required — purely a build outcome. Listed here for completeness of scenario coverage.)*

---

## 7. Scenario → UX Coverage Matrix

| Gherkin Scenario | UX Coverage |
|---|---|
| Production build succeeds | Flow C (no UI surface; build tooling) |
| Home page is served successfully | Flow A; §4 Home page Default state |
| Top bar displays the application title and a dataset selector placeholder | §3.2 Top Bar (App title + Dataset selector placeholder) |
| Unknown route returns 404 | Flow B; §5 Not Found page |

Every scenario maps to at least one UX surface or flow.

---

## 8. Visual Design Notes

- **Color palette:**
  - Background: soft off-white (light mode), e.g., a very pale neutral with a hint of warmth.
  - Primary accent: a confident, slightly unconventional hue (e.g., a deep teal, indigo, or coral) — used sparingly for the title accent mark, primary buttons, and decorative 404 numerals.
  - Text: near-black for primary, muted gray for secondary.
- **Typography:**
  - Use MUI's default theme typography but bump the display sizes slightly for headings to feel expressive.
  - Tighten letter-spacing on display headings; relax line-height.
- **Spacing:** Use an 8px base grid. Favor large gaps (48–64px) between sections to feel airy.
- **Motion:** Subtle fade-in (~200ms) on initial content render. No motion on the top bar.
- **Dark mode:** Out of scope for this scaffolding feature but should not be precluded by component choices.

---

## 9. Accessibility Summary

- **Landmarks:** `<header>` (top bar / banner), `<main>` (content area).
- **Headings:** Exactly one `<h1>` per page.
- **Keyboard navigation:** All interactive elements reachable via `Tab`; visible focus rings using MUI default focus styles (do not remove).
- **Screen reader text:** Dataset selector placeholder announces "Dataset selector (coming soon)".
- **Focus management:** On page load and route change, focus moves to the page's `<h1>`.
- **Color contrast:** WCAG AA minimum for all text and meaningful UI.
- **Decorative elements:** All marked `aria-hidden="true"`.
- **Page titles:** Each route sets a descriptive `<title>` ("Health Playground" for home, "Page not found — Health Playground" for 404).

---

## 10. Responsive Behavior

- **Desktop (≥900px):** Top