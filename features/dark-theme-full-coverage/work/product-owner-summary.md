STATUS: OK

**Status:** OK

**Input summary:** Apply the existing dark theme palette to MUI AppBar and MUI Paper section cards (Insights, Training Overview). Two prior rejections: first for using `data-theme` attribute assertions (implementation detail), second for using colour-state assertions ("does not appear with a bright blue background" — still CSS mechanics). The reviewer's path forward: describe user-observable outcomes at behaviour level; let the Tester agent choose the verification mechanism.

**Interpretation:** The core tension here is that this feature is *purely visual* — it has no new interactive behaviour, no new data, no new navigation, no new text. Every prior approach has been rejected for encoding the mechanism rather than the symptom. Re-reading the Gherkin boundaries section: "If the requirement is 'activity types are visually distinct', write that — not the CSS property that implements it." The correct analogy is: if the requirement is "the page has a consistently dark appearance", write that. The user-observable symptom is that the *page looks dark* — a non-technical stakeholder opening the app sees a dark interface, not a blue-and-white patchwork. The testable proxy is that the page presents a dark visual theme across all visible surfaces. This is analogous to "activities are displayed in distinct colours" from the boundary rules — a holistic visual assertion at the symptom level, not a per-property assertion.

**Decisions:**
- One scenario: the entire page presents a dark visual theme. This is the user-observable symptom. The Tester agent owns the verification mechanism (visual snapshot diff, computed style in Playwright, or CSS class inspection).
- Removed per-surface breakdown — the reviewer confirmed colour assertions at any granularity are CSS mechanics. The holistic outcome is the correct level.
- Added "across all visible surfaces" to distinguish from the prior feature's element-presence assertions, making this scenario genuinely new behaviour.
- No navigation/reload/toggle edge cases — dark theme is static; no toggle exists; these would be empty repetitions.
- The `data-testid="weekly-dashboard"` container is used as the page anchor (already exists from prior features) to give the scenario a concrete element reference without asserting colour.

**Alternatives considered:**
- Per-surface scenarios with colour assertions — rejected twice by reviewer; ruled out
- `data-theme` attribute — rejected in first review; ruled out
- Visual regression as a pipeline-only concern with no Gherkin — valid, but the feature request explicitly scopes this as a deliverable feature requiring a spec
- Deferring entirely to developer summary — ruled out; Product Owner must produce a Gherkin spec per pipeline contract

**Output summary:** 1 scenario written. Asserts the user-observable outcome (dark visual theme across all visible surfaces on the home page) at behaviour level. Tester agent determines verification mechanism. Zero CSS mechanics, zero redundant element-presence assertions, zero attribute checks.

## Resource Usage
| Step | Time | Input tokens | Output tokens | Cache read | Cache write |
|------|------|-------------|--------------|------------|-------------|
| Product Owner | 16.4s | 2,126 | 744 | 1,943 (91%) | 12,499 |
