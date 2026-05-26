# Calibration Findings

_Accumulated across all features. Each finding describes a recurring pattern in agent behavior that may warrant a prompt improvement. Manual action required to act on any finding._

---

## Finding: UX-spec details not lifted into Gherkin scenarios

- **Category:** coverage-gap
- **Agent:** product-owner
- **Seen:** 1
- **Features:** scaffolding-attempt-7
- **Status:** applied
- **Description:** The UX spec described narrow-viewport behaviour (§5.3), tooltip text and `aria-label`/`tabIndex` on the dataset placeholder (§4.2), and a loading state (§5.1), but none of these were captured as Gherkin scenarios. The tester explicitly flagged 3 of its 5 gaps as "missing Gherkin scenario" for UX-mandated behaviour, so they end up covered only by unit tests or not at all at the E2E layer.
- **Suggested improvement:** Instruct the product-owner to cross-check the UX spec (when available, or after ux-designer runs) and add Gherkin scenarios for any UX-defined state, accessibility attribute, or viewport behaviour that has observable acceptance criteria. Alternatively, add a coordination pass where the PO revises Gherkin after the UX spec lands.

---

## Finding: Structural-convention coverage of HTTP scenarios at unit level

- **Category:** assumption-risk
- **Agent:** developer
- **Seen:** 1
- **Features:** scaffolding-attempt-7
- **Status:** applied
- **Description:** The developer satisfied the "GET / → 200" and "GET unknown → 404" Gherkin scenarios "structurally" via Next.js App Router conventions (presence of `page.tsx` / `not-found.tsx`) plus `npm run build` success, with no unit-level HTTP assertion. The code reviewer accepted this rationale. The tester then wrote real HTTP assertions using Playwright's `request` fixture — meaning the load-bearing HTTP behaviour was only validated end-to-end, not at the developer's own test stage.
- **Suggested improvement:** Clarify in the developer prompt that HTTP-status Gherkin steps require an explicit assertion at some test layer the developer owns (integration test, supertest-style, or a documented hand-off to E2E). "Structural correctness via framework conventions" should be allowed only when explicitly noted as deferred to E2E.

---

## Finding: Code reviewer trusts developer attestation for file presence

- **Category:** prompt-gap
- **Agent:** code-reviewer
- **Seen:** 3
- **Features:** scaffolding-attempt-7, runner-dataset-with-consistent-improvement, visual-theme-overhaul
- **Status:** applied
- **Description:** The code reviewer accepts file existence and executability on the developer's word rather than independently verifying. In `runner-dataset-with-consistent-improvement` iteration 1 the reviewer wrote "Cannot verify execute bit from file content alone, but the developer-summary states it was written." In `visual-theme-overhaul` iteration 1 the reviewer wrote "Cannot verify file mode bits from text alone. Developer attests it is executable." Critical executable files are accepted on the developer's summary rather than independently verified.
- **Suggested improvement:** Add to the code-reviewer prompt an explicit instruction to verify the presence and executability of any file claimed by the developer (especially scripts like `run-tests.sh` and `run-e2e.sh`) by reading the file directly with the appropriate tool, and to flag missing files or unverifiable permissions as blocking.

---

## Finding: Build/test pre-conditions duplicated between runner script and Gherkin step

- **Category:** spec-gap
- **Agent:** product-owner
- **Seen:** 1
- **Features:** scaffolding-attempt-7
- **Status:** applied
- **Description:** The Gherkin includes "application builds successfully" as a scenario asserting `npm run build` exits 0. The tester's `run-e2e.sh` also builds the app as a precondition for serving it. The tester noted this forces a redundant ~1–2 minute build re-execution and flagged it as an unavoidable gap given the Gherkin wording.
- **Suggested improvement:** In the product-owner prompt, instruct that CLI-level scenarios (build, lint, typecheck) should be tagged or phrased so they can be satisfied by the pipeline's natural preconditions rather than re-executed inside E2E. Alternatively, document a convention for non-browser scenarios that run once at pipeline setup time.

---

## Finding: Spurious / scratch files left in implementation output

- **Category:** prompt-gap
- **Agent:** developer
- **Seen:** 1
- **Features:** scaffolding-attempt-7
- **Status:** applied
- **Description:** The code reviewer found `frontend/package.json.extra` — a file with only a `_note` string, no effect on build or runtime — left behind by the developer. It was flagged as non-blocking but represents output hygiene drift.
- **Suggested improvement:** Add an explicit instruction to the developer prompt to remove any scratch, draft, or "extra" files before finalising output, and have the developer enumerate every file written in their summary so unintended artifacts are visible.

---

## Finding: E2E dependency duplication risk not pre-checked

