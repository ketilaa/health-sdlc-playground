# System State

_Bootstrapped on 2026-05-27. Updated automatically after each feature lands._

---

## Frontend

### Pages / Routes

| Path | Purpose |
|---|---|
| `/` | Root page — renders `HomePage` component (dataset selector, two-column layout with WeeklyDashboard in left column and Insights placeholder in right column) |
| `/weekly-dashboard` | 308 permanent redirect → `/` (redirect implemented via Next.js route handler) |
| `*` (unmatched) | Next.js `not-found.tsx` — renders 404 page with "Page Not Found" and a link back to `/` |

### Key Components

| Component | Role |
|---|---|
| `HomePage.tsx` | Top-level page layout: sticky AppBar (TopBar), two-column content area (`left-column` / `right-column`), dataset selector, Training Overview placeholder, WeeklyDashboard, Insights placeholder |
| `TopBar.tsx` | App bar component (stub / partially used; AppBar logic also inline in HomePage) |
| `RunnerDashboard.tsx` | Accordion-style weekly list; renders `week-row` elements, expands to show `week-activities`, `activity-row` (with `data-activity-type`), and `skipped-activity` marker |
| `WeeklyDashboard.tsx` | Weekly summary card view; week selector (`week-selector`), activity list (`activity-list`), activity detail (`activity-detail`), aggregate metrics (avg HR, cadence, VO2max, resting HR, intensity balance), week-over-week trend indicators |
| `WeekRow.tsx` | Single week row in the RunnerDashboard accordion |
| `ActivityRow.tsx` | Single activity row within an expanded week; carries `data-activity-type` attribute for CSS token application |
| `SkippedActivity.tsx` | Renders the skipped-activity marker with `data-activity-type="skipped"` |
| `DatasetSelector.tsx` | MUI Select dropdown for choosing a dataset; isolates test fixture from selectable options |
| `LoadingState.tsx` | Loading/skeleton state shown before dataset renders (`data-testid="dataset-loading"`) |
| `ColorProbe.tsx` | Hidden probe element used to resolve CSS custom property values to canonical `rgb(...)` strings for theme verification |

### State Management

No external state management library. State is managed locally via React `useState` and `useEffect` hooks within components. Dataset selection and week selection are component-local state. No Redux, Zustand, or Context API in use _(unconfirmed for Context — not observed in source)_.

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

No backend is present. The application is entirely frontend — all data is mock/fixture data served from static TypeScript modules bundled with the frontend. There is no API server, database, or server-side data-fetching layer.

---

## Infrastructure (as Code)

### Hosting / Deployment

- **Platform:** GitHub Pages (static hosting)
- **Build output:** `frontend/out/` — Next.js static export (`output: 'export'` required in `next.config.js`)
- **Trigger:** Push to `main` branch, or manual `workflow_dispatch`
- **Node version:** 24

### CI/CD Pipelines

| Workflow file | Name | Trigger | Purpose |
|---|---|---|---|
| `ci.yml` | CI | Pull request → `main` | Install deps, audit (`--audit-level=high`), run tests (`run-tests.sh` or `npm test`); auto-merge Dependabot patch/minor PRs |
| `deploy.yml` | Deploy to GitHub Pages | Push to `main`, `workflow_dispatch` | Build Next.js static export, upload `frontend/out/`, deploy to GitHub Pages |
| `codeql.yml` | CodeQL | Push/PR to `main`, weekly schedule (Mon 06:00 UTC) | Static security analysis for JavaScript/TypeScript and Python |
| `feature-specification.yml` | Feature Specification | Issue opened (label: `direct-feature`) | AI agent pipeline: create feature branch, run feature specification agent, trigger UX Design stage |
| `ux-design.yml` | UX Design | Push to `feature/**` with `[NEXT:ux-design]` in commit | AI agent: generate UX spec; trigger Implementation and Test stage |
| `implement-and-test.yml` | Implement and Test | Push to `feature/**` with `[NEXT:implementation-and-test]` in commit | AI agent: implement feature, run tests (unit + optional E2E); trigger Calibrator stage |
| `calibrator.yml` | Calibrator | Push to `feature/**` with `[NEXT:calibrate]` in commit | AI agent: calibration step; trigger Create PR stage |
| `create-pr.yml` | Create PR | Push to `feature/**` with `[NEXT:create-pr]` in commit | Opens or updates a pull request; triggers system state update |
| `update-system-state.yml` | Update System State | Push to `feature/**` with `[NEXT:update-system-state]` in commit | AI agent: update `system/state.md` after feature lands |
| `bootstrap-system-state.yml` | Bootstrap System State | `workflow_dispatch` only | One-time bootstrap of `system/state.md` from codebase snapshot |
| `planner.yml` | Planner | Issue opened (no `direct-feature` label) | AI agent: decompose issue into feature backlog, open planning PR |

