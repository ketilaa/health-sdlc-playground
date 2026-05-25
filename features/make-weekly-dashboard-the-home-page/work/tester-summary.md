## Outer Iteration 3

# Tester Summary: Make Weekly Dashboard the Home Page

## Status: OK

## Input summary
- **Scope:** frontend
- **Scenarios:** 7
- **Implementation:** Next.js static export (`output: 'export'`, `basePath: '/health-sdlc-playground'`) served via `npx serve frontend/out`. All Gherkin scenarios are deferred to E2E by the developer (unit tests cannot assert HTTP status, redirects, viewport layout, or browser navigation). `WeeklyDashboard` component has `data-testid="weekly-dashboard-container"`, H1 "Weekly Dashboard", and `overflowX: hidden`. `TrainingOverview.tsx` is confirmed deleted. `serve.json` issues 308 redirects. `not-found.tsx` generates `404.html`.

## Assumptions

- The app is a static export served by `npx serve frontend/out -p 3000` — not `next start` (which fails with `output: 'export'`).
- `npm run build` in `frontend/` succeeds and emits `frontend/out/` with all necessary HTML files.
- `http://localhost:3000/` returns HTTP 200 and renders the Weekly Dashboard. **Critical caveat**: with `basePath: '/health-sdlc-playground'`, the `out/` directory structure is `out/health-sdlc-playground/index.html`, not `out/index.html`. If `npx serve` serves at root, `/` may return 404 and the correct URL is `/health-sdlc-playground/`. The Gherkin specifies `http://localhost:3000/` — this is taken at face value; if the basePath causes failures, `APP_URL` env var can be set to `http://localhost:3000/health-sdlc-playground`.
- `serve.json` (or equivalent static server config) issues HTTP 308 for `/weekly-dashboard` with `Location: /` exactly. Developer summary states the redirect is to `/health-sdlc-playground/` — this may diverge from the Gherkin assertion `Location: "/"`. Test asserts Gherkin value; test may fail if actual header differs.
- `data-testid="weekly-dashboard-container"` is present in the rendered DOM at `/`.
- No `data-testid="training-overview"` appears anywhere in the DOM at `/`.
- The `frontend/src/components/TrainingOverview.tsx` file has been deleted from disk.
- Port 3000 is free before the test run.
- `e2e/package.json` exists with the declared dependency versions (no new packages added).
- Chromium is installable via `npx playwright install chromium --with-deps`.
- Tests run from the repo root; `__dirname` in step files resolves to `e2e/make-weekly-dashboard-the-home-page/`, so `path.resolve(__dirname, '../..')` reaches the repo root for Scenario 5 filesystem check.
- The app has no authentication layer — no login required to reach `/`.
- `networkidle` wait state is sufficient for the static export — no long-running async data fetches that would leave the page in a loading state indefinitely.

## Decisions

- **`page.goto()` for browser scenarios, `playwrightRequest.newContext()` for raw HTTP scenarios**: Scenarios 1, 2, 4, 6 require a real browser (DOM assertions, viewport, URL bar). Scenarios 3 and 7 require raw HTTP response inspection. Playwright provides both fixtures; mixing them in one suite is clean.
- **`maxRedirects: 0` for Scenario 3**: The only Playwright API option to suppress redirect following is `maxRedirects: 0` on the `APIRequestContext`. This gives us the raw 308 response with its `Location` header.
- **`fs.existsSync` for Scenario 5**: The file-existence check is a pure Node.js filesystem assertion — no browser or HTTP needed. Simpler and more reliable than any browser-based approach.
- **`document.documentElement.scrollWidth <= window.innerWidth` for Scenario 6**: Standard web platform method for detecting horizontal overflow. Playwright's `page.evaluate()` runs in the real Chromium browser at the set viewport size, making this reliable. Chose `scrollWidth` on `documentElement` rather than on the container itself because horizontal scrollbars are a document-level concern.
- **`text=${text}` Playwright locator for text visibility**: Used alongside `page.waitForFunction` to combine polling (wait for text to appear) with visibility assertion (element is not hidden). More robust than a single `waitForSelector`.
- **Module-level shared state (browser, page, context)**: Simpler than a full World object for this feature since all scenarios share the same setup pattern. World file is included but not wired to module state — it is available for future use.
- **`APP_URL` env var**: Allows the basePath issue to be resolved at runtime without modifying test code.

