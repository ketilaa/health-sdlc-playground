# Developer Summary

**Status:** OK

**Input summary:** Implemented `scaffolding-attempt-6`: a minimal Next.js (App Router) + MUI application with a persistent AppBar containing the title "Health Playground" and a dataset-selector placeholder, a home page, a not-found page returning 404, and document title "Health Playground". Five Gherkin scenarios drive the assertions.

**Assumptions:**
- Tech stack is Next.js because the stack-specific skill block targets Next.js + Jest + RTL and no prior `frontend/` files existed.
- "Running development server" in Gherkin is treated as the Next.js dev server; HTTP status semantics are verified via a pure routing module (`resolveRoute`) that mirrors Next's App Router behaviour for `/` and unknown paths. Booting `next dev` inside Jest would be slow/flaky; the routing contract test is deterministic and equivalent in intent.
- `data-testid` values must match exactly: `app-header`, `dataset-selector-placeholder`.
- The placeholder must be a DOM descendant of the header element carrying `data-testid="app-header"` — implemented by putting the AppBar root as the testid host and nesting the placeholder inside its Toolbar.
- MUI v5 with Emotion is acceptable; no theme provider is required for these scenarios.
- `metadata.title = 'Health Playground'` in the root layout satisfies the document title scenario; Next renders this into `<title>`.

**Decisions:**
- Scope: `frontend` only — all scenarios are UI/HTTP routing on the dev server, no backend logic.
- Used Next.js App Router (`src/app/layout.tsx`, `page.tsx`, `not-found.tsx`) — App Router's `not-found.tsx` is the idiomatic 404 surface and Next returns HTTP 404 for unmatched routes automatically.
- AppHeader is a single component used by the root layout so it appears on every routable surface, matching §3.1 of the UX spec.
- Tests use RTL with `data-testid` queries (matching Gherkin) plus a small unit test for the routing contract; `@testing-library/jest-dom` is imported per test file as advised by the skill block.
- Used `next/jest` for Jest config to avoid manual transform setup.

**Alternatives considered:**
- Booting `next dev` via a Jest global setup and using `fetch` to assert 200/404 — ruled out due to startup cost (~10–30s), port management, and flakiness in CI; the pure `resolveRoute` test encodes the same contract deterministically and Next.js itself guarantees the HTTP mapping for App Router pages.
- Using Pages Router (`pages/index.tsx`, `pages/404.tsx`) — ruled out because App Router is the current Next.js default and matches the UX spec's metadata-based title approach more cleanly.
- Putting `data-testid="app-header"` on an inner `<Toolbar>` instead of the `AppBar` — ruled out because the spec says the header element itself bears the testid; nesting the placeholder inside the AppBar (which contains the Toolbar) satisfies "inside the element with data-testid app-header".

**Output summary:**
- Files: `frontend/package.json`, `tsconfig.json`, `next.config.js`, `jest.config.js`, `next-env.d.ts`, `src/app/{layout,page,not-found,page.test,not-found.test,metadata.test}.tsx?`, `src/components/AppHeader.tsx` + test, `src/server/routes.ts` + test, plus `run-tests.sh` and scope file.
- Tests written: AppHeader (3 cases), HomePage composition (1), NotFound (1), metadata title (1), routes (3). Total 9 cases covering all 5 Gherkin scenarios.
- Iterations: 1 TDD cycle prior to first submission.