### Secrets / Environment Variables

| Name | Used in |
|---|---|
| `ANTHROPIC_API_KEY` | All AI agent workflows |
| `GH_PAT` | All workflows that write to repo or create PRs (checkout with write token, PR creation) |
| `NEXT_TELEMETRY_DISABLED` | `deploy.yml` (set to `1` at build time) |

---

## UX / Design System

### Color Tokens

Defined in `frontend/src/theme/tokens.ts` as `const` object; injected as CSS custom properties on `:root` via `layout.tsx`.

| Token | Value | Semantic Role |
|---|---|---|
| `--color-background` | `rgb(18, 20, 24)` | Page background — near-black dark theme base |
| `--color-activity-long-run` | `rgb(56, 132, 196)` | Accent for long run activity rows |
| `--color-activity-restorative-run` | `rgb(94, 164, 122)` | Accent for restorative/recovery run rows |
| `--color-activity-intervals` | `rgb(224, 138, 64)` | Accent for interval session rows |
| `--color-activity-skipped` | `rgb(120, 124, 132)` | Muted accent for skipped activity markers |

All four activity tokens are pairwise distinct. Token values are stored as canonical `rgb(...)` strings so `getComputedStyle` returns them verbatim (enabling exact string equality in tests).

CSS attribute selectors wire tokens to DOM:
```css
[data-activity-type="long_run"]        { background-color: var(--color-activity-long-run); }
[data-activity-type="restorative_run"] { background-color: var(--color-activity-restorative-run); }
[data-activity-type="intervals"]       { background-color: var(--color-activity-intervals); }
[data-activity-type="skipped"]         { background-color: var(--color-activity-skipped); }
```

### Typography Scale

- **Base font:** `system-ui, -apple-system, sans-serif` (set on `<body>`)
- **Base text color:** `rgb(255, 255, 255)` (white on dark background)
- **Heading hierarchy (MUI-based):** `h6` variant in AppBar for app title (rendered as `<h1>`); `h2` for section headings (Training Overview, Insights, Weekly Dashboard)
- **404 page:** 72px / weight 700 for the "404" display number; 28px for the "Page Not Found" heading

### Spacing Conventions

- MUI default spacing scale (8px base unit) via `sx` props and MUI component defaults
- Layout uses flexbox `Box` components (not MUI Grid) to avoid v5 Grid API version concerns
- Top bar clears content area via padding/margin on the content wrapper
- Global reset: `html, body { margin: 0; padding: 0; }`

### Key Reusable Component Patterns

- **Accordion / expand-collapse rows:** `WeekRow` / `RunnerDashboard` — click a week row to expand `week-activities` panel; each row carries `data-testid="week-row"` and expands to show activity rows
- **Data attribute color coding:** `data-activity-type` attribute on `activity-row` and `skipped-activity` elements; CSS tokens applied via attribute selectors — color is supplemented by visible text labels (accessibility requirement)
- **MUI Paper sections:** Used for `training-overview` and `insights` panel placeholders with `component="section"` and `role="region"`
- **Metric display pattern:** `data-testid`-keyed elements for each metric (e.g. `weekly-vo2max`, `weekly-avg-hr`, `weekly-resting-hr`, `intensity-balance`, `trend-training-load`) enabling targeted test assertions and screen reader access
- **Loading state pattern:** `LoadingState` component shown before data renders; gated by async data availability

### Accessibility Baseline

