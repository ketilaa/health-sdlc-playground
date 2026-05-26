STATUS: OK

---

# UX Reviewer Summary: enforce-visual-theme

## Status
**OK** — All Gherkin scenarios are fully covered by the UX specification with no gaps, contradictions, or accessibility failures.

---

## Input Summary

**Feature:** enforce-visual-theme

**Gherkin Specification:**
- 4 scenarios validating that activity rows and skipped-activity markers expose `data-activity-type` attributes
- Scenario 1: Each activity row has non-empty `data-activity-type`
- Scenario 2: Attribute values match known types (`long_run`, `restorative_run`, `intervals`)
- Scenario 3: Skipped activity marker has `data-activity-type="skipped"`
- Scenario 4: Attribute consistency across different weeks

**UX Specification:**
- Defines the attribute contract between DOM and CSS token system
- Maps existing components (`activity-row`, `skipped-activity`) to attribute requirements
- Provides UI state definitions, user flows, accessibility requirements, and attribute value reference
- Explicitly declares no new visual components, tokens, or layout changes

**Prior Feature Specs & Summaries:**
- `visual-theme-overhaul`: Established CSS custom properties (colour tokens) applied via descendant selectors
- `runner-dataset-with-consistent-improvement`: Confirmed Week 8 contains "Long run", "Restorative run", "Intervals"; Week 4 is "sickness week" with skipped marker
- `make-weekly-dashboard-the-home-page`: Established `week-row`, `week-activities`, `activity-row`, `skipped-activity` testids and expansion interaction pattern
- `home-page-structure-step-1`: Established top-bar, content-area layout and accessibility patterns

All prior UX designer summaries are `STATUS: OK` with no blocking concerns.

---

## Interpretation

1. **Attribute as proxy for token application:** The spec correctly uses the presence and value of `data-activity-type` as a behavioral proxy for the design token system working correctly. The feature does not test CSS computed values (which belong in unit/visual tests); it tests the DOM contract that enables the tokens to be applied.

2. **No new visual components or patterns:** The spec explicitly states this feature enforces existing components, not introduces new ones. The activity row and skipped-activity marker already exist from `make-weekly-dashboard-the-home-page`. This is a structural/wiring feature, not a design step.

3. **Fixture assumptions:** Scenarios are pinned to specific week identifiers ("Week 8", "Week 4") and activity types. These are grounded in the fixture data verified by `runner-dataset-with-consistent-improvement`. Week 4 skipped marker and Week 8 activities are confirmed as present in the test dataset.

4. **Consistency with prior features:** All testids (`week-row`, `week-activities`, `activity-row`, `skipped-activity`) are reused from `make-weekly-dashboard-the-home-page`, not invented here. Expansion behavior and navigation patterns are unchanged.

5. **Accessibility not regressed:** The spec confirms accessibility requirements are satisfied:
   - `data-activity-type` is decorative (CSS hook only), not semantic — not a substitute for ARIA or text labels
   - Activity type must be communicated via visible text, not via attribute
   - Colour is supplemented by text labels
   - No keyboard or focus changes introduced
   - Skipped activity label requirement enforced

6. **Gherkin testability:** All scenarios use existing DOM query APIs (`data-testid`, `getAttribute()`). No CSS inspection, no computed style assertions, no file system or HTTP checks. Steps are atomic and self-contained.

---

## Decisions

### ✓ Scenario 1: Each activity row exposes its activity type for colour coding
- **Gherkin:** "each element with data-testid='activity-row' within 'week-activities' has a 'data-activity-type' attribute with a non-empty value"
- **UX Mapping:** Section 3.1 (Activity Row), Section 4.1 (Expanded Week — Activities Loaded), Flow 1 Step 3
- **Assessment:** 
  - ✓ UI state fully described: `activity-row` elements are rendered within `week-activities` when a week is expanded
  - ✓ Attribute requirement explicit: "Each `activity-row` element MUST carry a `data-activity-type` attribute whose value is a non-empty string"
  - ✓ Testable via `getAttribute('data-activity-type')` on each visible `activity-row`
  - ✓ No ambiguity on "non-empty" — excludes null, undefined, empty string
  - **No blocking issues**

