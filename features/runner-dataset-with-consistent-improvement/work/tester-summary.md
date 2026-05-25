## Outer Iteration 2

# Tester Summary

## Status
OK

## Input summary
- **Scope:** `frontend`
- **Scenarios:** 10 Gherkin scenarios (Background + 10 scenario blocks)
- **Implementation:** Next.js 15 static export, React 19, TypeScript. The developer summary confirms the feature is already implemented and all Jest/RTL unit tests pass. The E2E layer here exercises the fully-built static export served via `npx serve`.

## Assumptions
- App is served at `process.env.APP_URL || 'http://localhost:3000'` by the time Cucumber runs.
- `npx serve frontend/out -p 3000` successfully serves the static export built by `npm run build` in the `frontend/` directory.
- The "Half-Marathon Build-Up — 8 Week Consistent Plan" fixture dataset is **bundled into the static export** at build time — no runtime API call or seed script is required.
- The fixture dataset is the **default selected** dataset without any user interaction.
- Week 4 is the sickness week (2 activities + skipped marker) and Week 8 is the latest week (3 activities: Long run, Restorative run, Intervals) — these are structural assumptions about the fixture content verified by the Gherkin.
- The `dataset-selector` element uses an underlying MUI `Select` or similar that renders a dropdown with `role="listbox"` and `role="option"` elements when opened.
- The loading state (`dataset-loading`) is rendered on the first JS paint via `setTimeout(0)` / `useState` and disappears after the dataset resolves. The route intercept (`page.route('**/*.json', delay)`) is only effective if the app fetches a `.json` file at runtime. If data is fully inlined in the JS bundle, the loading-state scenario may pass trivially or be timing-sensitive.
- Playwright Chromium is installable in the CI/test environment via `npx playwright install chromium`.
- `e2e/package.json` already declares all needed dependencies at the versions listed; no new packages are added.
- `e2e/tsconfig.json` exists with `lib: ["ES2020", "dom"]` as per the skill note.
- The user is not authenticated — the app is a public static export.

## Decisions
- **`data-testid` selectors throughout:** All Gherkin scenarios are defined in terms of `data-testid` attributes per the UX spec. This makes tests resilient to styling/markup changes while remaining precise about semantic structure.
- **Playwright `locator` + `waitFor` over fixed delays:** Every assertion waits for the element state rather than sleeping, making tests faster and reliable across environments.
- **Route intercept for loading state:** Since the static export may bundle data, a `page.route('**/*.json', delay2000)` intercept is used to simulate slow network. This is the closest approximation for a static export without code changes. If data is fully inlined, this step is flagged as potentially flaky (see Gaps).
- **`chromium` only:** Spec does not require multi-browser coverage; Chromium minimizes install complexity in CI.
- **No mock/stub for fixture data:** The fixture is expected to be in the bundle — testing against real rendered output validates the full pipeline.
- **Separate `world.ts` for browser lifecycle:** `Before`/`After` hooks in `world.ts` + step file manage browser open/close cleanly per scenario without global state leakage.
- **Background step `Given the application is running...` navigates once:** The `When a user opens the application at the root path` step always re-navigates, so the background `Given` does a lightweight reachability check rather than a full load — avoids double-load overhead.

## Alternatives considered
- **Playwright Test runner (`@playwright/test`) instead of Cucumber:** Ruled out because the pipeline explicitly requires Cucumber + Playwright step definitions mapping Gherkin scenarios. `@playwright/test` has no Gherkin integration.
- **`page.emulateNetworkConditions` (CDP) for slow network:** Ruled out because `npx serve` (a Node.js static server) does not expose Chrome DevTools Protocol network conditions the same way a real browser context would for a live server. Route intercept (`page.route`) is the supported Playwright API that works regardless of server type.
- **Waiting for `networkidle` in loading-state scenario:** Ruled out because `networkidle` would wait for the loading to complete before assertions run, preventing us from observing the intermediate loading state. `domcontentloaded` is used instead so assertions can fire while data is still loading.
- **Single global browser instance (not per-scenario):** Ruled out because shared browser state between scenarios could cause interference (e.g., expanded week rows leaking into the next scenario). Per-scenario browser launch is safer, though slower.
- **Using `getByRole` over `locator('[data-testid=...]')`:** Ruled out for the main structural assertions because the Gherkin explicitly references `data-testid` attributes. `getByRole` is used only where text matching is needed (e.g., `getByText`).

## Gaps
1. **Loading state scenario reliability (potential flakiness):** The `dataset-loading` element is visible for only one JS event loop tick (`setTimeout(0)`). The `page.route('**/*.json', delay2000)` intercept only works if the app makes a JSON fetch at runtime. If data is fully inlined in the JS bundle (no network fetch), the intercept has no effect and the loading state flashes before the test can observe it. **This is the most significant gap.** The developer should confirm whether a `fetch('/fixture.json')` or similar call exists. If not, the loading-state test may need the developer to expose a flag/env variable to force a delay in test mode.
2. **Dropdown portal rendering:** MUI `Select` may render its listbox in a portal outside the main content area. The test uses `[role="listbox"]` which is standard, but if the component uses a custom portal or a different ARIA role, the assertion may fail. No `data-testid` is defined on the dropdown container in the UX spec.
3. **No `data-testid` on dropdown options:** The UX spec does not define `data-testid` attributes for individual dropdown options in the `DatasetSelector`. The test relies on `role="option"` and text content, which is fragile if ARIA roles differ.
4. **Ambiguous "8 Week Consistent Plan" name truncation:** The `dataset-selector` displays the full name "Half-Marathon Build-Up — 8 Week Consistent Plan". If the MUI Select truncates the visible text (e.g., CSS overflow ellipsis), `innerText()` may still return the full string (since `innerText` reads the DOM text node), but visual truncation could mislead a manual tester. Not a test gap but worth noting for calibration.

## Output summary
- **Scenarios mapped:** 10/10
- **Step definitions written:** ~30 step implementations in `runner-dataset-with-consistent-improvement.steps.ts`
- **Files produced:** `run-e2e.sh`, `e2e/runner-dataset-with-consistent-improvement/world.ts`, `e2e/runner-dataset-with-consistent-improvement/runner-dataset-with-consistent-improvement.steps.ts`, `features/runner-dataset-with-consistent-improvement/work/tester-summary.md`
- **Gaps identified:** 4 (1 potentially blocking for the loading-state scenario, 3 moderate/minor)