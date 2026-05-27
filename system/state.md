# System State

_Bootstrapped on 2026-05-27. Updated automatically after each feature lands._

---

## Frontend

### Pages / Routes

| Route | Purpose |
|---|---|
| `/` | Root page — renders `HomePage` component (client component) |
| `*` (no match) | `not-found.tsx` — custom 404 page with "Go to Dashboard" link back to `/` |

> No `/weekly-dashboard` page exists as a standalone route; a `redirect.test.ts` file is present in `app/weekly-dashboard/` suggesting a redirect from that path was considered or implemented _(unconfirmed — source not provided)_.

### Key Components

| Component | Role |
|---|---|
| `HomePage` | Top-level layout shell: TopBar + two-column content area (left: TrainingOverview + WeeklyDashboard; right: Insights placeholder) |
| `TopBar` | Application header bar displaying "Health Playground" title and `DatasetSelector` |
| `DatasetSelector` | Dropdown/selector for choosing between available datasets (`data-testid="dataset-selector"`) |
| `RunnerDashboard` | Weekly accordion list; renders `week-row` items, expands to show `week-activities` with `activity-row` and `skipped-activity` elements |
| `WeeklyDashboard` | Wrapper/container for `RunnerDashboard` within the left column (`data-testid="weekly-dashboard"`) |
| `WeekRow` | Single week row in the accordion; click to expand/collapse |
| `ActivityRow` | Single activity entry within an expanded week; carries `data-activity-type` attribute for CSS colour token wiring |
| `SkippedActivity` | Marker rendered for weeks with no activities (skipped); carries `data-activity-type="skipped"` |
| `LoadingState` | Loading skeleton/spinner shown while data is loading |
| `ColorProbe` | _(utility component)_ — likely used in tests to read computed CSS custom property values |

> `TrainingOverview` has a test file (`TrainingOverview.test.tsx`) but no corresponding `TrainingOverview.tsx` was listed in the source tree — the component may be inline within `HomePage` or missing _(unconfirmed)_.

### State Management

No dedicated state-management library (no Redux, Zustand, Jotai, etc.). State is managed via React's built-in `useState`/`useContext`. Dataset selection and expanded-week state are handled locally within components. Data is loaded synchronously from the mock fixture via `getDefaultDataset()` in `data/datasets.ts`.

### Key Libraries

| Library | Version |
|---|---|
| `next` | ^15.0.0 |
| `react` | ^19.2.6 |
| `react-dom` | ^19.2.6 |
| `@mui/material` | ^5.15.20 |
| `@mui/material-nextjs` | ^9.0.1 |
| `@emotion/react` | ^11.11.4 |
| `@emotion/styled` | ^11.11.5 |
| `@emotion/cache` | ^11.11.0 |

---

## Backend

**No backend is present.** All data is sourced from a static in-memory fixture (`halfMarathonFixture.ts`) loaded at build/render time. `data/loader.ts` is intentionally empty — described as unused.

---

## Infrastructure (as Code)

### Hosting / Deployment

Next.js application. Deployment target not explicitly declared in the provided files. CI runs on `ubuntu-latest` with Node 24 _(hosting platform unconfirmed — no Vercel/Netlify/Docker config visible in provided input)_.

### CI/CD Pipelines

| Workflow | Trigger | Purpose |
|---|---|---|
| `CI` | PR to `main` | Install deps, audit for high-severity vulnerabilities, run Jest tests; auto-merge Dependabot patch/minor PRs |
| `CodeQL` | Push to `main`, PR to `main`, weekly schedule (Mon 06:00 UTC) | Static security analysis for JavaScript/TypeScript and Python |
| `Bootstrap System State` | `workflow_dispatch` (manual) | Runs Python bootstrap script to generate `system/state.md` and commits it |
| `Calibrator` | Push to `feature/**` branches (commit message contains `[NEXT:calibrate]`) | Runs AI calibration script; commits and triggers `[NEXT:create-pr]` |
| `Create PR` | Push to `feature/**` branches (commit message contains `[NEXT:create-pr]`) | Creates or updates a GitHub PR for the feature branch; triggers `[NEXT:update-system-state]` |

