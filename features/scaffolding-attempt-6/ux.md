# Health Playground — UX Specification

## 1. Overview

This specification defines the UX for the initial scaffolding of the Health Playground application. The scope is intentionally minimal: a persistent top app bar with the product title and a reserved slot for a future dataset selector, a home page surface, and a not-found surface for unknown routes.

The visual language should feel light, data-forward, and slightly playful — hinting at the "playground" nature without being childish. Avoid generic admin-dashboard chrome.

## 2. Information Architecture

Two routable surfaces exist in this scaffold:

| Route | Purpose | UX Surface |
|---|---|---|
| `/` | Home page | Home Surface |
| any unknown path (e.g. `/this-route-does-not-exist`) | Fallback for unmatched routes | Not Found Surface |

Both surfaces share the same persistent App Header.

## 3. Global Elements

### 3.1 App Header (`data-testid="app-header"`)

A persistent top bar present on every routable page.

**MUI components:** `AppBar` (position: fixed or sticky at top) containing a `Toolbar`.

**Layout (left-to-right):**
1. **Brand cluster** (left-aligned)
   - Small decorative mark (e.g. a stylised pulse/heart glyph icon, 24px). Decorative only — `aria-hidden="true"`.
   - Application title text: **"Health Playground"**, rendered as the primary heading of the bar.
2. **Spacer** — flexible region that pushes the next cluster to the right.
3. **Dataset Selector Placeholder** (right-aligned, inside the header).

**Visual treatment:**
- Solid or subtly tinted background that contrasts with the page body.
- Title uses `Typography` variant `h6` (or equivalent), weight 600, with comfortable letter-spacing.
- Single elevation/shadow line (or a 1px divider) separating header from content.

**Accessibility requirements:**
- The `AppBar` exposes `role="banner"` (native landmark).
- The title text is a real heading element (`h1` semantically for the page application name, visually styled as `h6`-equivalent). Exactly one `h1` per page; subsequent surfaces use `h2`+ for their own content.
- The header must remain in the DOM and visible on every routable surface.

### 3.2 Dataset Selector Placeholder (`data-testid="dataset-selector-placeholder"`)

A reserved location *inside* the App Header for a future dataset-switching control. In this scaffold it is a static, non-interactive marker.

**Visual treatment:**
- A muted, dashed-outline pill or rectangle sized roughly to fit a future dropdown (suggested min-width: 180px, height matching toolbar items, e.g. 36px).
- Inside it, low-contrast helper text: "Dataset selector — coming soon" (or similar).
- Reduced opacity (e.g. 60%) to communicate "placeholder" without looking broken.
- Cursor: default (not pointer). Must not look clickable.

**Accessibility requirements:**
- `aria-hidden="false"` (it should be discoverable so its presence is verifiable) but role `note` or `status="off"` to indicate it is informational.
- Not focusable: no `tabindex`, no interactive role. Keyboard tab order skips it.
- Screen reader text inside it should match the visible "coming soon" label.

### 3.3 Document Title

The HTML document title for every routable surface (including Home and Not Found) must be exactly:

> **`Health Playground`**

No suffixes, prefixes, or per-page modifiers in this scaffold.

## 4. Home Surface (`/`)

### 4.1 Purpose
The landing surface. In this scaffold it has no functional content beyond the global header — it exists primarily to confirm the application boots, the header renders, and the title is set.

### 4.2 Layout

Stacked vertically:
1. App Header (see §3.1) — pinned at top.
2. Main content area below the header — a generous, centred container.

### 4.3 Main Content — Default State

Since no domain content is defined yet, the home surface shows a friendly welcome placeholder so the page does not appear empty or broken.

**Elements:**
- Centred vertically and horizontally within the viewport (minus header).
- A large, expressive headline: **"Welcome to the Playground"** (Typography `h4` or `h5`).
- A short supporting line beneath: e.g. *"Pick a dataset and start exploring health data."* (Typography `body1`, muted colour).
- Optional decorative element (e.g. a soft gradient blob, subtle illustration, or animated pulse line) behind the text — purely decorative, `aria-hidden="true"`.

**Note:** This welcome content is *not* asserted by Gherkin scenarios. Designer choice to avoid an empty page; implementation is free to substitute but must not introduce conflicting `data-testid` values or break header tests.

### 4.4 States

| State | Trigger | Presentation |
|---|---|---|
| **Default (success)** | Page loads successfully | Header + welcome content visible. Document title = "Health Playground". |
| **Loading** | Initial paint before hydration | Header skeleton (same dimensions as final header, neutral grey blocks where title and placeholder will appear). No content flash. Document title set as early as possible. |
| **Empty** | N/A in scaffold | The default state IS the empty state for the body. No separate empty treatment. |
| **Error** | Client-side rendering failure | App-level error boundary renders a minimal message: "Something went wrong." with a "Reload" button (MUI `Button` variant `contained`). Header remains visible. |

### 4.5 User Flow

1. User navigates to the site root (`/`).
2. Server responds with HTTP 200.
3. Browser renders the document; title bar shows "Health Playground".
4. App Header appears at top with the title "Health Playground" on the left and the dataset selector placeholder on the right.
5. Main content area below the header shows the welcome headline and supporting line.
6. No interactive controls are present in the scaffold; keyboard focus rests on the document body.