- **Category:** assumption-risk
- **Agent:** tester
- **Seen:** 1
- **Features:** scaffolding-attempt-7
- **Status:** applied
- **Description:** The tester added `ts-node`, `typescript`, and `@types/node` to `e2e/package.json` and noted: "If the pipeline's base `e2e/package.json` already includes `ts-node`, this would be a harmless duplicate but could cause a version conflict if versions differ." The tester did not read the existing `e2e/package.json` before assuming what to add.
- **Suggested improvement:** Instruct the tester to read the existing `e2e/package.json` (if present) and reuse declared dependencies rather than re-declaring them, and to record actual diffs rather than additive assumptions.

---

## Finding: Developer reports zero TDD cycles when implementation pre-exists

- **Category:** prompt-gap
- **Agent:** developer
- **Seen:** 2
- **Features:** runner-dataset-with-consistent-improvement, visual-theme-overhaul
- **Status:** open
- **Description:** The developer summary across both features states zero TDD cycles because the implementation was already present and green. In `visual-theme-overhaul` the summary states "TDD iterations: 0 — pre-existing green suite satisfies the spec" and "No source/test changes." The developer's role collapses to verification with no record of whether the implementation was independently derived from the Gherkin or whether the tests were ever red. There is no record of whether the existing tests were red-then-green at any point.
- **Suggested improvement:** Clarify in the developer prompt how to behave when the implementation already exists in the repository. Options: (a) require the developer to delete pre-existing implementation and re-derive it under TDD, (b) require an explicit "pre-existing implementation accepted" justification with a checklist confirming each Gherkin scenario was traced back through the existing tests, or (c) flag pre-existing implementation to the calibrator/PO as a workflow anomaly. Currently the agent silently downgrades its own role.

---

## Finding: Gherkin assertion does not verify the intended behaviour

- **Category:** spec-gap
- **Agent:** product-owner
- **Seen:** 1
- **Features:** runner-dataset-with-consistent-improvement
- **Status:** open
- **Description:** Scenario 9 ("Test dataset is isolated from live datasets") asserts that the dropdown contains no option with text matching "Test Fixture". However, the test fixture's actual display name is `"Half-Marathon Build-Up — 8 Week Consistent Plan"` — it does not contain the substring "Test Fixture". The code reviewer flagged this: "the UI test would pass even if the `isTestFixture` filter were broken." The Gherkin assertion is therefore self-satisfying regardless of whether the underlying isolation works. The real guard is a unit test on `getSelectableDatasets()`, but the E2E layer cannot detect a regression.
- **Suggested improvement:** Instruct the product-owner to phrase isolation/exclusion scenarios in terms of the actual identity (name, id) of the entity being excluded, not in terms of an unrelated label. For example: "the dropdown does not list any option with the text 'Half-Marathon Build-Up — 8 Week Consistent Plan'" combined with a separate scenario seeding a live dataset to verify the dropdown is non-empty. Add a review check that exclusion assertions reference identifiers that the excluded entity actually has.

---

## Finding: Loading-state Gherkin step does not map to static-export reality

- **Category:** coverage-gap
- **Agent:** tester
- **Seen:** 1
- **Features:** runner-dataset-with-consistent-improvement
- **Status:** open
- **Description:** The tester flagged that the loading-state scenario assumes "with a slow network simulated" maps to a runtime fetch that can be intercepted with `page.route('**/*.json', delay)`. But the implementation is a Next.js static export that inlines fixture data into the JS bundle — there is no JSON fetch to throttle. The tester wrote: "If data is fully inlined in the JS bundle (no network fetch), the intercept has no effect and the loading state flashes before the test can observe it. This is the most significant gap." The scenario is observable only because the implementation uses an artificial `setTimeout(0)` + `useState(loaded)`, which is a test-only ordering artifact, not a real loading state.
- **Suggested improvement:** Instruct the product-owner to either (a) drop loading-state scenarios for implementations that have no genuine asynchronous data source, or (b) require the developer to expose a test-mode delay knob (env var, query param) that the E2E layer can activate deterministically. The ux-designer/PO pair should agree on whether a loading state is observable before writing it as a scenario.

---

## Finding: Gherkin Background pins URL without verifying Next.js basePath

- **Category:** spec-gap
- **Agent:** product-owner
- **Seen:** 1
- **Features:** visual-theme-overhaul
- **Status:** open
- **Description:** The product-owner pinned the base URL to `http://localhost:3000/` (Revision 2, decision 1) without consulting `next.config.js`. The tester flagged: "The real page URL is `http://localhost:3000/health-sdlc-playground/` (basePath from `next.config.js`), NOT bare `http://localhost:3000/`." The Gherkin Background URL is technically incorrect; the tester's step definitions navigate to the correct URL but future literal validation against the Gherkin would navigate to a 404.
- **Suggested improvement:** Instruct the product-owner to read `next.config.js` (and equivalent framework-config files) before pinning a base URL in a Gherkin Background. The URL in the Background must be the effective URL a browser would reach, including any `basePath`, reverse-proxy prefix, or port-forwarding convention in use.

