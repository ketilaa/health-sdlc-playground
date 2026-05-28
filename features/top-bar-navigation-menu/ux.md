# UX Specification: Top Bar Navigation Menu

---

## 1. Overview

This feature adds a navigation menu trigger and a slide-out or dropdown navigation menu to the existing top bar. The menu is hidden by default and revealed when the user activates the trigger. The menu contains a single "Home" item that navigates to the root page (`/`).

This feature is purely additive. It extends the existing top bar (established by `home-page-structure-step-1`) without removing or modifying the title or dataset selector.

---

## 2. Design System Context

The following existing tokens and conventions apply:

| Token / Convention | Source feature | Purpose |
|---|---|---|
| `--color-surface` | `visual-theme-overhaul` | Top bar and menu background |
| `--color-surface-alt` | `visual-theme-overhaul` | Hover/focus background for menu items |
| `--color-text-primary` | `visual-theme-overhaul` | Primary label text |
| `--color-text-muted` | `visual-theme-overhaul` | De-emphasised text |
| `--color-border` | `visual-theme-overhaul` | Borders and dividers |
| `--color-accent` | `visual-theme-overhaul` | Interactive element accent |
| Top bar element | `home-page-structure-step-1` | Horizontal bar at top of page; contains title and dataset selector |
| `content-area` testid | `home-page-structure-step-1` | Main content region below the top bar |

**No new tokens are introduced.** All visual properties reference existing tokens.

---

## 3. Component: Navigation Menu Trigger (`data-testid="nav-menu-trigger"`)

### 3.1 Placement

The trigger is positioned at the **left edge** of the top bar, before the page title. It is always visible regardless of menu open/closed state.

### 3.2 Appearance

The trigger is an icon button rendering a **hamburger menu icon** (three horizontal lines, stacked vertically). It uses no visible text label in its default state.

| Property | Value |
|---|---|
| Icon | Hamburger / menu icon (three lines) |
| Icon size | 24 × 24 px |
| Button size | 40 × 40 px minimum touch target |
| Background (default) | Transparent |
| Background (hover) | `--color-surface-alt` |
| Background (active/pressed) | `--color-surface-alt` with reduced opacity (0.7) |
| Icon colour | `--color-text-primary` |
| Border | None |
| Border radius | 4 px |

### 3.3 Accessibility

- `aria-label="Open navigation menu"` when the menu is closed
- `aria-label="Close navigation menu"` when the menu is open
- `aria-expanded="false"` when menu is closed; `aria-expanded="true"` when open
- `aria-controls="nav-menu"` — references the menu panel by its `id`
- Receives keyboard focus; activatable with Enter or Space
- Focus indicator: 2 px solid `--color-accent` outline with 2 px offset

---

## 4. Component: Navigation Menu Panel (`data-testid="nav-menu"`)

### 4.1 Default State

The menu panel is **not rendered** (or is set to `display: none` / `visibility: hidden` via `aria-hidden="true"`) when the trigger has not been activated. The Gherkin scenario explicitly requires it to be non-visible before trigger activation.

### 4.2 Open State — Appearance

The menu appears as a **vertical dropdown panel** anchored directly below the left edge of the top bar (below and flush with the trigger button). It overlays the page content rather than pushing it down.

| Property | Value |
|---|---|
| `data-testid` | `nav-menu` |
| `id` | `nav-menu` (matches `aria-controls` on trigger) |
| `role` | `menu` |
| `aria-label` | `"Main navigation"` |
| Background | `--color-surface` |
| Border | 1 px solid `--color-border` |
| Border radius | 4 px |
| Box shadow | Subtle elevation — `0 4px 12px rgba(0,0,0,0.15)` |
| Min width | 180 px |
| Max width | 280 px |
| Padding (top/bottom) | 4 px |

### 4.3 Open State — Positioning

- Anchored to the bottom-left of the trigger button
- Appears directly below the top bar
- Z-index above all content (`z-index: 1300` — consistent with modal/overlay layer in MUI)
- At narrow viewports (< 480 px): panel expands to full viewport width, flush with left and right edges

### 4.4 Dismissal