> Additional workflows are referenced (`update-system-state`, and others) but were truncated in the input _(unconfirmed)_.

### Secrets / Environment Variables

| Name | Used In |
|---|---|
| `GH_PAT` | `bootstrap-system-state`, `calibrator`, `create-pr` — GitHub API authentication |
| `ANTHROPIC_API_KEY` | `bootstrap-system-state`, `calibrator` — AI agent API calls |

---

## UX / Design System

### Color Tokens

All tokens are defined as canonical `rgb(...)` strings in `frontend/src/theme/tokens.ts` and injected as CSS custom properties on `:root` via `layout.tsx`.

| Token | Value | Semantic Role |
|---|---|---|
| `--color-background` | `rgb(18, 20, 24)` | Page background — very dark near-black |
| `--color-activity-long-run` | `rgb(56, 132, 196)` | Accent colour for long run activities (blue) |
| `--color-activity-restorative-run` | `rgb(94, 164, 122)` | Accent colour for restorative/recovery runs (green) |
| `--color-activity-intervals` | `rgb(224, 138, 64)` | Accent colour for interval sessions (orange) |
| `--color-activity-skipped` | `rgb(120, 124, 132)` | Accent colour for skipped activity markers (muted grey) |

> `--color-surface` (card/panel background) is referenced in the UX spec but is not present in `tokens.ts` _(unconfirmed — may be applied via MUI Paper defaults)_.

Tokens are applied to DOM elements via CSS attribute selectors on `data-activity-type`:
```
[data-activity-type="long_run"]          → --color-activity-long-run
[data-activity-type="restorative_run"]   → --color-activity-restorative-run
[data-activity-type="intervals"]         → --color-activity-intervals
[data-activity-type="skipped"]           → --color-activity-skipped
```

### Typography Scale

No custom type scale library. Body text uses `system-ui, -apple-system, sans-serif` (set on `body` in `layout.tsx`). Text color is `rgb(255, 255, 255)` (white on dark background). Specific scale sizes are set inline per component (e.g. 404 page: 72px display, 28px h1). MUI Typography component is available but scale customisation not confirmed.

### Spacing Conventions

Spacing is applied via inline `style` props (e.g. `padding: 24`, `margin: '12px 0 16px 0'`). No shared spacing scale or utility classes detected. MUI's default 8px base spacing unit is available via theme but custom overrides not confirmed.

### Key Reusable Component Patterns

- **Accordion / expand-collapse row**: `WeekRow` expands to reveal `week-activities` panel — used throughout `RunnerDashboard`
- **Activity row with colour-coded accent**: `ActivityRow` with `data-activity-type` attribute wired to CSS tokens — the primary content pattern
- **Two-column layout**: Left column (Training Overview + Weekly Dashboard) + right column (Insights) — defined in `HomePage`
- **Sticky/persistent TopBar**: `TopBar` sits above the content area with title and dataset selector
- **MUI Paper cards**: Used for `training-overview` and similar content sections (inferred from UX spec)

### Accessibility Baseline

- `lang="en"` on `<html>` root
- `role="main"` on 404 page `<main>` element
- `aria-hidden="true"` on decorative 404 number display
- `data-activity-type` is explicitly a CSS hook only — not used as ARIA attribute
- Activity type communicated to screen readers via visible text labels (not colour alone)
- Week rows are keyboard-accessible (Enter/Space to expand/collapse) per UX spec
- `role="region"` on `week-activities` container
- Focus management: expanding a week row moves focus to `week-activities` container or first child (per UX spec)

---

## Data Model

### Entities and Shapes

**Dataset** (`domain/dataset.ts`):
```
Dataset {
  id: string
  name: string
  isTestFixture?: boolean
  weeks: Week[]
}
```