- `<html lang="en">` set on root layout
- `<header>` wraps top bar; `<main>` wraps content area
- Section cards use `role="region"` with `aria-labelledby` pointing to heading
- `data-activity-type` is a CSS hook only — not semantic; activity type is always conveyed via visible text or `aria-label`
- `intensity-balance` element carries `aria-label` with full description (e.g. "Intensity balance: 3 low-intensity sessions, 1 high-intensity session")
- Keyboard navigation: week rows expandable via Enter/Space; dataset selector keyboard-accessible (MUI Select)
- Color is never the sole differentiator — text labels accompany all color-coded elements
- WCAG AA contrast target for text (4.5:1 normal, 3:1 large text) — dark background with white text
- 404 page uses `role="main"` and `aria-hidden="true"` on decorative "404" number display

---

## Data Model

### Entities and Shapes

**`Activity`** _(inferred from developer summaries and Gherkin)_:
```
{
  name: string           // display name, e.g. "Morning Run"
  type: string           // display label, e.g. "Long run" | "Restorative run" | "Intervals"
  duration_min: number
  distance_km: number
  avgHr?: number         // optional; em-dash shown if absent
  cadence?: number       // optional; em-dash shown if absent
  date?: string          // ISO date string _(unconfirmed field name)_
}
```

**`WeekData`** _(inferred; exact shape unconfirmed)_:
```
{
  weekLabel: string      // e.g. "Week 8"
  weekId: string         // e.g. "2024-W10"
  activities: Activity[]
  skipped?: boolean      // true for weeks with a skipped entry (e.g. Week 4 — sickness)
  skippedReason?: string // e.g. "Skipped due to sickness"
  vo2max?: number        // weekly VO2max value
  restingHrAvg?: number  // average resting HR for the week
  trainingLoad?: number  // numeric training load for trend computation
}
```

**Computed / derived per week** (calculated at render time, not stored):
- `weeklyAvgHr`: mean of `activity.avgHr` values (rounded), ignoring nulls
- `weeklyAvgCadence`: mean of `activity.cadence` values (rounded), ignoring nulls
- `intensityBalance`: count of high-intensity (`type === 'intervals'`) vs low-intensity activities
- Trend indicators (`↑ Increasing` / `↓ Decreasing` / `→ Stable` / `—`): computed by `computeTrend()` comparing current vs previous week; threshold >±2% for directional change

**`Dataset`** _(inferred from `domain/dataset.ts` and developer summaries)_:
```
{
  name: string           // e.g. "Half-Marathon Build-Up — 8 Week Consistent Plan"
  weeks: WeekData[]
  isTestFixture?: boolean // true → excluded from selectable datasets in UI
}
```

### Mock vs Real Data

All data is **mocked**. Two data modules serve mock data:

- `frontend/src/data/datasets.ts` — exports the half-marathon fixture dataset (`isTestFixture: true`) and `getSelectableDatasets()` (returns non-fixture datasets for the UI dropdown; currently empty or stub). Contains 8 weeks: Weeks 1–8, Week 4 has no activities and a skipped marker.
- `frontend/src/data/weeklyDashboardData.ts` — exports typed weekly data used by `WeeklyDashboard.tsx`; includes at least W08, W09, W10 with full activity and aggregate data.
- `frontend/src/data/halfMarathonFixture.ts` — fixture data file for the 8-week plan.

`frontend/src/data/loader.ts` is intentionally empty (stub); data loading is handled inline via `getDefaultDataset()`.

---

## Feature Inventory

