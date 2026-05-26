STATUS: OK

**Agent Summary**

**Input feature request:** The visual theme established by the visual-theme-overhaul feature has been partially overwritten by subsequent features. The five CSS custom properties on :root (--color-activity-long-run, --color-activity-restorative-run, --color-activity-intervals, --color-activity-skipped, --color-background), the dark body background (WCAG luminance < 0.2), and per-activity-type background-color coding may no longer be applied correctly across all screens. Restore and enforce the full visual theme across the entire app so that all pages — including those added by later features — honour the established design token system. Do not re-specify behavior that is already working; only re-assert what has regressed.

**Interpretation:**
- The reviewer correctly identified that colour assertions ("visually dark background", "different background colour") are implementation details that cannot be verified by a non-technical stakeholder through app interaction alone — they require CSS inspection, which belongs in unit/integration tests.
- The user-observable effect of the design token system is not the colour values themselves but the presence of type-specific CSS class names or data attributes that encode the intended styling intent. These are testable without CSS inspection.
- The correct behavioral proxy for "design token applied to activity type X" is that each activity row carries a data attribute or class that identifies its type, allowing the design system to apply the correct token. If the attribute is absent, the theme cannot be applied regardless of CSS.
- "Dark background" has no user-observable correlate beyond what CSS reports — it cannot be asserted in Gherkin without violating boundaries. This scenario is dropped; the dark background token verification belongs in a CSS unit test or visual regression test outside Gherkin.
- The colour-coding enforcement is instead specified as: each activity row exposes a `data-activity-type` attribute matching the activity's type, and the skipped marker exposes `data-activity-type="skipped"`. This is the behavioral contract that makes the design token system enforceable — if the attribute is present and correct, the CSS token system can function; if absent, it cannot.
- Consistency across weeks is verified by asserting the same attribute value for the same activity type in two different weeks — no CSS comparison needed.

**Decisions:**
- Dropped "dark background" scenarios entirely — no user-observable proxy exists that isn't a CSS mechanic. Verification belongs in developer-layer CSS unit tests.
- Replaced colour inequality/equality assertions with `data-activity-type` attribute presence assertions — these are the behavioral contract that enables the token system.
- All activity type values are pinned to known types from the existing dataset fixture (`long_run`, `restorative_run`, `intervals`, `skipped`).
- Existing `data-testid` identifiers from prior features are reused (`week-row`, `week-activities`, `activity-row`, `skipped-activity`).
- No loading, accessibility, or viewport scenarios added — not requested.

**Alternatives considered:**
- Visual regression snapshots as Gherkin steps — ruled out; snapshot mechanics belong in the tester/integration layer, not Gherkin scenarios for a non-technical stakeholder.
- Asserting a CSS class name (e.g., `class="activity-long-run"`) — ruled out; class names are implementation details equivalent to CSS property names.
- Keeping dark background scenarios with a `data-testid="dark-theme-indicator"` sentinel element — ruled out as artificial; no such element exists in the app and inventing one to satisfy Gherkin would be a testing artefact, not a user-observable feature.

**Output summary:** 4 scenarios written. Dark background scenarios dropped (no valid Gherkin proxy). Colour coding enforced via `data-activity-type` attribute assertions — the behavioral contract that makes the design token system operative. 2 negative cases covered (missing attribute on activity row, missing attribute on skipped marker).