## Outer Iteration 1 — TDD Attempt 1

# Developer Summary — top-bar-navigation-menu

## Status
OK

## Input Summary
Feature: `top-bar-navigation-menu` — adds a hamburger menu trigger and dropdown navigation panel to the existing top bar. 4 Gherkin scenarios:
1. Navigation menu not visible before trigger activation
2. Clicking trigger opens menu
3. Open menu contains "Home" item with text "Home"
4. Clicking "Home" navigates to root page and shows `content-area`

UX spec specifies: hamburger trigger at left of top bar, dropdown panel with `role="menu"`, Home item with `role="menuitem"`, full ARIA wiring, keyboard navigation, focus management, color token usage.

## Assumptions
- The implementation already existed in `frontend/src/components/HomePage.tsx` — the nav menu trigger, panel, and Home item were all implemented in a prior iteration
- The test file `frontend/src/components/HomePage.test.tsx` already covered all 4 Gherkin scenarios
- `aria-expanded` with boolean `false` in JSX renders as `aria-expanded="false"` in the DOM — RTL's `toHaveAttribute('aria-expanded', 'false')` correctly asserts this
- The nav menu panel uses conditional rendering (`{isNavOpen && ...}`) so it is not in the DOM at all when closed, satisfying Scenario 1's "not visible" requirement
- `mockPush` from the `next/navigation` mock captures the router call on Home item click

## Decisions
- **Scope: frontend** — all behavior is UI-only; no backend required
- **Implementation location: `HomePage.tsx`** — nav menu is inline in the home page component, consistent with existing pattern
- **Conditional render vs. `display:none`** — using conditional render (`{isNavOpen && ...}`) ensures the element is completely absent from the DOM when closed, which is the strongest possible implementation of "not visible"
- **`useEffect` for auto-focus** — opens focus to first menu item after render cycle completes (state update → render → effect → focus)
- **Global event listeners for Escape/click-outside** — added/removed on `isNavOpen` change to avoid stale closures
- **No new npm packages** — implementation uses existing React/TypeScript/MUI stack

## Widget Choices
| Widget | Type | ARIA role | DOM structure |
|---|---|---|---|
| `nav-menu-trigger` | `<button>` | `button` (native) | `<button data-testid="nav-menu-trigger" aria-label="Open/Close navigation menu" aria-expanded={bool} aria-controls="nav-menu">` |
| `nav-menu` | `<div>` | `menu` | `<div data-testid="nav-menu" id="nav-menu" role="menu" aria-label="Main navigation">` |
| `nav-menu-item-home` | `<div>` | `menuitem` | `<div data-testid="nav-menu-item-home" role="menuitem" tabIndex={0}>` |

## data-testid Inventory
| data-testid | Element type | Parent context |
|---|---|---|
| `nav-menu-trigger` | `<button>` | Inside `<Toolbar>` in `<AppBar>` |
| `nav-menu` | `<div>` | Direct child of fragment (sibling to AppBar and main Box), conditionally rendered |
| `nav-menu-item-home` | `<div>` | Inside `nav-menu` panel |
| `dataset-selector` | `<div>` | Inside `<Toolbar>` in `<AppBar>` (right side) |
| `content-area` | `<div>` (MUI Box) | Inside `<main>` Box |
| `left-column` | `<div>` (MUI Box) | Inside `content-area` |
| `right-column` | `<div>` (MUI Box) | Inside `content-area` |
| `training-overview` | `<section>` (MUI Paper) | Inside `left-column`, first child |
| `weekly-dashboard` | `<div>` (MUI Box) | Inside `left-column`, second child |
| `insights` | `<section>` (MUI Paper) | Inside `right-column` |

## Visual Properties (untested)
- Hamburger icon: inline SVG 24×24 px, three `<rect>` elements, `fill="currentColor"`, `aria-hidden="true"`, `focusable="false"`
- Home icon: inline SVG 20×20 px, house path, `fill="currentColor"`, `aria-hidden="true"`, `color: var(--color-text-muted, inherit)`
- Trigger button: 40×40 px minimum, transparent background, border-radius 4px, no border, cursor pointer
- Trigger hover background: `--color-surface-alt` (CSS token; not testable in jsdom without computed style)
- Menu panel: `position: fixed`, `top: 64px`, `left: 0`, `z-index: 1300`, `backgroundColor: var(--color-surface, #1e1e2e)`, `border: 1px solid var(--color-border, #3a3a4a)`, `borderRadius: 4px`, `boxShadow: 0 4px 12px rgba(0,0,0,0.15)`, `minWidth: 180px`, `maxWidth: 280px`, padding 4px top/bottom
- Menu item: padding 10px vertical / 16px horizontal, gap 8px, font-size 0.875rem, `color: var(--color-text-primary, inherit)`
- Focus indicator: 2px solid `--color-accent` with 2px offset (requires CSS; not in inline styles, would need global CSS rule)
- Icon color in item: `--color-text-muted` for Home icon (de-emphasised)

## E2E Deferrals
- **Viewport < 480px full-width panel** (UX spec Section 4.3): CSS media query behavior — not testable in jsdom; deferred to E2E
- **Click-outside dismissal** (UX spec Section 4.4): `mousedown` event on `document` — partially testable in RTL but full browser behavior deferred to E2E

## Alternatives Considered
- **Separate `NavMenu` component vs. inline in `HomePage`:** Inline is consistent with the existing pattern where all top-bar and layout logic lives in `HomePage.tsx`; extraction would be premature without additional complexity
- **MUI `Menu`/`Popper` vs. plain `<div>`:** MUI `Menu` uses a Portal that renders outside the component tree, breaking RTL `within()` queries; plain `<div>` with inline positioning is simpler and fully testable
- **`display: none` vs. conditional render:** Conditional render (`{isNavOpen && ...}`) removes the element from the DOM entirely, providing the strongest guarantee for Scenario 1's "not visible" requirement; `display: none` would leave the element in the DOM

## Output Summary
**Files written:**
- `features/top-bar-navigation-menu/scope` — `frontend`
- `run-tests.sh` — test entry point (npm ci + audit + tsc + jest)
- `features/top-bar-navigation-menu/work/developer-summary.md` — this file

**Files verified as already correct (no changes needed):**
- `frontend/src/components/HomePage.tsx` — nav menu fully implemented
- `frontend/src/components/HomePage.test.tsx` — all 4 Gherkin scenarios covered

**TDD cycles:** 0 new cycles — the implementation and tests were already present and complete in the codebase from prior development work.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O1/T1 | 59.6s | 2 | 3,636 | 0 (0%) | 57,577 |
