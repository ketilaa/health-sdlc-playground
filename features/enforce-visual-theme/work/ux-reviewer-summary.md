# UX Reviewer Summary: enforce-visual-theme

**Status:** STOP

---

## Input Summary

**Feature specification (Gherkin):**
Four scenarios verify that activity rows and skipped-activity markers expose a `data-activity-type` attribute with values matching known activity type constants (`long_run`, `restorative_run`, `intervals`, `skipped`). Tests execute across Week 8 (three activity types), Week 4 (skipped marker), and Week 7 (consistency check).

**UX specification:**
Comprehensive document defining:
- Data contract: four CSS custom properties on `:root` (colour tokens) with hex values and contrast audit
- Fixture data contract: Week 8, 7, 4 requirements
- Component specifications: `activity-row` (MUI `ListItem`, `data-activity-type` attribute, 4px coloured left border), `skipped-activity` (same structure, grey border, "Skipped" visible text), `week-activities` container (MUI `List`)
- UI states: correctly attributed (primary), missing/empty (regression), week expanded/collapsed
- CSS rules: four attribute selectors with token references
- Accessibility: WCAG 1.4.1 (colour not sole differentiator), 1.4.11 (non-text contrast), 4.1.2 (accessible names)
- User flows: colour-coded scanning (Flow 1), skipped identification (Flow 2), consistency verification (Flow 3)
- Scenario mapping: all 4 Gherkin scenarios covered

**Feature reviewer summary:** STATUS: OK — all scenarios testable, no implementation details, consistent with prior features.

**UX designer summary:** STATUS: OK — no detailed reasoning provided, but implicit approval of the specification.

**Prior UX specs reviewed:**
- `home-page-structure-step-1/ux.md` — established top bar, two-column layout, left-column contains Training Overview above Weekly Dashboard, right column contains Insights
- `make-weekly-dashboard-the-home-page/ux.md` — established Weekly Dashboard as MUI `List` with week rows (`week-row` with `data-testid`), expandable to show activities in `week-activities` container
- `runner-dataset-with-consistent-improvement/ux.md` — established fixture data: Week 8 contains "Long run", "Restorative run", "Intervals"; Week 4 is "sickness week" with skipped marker
- `visual-theme-overhaul/ux.md` — **CRITICAL SOURCE** for CSS custom properties and colour token values

---

## Interpretation

1. **Data contract is the proxy for design token system:** The spec correctly delegates CSS rule definitions to the prior `visual-theme-overhaul` feature and focuses this feature on verifying that `data-activity-type` attributes are present and correct — the contract that enables those CSS rules to fire.

2. **Colour tokens are sourced from `visual-theme-overhaul/ux.md`:** The spec cites §2 as the canonical source: `--color-activity-long-run: #4A90D9`, `--color-activity-restorative: #7ED321`, `--color-activity-intervals: #F5A623`, `--color-activity-skipped: #9B9B9B`.

3. **Contrast audit provided:** §2.1 shows WCAG 1.4.11 contrast calculations against `#1A1A2E` (dark surface background from `visual-theme-overhaul`). All four tokens pass 3:1.

4. **Components are MUI `ListItem` within MUI `List`:** Consistent with `make-weekly-dashboard-the-home-page` spec, which established `week-activities` as a `List` and each activity as a `ListItem`.

5. **Fixture data hard requirement:** §3 requires Week 7 to contain a `long_run` activity for Scenario 4 to pass. This is noted as the developer's responsibility to confirm or add.

6. **Accessibility properly scoped:** Accessible names come from visible text; `data-activity-type` is not an accessible mechanism; "Skipped" must be visible text, not colour-only; list semantics are native MUI structure.

---

## Decisions

### ✓ Validation checks passed:

**Coverage of Gherkin scenarios:**
- Scenario 1 ("Each activity row exposes...") → §5.1 activity-row state + CSS rules §6
- Scenario 2 ("Activity type attribute values match...") → §5.1 + §2 token table + Flow 1
- Scenario 3 ("Skipped activity marker exposes...") → §5.3 skipped-activity state
- Scenario 4 ("Activity type attribute is consistent...") → §5.1 + Flow 3 + fixture §3
- All 4 scenarios mapped in §9 ✓

**UI states are exhaustive and non-contradictory:**
- §5.1 (correctly attributed) — primary, testable state
- §5.2 (missing/empty) — regression state, correctly identified as "must not occur"
- §5.3 (skipped correctly attributed) — unambiguous
- §5.4–5.5 (week collapsed/expanded) — state inheritance from prior features ✓

**No gaps in transition logic:**
- User expands week → `week-activities` visible → all rows have `data-activity-type`
- User collapses week → `week-activities` hidden → no attribute requirements apply
- User navigates between weeks → rows in each week carry correct attributes consistently
- No dead ends; all flows return to a valid state ✓