| Feature | What it added |
|---|---|
| `scaffolding-attempt-7` | Next.js app scaffold; root route returning 200; TopBar with "Health Playground" title and dataset selector placeholder; 404 for unknown routes; build passing |
| `home-page-structure-step-1` | Two-column `HomePage` layout (left: Training Overview + WeeklyDashboard, right: Insights); sticky AppBar with dataset selector (`DatasetSelector`); MUI Paper section placeholders; landmark/heading accessibility structure |
| `visual-theme-overhaul` | Dark theme (`rgb(18,20,24)` background); CSS custom property token system on `:root` for 5 color tokens; `data-activity-type` CSS attribute selectors; `ColorProbe` component for computed-style testing; skipped-activity marker distinct visual treatment |
| `runner-dataset-with-consistent-improvement` | Half-marathon 8-week fixture dataset; `RunnerDashboard` accordion with 8 `week-row` elements sorted newest-first; drill-down to `week-activities`; `ActivityRow` and `SkippedActivity` components; `LoadingState`; week aggregate display (distance, duration, activity count); test fixture isolated from UI picker |
| `enforce-visual-theme` | `data-activity-type` attribute wired to every `activity-row` (snake_case values: `long_run`, `restorative_run`, `intervals`) and `skipped-activity` (`data-activity-type="skipped"`); CSS tokens now structurally applied via DOM attribute contract |
| `make-weekly-dashboard-the-home-page` | Root `/` now renders `WeeklyDashboard` directly (Training Overview removed from page); `/weekly-dashboard` → 308 redirect to `/`; `weekly-dashboard-container` no horizontal overflow at 390px; `TrainingOverview.tsx` deleted |
| `improve-weekly-aggregates-and-prepare-for-more-insights` | Activity-level `avgHr` and `cadence` fields with em-dash fallback; weekly metrics: `weekly-vo2max`, `weekly-resting-hr`, `weekly-avg-hr`, `weekly-avg-cadence`; intensity balance indicator with `aria-label`; week-over-week trend indicators (↑/↓/→/—) for training load, avg HR, resting HR; `weeklyDashboardData.ts` data module; `week-selector` navigation; `activity-list` → `activity-detail` drill-down; responsive at 375px |

---

## Known Constraints

### Architectural
- **Static export only:** Next.js is configured with `output: 'export'` — no server-side rendering, no API routes, no `getServerSideProps`. All data must be bundled statically.
- **No backend:** The system is entirely client-side. Adding a backend requires infrastructure changes (hosting, CORS, secrets, deploy pipeline updates).
- **`/weekly-dashboard` → 308 redirect is load-bearing:** The redirect from `/weekly-dashboard` to `/` is a permanent redirect; any route handler implementing it must preserve the 308 status code (not 301 or 307).
- **`TrainingOverview.tsx` has been deleted:** Do not recreate this file. Its removal is a completed spec requirement (`make-weekly-dashboard-the-home-page`).
- **`theme.ts` (root) is intentionally empty:** `frontend/src/theme.ts` exports nothing — it is a stub kept only to avoid breaking stray imports. Do not add MUI theme configuration here; theme tokens live in `frontend/src/theme/tokens.ts`.

### Design System Non-Negotiables
- **Token values are canonical `rgb(...)` strings:** `themeTokens` values must remain in `rgb(r, g, b)` integer format — tests use exact string equality against `getComputedStyle` output.
- **`data-activity-type` attribute contract:** Values must be snake_case (`long_run`, `restorative_run`, `intervals`, `skipped`). CSS selectors in `layout.tsx` depend on these exact strings.
- **Color is never the sole differentiator:** Every color-coded element must also carry a text label or `aria-label`. This is both an accessibility requirement and a Gherkin-tested constraint.
- **Four activity token colors are pairwise distinct:** All four `--color-activity-*` tokens must remain unique (tested by `visual-theme-overhaul` scenarios).

### Performance-Sensitive
- **`weekly-dashboard-container` horizontal overflow:** The weekly dashboard must not cause horizontal scrollbar at 390px viewport width — this is a regression-tested constraint.
- **Test fixture isolation:** `isTestFixture: true` datasets must never appear in the `DatasetSelector` dropdown. `getSelectableDatasets()` filters them out — do not bypass this filter.

### CI/CD
- **`npm audit --audit-level=high` runs in CI:** All production dependencies must pass a high-severity audit on every PR. New dependencies must not introduce high/critical vulnerabilities.
- **AI agent pipeline chaining:** Workflow stages are triggered by specific commit message tokens (`[NEXT:ux-design]`, `[NEXT:implementation-and-test]`, etc.). Commit messages must not include these tokens outside of intentional pipeline triggers — they are edge-triggered.
- **`[no-trigger]` suffix:** Commits that should not trigger downstream pipelines must include `[no-trigger]` in the message.