### ✓ Scenario 2: Activity type attribute values match the known activity types
- **Gherkin:** Verifies visible elements with `data-activity-type="long_run"`, `"restorative_run"`, `"intervals"` within `week-activities`
- **UX Mapping:** Section 3.1 (Activity Row — Required values table), Section 6 (Attribute Value Reference), Flow 1 Step 3
- **Assessment:**
  - ✓ Attribute value reference (Section 6) provides normative list: `long_run`, `restorative_run`, `intervals`, `skipped`
  - ✓ Table in Section 3.1 confirms machine-readable values (snake_case, lowercase)
  - ✓ Week 8 fixture confirmed to contain these three activity types (per `runner-dataset-with-consistent-improvement` summary)
  - ✓ Testable via `getByTestId('activity-row')[i].getAttribute('data-activity-type')` and assertion against expected values
  - ✓ No constraint on display labels (still "Long Run", "Restorative Run") — only the attribute value is pinned
  - **No blocking issues**

### ✓ Scenario 3: Skipped activity marker exposes its type for colour coding
- **Gherkin:** "the element with data-testid='skipped-activity' within 'week-activities' has a 'data-activity-type' attribute with value 'skipped'"
- **UX Mapping:** Section 3.2 (Skipped Activity Marker), Section 4.2 (Expanded Week — Skipped Activity Present), Flow 2
- **Assessment:**
  - ✓ Attribute requirement explicit: "`skipped-activity` element MUST carry a `data-activity-type` attribute with the value `"skipped"`"
  - ✓ Week 4 fixture confirmed as "sickness week" with skipped marker (per `runner-dataset-with-consistent-improvement`)
  - ✓ Accessibility checked: Section 7 requires "`skipped-activity` element must include visible text or an `aria-label` communicating that the activity was skipped"
  - ✓ Testable via `getByTestId('skipped-activity').getAttribute('data-activity-type')` === `'skipped'`
  - **No blocking issues**