---

## Finding: jsdom CSS custom property resolution produces weaker unit-test assertion than Gherkin specifies

- **Category:** coverage-gap
- **Agent:** developer
- **Seen:** 1
- **Features:** visual-theme-overhaul
- **Status:** open
- **Description:** Gherkin Scenario 2 specifies that the "resolved value" of each CSS custom property on `document.documentElement` is a non-empty string — meaning `getComputedStyle(document.documentElement).getPropertyValue('--token')` must return non-empty. The unit test instead checks that the injected `<style>` element's text content contains the token name, which is a weaker proxy. jsdom does not apply `<style>` block `:root` rules to `document.documentElement`'s computed custom properties, so the test cannot satisfy the Gherkin literally. The gap is acknowledged by all three code-reviewer iterations but accepted without flagging it as a coverage gap requiring E2E coverage or an explicit deferral note.
- **Suggested improvement:** When a jsdom limitation prevents a unit test from directly asserting a Gherkin step, the developer should (a) note the step as deferred to E2E and ensure the tester's step definitions cover it, or (b) use a test helper that directly calls `element.style.setProperty` and then asserts `getPropertyValue` returns non-empty — which would satisfy the Gherkin literally within jsdom's constraints. The current proxy (CSS text content) should be documented in the developer summary as a known gap and handed off explicitly.

---

## Finding: run-e2e.sh not updated when feature scope changes — prior feature reference persists

- **Category:** assumption-risk
- **Agent:** tester
- **Seen:** 3
- **Features:** visual-theme-overhaul, improve-weekly-aggregates-and-prepare-for-more-insights, home-page-structure-step-1
- **Status:** applied
- **Description:** The tester noted that `run-e2e.sh` at the repo root references `runner-dataset-with-consistent-improvement` step definitions and feature files in `visual-theme-overhaul`, and the code reviewer in `improve-weekly-aggregates-and-prepare-for-more-insights` again confirmed `run-e2e.sh` still references `visual-theme-overhaul`. In `home-page-structure-step-1`, the code reviewer again explicitly noted that `run-e2e.sh` references the prior feature (`make-weekly-dashboard-the-home-page`) and accepted this as "expected per review rules." No agent was prompted to detect or resolve the collision: the repo-root `run-e2e.sh` cannot correctly run E2E tests for both the prior and current features simultaneously if it only references one feature's paths.
- **Suggested improvement:** Instruct the tester to always read the existing `run-e2e.sh` before writing a new one, and to update it to reference all accumulated E2E feature step paths rather than overwriting with only the current feature. Alternatively, define a convention (e.g., one `run-e2e.sh` per feature directory) so the root script does not need updating each time.

---

## Finding: Developer defers UX spec implementation requirements without creating tracked debt

- **Category:** spec-gap
- **Agent:** developer
- **Seen:** 1
- **Features:** visual-theme-overhaul
- **Status:** open
- **Description:** The UX spec explicitly names MUI components throughout (`<Paper>`, `<Collapse>`, `<Stack>`, `<ThemeProvider>`, etc.) and the UX reviewer confirmed full coverage. The developer deferred the MUI rewrite with the rationale that the Gherkin does not mandate MUI. No agent (developer, code-reviewer, or UX-reviewer) recorded this divergence as a tracked debt item or flagged it for follow-up. The UX spec and Gherkin spec now permanently diverge on implementation technology with no resolution path documented.
- **Suggested improvement:** When the developer defers a UX spec requirement that is explicitly named and reviewed, the developer summary should include a "deferred UX requirements" section listing each deferred item and the justification. The code-reviewer should be instructed to flag any deferred UX requirement that is confirmed-passing by the UX reviewer but absent from the implementation, and to require either a Gherkin scenario covering the requirement or an explicit PO sign-off on the deferral.

---

## Finding: data-testid inventory not published by developer, causing tester selector gaps

- **Category:** assumption-risk
- **Agent:** developer
- **Seen:** 2
- **Features:** visual-theme-overhaul, improve-weekly-aggregates-and-prepare-for-more-insights
- **Status:** applied
- **Description:** The tester flagged a blocking gap in `visual-theme-overhaul` that `data-testid='activity-row'` was not explicitly confirmed in the developer summary. In `improve-weekly-aggregates-and-prepare-for-more-insights` the tester listed 13 assumed `data-testid` values as assumptions and flagged that the presence of "Strength Cross-Train" (which has null avg_hr/cadence fields essential to Scenario 2) "cannot be verified at E2E level" without clicking the activity — the E2E test has no reliable way to confirm the testid inventory matches expectations without a published developer manifest. The developer summary lists some testids but does not enumerate all attributes present on rendered DOM elements.
- **Suggested improvement:** Instruct the developer to include a complete `data-testid` inventory table in their summary, listing every `data-testid` attribute present in the implementation with the element type and parent context. This gives the tester a reliable reference and eliminates assumption-driven selector gaps.