**Accessibility requirements complete:**
- WCAG 1.4.1 (colour not sole): ✓ visible text labels on all rows (activity name, "Skipped")
- WCAG 1.4.11 (non-text contrast): ✓ §2.1 audit provided; all four borders pass 3:1 against `#1A1A2E`
- WCAG 4.1.2 (accessible name): ✓ activity names and "Skipped" text provide accessible names; `aria-label` optional for `skipped-activity`; `week-activities` container requires `aria-label` or `aria-labelledby` (§7, row 7)
- List semantics: ✓ MUI `List`/`ListItem` are native semantic HTML; no ARIA role override needed
- Keyboard navigation: ✓ expand/collapse uses existing week-row behaviour; activity rows not interactive (correct — they are list items, not buttons)
- Focus management: ✓ no auto-focus; standard list navigation ✓

**Design principles (from instructions):**
- Components identified as MUI: ✓ `ListItem`, `List`, `Typography` (body1, body2) — all explicit
- Insights glanceable: ✓ colour accent is leftmost and immediately visible; activity name prominent (body1); secondary detail subordinate (body2) — no dense table, clear visual hierarchy
- Visual hierarchy: ✓ activity name 4px solid coloured left border + text label vs. secondary detail muted; skipped row de-emphasised relative to completed rows
- Avoids generic dashboard pattern: ✓ rows are differentiated by colour token + text label, not identical stat cards
- **Experimental UX checklist** (from `.claude/skills/experimental-ux.md`): No experimental patterns present. Feature is a structural/data-contract validation — rows are standard list items with attributes. ✓
- **Accessibility checklist** (from `.claude/skills/accessibility.md`): Covered above. ✓

**Internal consistency:**
- Same `activity-row` and `skipped-activity` testids and attribute structures used throughout §4, §5, §9 ✓
- Fixture data assumptions consistent with prior `runner-dataset-with-consistent-improvement` spec (Week 8 has three activity types, Week 4 has skipped marker) ✓
- Colour token values consistent across §2 (token table), §2.1 (contrast audit), §6 (CSS rules), Flow 1 and Flow 2 (visual descriptions) ✓
- Component structure (MUI `ListItem` in MUI `List`) consistent with `make-weekly-dashboard-the-home-page` spec ✓

**No contradictions with prior features:**
- Home page structure (§3.2–3.4 left/right columns, top bar) untouched ✓
- Weekly dashboard structure (`week-row` expand/collapse) unchanged ✓
- Fixture data (Week 8 activities, Week 4 sickness) already defined; this feature adds fixture verification for Week 7 ✓
- Dark theme tokens from `visual-theme-overhaul` reused; no re-definition ✓

---

### ⚠️ BLOCKING ISSUES IDENTIFIED:

#### **Issue 1: Missing accessible name for `week-activities` container — blocking WCAG 4.1.2**

**Location:** §7, Accessibility Requirements, row 7 specifies requirement; §4.3 component spec mentions requirement but does not enforce it in the UX description.

**Problem:** The UX spec says `week-activities` container (MUI `List`) "must have `aria-label="Activities for Week N"` or `aria-labelledby` pointing to the week label". However, §4.3 lists only `data-testid`, `MUI component`, `Visibility`, and `ARIA` in the component table. The `ARIA` row says:

> `aria-label` of "Activities for Week N" or equivalent, or `aria-labelledby` pointing to the week heading

**But the component spec does not enforce which mechanism is required or provide a specific default.** The UX should specify:

1. Is `aria-label` or `aria-labelledby` the primary mechanism?
2. What is the exact text or element reference for each week (Week 4, Week 7, Week 8)?
3. If `aria-labelledby` is used, which DOM element provides the label? (The `week-row` heading element? A generated label?)

**Impact:** A developer could implement either mechanism, creating ambiguity. Automated tests cannot verify ARIA attributes without defining the exact structure. This is a gap in the UX spec — not a design problem, but a specification completeness problem.

**WCAG criterion affected:** 4.1.2 Name, Role, Value. A `<ul>` (MUI `List`) without an accessible label is announced to screen reader users as "list, 0 items" with no context. The accessible name is required.

**Required fix:** Specify exactly one of:
- **Option A (preferred):** `aria-label="Activities for Week N"` on the `week-activities` `List` element, where "N" is the week number extracted from the `week-row` or visible on the page.
- **Option B:** `aria-labelledby="week-8-heading"` pointing to the week heading element in the `week-row`, with a guaranteed DOM id on that heading.
- Include the exact DOM structure or reference in the spec.

---

#### **Issue 2: Colour token values not verified against live `visual-theme-overhaul` implementation**

