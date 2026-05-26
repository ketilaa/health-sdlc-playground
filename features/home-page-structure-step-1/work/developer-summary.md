## Outer Iteration 1 — TDD Attempt 1

# Developer Summary — home-page-structure-step-1

## Status
OK

## Input summary
- Feature: Home Page Structure (Step 1)
- 7 Gherkin scenarios covering: app title "Health Playground", dataset-selector, content-area/left-column/right-column layout, training-overview before weekly-dashboard in left column, "Training Overview" placeholder text, insights in right column, "Insights" placeholder text
- UX spec: MUI AppBar top bar, two-column MUI Grid layout, MUI Card/Paper placeholders
- Reviewer: STATUS OK, all scenarios covered

## Assumptions
- The existing `page.tsx` renders WeeklyDashboard directly — it was replaced with the new HomePage component
- The existing `page.test.tsx` asserted training-overview was NOT in the page — this is now inverted since the new page DOES show training-overview; test updated
- `layout.test.tsx` asserted `metadata.title === 'Weekly Dashboard'` — changed to 'Health Playground' per UX spec, test updated
- `data-testid="weekly-dashboard"` in the new spec refers to a wrapper div in the left column; `data-testid="weekly-dashboard-container"` belongs to the existing WeeklyDashboard component — they coexist without conflict
- The existing WeeklyDashboard component is placed inside the new `weekly-dashboard` wrapper to preserve its functionality
- Dataset selector at this stage has a single placeholder "Demo Dataset" option — no real data source required by Gherkin
- MUI components used as-is without a custom theme provider — styled via `sx` props; background color from existing themeTokens
- No new npm packages added — all MUI components already present in package.json

## Decisions
- **Scope:** frontend — all changes are UI/component-level
- **Architecture:** New `HomePage.tsx` component encapsulates the full layout; `page.tsx` updated to render it
- **MUI AppBar:** `position="sticky"` with `elevation={4}` for top bar, wrapped in `<header>` semantics via `component="header"`
- **Layout:** Flexbox `Box` components instead of MUI Grid (simpler, avoids Grid API version concerns with MUI v5)
- **Placeholders:** MUI `Paper` with `component="section"` for training-overview and insights
- **Dataset Selector:** MUI `Select` with `InputLabel` inside `FormControl`, wrapped in a `div[data-testid="dataset-selector"]`
- **DOM order:** training-overview rendered before weekly-dashboard in JSX, tested via `compareDocumentPosition`
- **Testing:** RTL unit tests for all 7 Gherkin scenarios; `within()` used for containment assertions; `compareDocumentPosition` for DOM order

## Widget choices
- **Dataset Selector:** MUI `Select` component
  - ARIA role: `combobox` (native MUI Select renders as `<div role="combobox">`)
  - Key DOM: `<div data-testid="dataset-selector"> > <FormControl> > <InputLabel id="dataset-selector-label">Dataset</InputLabel> + <Select aria-label="Select dataset" inputProps={{ id: "dataset-selector-input" }}>`

## data-testid inventory

| data-testid | Element type | Parent context |
|---|---|---|
| `dataset-selector` | `<div>` | Inside `<AppBar>` Toolbar |
| `content-area` | `<div>` (MUI Box) | Inside `<main>` (Box component="main") |
| `left-column` | `<div>` (MUI Box) | Inside `content-area` |
| `right-column` | `<div>` (MUI Box) | Inside `content-area` |
| `training-overview` | `<section>` (MUI Paper) | Inside `left-column`, first child |
| `weekly-dashboard` | `<div>` (MUI Box) | Inside `left-column`, second child |
| `insights` | `<section>` (MUI Paper) | Inside `right-column` |

## E2E deferrals
None — all 7 Gherkin scenarios contain no viewport GIVEN constraints and are fully testable in RTL unit tests.

## Alternatives considered
- **MUI Grid vs Flexbox Box:** MUI Grid v5 has breaking API differences between minor versions; plain flexbox Box is more predictable and avoids potential `item`/`container` prop issues — chose Box
- **MUI Card vs Paper:** Card adds CardContent/CardHeader overhead; Paper is sufficient for placeholder content — chose Paper
- **Rendering WeeklyDashboard inside weekly-dashboard wrapper vs replacing it:** Wrapping preserves existing functionality and avoids breaking 20+ existing tests — chose wrapping
- **Separate TopBar component vs inline in HomePage:** No existing TopBar in use (TopBar.tsx is a stub); inline in HomePage is simpler for this step — chose inline

## Output summary
**Files created:**
- `frontend/src/components/HomePage.tsx` — new home page layout component
- `frontend/src/components/HomePage.test.tsx` — 10 RTL unit tests covering all 7 Gherkin scenarios

**Files modified:**
- `frontend/src/app/page.tsx` — renders `HomePage` instead of `WeeklyDashboard`
- `frontend/src/app/layout.tsx` — metadata title changed to "Health Playground"
- `frontend/src/app/layout.test.tsx` — updated title assertion to "Health Playground"
- `frontend/src/app/page.test.tsx` — updated to reflect new page content (training-overview now present)

**Iterations:** 1 TDD cycle