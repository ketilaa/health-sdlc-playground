# UX Specification — Health Playground Scaffolding

## 1. Purpose and Scope

This specification covers the initial scaffolding of the Health Playground application. The visible surface area is small: a single home page (`/`) with a persistent top bar, plus a 404 page for unknown routes. The design must establish the visual foundation (color, typography, spatial rhythm) that subsequent features will build on, while remaining intentionally minimal in functionality.

The feature delivers:
- A persistent top bar with the app title and a reserved slot for a future dataset selector.
- A home page body that signals the app is ready and points toward upcoming functionality.
- A 404 page for unknown routes.

## 2. Design Language

### 2.1 Visual tone
- **Mood:** Clinical-but-warm. The app explores health data, so the palette leans calm and trustworthy, but a single accent color injects energy to avoid the sterile-dashboard trap.
- **Component library:** MUI. Use `AppBar`, `Toolbar`, `Typography`, `Container`, `Box`, `Skeleton`, and `Button` primitives.
- **Density:** Comfortable, not compact. Generous vertical breathing room (`spacing(3)`–`spacing(6)`) on the home page.

### 2.2 Color
- **Primary:** A deep teal (e.g. MUI `teal[700]`-equivalent) — calm, medical, distinct from generic SaaS blue.
- **Accent:** A warm coral or amber for interactive highlights and the dataset-selector placeholder pulse (so users instantly notice where future interactivity will live).
- **Surface:** Off-white background (`#FAFAF7`) so the top bar's tinted surface reads as a clear horizontal band.
- **Top bar:** Filled with primary color, white foreground text. Elevation 2 (subtle shadow to separate from page content).

### 2.3 Typography
- **App title ("Health Playground"):** Display-weight, slightly oversized for an AppBar title — `h6` weight 600, letter-spacing tightened. Conveys identity, not just a label.
- **Body text:** MUI default (`body1`, `body2`) for any home-page copy.

## 3. Layout

### 3.1 Global frame (applies to every route)
```
┌──────────────────────────────────────────────────────────┐
│  TOP BAR  [Title]                  [Dataset placeholder] │  ← AppBar, fixed top
├──────────────────────────────────────────────────────────┤
│                                                          │
│                     PAGE CONTENT                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
- The top bar is rendered on every route, including the 404 page, so the app feels like one continuous product.
- Page content sits inside a centered `Container` (max-width `lg`) with top padding equal to AppBar height + `spacing(4)`.

### 3.2 Top bar internal layout
- **Left zone:** App title.
- **Right zone:** Dataset selector placeholder.
- **Spacing:** Title and placeholder pushed to opposite ends of the Toolbar using `flex: 1` spacer between them. Horizontal padding `spacing(3)` on both sides.

## 4. Components

### 4.1 TopBar
- **Element:** MUI `AppBar` (position `static`), containing a `Toolbar`.
- **`data-testid`:** `top-bar` on the root AppBar element.
- **Contents (left → right):**
  1. **Title block**
     - Text: exactly `Health Playground` (case-sensitive, no trailing whitespace).
     - Rendered as `Typography variant="h6"`, `component="h1"`.
     - Visible (not visually hidden, not clipped).
  2. **Flex spacer** (no test id, no content).
  3. **Dataset selector placeholder** — see 4.2.

### 4.2 Dataset Selector Placeholder
- **`data-testid`:** `dataset-selector-placeholder`.
- **DOM placement:** Nested inside the element with `data-testid="top-bar"` (descendant, not sibling).
- **Visual treatment:**
  - A pill-shaped MUI `Skeleton` (variant `rounded`, width ~180px, height 36px) with a subtle accent-tinted shimmer.
  - Tooltip on hover: `Dataset selector — coming soon`.
  - `aria-label`: `Dataset selector placeholder, not yet available`.
  - `role="presentation"` is **not** used; the placeholder should be discoverable by assistive tech so users understand the reserved space.
  - Non-interactive: no click handler, no focus ring, `tabIndex={-1}`.
- **Rationale:** A skeleton communicates "future content here" more clearly than an empty box or disabled select, and avoids implying a broken control.

### 4.3 Home Page Body (`/`)
The Gherkin spec does not require specific body content, but the page must render something coherent.
- **Hero block** centered in the container:
  - `Typography variant="h3"`: `Welcome to Health Playground`.
  - `Typography variant="body1"` (muted color): `A space to explore health datasets. Pick a dataset from the top bar once one is available.`
  - Optional decorative element: a soft, low-contrast SVG illustration or a subtle gradient panel — kept under `spacing(40)` height so it does not dominate.
- **No interactive controls** in this scaffolding pass.

### 4.4 404 Page (`/this-route-does-not-exist` and any unmatched route)
- Top bar remains visible and identical to home.
- Body:
  - `Typography variant="h2"`: `404`.
  - `Typography variant="h5"`: `We couldn't find that page.`
  - `Typography variant="body2"` (muted): `The route you requested doesn't exist yet.`
  - MUI `Button variant="contained"` labeled `Back to home`, links to `/`.
