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
- **Seen:** 1
- **Features:** scaffolding-attempt-7
- **Status:** applied
- **Description:** The code reviewer wrote: "The `run-tests.sh` existence and executability is attested to in the developer summary but not in the provided file listing; accepted as present per the summary's output list." Critical executable files were accepted on the developer's word rather than independently verified.
- **Suggested improvement:** Add to the code-reviewer prompt an explicit instruction to verify the presence and executability of any file claimed by the developer (especially scripts like `run-tests.sh` and `run-e2e.sh`) by reading the file directly, and to flag missing files as blocking.

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