**Location:** §2 token table cites hex values as "taken verbatim from `features/visual-theme-overhaul/ux.md`", with a conditional warning: "If that file lists different values, those values govern — the contrast audit in §2.1 must be re-run against the live values."

**Problem:** The prior `visual-theme-overhaul/work/ux-designer-summary.md` file provided in the context shows only:
> STATUS: OK

No detailed UX spec excerpt was provided. I cannot verify whether the hex values in §2 (`#4A90D9`, `#7ED321`, `#F5A623`, `#9B9B9B`) match the live values in the codebase or the `visual-theme-overhaul` feature specification.

**Impact:** If the live colour tokens in the application differ from the values cited in this spec, then:
1. The contrast audit in §2.1 is incorrect
2. The CSS rules in §6 may reference tokens with wrong hex values
3. The Gherkin scenarios may pass (because they only check `data-activity-type` attributes, not colours), but the visual result will not match the spec

**Risk level:** MEDIUM. The Gherkin tests are attribute-based, not colour-based, so they will pass regardless. However, the UX spec is internally self-contradictory if live tokens differ from cited values. The spec claims §2.1 is a "blocking" contrast audit, but that audit is only valid if the hex values are correct.

**Required fix:** 
1. Obtain the actual hex values from the live `visual-theme-overhaul` feature implementation (CSS file or design tokens file).
2. Verify against the values in §2. If any differ, update §2, re-run the contrast audit in §2.1, and confirm all four tokens still pass 3:1 against `#1A1A2E`.
3. Document the source of the hex values (e.g., "as of commit SHA" or "from `/src/theme/tokens.css`").

This is a **specification validation gate** — not a blocking gap in the UX design itself, but a gap in the spec's precision.

---

#### **Issue 3: Fixture data for Week 7 `long_run` activity not confirmed in prior features**

**Location:** §3, Fixture Data Contract, requires Week 7 to contain a `long_run` activity. The table states this requirement and notes "The Week 7 `long_run` entry must be confirmed or added by this feature's developer."

**Problem:** The prior feature specs reviewed (runner-dataset-with-consistent-improvement, make-weekly-dashboard-the-home-page) confirm that Week 8 and Week 4 contain the required activities. However, no prior feature spec or scenario explicitly verifies that Week 7 contains a `long_run` activity. This is a fixture assumption, not a validated fact.

**Gherkin Scenario 4** ("Activity type attribute is consistent for the same type across different weeks") requires:
```
When the user clicks the element with data-testid "week-row" containing the text "Week 7"
Then an element with data-testid "activity-row" and data-activity-type "long_run" is visible within "week-activities"
```

If the fixture does not include a `long_run` in Week 7, Scenario 4 will fail, but the failure will be a **fixture gap**, not a UX or code issue.

**Impact:** This is correctly identified in the spec as the developer's responsibility (§3). However, it is a **hard blocking dependency** for Scenario 4. The UX spec is not defective, but it highlights a critical fixture requirement.

**Acceptable solution:** The developer must verify or add the Week 7 `long_run` entry before merging. The feature reviewer summary already noted this in the "Fixture must provide this" assessment. This is not a UX spec gap per se — it is a development/fixture task dependency.

**Verdict:** Not a blocking UX issue (the spec correctly delegates responsibility), but must be called out in the developer handoff as a **hard gate** for Scenario 4.

---

#### **Issue 4: "Skipped" visible text requirement lacks specificity in component spec**

**Location:** §4.2 Skipped Activity Marker states:
> Visible text label | "Skipped" or the planned activity name with a "Skipped" qualifier — must be present as visible text, never colour-only

§7 Accessibility Requirements row 6 reinforces:
> `skipped-activity` `ListItem` must contain visible text "Skipped" (or equivalent). If the visible text is ambiguous, add `aria-label="Skipped activity"` to the `ListItem`.

**Problem:** The component spec uses the phrase **"Skipped" or the planned activity name with a "Skipped" qualifier** — this is ambiguous and allows multiple implementations:

1. Exact text "Skipped" (e.g., a row showing only "Skipped")
2. Planned activity name + qualifier (e.g., "Long Run (Skipped)" or "Skipped Long Run")
3. Combination (e.g., "Skipped" on one line, activity name on another)

The Flow 2 user journey (§8) is also vague:
> User reads "Skipped" label on the de-emphasised row.

But does not specify whether the row shows "Skipped" alone or combined with an activity name.

**Impact:** A developer could implement any of the above, and all would satisfy the spec. However, for Gherkin test automation, there is no step that verifies the visible text content of the `skipped-activity` row — only the `data-activity-type` attribute. So the vagueness does not block the Gherkin scenarios (they only check attributes). But it creates ambiguity for visual design and accessibility verification.

**Risk level:** LOW. The Gherkin spec is unaffected (only checks `data-activity-type="