The menu closes when:
1. The user activates the trigger again (toggle)
2. The user presses `Escape`
3. The user clicks outside the menu panel
4. A menu item is activated (navigation occurs)

On close, focus returns to the trigger button (`nav-menu-trigger`).

---

## 5. Component: Menu Item — Home (`data-testid="nav-menu-item-home"`)

### 5.1 Appearance

| Property | Value |
|---|---|
| `data-testid` | `nav-menu-item-home` |
| `role` | `menuitem` |
| Display | Full-width row within the menu panel |
| Layout | Horizontally arranged: icon on the left, label to the right, with an 8 px gap |
| Icon | Home icon (house outline) — 20 × 20 px — `--color-text-muted` |
| Label text | `Home` |
| Label colour | `--color-text-primary` |
| Label typography | Body2 weight — consistent with existing metric label sizing |
| Padding | 10 px vertical, 16 px horizontal |
| Background (default) | Transparent |
| Background (hover) | `--color-surface-alt` |
| Background (focus) | `--color-surface-alt` |
| Background (active/pressed) | `--color-surface-alt` with reduced opacity (0.7) |
| Border radius | 0 (full-width item) |

The element renders the visible text `Home`. The full readable string is `Home` with no prefix character.

### 5.2 Behaviour

- Clicking or pressing Enter/Space on this item navigates to `/` (root page)
- Navigation is client-side (Next.js router)
- The menu closes immediately upon activation
- After navigation, focus moves to the main content area (`content-area`) or the page's primary heading — whichever the routing framework's default focus management produces

### 5.3 Accessibility

- `role="menuitem"` within the `role="menu"` container
- `aria-label` is not required (label text `Home` is descriptive on its own)
- Keyboard navigable via arrow keys within the menu (↑ / ↓ cycle through items; with only one item, both arrows stay on the same item)
- Tab key closes the menu and moves focus forward in the page tab order
- Enter or Space activates the item

---

## 6. UI States

### 6.1 Menu Closed (Default)

- `nav-menu-trigger` is visible in the top bar
- `nav-menu` panel is **not visible** — not present in the visible layout (may be in the DOM with `display: none` or conditional render; must not be detectable as visible by the test)
- `aria-expanded="false"` on trigger

### 6.2 Menu Open

- `nav-menu-trigger` remains visible; `aria-expanded="true"`
- `nav-menu` panel appears as described in Section 4.2
- `nav-menu-item-home` is visible within the panel, showing text `Home`
- Focus moves into the menu panel upon open; first (and only) item receives focus

### 6.3 Home Item Hovered / Focused

- Background of `nav-menu-item-home` becomes `--color-surface-alt`
- Icon colour shifts to `--color-text-primary`
- Cursor changes to `pointer`

### 6.4 Navigation in Progress (after clicking Home)

- Menu closes immediately
- Application navigates to `/`
- `content-area` becomes visible
- No explicit loading indicator is required by the spec (client-side navigation is near-instant)

### 6.5 Loading State (if applicable)

If the application is in a loading state when the menu is triggered, the menu still opens and the "Home" item remains interactive. No skeleton or spinner is shown inside the menu — the menu content is static.

### 6.6 Error / Empty State

The navigation menu has no error state of its own. The "Home" item is always present and always navigable. If the home page itself has an error, that is outside the scope of this feature.

---

## 7. User Flows

### Flow 1 — Menu Not Visible Before Interaction (Scenario 1)

| Step | What the user sees |
|---|---|
| 1 | Application loads at `http://localhost:3000/`. |
| 2 | Top bar is visible: hamburger trigger on the left, page title, dataset selector on the right. |
| 3 | No menu panel is visible. The element `nav-menu` is absent from the visible layout. |

### Flow 2 — Opening the Navigation Menu (Scenario 2)

| Step | What the user sees |
|---|---|
| 1 | User sees the top bar with the hamburger trigger (`nav-menu-trigger`). |
| 2 | User clicks (or presses Enter/Space on) `nav-menu-trigger`. |
| 3 | The `nav-menu` panel appears — a vertical dropdown anchored below the trigger. |
| 4 | The panel is visible and contains at least the "Home" item. |
| 5 | Focus moves to the first item in the panel (`nav-menu-item-home`). |