## Alternatives considered

- **Using `page.goto()` with `{ waitUntil: 'domcontentloaded' }` instead of `networkidle`**: Faster but risks asserting before async content renders. `networkidle` is safer for a static export with possible client-side data fetching. Ruled out in favour of reliability.
- **Checking `Location` header case-insensitively**: HTTP headers are case-insensitive but Playwright lowercases them. The comparison `location` (lowercase key lookup) handles this. No alternative needed.
- **Using Playwright's `expect` from `@playwright/test` instead of Node `assert`**: `@playwright/test` is available in `e2e/package.json` but the test runner is Cucumber-JS, not Playwright Test. Mixing `expect` from `@playwright/test` with Cucumber would require importing it directly; Node `assert` is simpler and has no runner dependency. Playwright's `APIRequestContext` is still used for HTTP requests — just the assertion library differs.
- **`page.waitForSelector` instead of `page.waitForFunction` for text**: `waitForSelector('text=...')` is equivalent but `waitForFunction` with `innerText.includes()` is more explicit about partial matching. Chose `waitForFunction` for clarity.
- **Checking `scrollWidth` on `[data-testid="weekly-dashboard-container"]` directly**: The container may have `overflow: hidden` which means its own `scrollWidth` would not reflect overflow — the document-level `scrollWidth` is the correct indicator of whether a scrollbar appears. Container check alone would be a false negative. Kept document-level check.

## Gaps

1. **basePath ambiguity (HIGH)**: The Gherkin asserts `http://localhost:3000/` but `next.config.js` has `basePath: '/health-sdlc-playground'`. With `output: 'export'`, the built `out/` directory contains `out/health-sdlc-playground/index.html`. `npx serve frontend/out` would serve `/` as a directory listing or 404, not the app. The correct URL would be `http://localhost:3000/health-sdlc-playground/`. The feature spec (Gherkin) contradicts the deployment configuration. **Recommendation for calibrator**: The Gherkin should either use `http://localhost:3000/health-sdlc-playground/` as the base URL, or the `run-e2e.sh` should set `APP_URL=http://localhost:3000/health-sdlc-playground` and the step definitions should resolve URLs against `APP_URL`. Currently the tests use `APP_URL` env var as an escape hatch.

2. **Scenario 3 — Location header value**: Gherkin asserts `Location: "/"`. Developer summary states `serve.json` redirects to `/health-sdlc-playground/`. If the actual HTTP `Location` header is `/health-sdlc-playground/`, the test will fail. This is a spec vs. implementation mismatch that the developer deferred to E2E. **Recommendation**: The Gherkin `Location: "/"` assertion may need to be `/health-sdlc-playground/` to match the actual redirect target.

3. **`Then the page returns HTTP status 200` step re-navigates**: The step implementation calls `page.goto(page.url())` to capture the response object (since `page.goto()` in the `When` step returns a response that isn't stored). This causes a double navigation. A cleaner approach would store the response from the `When` step — but Cucumber's step isolation makes this require a World object. Current implementation works but is slightly inefficient.

4. **No `data-testid` on 404 page**: Scenario 7 only asserts HTTP 404 (no DOM assertion), so this is not a blocking gap.

## Output summary
- **Scenarios mapped:** 7 of 7
- **Step definitions written:** 1 file (`make-weekly-dashboard-the-home-page.steps.ts`)
- **World file:** 1 file (`world.ts`)
- **`run-e2e.sh`:** written at repo root
- **Gaps identified:** 2 significant (basePath URL mismatch, Location header value mismatch) + 1 minor (double navigation in HTTP status step)