### ✓ Scenario 4: Activity type attribute is consistent for the same type across different weeks
- **Gherkin:** Expands Week 8, verifies `long_run` attribute; expands Week 7, verifies `long_run` attribute again; asserts consistency
- **UX Mapping:** Section 3.1 (Activity Row — same attribute values across renders), Flow 3 (User Compares Activity Types Across Weeks), Section 4.1 (same token applied via same selector)
- **Assessment:**
  - ✓ UX spec explains consistency model: "The accent colour applied to long run activities is identical across weeks because it derives from the same CSS token (`--color-activity-long-run`) via the same attribute selector — not from inline styles or per-row logic"
  - ✓ Attribute value contract is stateless: `long_run` in Week 8 uses the same value as in Week 7, so the same CSS selector applies
  - ✓ Week 7 assumed to contain a long-run activity (fixture must provide; Gherkin doesn't require prior validation of Week 7 content in feature scenarios, only in fixture loading)
  - ✓ Testable via two `getAttribute()` calls across different week expansions and comparison
  - ✓ Regression-detection scenario per reviewer brief: valid use of Gherkin to catch breakage of consistency
  - **No blocking issues**

---

## Accessibility Validation

**Against `.claude/skills/accessibility.md` checklist items:**

1. ✓ **ARIA attributes used correctly:** `data-activity-type` is explicitly NOT an ARIA attribute (Section 7, "Attribute is decorative, not semantic"). Activity type is communicated via visible text labels.

2. ✓ **Colour not sole differentiator:** Section 7 requirement: "The accent colour applied via `data-activity-type` CSS selectors must be supplemented by the visible text label for each activity type."

3. ✓ **Keyboard navigation:** Section 7 explicitly preserves: "Expanding/collapsing via Enter/Space" — no change from existing interaction pattern.

4. ✓ **Focus management:** Section 7 requires: "Expanding a week row moves focus to the `week-activities` container or its first child, consistent with the interaction pattern established in `make-weekly-dashboard-the-home-page`."

5. ✓ **Screen reader text:** Section 7, "Activity type communicated to screen readers:" — "The activity type (e.g. 'Long Run') must be conveyed via visible text or `aria-label` — not via `data-activity-type`."

6. ✓ **Semantic HTML:** Existing components (`activity-row`, `skipped-activity`) already have semantic structure from prior features; this spec does not regress that.

7. ✓ **Label association:** Skipped activity label requirement (Section 7): "`skipped-activity` element must include visible text or an `aria-label`" — not reliant on attribute alone.

**No accessibility gaps identified.**

---

## Experimental UX Validation

**Against `.claude/skills/experimental-ux.md` checklist:**

This feature does not introduce new visual components or experimental patterns. It enforces an existing design token system via a DOM attribute contract. Checklist application:

1. ✓ **Components are identified as MUI components:** Not applicable — no new components. Existing `activity-row` and `skipped-activity` components are inherited from prior features.

2. ✓ **Insights are glanceable:** Not applicable — feature does not change data presentation. Colour accents (applied via existing tokens) remain the primary visual differentiator; text labels remain readable.

3. ✓ **Visual hierarchy:** Not applicable — no new visual hierarchy introduced. Existing layout and typography from `make-weekly-dashboard-the-home-page` unchanged.

4. ✓ **Avoid generic patterns:** Not applicable — feature enforces consistency, not genericness.

**No experimental UX concerns.**

---

## Design Token Consistency Check

**Prior feature:** `visual-theme-overhaul`

**UX Designer Summary (prior):** `STATUS: OK`

**Established tokens referenced in `enforce-visual-theme`:**
- `--color-activity-long-run`
- `--color-activity-intervals`
- `--color-activity-restorative-run`
- `--color-activity-skipped`
- `--color-surface`
- `--color-background`

**UX Spec's treatment of tokens:**
- Section 2 references these tokens as "established in the `visual-theme-overhaul` feature"
- Section 9 (Out of Scope): "Changes to the CSS custom property definitions themselves" — not redefined here
- Attribute values are machine-readable identifiers matching token suffixes: `long_run` → `--color-activity-long-run`, etc.

**Assessment:** ✓ No deviation from established design system. Tokens are referenced, not modified. Attribute naming convention (`snake_case`, lowercase) is consistent with CSS identifier conventions and prior codebase patterns.

---

## Gherkin–UX Mapping Summary

| Scenario | UX Section(s) | State | Flow | Coverage |
|---|---|---|---|---|
| 1. Each activity row has non-empty `data-activity-type` | 3.1, 4.1, 6 | Expanded Week — Activities Loaded | Flow 1 Step 3 | ✓ Full |
| 2. Attribute values match known types | 3.1, 4.1, 6 | Expanded Week — Activities Loaded | Flow 1 Step 3 | ✓ Full |
| 3. Skipped activity marker has `data-activity-type="skipped"` | 3.2, 4.2 | Expanded Week — Skipped Activity Present | Flow 2 Step 3 | ✓ Full |
| 4. Attribute consistent across weeks | 3.1, 4.1, Flow 3 | Expanded Week — Activities Loaded (repeated) | Flow 3 Steps 1–3 | ✓ Full |

**All 4 scenarios covered with no gaps.**

---

## Potential Non-Blocking Observations

1. **Week 7 fixture not explicitly verified in prior features:** Scenario 4 assumes Week 7 contains a long-run activity. The fixture is loaded in the Background step; the runner-dataset feature only explicitly confirms Week 8 and Week 4 content. This is acceptable because:
   - Gherkin does not require forward-references to confirm all test data
   - The test fixture is external to the feature spec
   - If Week 7 lacks a long-run activity, the scenario will fail during test execution, providing immediate feedback
   - This is a **regression-detection scenario**, not a positive-path scenario, so it's appropriate to trust the fixture

2. **"machine-readable (snake_case, lowercase)" — redundancy noted but acceptable:** Section 3.1 and Section 6 both define the attribute values. This is intentional: Section 3.1 specifies the requirement on the component; Section 6 provides a reference table for developers. No contradiction.

3. **Section 4.4 (Loading State) assumes optional async loading:** The spec states "If week activities are fetched asynchronously: a skeleton or spinner is shown." The Gherkin doesn't test loading states; the spec correctly marks this as conditional ("If"). No gap — spec is defensive without over-specifying.

4. **Section 4.6 (Empty State) — no `activity-row` elements:** The spec notes "the absence of `activity-row` elements means the attribute requirement trivially passes." This is correct: if there are no elements, the assertion "each element has the attribute" is vacuously true. No gap.

---

## Output Summary

**Status:** ✓ **OK**

**All Gherkin scenarios fully covered:**
- Scenario 1: Activity row attribute presence → UX Section 3.1, State 4.1, Flow 1
- Scenario 2: Attribute values match known types → UX Section 6, State 4.1, Flow 1
- Scenario 3: Skipped activity marker attribute → UX Section 3.2, State 4.2, Flow 2
- Scenario 4: Consistency across weeks → UX Section 3.1, State 4.1, Flow 3

**No blocking issues identified:**
- ✓ No undefined states or dead-end flows
- ✓ No accessibility gaps or failures
- ✓ No contradictions with Gherkin or prior features
- ✓ All attribute values explicitly defined and normative
- ✓ All UI states clearly mapped to scenarios
- ✓ Consistency with established design token system confirmed
- ✓ Keyboard navigation and focus management preserved

**Accessibility validation:** All requirements met (ARIA usage, colour + text labels, keyboard nav, focus management, screen reader support).

**Design consistency:** Feature enforces existing design system without modification; no new components or patterns introduced.

---