### Flow 3 — Inspecting Menu Contents (Scenario 3)

| Step | What the user sees |
|---|---|
| 1 | User activates the trigger (as in Flow 2). |
| 2 | `nav-menu` panel is visible. |
| 3 | `nav-menu-item-home` is visible inside the panel. |
| 4 | The element displays the text `Home`. |

### Flow 4 — Navigating Home via Menu (Scenario 4)

| Step | What the user sees |
|---|---|
| 1 | User activates the trigger (as in Flow 2). |
| 2 | `nav-menu` panel is open with `nav-menu-item-home` visible. |
| 3 | User clicks (or presses Enter/Space on) `nav-menu-item-home`. |
| 4 | Menu closes. |
| 5 | Application navigates to `/`. |
| 6 | The main content area (`data-testid="content-area"`) is visible on the page. |

---

## 8. Top Bar Layout Integration

The updated top bar layout from left to right:

```
[ nav-menu-trigger (hamburger) ] [ Page Title ] ··· [ Dataset Selector ]
```

The trigger is the leftmost element. The page title and dataset selector remain in their established positions. No existing top bar elements are repositioned or removed.

The trigger button is vertically centred within the top bar height. A gap of 8–12 px separates the trigger from the page title.

---

## 9. Accessibility Requirements

| Requirement | Detail |
|---|---|
| Trigger `aria-label` | Dynamic: `"Open navigation menu"` (closed) / `"Close navigation menu"` (open) |
| Trigger `aria-expanded` | `"false"` when closed; `"true"` when open |
| Trigger `aria-controls` | Value equals the `id` of the menu panel (`nav-menu`) |
| Menu panel `role` | `menu` |
| Menu panel `aria-label` | `"Main navigation"` |
| Menu item `role` | `menuitem` |
| Keyboard: open | Enter or Space on trigger |
| Keyboard: close | Escape closes menu; focus returns to trigger |
| Keyboard: navigate items | ↑ / ↓ arrow keys cycle through items |
| Keyboard: activate item | Enter or Space |
| Keyboard: Tab | Closes menu; moves focus to next focusable element in page order |
| Focus management on open | First menu item (`nav-menu-item-home`) receives focus automatically |
| Focus management on close | Focus returns to `nav-menu-trigger` |
| Click outside to close | Clicking outside `nav-menu` and `nav-menu-trigger` closes the menu |
| Colour is not sole differentiator | Hover/focus state uses background colour change AND (optionally) a left border accent — never colour alone |
| Contrast | All text and icon colours must meet WCAG AA (4.5:1 for text, 3:1 for UI components) against `--color-surface` |
| Screen reader announcement | When menu opens, screen reader announces panel with its `aria-label`; when navigating to item, screen reader reads item label `"Home"` |
| Touch target | Trigger button: minimum 40 × 40 px. Menu item: minimum 44 px tall |

---

## 10. Gherkin Scenario → UI State / Flow Mapping

| Gherkin Scenario | UI Element / State | Flow |
|---|---|---|
| Scenario 1: Menu not visible before trigger is activated | `nav-menu` absent from visible layout (State 6.1) | Flow 1 |
| Scenario 2: Clicking trigger opens the menu | Trigger click → `nav-menu` panel visible (State 6.2) | Flow 2 |
| Scenario 3: Open menu contains a "Home" item with text "Home" | `nav-menu-item-home` visible, text = `Home` (State 6.2) | Flow 3 |
| Scenario 4: Selecting "Home" navigates to root page | Click `nav-menu-item-home` → `content-area` visible (State 6.4) | Flow 4 |

All 4 Gherkin scenarios are covered.

---

## 11. Out of Scope

- Additional navigation items beyond "Home" — not specified in the Gherkin
- Animated open/close transitions — not specified
- Mobile-specific drawer or full-screen overlay — not specified (dropdown panel is sufficient)
- Active/selected state highlighting for current route — not specified
- Sub-menus or nested navigation — not specified
- Persisting open/closed state across page loads — not specified