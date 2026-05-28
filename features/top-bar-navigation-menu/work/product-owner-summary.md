## Pre-flight Check

1. **Is there a new user action?** YES — clicking a menu trigger in the top bar, selecting "Home" from the menu
2. **Is there new data or content shown to the user?** YES — a navigation menu element and a "Home" menu item appear
3. **Is there a new state the user can enter or exit?** YES — menu open/closed state; navigation to `/`
4. **Can success be verified without inspecting CSS, computed styles, or internal code?** YES — element presence, visibility, and navigation outcome are all observable

All four checks pass. Proceeding with Gherkin.

---

STATUS: OK

**Status:** OK
**Input summary:** Add an interactive navigation menu to the top bar (AppBar). The menu exposes a single "Home" entry that navigates to `/`. The trigger element (e.g. hamburger button) lives in `TopBar.tsx` or the inline AppBar in `HomePage.tsx`. The `/` route already exists. No other routes, redesigns, or page content changes are in scope.

**Interpretation:**
- The menu has two observable states: closed (default) and open (after user activates the trigger)
- "Home" is the sole menu item; clicking it navigates to `/`
- The trigger element must be identifiable by a test (data-testid or aria-label)
- The menu panel/list must be identifiable when open (data-testid)
- Navigation outcome is observable via the page URL or by asserting the home page content is visible
- The menu closes (or the user lands on `/`) after selecting "Home" — covered by the navigation assertion
- The dataset selector and app title already exist in the top bar (home-page-structure-step-1); this feature adds a menu element alongside them without removing or replacing existing top-bar content

**Decisions:**
- Use `data-testid="nav-menu-trigger"` for the button that opens the menu
- Use `data-testid="nav-menu"` for the open menu panel/list
- Use `data-testid="nav-menu-item-home"` for the "Home" item
- Navigation success is verified by asserting the user lands at `/` (URL) and the home page landmark is visible — consistent with how prior features assert page-level outcomes
- A scenario for the closed state (menu not visible before trigger is clicked) is included as a distinct starting state
- No loading-state or accessibility scenarios added speculatively — the feature request does not call them out
- Visual/style aspects of the menu (colours, spacing, animation) are out of scope for Gherkin; they belong in developer unit tests or visual regression snapshots

**Alternatives considered:**
- Using aria-label selectors instead of data-testid — ruled out; data-testid is the established selector convention in this codebase
- Asserting HTTP navigation by URL string — kept as a supporting assertion where observable from the test runner, but primary assertion is element presence on the resulting page

**Output summary:** 4 scenarios written, covering: menu hidden by default, menu opens on trigger click, menu contains "Home" item, clicking "Home" navigates to `/`.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Product Owner | 21.5s | 11,981 | 1,053 | 0 (0%) | 2,407 |