## 5. Not Found Surface (unknown routes)

### 5.1 Purpose
Catch-all for any path that does not match a defined route. Must produce an HTTP 404 status and a human-readable page.

### 5.2 Layout

Stacked vertically:
1. App Header (see §3.1) — identical to home.
2. Main content area showing the not-found message.

### 5.3 Main Content — Not Found State

**Elements:**
- Centred vertically and horizontally.
- Large numeric glyph: **"404"** (Typography `h1` visually, but the semantic page heading should be the message below to avoid duplicating the global `h1`; treat "404" as decorative `aria-hidden="true"`).
- Heading: **"Page not found"** (Typography `h2`).
- Supporting line: *"The page you were looking for doesn't exist."* (Typography `body1`, muted).
- Primary action: MUI `Button` variant `contained`, label **"Go home"**, linking to `/`.

**Visual treatment:**
- Same background palette as home, no alarming colours (no red). Use a softly desaturated accent.
- Optional small decorative element (e.g. a broken/dotted line motif) — `aria-hidden="true"`.

### 5.4 States

| State | Trigger | Presentation |
|---|---|---|
| **Default** | Any unmatched route requested | Header + 404 content visible. HTTP status 404. Document title = "Health Playground". |
| **Loading** | Pre-hydration | Header skeleton + neutral placeholder for body. |
| **Error** | Failure rendering the 404 page itself | Fallback to plain-text "404 — Page not found" served by the platform; header may be absent. |

### 5.5 Accessibility
- The "Go home" button is keyboard-focusable and is the first focusable element in the main content area after the header.
- Focus management: when the not-found page mounts, focus moves to the `h2` "Page not found" (with `tabindex="-1"`) so screen reader users are informed of the route change.
- Button has an accessible name matching its visible label.

### 5.6 User Flow

1. User navigates to a path that does not exist (e.g. `/this-route-does-not-exist`).
2. Server responds with HTTP 404.
3. Browser renders the not-found surface.
4. Document title remains "Health Playground".
5. App Header renders normally at the top.
6. Main content shows the 404 glyph, "Page not found" heading, supporting line, and "Go home" button.
7. User can press Tab to focus the "Go home" button (it is the only interactive element on the page besides any focusable header items — none in this scaffold).
8. Activating "Go home" (click or Enter/Space) navigates to `/`.

## 6. Responsive Behaviour

| Breakpoint | App Header | Main Content |
|---|---|---|
| **Desktop (≥ 900px)** | Full layout: brand + title left, placeholder right with comfortable padding. | Centred container, max-width ~960px. |
| **Tablet (600–899px)** | Same layout, reduced horizontal padding. Placeholder may shrink min-width to 140px. | Centred, full-width with side padding. |
| **Mobile (< 600px)** | Title remains left. Placeholder shrinks to a compact pill (min-width 100px) but stays visible and inside the header. Decorative brand glyph may hide if space-constrained. | Stacked, full-width with 16px side padding. |

The placeholder must remain inside the App Header at all breakpoints (required by spec).

## 7. Accessibility Summary

- **Landmarks:** `banner` (header), `main` (content area on each surface).
- **Headings:** One `h1` per page — the application title in the header acts as the page-level `h1` in this scaffold (acceptable because no other page-specific title competes). Sub-content uses `h2` and below.
- **Keyboard navigation:**
  - Tab order on Home: skip-to-main link (optional) → no interactive header elements → no interactive body elements.
  - Tab order on Not Found: skip-to-main link (optional) → "Go home" button.
- **Focus indicators:** Use MUI default visible focus rings; do not suppress.
- **Screen reader text:**
  - Decorative icons and blobs: `aria-hidden="true"`.
  - Placeholder: discoverable with text content "Dataset selector — coming soon" (or chosen equivalent).
- **Colour contrast:** All text against its background must meet WCAG AA (4.5:1 for body, 3:1 for large text). Placeholder muted text must still meet 4.5:1.
- **Motion:** Any decorative animation must respect `prefers-reduced-motion` and become static.

## 8. Scenario → UI Mapping

| Gherkin Scenario | UI State / Flow |
|---|---|
| Home page responds successfully (GET `/` → 200) | §4 Home Surface, §4.4 Default state. Server returns 200. |
| Home page displays the application title in the top bar | §3.1 App Header renders with `data-testid="app-header"` containing the text "Health Playground". |
| Home page reserves a location for the future dataset selector | §3.2 Dataset Selector Placeholder with `data-testid="dataset-selector-placeholder"` rendered inside the element carrying `data-testid="app-header"`. |
| Document title is set to the application name | §3.3 Document title = "Health Playground" on all surfaces, including Home. |
| Unknown routes return a not-found response | §5 Not Found Surface with HTTP 404 status code. |

Every scenario maps to at least one defined state or flow above.

## 9. Out of Scope (Explicit Non-Goals)

- Behaviour of the dataset selector (interaction, options, selection state) — placeholder only.
- Authentication, user identity, navigation menus.
- Routing beyond `/` and the