# System State

_Bootstrapped on 2026-05-27. Updated automatically after each feature lands._

---

## Frontend

### Pages / Routes

| Path | Purpose |
|---|---|
| `/` | Home page — renders `HomePage` component (top bar + two-column layout with `RunnerDashboard` / `WeeklyDashboard` in left column and Insights placeholder in right column) |
| `/weekly-dashboard` | Issues a permanent 308 redirect to `/` |
| `*` (unmatched) | Next.js `not-found.tsx` — renders a centred 404 page with a "Go to Dashboard" link |

### Key Components

| Component | Role |
|---|---|
| `HomePage` | Full-page layout shell: sticky `AppBar` top bar, two-column flex content area, wires together all section panels |
| `TopBar` | App bar sub-component — displays "Health Playground" title and `DatasetSelector`; `data-testid="top-bar"` |
| `DatasetSelector` | MUI `Select` dropdown for choosing the active dataset; `data-testid="dataset-selector"`; at present renders the half-marathon fixture as the only non-test option |
| `RunnerDashboard` | Accordion-style weekly list; renders `WeekRow` items, expands to show `ActivityRow` / `SkippedActivity`; `data-testid="runner-dashboard"` |
| `WeekRow` | Single week summary row: total distance, total duration, activity count; `data-testid="week-row"` |
| `WeeklyDashboard` | Weekly drill-down panel: week selector, weekly summary card (VO2max, resting HR, avg HR, avg cadence, intensity balance, trend indicators), activity list, activity detail; `data-testid="weekly-dashboard-container"` |
| `ActivityRow` | Single activity row within an expanded week; carries `data-activity-type` attribute for CSS colour-coding; `data-testid="activity-row"` |
| `SkippedActivity` | Marker rendered in weeks with a skipped session; carries `data-activity-type="skipped"`; `data-testid="skipped-activity"` |
| `LoadingState` | Loading skeleton/spinner shown before dataset renders; `data-testid="dataset-loading"` |
| `ColorProbe` | Hidden utility element used in tests to resolve CSS custom properties to canonical `rgb(...)` values |

### State Management

Local React component state only (`useState`, `useEffect`). No global state library. Dataset selection is managed in `HomePage` / `DatasetSelector` and passed down as props. No server state or async data fetching — all data is synchronous in-module mock data.

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

No backend is present. All data is static mock data bundled with the frontend.

---

## Infrastructure (as Code)

### Hosting / Deployment

- **Platform:** GitHub Pages (static hosting)
- **Build output:** Next.js static export (`output: 'export'`); build artefact written to `frontend/out/`
- **Deployment trigger:** Push to `main` branch or manual `workflow_dispatch`

### CI/CD Pipelines

| Workflow file | Name | Trigger | Purpose |
|---|---|---|---|
| `ci.yml` | CI | Pull request → `main` | Installs deps, audits for high-severity vulns, runs Jest tests; auto-merges Dependabot patch/minor PRs |
| `deploy.yml` | Deploy to GitHub Pages | Push to `main`, `workflow_dispatch` | Builds Next.js static export and deploys to GitHub Pages |
| `codeql.yml` | CodeQL | Push/PR → `main`, weekly schedule (Mon 06:00 UTC) | SAST analysis for JavaScript/TypeScript and Python |
| `bootstrap-system-state.yml` | Bootstrap System State | `workflow_dispatch` | Runs the System State Bootstrap agent and commits `system/state.md` |
| `feature-specification.yml` | Feature Specification | Issue opened with label `direct-feature` | Creates feature branch, runs Feature Specification agent, triggers `[NEXT:ux-design]` |
| `calibrator.yml` | Calibrator | Push to `feature/**` with `[NEXT:calibrate]` in commit message | Runs Calibrator agent; triggers `[NEXT:create-pr]` |
| `create-pr.yml` | Create PR | Push to `feature/**` with `[NEXT:create-pr]` in commit message | Opens/updates a pull request; triggers `[NEXT:update-system-state]` |

_(Additional pipeline workflow files exist but were truncated in input; the above covers all fully-visible files.)_

### Secrets / Environment Variables

| Name | Used in |
|---|---|
| `ANTHROPIC_API_KEY` | `bootstrap-system-state.yml`, `feature-specification.yml`, `calibrator.yml` |
| `GH_PAT` | `bootstrap-system-state.yml`, `feature-specification.yml`, `calibrator.yml`, `create-pr.yml` |
| `NEXT_TELEMETRY_DISABLED` | `deploy.yml` (set to `1` to suppress Next.js telemetry) |

---

## UX / Design System

### Color Tokens

Defined in `frontend/src/theme/tokens.ts` and injected as CSS custom properties on `:root` via `layout.tsx`.

