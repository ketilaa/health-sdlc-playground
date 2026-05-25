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
- **Seen:** 2
- **Features:** scaffolding-attempt-7, runner-dataset-with-consistent-improvement
- **Status:** applied
- **Description:** The code reviewer accepts file existence and executability on the developer's word rather than independently verifying. In iteration 1 of `runner-dataset-with-consistent-improvement`, the reviewer wrote: "Cannot verify execute bit from file content alone, but the developer-summary states it was written." Critical executable files are accepted on the developer's summary rather than independently verified.
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
- **Seen:** 1
- **Features:** runner-dataset-with-consistent-improvement
- **Status:** open
- **Description:** The developer summary across both outer iterations states "TDD cycles: 0 net — feature was already green" and "every Gherkin scenario maps directly to existing code paths and existing tests; modifying would risk regressions for no behavioral gain." The developer performed verification rather than TDD, accepting a pre-existing implementation wholesale. There is no record of whether the existing tests were red-then-green at any point, nor whether the implementation was independently re-derived from the Gherkin. The developer's role effectively collapsed to "verify and add `run-tests.sh`".
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