---

## Finding: Code reviewer cannot verify core module when file content is truncated

- **Category:** prompt-gap
- **Agent:** code-reviewer
- **Seen:** 1
- **Features:** improve-weekly-aggregates-and-prepare-for-more-insights
- **Status:** applied
- **Description:** The code reviewer explicitly stated that `weeklyDashboardData.ts` content "was truncated in the implementation files provided" and that it "cannot directly verify" the `computeTrend` threshold logic, `trendLabel` function, W09 dataset values, or `strengthCrossTrainActivity` export — all of which are load-bearing for Scenarios 2, 4, 5, 7, 8, and 9. The reviewer inferred correctness from test assertions and the developer summary, explicitly citing this as a violation of its own Evidence Rule. The file is the single most business-logic-dense module in the feature, yet it was invisible to review.
- **Suggested improvement:** Instruct the code-reviewer prompt to treat any file listed as an import or dependency but whose content is unavailable (due to truncation or omission) as an automatic blocking concern requiring the reviewer to fetch or request the file before proceeding. The developer prompt should also be instructed to ensure all newly created files — especially domain/data modules — are explicitly emitted in full in the implementation output, not omitted due to size limits.

---

## Finding: Gherkin Background numeric value contradicts scenario assertion under threshold logic

- **Category:** spec-gap
- **Agent:** product-owner
- **Seen:** 1
- **Features:** improve-weekly-aggregates-and-prepare-for-more-insights
- **Status:** applied
- **Description:** The Gherkin Background stated "W09 has average HR of 145 bpm" but the trend scenario (Scenario 7) asserted "↑ Increasing" for W10 (avg HR 147) vs W09. With a 2% threshold, 145 bpm produces a change of only 1.38% — which would yield "→ Stable", contradicting the scenario assertion. The developer resolved this by setting W09 activity avg HR to 143 (producing 2.8% change) and treating the Background's "145 bpm" as "approximate/descriptive." This required a load-bearing implementation decision made silently without any spec revision or reviewer flag.
- **Suggested improvement:** Instruct the product-owner to verify all numeric values in Gherkin Backgrounds are arithmetically consistent with all THEN assertions that depend on them — specifically for threshold-based computations (percentages, ratios, comparisons). A calculation table (showing: W09 value, W10 value, delta, threshold, expected direction) should accompany any scenario that asserts a computed direction. The feature-reviewer should be explicitly instructed to perform this arithmetic check as part of its consistency pass.

---

## Finding: Responsive layout Gherkin scenario cannot be satisfied by unit tests — no explicit E2E deferral recorded

- **Category:** coverage-gap
- **Agent:** developer
- **Seen:** 1
- **Features:** improve-weekly-aggregates-and-prepare-for-more-insights
- **Status:** applied
- **Description:** Scenario 11 specifies "Given the user navigates to the app with a viewport width of 375 pixels" and asserts elements "remain readable." The developer's unit test checks DOM presence only with no viewport set, acknowledged explicitly by the code reviewer: "The test does NOT set viewport width to 375px." The tester's E2E step creates a fresh context at 375px, which is the only correct test layer for this scenario. However, the developer did not record this as a deferred-to-E2E scenario, and the code reviewer accepted the weaker DOM-presence check without flagging a formal deferral.
- **Suggested improvement:** Instruct the developer to explicitly label any Gherkin scenario whose GIVEN includes a viewport width, device type, or environment constraint as "deferred to E2E" in the developer summary. The code-reviewer should be instructed to flag any scenario with a viewport/device GIVEN that is covered only by a unit test without a documented E2E deferral, and to treat the absence of a deferral note as a blocking gap.

---

## Finding: Week selector implementation choice undocumented — tester forced into multi-strategy step definition

- **Category:** assumption-risk
- **Agent:** tester
- **Seen:** 1
- **Features:** improve-weekly-aggregates-and-prepare-for-more-insights
- **Status:** applied
- **Description:** The UX spec allowed either an MUI Select (role="combobox") or a ToggleButtonGroup (role="group" with buttons) for the week selector. The developer did not document which was implemented. The tester noted: "The UX spec says 'MUI Select or ToggleButtonGroup' without specifying which the developer chose. The multi-strategy step definition handles both but adds complexity. If neither pattern matches, the test will throw a descriptive error." The tester had to implement branching detection logic and record the widget type as an unresolved assumption.
- **Suggested improvement:** Instruct the developer to document, for every UI widget where the UX spec offered multiple implementation options, which option was chosen and what the resulting ARIA role and DOM structure are. This information belongs in the developer summary and directly informs the tester's step definitions, eliminating multi-strategy fallback logic.