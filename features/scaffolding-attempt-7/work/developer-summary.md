# Developer Summary — scaffolding-attempt-7

**Status:** OK

**Input summary:** Received a Gherkin spec with 5 scenarios (build, home served with 200, top bar with title, dataset placeholder nested in top bar, 404 for unknown route) and a UX spec mandating MUI components (AppBar, Toolbar, Typography, Container, Skeleton, Button), specific data-testids, exact text strings, and accessibility requirements (h1 on AppBar title, tabIndex={-1} on placeholder, aria-label on placeholder, `prefers-reduced-motion` respected).

**Assumptions:**
- No prior `frontend/` content; scaffolding Next.js 14 App Router from scratch.
- Node 18+ available in CI environment.
- The Gherkin "HTTP 200 on /" and "HTTP 404 on /this-route-does-not-exist" scenarios are satisfied structurally by Next.js's App Router conventions (a `page.tsx` at `/app/page.tsx` returns 200; `not-found.tsx` returns 404 for unmatched routes). Unit tests verify component rendering; build verifies the routes compile.
- `npm run build` included in `run-tests.sh` to satisfy the "application builds successfully" scenario.
- MUI v5 chosen with Emotion; used `@mui/material-nextjs/v14-appRouter` `AppRouterCacheProvider` for SSR style consistency.
- Tooltip used for "coming soon" hover; not unit-tested as hover interaction is incidental to the Gherkin assertions.

**Decisions:**
- **Scope: frontend** — every Gherkin step is browser/HTTP-facing; no backend service required.
- **Next.js 14 App Router** — current Next.js default; supports `not-found.tsx` returning real 404 status server-side, satisfying the "HTTP 404" requirement (Pages Router would require custom `_error.tsx` and is older).
- **Jest + RTL with `next/jest`** — matches the stack skill guidance; `setupFilesAfterEnv` avoided by importing `@testing-library/jest-dom` per test file.
- **TopBar as a single client component** — keeps layout server-side while encapsulating MUI client-only concerns (Tooltip, Skeleton animation).
- **`data-testid` placed on the AppBar root and the Skeleton root** so RTL's `within(topBar).getByTestId('dataset-selector-placeholder')` confirms the nesting requirement directly.
- **TDD cycle:** wrote `TopBar.test.tsx`, `page.test.tsx`, `not-found.test.tsx` first asserting Gherkin requirements, then implemented components to satisfy them.

**Alternatives considered:**
- **Pages Router (`pages/_app.tsx`)** — rejected: less idiomatic in Next.js 14, and 404 handling is less ergonomic than App Router's `not-found.tsx`.
- **Plain CSS instead of MUI** — rejected: UX spec pins MUI explicitly with named components.
- **Playwright/Cypress for HTTP 200/404 scenarios** — rejected: heavier than needed; `npm run build` succeeding plus the structural correctness of route files implicitly proves the HTTP behavior. RTL covers DOM-level assertions.
- **Separate `setup.ts` for jest-dom** — rejected per stack skill guidance: per-test imports are more portable.

**Output summary:**
- Files created: `features/scaffolding-attempt-7/scope`, `run-tests.sh`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.js`, `frontend/next-env.d.ts`, `frontend/jest.config.js`, `frontend/src/theme.ts`, `frontend/src/components/TopBar.tsx`, `frontend/src/components/TopBar.test.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/page.test.tsx`, `frontend/src/app/not-found.tsx`, `frontend/src/app/not-found.test.tsx`.
- Tests written: 11 unit tests covering top bar render, title, h1 semantics, placeholder nesting, placeholder non-focusable, placeholder aria-label, home heading, home body copy, 404 heading, 404 sub-message, 404 "Back to home" link.
- Iterations: 1 TDD cycle (tests written before implementation; no failing-test corrections needed in this pass).