- HTTP response status: **404** (handled by Next.js `not-found` mechanism; UX requirement is that the server actually returns 404, not just a styled page on a 200 response).

## 5. UI States

Even a scaffolding feature must declare states explicitly.

### 5.1 Home page (`/`)
| State | When it occurs | What the user sees |
|---|---|---|
| **Initial render / steady** | Page loads successfully | Top bar + hero block. This is effectively the only state for this feature. |
| **Loading** | Brief moment before hydration | Top bar renders server-side and is immediately visible. Hero text is server-rendered too — no skeleton needed for body. Dataset selector placeholder is itself a skeleton, so it visually represents its own "loading-forever-until-built" state. |
| **Error (server)** | Server fails to render | Falls back to default Next.js error boundary; user sees a generic error page with top bar absent. (Not directly tested by this feature, but declared so future work knows the boundary.) |
| **Empty** | N/A — there is no data to be empty of in this scaffold. | — |

### 5.2 404 page
| State | When it occurs | What the user sees |
|---|---|---|
| **Default** | Any unmatched route | Top bar + 404 body block + "Back to home" button. |

### 5.3 Top bar (across all pages)
| State | When it occurs | What the user sees |
|---|---|---|
| **Steady** | Always, on every route | Filled primary AppBar with title (left) and skeleton placeholder (right). |
| **Narrow viewport (<600px)** | Mobile widths | Title remains visible, placeholder shrinks to ~120px width but remains present and identifiable. Both elements stay on a single row; no wrap, no collapse into a menu (out of scope for scaffolding). |

## 6. User Flows

### Flow A — First-time visit to home
1. User navigates to `/`.
2. Server returns HTML with status 200.
3. Browser paints: top bar (teal band) appears with `Health Playground` on the left and a shimmering pill on the right.
4. Below the bar, the hero greeting fades in (CSS transition, `opacity` 0 → 1 over 200ms — optional polish, not required by spec).
5. User reads the welcome message. No interactive affordances; user can hover the placeholder to see the "coming soon" tooltip.

### Flow B — Visit to an unknown route
1. User navigates to `/this-route-does-not-exist` (or any other unmatched path).
2. Server returns HTML with status 404.
3. Browser paints: top bar identical to home, then 404 body block.
4. User clicks `Back to home` → navigated to `/`, Flow A resumes.

### Flow C — Build/serve (developer-facing, no UI)
This is a developer-facing flow with no UI surface, but it shapes the others:
1. Developer runs `npm run build`. Build completes with exit code 0.
2. Developer starts the app. The app serves `/` with status 200 and unknown routes with status 404.

## 7. Accessibility

### 7.1 Landmarks
- Top bar wrapped in a `header` landmark (`AppBar` defaults to `<header>`).
- Page content wrapped in a `main` landmark.
- 404 page's body content also inside `main`.

### 7.2 Headings
- The app title `Health Playground` is the `h1` of every page (rendered via `Typography component="h1"` inside the AppBar).
- Home page hero uses `h2` for `Welcome to Health Playground` (downgraded from `h3` styling to keep visual hierarchy while preserving semantic order). *Judgement call: visual size and semantic level diverge here; if this conflicts with engineering preference, prefer semantic correctness over visual scale.*
- 404 page uses `h2` for `404` and `h3` for the sub-message.

### 7.3 Keyboard
- Tab order on home: `Back to home` button only appears on 404, so home has no focusable elements in this scaffold. This is acceptable; focus remains on `body`.
- The dataset selector placeholder is **not** focusable (`tabIndex={-1}`) because it is not yet a real control. Including it in tab order would mislead keyboard users.
- 404 page: `Back to home` button is the first and only focusable element; receives focus on page load via `autoFocus`.

### 7.4 Screen readers
- App title is announced as a level-1 heading on every page.
- Dataset selector placeholder is announced via its `aria-label`: `Dataset selector placeholder, not yet available`. This prevents confusion about an unlabeled skeleton.
- Decorative shimmer animation respects `prefers-reduced-motion: reduce` — animation is replaced with a static muted background.

### 7.5 Contrast
- Top bar foreground (white) on primary teal must meet WCAG AA (≥4.5:1 for normal text, ≥3:1 for large). Deep teal at `teal[700]` satisfies this with white text.
- Muted body copy uses MUI `text.secondary`, which meets AA on the off-white surface.

## 8. Mapping: Gherkin Scenarios → UX Coverage

| Gherkin scenario | UX artifact that satisfies it |
|---|---|
| The application builds successfully | Flow C (no UI). |
| The home page is served successfully | Flow A; Home page section 4.3; state 5.1 "Initial render". |
| The top bar displays the application title | Component 4.1 TopBar; required text `Health Playground`; `data-testid="top-bar"`. |
| The top bar contains a placeholder for the future dataset selector | Component 4.2 Dataset Selector Placeholder; `data-testid="dataset-selector-placeholder"` nested inside `top-bar`. |
| Requesting a non-existent route returns a 404 | Flow B; 404 page section 4.4; server must return HTTP 404. |

## 9. Edge Cases Addressed

- **Unknown route returns styled 404, not a generic blank page** → 404 page in 4.4.
- **Top