| Token | Resolved value | Semantic role |
|---|---|---|
| `--color-background` | `rgb(18, 20, 24)` | Page background (very dark near-black) |
| `--color-activity-long-run` | `rgb(56, 132, 196)` | Accent colour for long-run activity rows |
| `--color-activity-restorative-run` | `rgb(94, 164, 122)` | Accent colour for restorative/recovery run rows |
| `--color-activity-intervals` | `rgb(224, 138, 64)` | Accent colour for interval session rows |
| `--color-activity-skipped` | `rgb(120, 124, 132)` | Muted colour for skipped-activity markers |

All four activity colours are pairwise distinct. CSS selectors `[data-activity-type="<value>"]` apply the corresponding token as `background-color`.

### Typography Scale

- **System font stack:** `system-ui, -apple-system, sans-serif` applied globally on `body`
- **Body text:** `color: rgb(255, 255, 255)` (white on dark background)
- **Section headings:** MUI `Typography` at `h2` variant within section panels
- **Page / app title ("Health Playground"):** MUI `h6` variant rendered semantically as `<h1>` in the top bar
- **404 page numerals:** `72px`, `fontWeight: 700`; "Page Not Found" heading: `28px`

### Spacing Conventions

- Inline styles and MUI `sx` prop used throughout; no custom spacing scale defined — relies on MUI default 8px grid
- Top bar clears below AppBar to avoid content hiding
- Content area uses flexbox layout for the two-column split
- 404 page uses `padding: 24px`

### Key Reusable Component Patterns

- **Week accordion row:** `WeekRow` renders a summary line; clicking expands an inline `week-activities` region showing `ActivityRow` children — expand/collapse interaction pattern used consistently
- **Activity row with colour attribute:** Every `ActivityRow` carries `data-activity-type` (snake_case); CSS targeting that attribute applies the token colour — no inline colour styles on individual rows
- **Section card/panel:** MUI `Paper` with `component="section"` used for Training Overview and Insights placeholders; `data-testid` on each for testability
- **Dataset selector:** `FormControl` + `InputLabel` + `Select` pattern, wrapped in a `data-testid="dataset-selector"` div

### Accessibility Baseline

- `lang="en"` on `<html>`
- Landmark structure: `<header>` for top bar, `<main>` for content area, `role="region"` with `aria-labelledby` on section panels
- Heading hierarchy: `<h1>` (app title) → `<h2>` (section headings)
- `data-activity-type` is a CSS hook only — not an ARIA attribute; activity type communicated via visible text label
- `aria-label` on intensity balance element (e.g. `"Intensity balance: 3 low-intensity sessions, 1 high-intensity session"`)
- Dataset selector has associated visible label ("Dataset") and `aria-label="Select dataset"`
- Colour is never the sole differentiator — activity type label text always present alongside colour accent
- Keyboard navigation: week rows expandable via Enter/Space; tab order follows DOM order (left-before-right columns, training-overview before weekly-dashboard)
- `role="main"` on the 404 page `<main>` element
- `aria-hidden="true"` on the decorative `404` numeral

---

## Data Model

### Entities and Shapes

**`Activity`** (inferred from `datasets.ts`, `halfMarathonFixture.ts`, developer summaries):
```
{
  name: string           // display name, e.g. "Long run"
  type: string           // display label, e.g. "Long run" | "Restorative run" | "Intervals"
  date: string           // ISO date string
  distance_km: number
  duration_min: number
  avgHr?: number         // optional; average heart rate
  cadence?: number       // optional; steps per minute
}
```

**`WeekData`** (inferred from `weeklyDashboardData.ts` and developer summaries):
```
{
  weekId: string         // e.g. "2024-W10"
  label: string          // e.g. "Week 8"
  activities: Activity[]
  skipped?: boolean      // true for weeks with a skipped session
  skippedReason?: string // e.g. "Skipped due to sickness"
  vo2max?: number        // weekly VO2max estimate
  restingHrAvg?: number  // weekly average resting HR
  trainingLoad: number   // numeric load value for trend computation
}
```

**`Dataset`** (from `domain/dataset.ts`):
```
{
  id: string
  name: string
  weeks: WeekData[]
  isTestFixture?: boolean  // true → excluded from user-selectable dropdown
}
```

**Computed / derived values** (calculated in `WeeklyDashboard` or data helpers):
- `weeklyAvgHr` — mean of `activity.avgHr` values across the week (rounded)
- `weeklyAvgCadence` — mean of `activity.cadence` values across the week (rounded)
- `intensityBalance` — count of low-intensity vs high-intensity sessions (high = `type === 'intervals'`)
- `trend` — week-over-week change: `> +2%` → "↑ Increasing", `< -2%` → "↓ Decreasing", `±2%` → "→ Stable", no prior week → "—"

