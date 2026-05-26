STATUS: OK

---

## Feature Reviewer Summary

**Status:** OK

**Input summary:**
The feature enforces the visual theme established by a prior visual-theme-overhaul feature. Five CSS custom properties on `:root` (colour tokens for activity types and background) and a dark body background may have regressed due to subsequent changes. The specification requires that activity rows expose their type via a `data-activity-type` attribute to enable the design token system to apply correct styling. Four Gherkin scenarios verify:
1. Each activity row has a non-empty `data-activity-type` attribute
2. Activity type values match known types (`long_run`, `restorative_run`, `intervals`)
3. Skipped activity marker exposes `data-activity-type="skipped"`
4. Attribute consistency across different weeks

**Interpretation:**
- The product owner summary correctly identified that direct CSS assertions (colour values, luminance, computed styles) are implementation details unsuitable for Gherkin and belong in unit/CSS tests.
- The behavioral proxy for "design token applied" is the presence and correctness of the `data-activity-type` attribute — this is the contract that enables the token system to function.
- All scenarios describe user-observable outcomes: elements and their attribute values, verifiable without CSS inspection or developer tools.
- No scenarios attempt to verify: CSS property values, RGB colours, luminance formulas, file system paths, HTTP status codes, codebase structure, or network timing.
- Dark background scenarios were dropped (no valid Gherkin proxy exists) — correct decision.
- Existing `data-testid` identifiers are reused from prior features (`week-row`, `week-activities`, `activity-row`, `skipped-activity`), consistent with the runner-dataset and make-weekly-dashboard features.

**Decisions:**

✓ **Scenario 1: "Each activity row exposes its activity type for colour coding"**
- GIVEN: app running, fixture loaded
- WHEN: navigate home, click "Week 8" row
- THEN: verify each `activity-row` within `week-activities` has non-empty `data-activity-type` attribute
- Assessment: Testable, self-contained, pinned to "Week 8", uses existing data-testids from prior features. ✓

✓ **Scenario 2: "Activity type attribute values match the known activity types"**
- GIVEN: app running, fixture loaded
- WHEN: navigate home, click "Week 8" row
- THEN: verify visible `activity-row` elements with `data-activity-type` values `long_run`, `restorative_run`, `intervals`
- Assessment: Pinned to exact attribute values and visible elements. Uses existing Week 8 fixture data (verified in runner-dataset feature as containing "Long run", "Restorative run", "Intervals"). ✓

✓ **Scenario 3: "Skipped activity marker exposes its type for colour coding"**
- GIVEN: app running, fixture loaded
- WHEN: navigate home, click "Week 4" row
- THEN: verify `skipped-activity` element has `data-activity-type="skipped"`
- Assessment: Uses existing `skipped-activity` testid from prior feature. Week 4 confirmed as "sickness week" with skipped marker in runner-dataset feature. ✓

✓ **Scenario 4: "Activity type attribute is consistent for the same type across different weeks"**
- GIVEN: app running, fixture loaded
- WHEN: navigate home, click "Week 8", verify `long_run` attribute; click "Week 7", verify `long_run` attribute again
- THEN: same attribute value across weeks
- Assessment: Tests consistency without CSS comparison. Does not require Week 7 to be verified in prior features (only Week 8 and Week 4 are explicitly confirmed in runner-dataset). Assumes Week 7 contains a `long_run` activity — fixture must provide this, but Gherkin does not require prior scenario validation. This is acceptable as a regression-detection scenario per the reviewer brief. ✓

**No blocking issues identified:**

- ✓ All GIVEN/WHEN/THEN steps are clear and testable
- ✓ No ambiguous terms; all attribute values and week labels are pinned to exact values
- ✓ Both positive (attribute present, correct values, consistent) and negative (attribute missing or incorrect) scenarios are covered implicitly via the attribute-presence assertions
- ✓ Each scenario is self-contained with explicit navigation and week selection
- ✓ No implementation details: no CSS inspection, HTTP codes, file paths, arithmetic formulas, or codebase references
- ✓ Consistency: all scenarios use the same navigation pattern and fixture assumptions
- ✓ `data-testid` identifiers (`week-row`, `week-activities`, `activity-row`, `skipped-activity`) are reused from prior features and consistent with existing codebase
- ✓ No contradictions with prior features: the attribute assertions do not conflict with existing home-page, runner-dataset, or weekly-dashboard behavior
- ✓ Edge cases: empty attribute value is explicitly tested ("non-empty value"); missing attribute is implicitly tested by requiring visible elements with the attribute
- ✓ Testability: all scenarios can be verified by automated tests via RTL `getAttribute()`, `getByTestId()`, and DOM queries
- ✓ Regression detection: Scenario 4 re-asserts a behavior across multiple weeks to detect regression of attribute consistency — acceptable per reviewer brief

**Alternatives considered:**
- Testing CSS class names instead of data attributes: Ruled out — class names are implementation details equivalent to CSS property names.
- Adding a sentinel `data-testid="dark-theme-indicator"` for dark background verification: Ruled out as noted in product owner summary — artificial element not representing actual user-observable feature.
- Including visual regression snapshot assertions: Ruled out — snapshot mechanics belong in integration/visual test layer, not Gherkin for non-technical stakeholders.

**Output summary:**
4 scenarios received, all testable and unambiguous. No implementation details detected. Attribute-based assertions correctly proxy for design token system enforcement. No contradictions with prior features. Zero blocking issues.