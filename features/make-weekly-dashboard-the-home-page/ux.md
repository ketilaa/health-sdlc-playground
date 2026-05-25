# UX Specification: Make Weekly Dashboard the Home Page

## Overview

This feature establishes the Weekly Dashboard as the application's root (`/`) page, removes the Training Overview component, implements a permanent redirect from `/weekly-dashboard` to `/`, and ensures the dashboard is usable on narrow (mobile) viewports. A 404 state is defined for unrecognised routes.

---

## 1. Route & Navigation Architecture

### 1.1 Route Map

| URL | Behaviour | End State |
|---|---|---|
| `/` | Renders Weekly Dashboard directly | Weekly Dashboard page |
| `/weekly-dashboard` | Issues HTTP 308 → redirects to `/` | Weekly Dashboard page |
| `/non-existent-route` (or any unknown path) | Returns HTTP 404 | 404 Error page |

### 1.2 Redirect Experience (Scenario 3 & 4)

- When a user navigates to `/weekly-dashboard`, the browser transparently follows the 308 redirect.
- No loading state or redirect notice is shown; the transition is invisible to the user.
- The browser's address bar settles on `http://localhost:3000/` after the redirect completes.
- The page content shown is identical to directly visiting `/`.

---

## 2. Weekly Dashboard Page (`/`)

### 2.1 Page Identity

- **Page title (browser tab):** "Weekly Dashboard"
- **Primary heading (H1):** "Weekly Dashboard" — visible in the page body, satisfying the text-visibility assertion.
- **`data-testid`:** The outermost container element carries `data-testid="weekly-dashboard-container"`.

### 2.2 Layout — Default (≥ 391 px wide)

```
┌─────────────────────────────────────────┐
│  [App Shell / Navigation Bar]           │
├─────────────────────────────────────────┤
│                                         │
│  Weekly Dashboard          [H1]         │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Card 1   │  │ Card 2   │  │ Card 3│ │
│  └──────────┘  └──────────┘  └───────┘ │
│                                         │
│  [Additional dashboard content…]        │
│                                         │
└─────────────────────────────────────────┘
```

- The `weekly-dashboard-container` spans the full available width inside the app shell.
- Content uses a responsive grid or flex layout that reflows to a single column on narrow viewports.
- No element within `weekly-dashboard-container` should be wider than the viewport, preventing a horizontal scrollbar.

### 2.3 Layout — Narrow Viewport (390 × 844 px, Scenario 6)

```
┌──────────────────┐  (390 px)
│ [Nav Bar]        │
├──────────────────┤
│                  │
│ Weekly Dashboard │  ← H1, font scales down if needed
│                  │
│ ┌──────────────┐ │
│ │   Card 1     │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │   Card 2     │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │   Card 3     │ │
│ └──────────────┘ │
│                  │
└──────────────────┘
```

- All cards and containers stack vertically; none exceed 390 px in width.
- Horizontal overflow is `hidden` or content is constrained so `document.documentElement.scrollWidth` equals `window.innerWidth` at 390 px.
- Text does not overflow or clip; wrapping is permitted.
- Touch targets remain ≥ 44 × 44 px on narrow viewports.

### 2.4 UI States

#### 2.4.1 Loading State
- Shown while the Weekly Dashboard's data is being fetched (if any async data exists).
- Display skeleton loaders inside `weekly-dashboard-container` in place of cards/charts.
- The H1 "Weekly Dashboard" remains visible during loading — it is not replaced.
- A visually hidden live region (`aria-live="polite"`) announces "Loading Weekly Dashboard" to screen readers.
- `data-testid="weekly-dashboard-container"` is present in the DOM during loading.

#### 2.4.2 Loaded / Success State
- Full dashboard content is visible.
- H1 "Weekly Dashboard" is present and visible.
- `data-testid="weekly-dashboard-container"` wraps all content.
- No element with `data-testid="training-overview"` is present anywhere in the DOM.

#### 2.4.3 Error State
- Shown if dashboard data fails to load.
- Display an inline error message within `weekly-dashboard-container` (e.g., "Unable to load dashboard data. Please try again.").
- Provide a "Retry" action button.
- H1 "Weekly Dashboard" remains visible.
- Error message container has `role="alert"` so screen readers announce it immediately.

#### 2.4.4 Empty State
- Shown if the dashboard has no data to display (e.g., no activities logged).
- Display a contextual empty-state illustration or icon with a short message (e.g., "No activity this week. Start logging your training.").
- H1 "Weekly Dashboard" remains visible.
- `data-testid="weekly-dashboard-container"` remains present.

---

## 3. Removed Component: Training Overview

### 3.1 Absence Contract

- No element with `data-testid="training-overview"` appears anywhere in the DOM at `/`.
- No navigation link, tab, or menu item references "Training Overview" as a destination (it no longer exists as a route or component).
- The file `frontend/src/components/TrainingOverview.tsx` does not exist; there is no UI surface for it.

### 3.2 Impact on Navigation

- If any previous navigation item pointed to a Training Overview page, that item is removed from all menus, sidebars, and breadcrumb trails.
- No orphaned links remain that would navigate to a Training Overview destination.

