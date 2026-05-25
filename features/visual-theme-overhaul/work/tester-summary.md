## Outer Iteration 3

# Tester Summary — visual-theme-overhaul

## Status: OK

## Input summary
- **Scope:** frontend
- **Scenarios:** 7 (Background + 6 scenarios, one of which is a Scenario Outline with 3 examples = 8 effective test cases)
- **Implementation provides:** A Next.js static export serving a Training Overview page with inline-style activity rows, CSS custom properties on `:root`, a hidden colour probe element (`data-testid="color-probe"`), and a skipped-activity-marker. Developer confirms all Gherkin contracts are satisfied by existing source.

## Assumptions

- The app is a Next.js static export served by `npx serve frontend/out` on port 3000 — `next start` is not used because `output: 'export'` is set.
- The real page URL is `http://localhost:3000/health-sdlc-playground/` (basePath from `next.config.js`), NOT bare `http://localhost:3000/`. The Gherkin Background says `http://localhost:3000/` which maps to the basePath-prefixed path.
- Pre-seeded fixture data is loaded automatically with no user action or authentication required, and contains at least one each of `long-run`, `restorative-run`, `intervals`, and exactly one `skipped-activity-marker`.
- `data-testid="color-probe"` is present in the DOM as described in UX §2.4; if absent, step definitions fall back to creating a temporary probe element.
- `data-testid="activity-row"` exists on the activity row wrapper element and `data-activity-type` is set on that same element (not only on a child).
- `data-testid="activity-row-toggle"` is a child of the activity row element.
- `data-testid="activity-row-expanded"` is a child of the activity row element and carries `data-activity-type` matching its row type.
- Playwright Chromium resolves CSS custom properties correctly in real browser context (unlike jsdom).
- Port 3000 is not occupied when `run-e2e.sh` starts (the script kills any existing process).
- `npx serve` is available in the CI environment.
- `e2e/package.json` already declares all required dependencies at the versions specified; no new packages were added.
- The `npm run build` command succeeds in the frontend directory and produces a valid `out/` directory.

## Decisions

- **Used real Playwright Chromium browser (not jsdom):** CSS custom property resolution and `getComputedStyle` behave correctly in a real browser, unlike jsdom which has limited `var()` support. This is essential for the colour-matching and luminance scenarios.
- **Hidden colour probe technique:** Implemented `resolveCustomProperty()` helper that sets `background-color: var(--token)` on the probe element and reads back via `getComputedStyle` — this is the exact technique described in the Gherkin glossary and UX spec §2.4.
- **Fallback probe element:** If `data-testid="color-probe"` is absent, a temporary invisible div is created and removed within the same page evaluation. This makes tests more resilient without changing application code.
- **Step isolation via `Before`/`After` hooks:** Each scenario gets a fresh browser context and page, preventing state leakage between scenarios.
- **Concrete step definitions for Scenario Outline:** The Outline generates three concrete `Then` steps with literal text; implemented each as a named concrete step rather than a parametrised regex, because the Gherkin does not use parameterised table-driven steps in the standard Cucumber sense — it uses literal `<type>` and `<token>` substitution in the examples table.
- **`activeRow` stored in closure variable:** The expand-row scenario requires state across multiple Given/When/Then steps; stored as a module-level variable reset in `Before`.
- **WCAG luminance computed in test code (not in-browser):** Parsed the canonical `rgb()` string and applied the formula in TypeScript for deterministic, auditable arithmetic.
- **`waitFor({ state: 'visible' })` used throughout:** Never used `page.waitForTimeout()` or arbitrary sleeps, per instructions.

## Alternatives considered

- **Using Playwright's `test` fixture instead of Cucumber + `@playwright/test`:** Ruled out because the pipeline requires Cucumber step definitions mapping to the Gherkin feature file. `@playwright/test` would require rewriting the feature as spec files.
- **Single browser instance across all scenarios:** Ruled out because shared state between colour-mutation tests (e.g., probe element manipulation) could cause false passes or failures. Per-scenario browser context is safer.
- **Asserting exact RGB values (e.g., `rgb(56, 132, 196)`):** Ruled out because the UX spec says implementers "may tune hues" — hardcoding exact values would make tests brittle and incorrect per the spec's intent. Tests assert token consistency (element colour = token value), not specific colours.
- **Using CSS `:root` `getPropertyValue` directly for equality checks (without probe):** Ruled out because custom property values may contain `var()` references, spaces, or non-canonical forms. The probe technique ensures both the expected and actual values are in the same canonical `rgb()` / `rgba()` form.
- **Parametric step matching `{string}` for the Outline examples:** The Gherkin Outline uses `data-activity-type="<type>"` with backtick quoting, not standard Cucumber `{string}` parameter syntax in the step text. Concrete named steps are more reliable for exact text matching.

## Gaps

1. **`data-testid="activity-row"` not explicitly confirmed:** The developer summary lists `activity-row-toggle` and `activity-row-expanded` but never explicitly confirms `activity-row` on the row wrapper. If the implementation uses a different testid or no testid on the wrapper, the expand scenario will fail with a selector error. **Impact:** one scenario (expand/collapse colour retention) would be blocked. **Required fix:** developer confirms or adds `data-testid="activity-row"` on the row wrapper element.

2. **`data-testid="color-probe"` existence assumed:** UX spec §2.4 requires it; developer summary acknowledges `ColorProbe.tsx` exists but does not confirm the testid renders in production. The fallback in step definitions mitigates this, but if `document.body` is not accessible when the probe is created temporarily, the fallback may also fail.

3. **`basePath` URL discrepancy in Gherkin:** The Gherkin Background states `http://localhost:3000/` as the app URL, but the Next.js config uses `basePath: '/health-sdlc-playground'`, meaning the real URL is `http://localhost:3000/health-sdlc-playground/`. The steps navigate to the correct URL, but this is an inconsistency in the Gherkin that the spec author should be aware of — if the spec is later validated literally, it will appear to navigate to a 404. **Recommendation for calibrator:** the Feature agent should be aware that `basePath` causes the Background's URL to be technically incorrect; the Gherkin should either use the full path or note the basePath redirect.

4. **Expanded element `data-activity-type`:** The Gherkin asserts `that expanded element carries the attribute data-activity-type="long-run"`. This is an implementation detail that may or may not be present depending on whether the expanded panel element (not just the row wrapper) carries this attribute. This is a potential source of false failure.

## Output summary
- **Scenarios mapped:** 7 scenarios (8 effective test cases including Outline expansion) → fully mapped
- **Step definitions written:** 1 file (`e2e/visual-theme-overhaul/visual-theme-overhaul.steps.ts`) with all Background, scenario, and outline steps covered
- **Helper functions:** `parseRgb`, `relativeLuminance`, `resolveCustomProperty`, `assertActivityTypeColor`, `ensurePageReady`
- **Gaps identified:** 4 (1 blocking, 3 mitigated or advisory)
- **Files produced:** `run-e2e.sh`, `e2e/visual-theme-overhaul/visual-theme-overhaul.steps.ts`, `features/visual-theme-overhaul/work/tester-summary.md`