**Week**:
```
Week {
  label: string          // e.g. "Week 8"
  skipped?: boolean      // true for weeks with no activities
  activities: Activity[]
}
```

**Activity**:
```
Activity {
  type: string           // display label: "Long run" | "Restorative run" | "Intervals"
  // additional fields (distance, duration, etc.) inferred from component rendering
}
```

`data-activity-type` values are derived at render time by `activityTypeAttr()`: `type.toLowerCase().replace(/\s+/g, '_')` → `"long_run"` | `"restorative_run"` | `"intervals"`.

**Selectable datasets** are returned by `getSelectableDatasets()` — fixture datasets (`isTestFixture: true`) are excluded from the selector UI.

### Mock vs Real Data

**All data is mocked.** The sole data source is `halfMarathonFixture.ts` — an 8-week half-marathon training plan fixture. Week 4 is skipped (empty activities array, `skipped: true`). All other weeks have 3 activities. `data/loader.ts` is intentionally empty.

---

## Feature Inventory

| Feature | What it added |
|---|---|
| `home-page-structure-step-1` | TopBar with title + DatasetSelector; two-column layout (left: TrainingOverview + WeeklyDashboard; right: Insights placeholder); all structural `data-testid` anchors |
| `enforce-visual-theme` | `data-activity-type` attribute on every `activity-row` and `skipped-activity` element; CSS token wiring via attribute selectors in `layout.tsx`; `datasets.ts` fixture with 8-week half-marathon plan |

> Additional features are referenced in the file tree and component names (e.g. `visual-theme-overhaul`, `runner-dataset-with-consistent-improvement`, `make-weekly-dashboard-the-home-page`) but their Gherkin/developer summaries were truncated — not listed here to avoid speculation _(unconfirmed)_.

---

## Known Constraints

1. **`data-activity-type` attribute contract is load-bearing** — CSS colour tokens are applied exclusively via `[data-activity-type="..."]` selectors. Removing or renaming this attribute from `ActivityRow` or `SkippedActivity` will silently break all colour-coding with no JS error.

2. **Token values are canonical `rgb(...)` strings** — `tokens.ts` uses `rgb(...)` format deliberately so `getComputedStyle()` returns them verbatim in tests. Changing to hex or HSL will break `ColorProbe`-based tests.

3. **`data-activity-type` uses snake_case display-label conversion** — the `activityTypeAttr()` function (`toLowerCase().replace(/\s+/g, '_')`) must remain consistent with CSS selector values in `layout.tsx`. Adding a new activity type requires updating both the CSS selectors and the fixture.

4. **`isTestFixture: true` hides fixture from DatasetSelector** — the half-marathon fixture is excluded from the user-facing selector via this flag. Removing the flag will expose it in the UI unintentionally.

5. **`theme.ts` is intentionally empty** — it exists only to avoid breaking stray imports. Do not add MUI theme configuration here; `tokens.ts` is the canonical design token source.

6. **No backend / no API calls** — the architecture assumes all data is static and loaded synchronously. Introducing async data fetching would require significant changes to loading states and component lifecycle.

7. **`data/loader.ts` is intentionally empty** — do not route data loading through it; `getDefaultDataset()` in `datasets.ts` is the correct data entry point.

8. **MUI is present but lightly used** — `@mui/material` is a declared dependency and MUI Paper/Typography are referenced in UX specs. The MUI theme is not customised; avoid relying on MUI defaults for critical design decisions.

9. **Node 24 required in CI** — `ci.yml` pins `node-version: '24'`. Local development should match to avoid subtle build differences.

10. **`[no-trigger]` and `[NEXT:...]` commit message conventions are pipeline control signals** — commits with `[NEXT:calibrate]`, `[NEXT:create-pr]`, `[NEXT:update-system-state]` trigger specific workflow jobs. These strings must not appear in normal developer commit messages.