**`activityTypeAttr()`** (`RunnerDashboard.tsx`) — maps display label to snake_case DOM attribute value:
- `"Long run"` → `"long_run"`, `"Restorative run"` → `"restorative_run"`, `"Intervals"` → `"intervals"`

### Mock vs Real Data

**All data is mocked.** The production fixture is the "Half-Marathon Build-Up — 8 Week Consistent Plan" dataset defined in `halfMarathonFixture.ts` — 8 weeks, Week 4 has 0 activities (skipped/sickness), all other weeks have 3 activities (Long run, Restorative run, Intervals). This fixture is loaded synchronously; no network requests are made. `isTestFixture: true` datasets are hidden from the user-facing selector.

---

## Feature Inventory

| Feature | What it added |
|---|---|
| `scaffolding-attempt-7` | Next.js app scaffold; top bar with "Health Playground" title and dataset-selector-placeholder; 404 handling; build pipeline |
| `home-page-structure-step-1` | `HomePage` component with sticky `AppBar`, two-column flex layout; `training-overview` and `insights` placeholder panels; `weekly-dashboard` wrapper in left column; `DatasetSelector` MUI `Select` in top bar |
| `visual-theme-overhaul` | Dark background (`rgb(18, 20, 24)`); CSS custom property token system (`--color-background`, `--color-activity-*`); activity-type `data-activity-type` attribute → CSS background colour; `ColorProbe` utility |
| `runner-dataset-with-consistent-improvement` | `halfMarathonFixture.ts` — 8-week half-marathon build-up dataset; `RunnerDashboard` with accordion week list; `WeekRow`, `ActivityRow`, `SkippedActivity` components; `LoadingState`; `datasets.ts` with `getDefaultDataset()` / `getSelectableDatasets()` |
| `make-weekly-dashboard-the-home-page` | Root `/` route renders `WeeklyDashboard` as primary content; `/weekly-dashboard` → 308 permanent redirect to `/`; removed `TrainingOverview.tsx`; `weekly-dashboard-container` testid; 404 page confirmed |
| `enforce-visual-theme` | `data-activity-type` attribute wired on every `activity-row` (snake_case values: `long_run`, `restorative_run`, `intervals`) and `skipped-activity` (`data-activity-type="skipped"`); attribute hook contract between DOM and CSS token system formalised |
| `improve-weekly-aggregates-and-prepare-for-more-insights` | `weeklyDashboardData.ts` data module; `WeeklyDashboard` enriched with: weekly VO2max, resting HR, computed avg HR and avg cadence, intensity balance indicator (with `aria-label`), week-over-week trend indicators (training load, avg HR, resting HR); activity detail panel with `avgHr` / `cadence` fields (em-dash fallback); responsive layout at 375px |

---

## Known Constraints

### Architectural
- **Static export only** — `next.config.js` must keep `output: 'export'`; no server-side rendering, no API routes, no `getServerSideProps`. Any data must be bundled at build time or fetched client-side.
- **No backend** — all data is in-module mock data. Adding a backend would require new CI steps, secrets, and deployment infrastructure.
- **`isTestFixture: true`** — the test fixture dataset must never appear in `getSelectableDatasets()` results; this is load-bearing for the "test dataset is isolated from live datasets" Gherkin scenario.
- **`data-activity-type` attribute contract** — CSS selectors in `layout.tsx` target `[data-activity-type="long_run"]` etc. Renaming these values or removing the attribute will silently break colour-coding. The snake_case values (`long_run`, `restorative_run`, `intervals`, `skipped`) are normative.
- **`dangerouslySetInnerHTML` in `layout.tsx`** — used only for injecting hardcoded CSS custom property declarations from `themeTokens`. The string is entirely build-time constant; do not introduce any runtime or user-derived content into this string.
- **`theme.ts` is an empty stub** — intentionally kept as `export {}` to avoid breaking stray imports during an MUI theme transition. Do not restore MUI theme config here without updating all consumers.

### Design System Non-Negotiables
- CSS custom property token names (`--color-background`, `--color-activity-long-run`, etc.) must remain stable — they are referenced in both `layout.tsx` (CSS injection) and `theme/tokens.ts` (TypeScript constants).
- All four activity token colours must remain pairwise distinct (enforced by Gherkin scenario "All four activity-related theme colours resolve to pairwise distinct values").
- Colour alone must never be the sole differentiator for activity type — visible text labels are required alongside accent colours (WCAG / accessibility constraint).

### Performance-Sensitive Areas
- No identified performance bottlenecks at current scale (8-week static dataset). If dataset size grows significantly, the synchronous in-module load and full re-render on week selection may need optimisation.

### DOM Order Constraints
- `training-overview` node must appear before `weekly-dashboard` node in document order (keyboard/screen-reader reading order constraint, tested via `compareDocumentPosition`).
- Columns must be ordered left-before-right in DOM to match visual order.
