## Outer Iteration 1 — TDD Attempt 1

# Developer Summary — top-bar-navigation-menu

## Status
OK

## Input Summary
Feature: `top-bar-navigation-menu` — adds hamburger menu trigger (left edge of top bar) and dropdown navigation panel with a single "Home" item. Menu hidden by default, opens on trigger click, closes on Escape/click-outside/item activation/second trigger click. Home item navigates to `/`. Purely additive to existing `HomePage` component.

4 Gherkin scenarios:
1. Menu not visible before trigger is activated
2. Clicking trigger opens the menu
3. Open menu contains "Home" item with text "Home"
4. Selecting "Home" navigates to root page (`content-area` visible)

UX spec constraints: hamburger icon, ARIA labels/expanded/controls, menu panel with `role="menu"`, Home item with `role="menuitem"`, all using existing design tokens.

## Assumptions
- Navigation menu implemented inline in `HomePage.tsx` — top bar is already inline there, consistent with prior pattern
- `nav-menu` is conditionally rendered (not CSS-hidden) to satisfy Scenario 1 — RTL `queryByTestId` would find CSS-hidden elements
- `router.push('/')` uses Next.js `useRouter` from `next/navigation`; mocked in tests via `jest.mock('next/navigation')`
- Hamburger and home icons implemented as inline SVG — `@mui/icons-material` not in `package.json`
- `content-area` testid is already present in `HomePage.tsx` render output, so Scenario 4's THEN assertion ("content-area is visible") is satisfied by the same component remaining mounted
- The AppBar height in this codebase is approximately 64px (MUI default), so the menu panel is positioned at `top: 64` with `position: fixed`

## Decisions
- **Scope: frontend** — pure UI, no backend
- **State: `useState(false)` for `isNavOpen`** — simple boolean sufficient for a single toggle
- **Conditional render for menu panel** — `{isNavOpen && <div data-testid="nav-menu" ...>}` ensures element absent from DOM when closed
- **Click-outside: `useEffect` with `mousedown` listener** — standard pattern; uses `ref` on both trigger and menu to detect outside clicks
- **Escape key: `useEffect` with `keydown` listener** — only active when menu is open (depends on `isNavOpen`)
- **Inline SVG icons** — avoids new dependency; three horizontal rects for hamburger, house path for home
- **Testing: RTL + `jest.mock('next/navigation')`** — enables asserting `router.push('/')` was called without real navigation

## Widget Choices

| Widget | Type | ARIA role | Key DOM structure |
|---|---|---|---|
| `nav-menu-trigger` | `<button>` | implicit `button` | `<button data-testid="nav-menu-trigger" aria-label="..." aria-expanded="..." aria-controls="nav-menu">` |
| `nav-menu` | `<div>` | `role="menu"` | `<div data-testid="nav-menu" id="nav-menu" role="menu" aria-label="Main navigation">` |
| `nav-menu-item-home` | `<div>` | `role="menuitem"` | `<div data-testid="nav-menu-item-home" role="menuitem" tabIndex={0}>` |

## data-testid Inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `nav-menu-trigger` | `<button>` | Inside `<Toolbar>` in `<AppBar>`, leftmost |
| `nav-menu` | `<div>` | Fixed-positioned below AppBar, conditionally rendered |
| `nav-menu-item-home` | `<div>` | Inside `nav-menu` |
| `content-area` | `<div>` (MUI Box) | Inside `<main>` — pre-existing |
| `dataset-selector` | `<div>` | Inside `<Toolbar>` — pre-existing |
| `training-overview` | `<section>` | Inside `left-column` — pre-existing |
| `weekly-dashboard` | `<div>` | Inside `left-column` — pre-existing |
| `insights` | `<section>` | Inside `right-column` — pre-existing |
| `left-column` | `<div>` | Inside `content-area` — pre-existing |
| `right-column` | `<div>` | Inside `content-area` — pre-existing |

## Visual Properties (untested)
- `nav-menu-trigger` button size: 40×40 px min touch target
- `nav-menu-trigger` background: transparent default, `var(--color-surface-alt)` on hover/active
- `nav-menu-trigger` icon: hamburger SVG 24×24 px, `var(--color-text-primary)`
- `nav-menu-trigger` border-radius: 4px; no border
- `nav-menu-trigger` focus: 2px solid `var(--color-accent)` outline, 2px offset
- `nav-menu` background: `var(--color-surface)`
- `nav-menu` border: 1px solid `var(--color-border)`
- `nav-menu` border-radius: 4px
- `nav-menu` box-shadow: `0 4px 12px rgba(0,0,0,0.15)`
- `nav-menu` min-width: 180px, max-width: 280px, z-index: 1300
- `nav-menu-item-home` home icon: 20×20 px, `var(--color-text-muted)` 
- `nav-menu-item-home` padding: 10px vertical 16px horizontal
- `nav-menu-item-home` gap between icon and label: 8px
- `nav-menu-item-home` hover/focus background: `var(--color-surface-alt)`
- Top bar: trigger at left edge, 8–12px gap between trigger and title

## E2E Deferrals
None — all 4 Gherkin scenarios tested with RTL unit tests. No viewport GIVEN constraints in any scenario.

## Alternatives Considered
- **CSS hidden vs conditional render:** CSS hidden (`display:none`) would still be found by `queryByTestId` in RTL — conditional render is the only reliable approach for "not visible" assertions in unit tests
- **`@mui/icons-material` for icons:** Not installed; adding it would be a large dependency for two icons; inline SVG is zero-cost
- **Separate `NavMenu.tsx` component:** Cleaner but inconsistent with existing codebase pattern where all top-bar content is inline in `HomePage.tsx`
- **`aria-hidden="true"` instead of conditional render:** UX spec allows this approach (Section 4.1 says "may be in the DOM with `display: none`") but RTL `queryByTestId` ignores `aria-hidden` — would cause Scenario 1 to fail

## Output Summary

**Files written:**
- `features/top-bar-navigation-menu/scope` — `frontend`
- `run-tests.sh` — test entry point (npm ci + audit + tsc + jest)
- `frontend/src/components/HomePage.tsx` — updated with nav menu trigger and panel
- `frontend/src/components/HomePage.test.tsx` — updated with 4 nav menu Gherkin scenarios + behavior tests + all prior scenarios preserved
- `features/top-bar-navigation-menu/work/developer-summary.md`

**TDD cycles:** 1

---

## Outer Iteration 1 — TDD Attempt 2

## Diagnosis

The `page.test.tsx` file renders `<Page />` which renders `<HomePage />`, but `page.test.tsx` does **not** mock `next/navigation`. The `useRouter()` call in `HomePage` throws `invariant expected app router to be mounted` because there's no Next.js App Router context in that test environment.

Fix: add `jest.mock('next/navigation', ...)` to `page.test.tsx` the same way `HomePage.test.tsx` does it.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O1/T1 | 127.2s | 2 | 9,003 | 0 (0%) | 53,678 |
| Developer O1/T2 | 8.9s | 10,204 | 507 | 53,678 (526%) | 0 |


---

## Outer Iteration 2 — TDD Attempt 1



## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Developer O2/T1 | 3.3s | 1,662 | 68 | 53,678 (3229%) | 10,708 |