---

## 4. 404 Error Page (Scenario 7)

### 4.1 Page Identity

- **Page title (browser tab):** "Page Not Found"
- **HTTP status returned:** 404
- Rendered for any route not explicitly handled by the router (e.g., `/non-existent-route`).

### 4.2 Layout

```
┌─────────────────────────────────────────┐
│  [App Shell / Navigation Bar]           │
├─────────────────────────────────────────┤
│                                         │
│         404                  [large]    │
│         Page Not Found       [H1]       │
│                                         │
│  The page you're looking for doesn't    │
│  exist.                                 │
│                                         │
│  [ Go to Dashboard ]   ← primary CTA   │
│                                         │
└─────────────────────────────────────────┘
```

### 4.3 UI Elements

| Element | Type | Purpose |
|---|---|---|
| "404" | Display text / decorative | Visual signal, not the H1 |
| "Page Not Found" | H1 | Semantic heading, screen reader primary heading |
| Explanatory paragraph | Body text | Brief, plain-language explanation |
| "Go to Dashboard" button | MUI `Button` variant="contained" | Primary CTA navigating to `/` |

### 4.4 Accessibility

- H1 is "Page Not Found" — the large "404" numeral is decorative (`aria-hidden="true"` or wrapped in a `<p>` with no heading role).
- "Go to Dashboard" button receives focus on page load (focus management after route change).
- `role="main"` on the content area.

---

## 5. Component Inventory

| Component | MUI Base | `data-testid` | Notes |
|---|---|---|---|
| Weekly Dashboard container | `Box` or `Container` | `weekly-dashboard-container` | Outermost wrapper; no horizontal overflow |
| Page H1 heading | `Typography variant="h1"` | — | Text: "Weekly Dashboard" |
| Dashboard cards | `Card` | Per card (not specified here) | Reflow to single column at 390 px |
| Skeleton loaders | `Skeleton` | — | Loading state only |
| Error alert | `Alert severity="error"` | — | `role="alert"` |
| Retry button | `Button variant="outlined"` | — | Inside error alert |
| Empty state container | `Box` | — | Illustration + message |
| 404 page container | `Box` | — | `role="main"` |
| 404 CTA | `Button variant="contained"` | — | Links to `/`; auto-focused |

---

## 6. Accessibility Requirements

### 6.1 Keyboard Navigation

- All interactive elements (buttons, links) are reachable via `Tab` key.
- Tab order follows visual reading order (top-to-bottom, left-to-right).
- No keyboard traps.
- On route change (including redirect from `/weekly-dashboard`), focus moves to the main content landmark or the H1.

### 6.2 Screen Reader

- Page `<title>` changes to reflect the current page ("Weekly Dashboard" at `/`, "Page Not Found" at unknown routes).
- H1 is always the first heading in the content area.
- Loading state: `aria-live="polite"` region announces "Loading Weekly Dashboard".
- Error state: `role="alert"` announces error message immediately.
- Redirect: no announcement needed — the browser handles the HTTP redirect transparently before the page renders.

### 6.3 ARIA Labels

| Element | ARIA attribute | Value |
|---|---|---|
| Navigation bar | `role="navigation"` + `aria-label` | "Main navigation" |
| Weekly Dashboard container | `role="main"` | — |
| Loading live region | `aria-live="polite"` + `aria-atomic="true"` | — |
| Error alert | `role="alert"` | — |
| 404 decorative numeral | `aria-hidden="true"` | — |
| 404 "Go to Dashboard" button | `aria-label` (if icon-only) | "Go to Weekly Dashboard home" |

### 6.4 Colour & Contrast

- All text meets WCAG AA contrast ratio (≥ 4.5:1 for body text, ≥ 3:1 for large text).
- Error state does not rely on colour alone — includes an error icon and text label.
- Focus indicators are visible with a minimum 3:1 contrast ratio against adjacent colours.

### 6.5 Responsive / Mobile Accessibility

- At 390 px viewport width, no content is obscured by horizontal overflow.
- Font sizes do not drop below 16 px for body text (to aid readability on mobile).
- Touch targets ≥ 44 × 44 px.

---

## 7. Scenario-to-UI-State Mapping

| Gherkin Scenario | UI State / Flow |
|---|---|
| Scenario 1: Root route renders Weekly Dashboard | Success state of Weekly Dashboard page at `/`; H1 "Weekly Dashboard" visible |
| Scenario 2: Root route does not render Training Overview | Success state; `data-testid="training-overview"` absent from DOM |
| Scenario 3: `/weekly-dashboard` issues 308 redirect | Network-level redirect; no visible UI state (transparent to user) |
| Scenario 4: Browser lands on `/` after following redirect | Same as Scenario 1 — success state with H1 visible; address bar shows `/` |
| Scenario 5: TrainingOverview file deleted | No UI surface exists for Training Overview; no links, tabs, or components reference it |
| Scenario 6: No horizontal overflow at 390 px | Narrow viewport layout (Section 2.3); `weekly-dashboard-container` constrained to 390 px width |
| Scenario 7: Non-existent routes return 404 | 404 Error page (Section 4) |