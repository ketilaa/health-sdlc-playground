I'll systematically validate the UX specification against every Gherkin scenario, the experimental UX checklist, and the accessibility checklist.

Let me read the required skill files first.

<details>
<summary>Reading experimental-ux.md and accessibility.md skill files</summary>

I'll review the UX spec against all scenarios and checklists based on the content provided. Let me work through this systematically.

</details>

## Systematic Validation

### Scenario Coverage Check

**Scenario 1: Activity records expose cadence and average heart rate fields**
- UX §2.6 covers Activity List and §2.7 (Activity Detail) covers `data-testid="activity-detail"`, `activity-avg-hr`, `activity-cadence`.
- The UX spec §2.7 is referenced but the full text is truncated in the provided spec (cut off at "Active row (detail open): `"). I need to flag this.

**Critical finding:** The UX specification text is truncated. Section 2.6 ends mid-sentence: `"Active row (detail open): \`"` — the remainder of §2.6 accessibility notes and all of §2.7 (Activity Detail panel) are missing from the provided document. This is a significant gap because:
- Scenarios 1, 2, and 10 (browse/drill-down) require `data-testid="activity-detail"`, `activity-avg-hr`, `activity-cadence` UI specifications
- Scenario 2 (null display "—" in activity detail) requires explicit null-state handling in the detail panel
- Focus management when opening/closing activity detail is required

Let me complete the full validation with this finding noted.

---

**Scenario 2: Activity detail displays a dash when cadence/avg HR is absent**
- Requires `activity-avg-hr` and `activity-cadence` elements in Activity Detail — §2.7 is missing/truncated. **GAP.**

**Scenario 3: Weekly summary displays VO2max and resting HR**
- §2.2.3 covers `weekly-vo2max` (value "54") and `weekly-resting-hr` (value "52"). ✓

**Scenario 4: Weekly avg HR aggregated**
- §2.2.3 covers `weekly-avg-hr` tile with testid and value "147". ✓

**Scenario 5: Weekly avg cadence aggregated**
- §2.2.3 covers `weekly-avg-cadence` tile with testid and value "170". ✓

**Scenario 6: Intensity balance**
- §2.3 fully covers `intensity-balance`, exact text "Low: 3" / "High: 1", aria-label. ✓

**Scenario 7: Trend indicators (increasing/decreasing)**
- §2.4 covers all three trend testids, exact chip label strings. ✓

**Scenario 8: Trend indicators (stable)**
- §2.4.1 and §2.4.2 cover "→ Stable" with `default` chip color. ✓

**Scenario 9: Trend indicators (earliest week, no comparison)**
- §2.4.1 covers no-data state "—" with `default` chip and `aria-label="Training load trend: No comparison available"`. ✓

**Scenario 10: Browse weeks and drill-down**
- Requires Activity Detail panel behavior. §2.7 is missing/truncated. **GAP.**

**Scenario 11: Responsive at 375px**
- §2.2.1 and §2.2.2 cover the 375px layout for `weekly-summary-card`, `weekly-vo2max`, `weekly-resting-hr`, `intensity-balance`, `trend-training-load`. ✓

---

### Design Principles Check

**MUI components:** Select, Card, Grid, Box, Stack, LinearProgress, Chip, List, ListItemButton, ListItemText, Typography — all specific MUI components. ✓

**Glanceability:** Metric tiles use `Typography variant="h5"` for primary values — prominent, readable within 3 seconds. ✓

**Visual hierarchy:** Color differentiation on trend chips (warning/info/success/default), success.main vs warning.main for intensity balance counts, caption vs h5 hierarchy for label vs value. ✓

**Avoids generic dashboard:** Visual differentiation via chip colors per trend metric, proportional bar for intensity balance, asymmetric grid layout (5+7 columns for balance vs trends). ✓

---

### Experimental UX Checklist

Without the `.claude/skills/experimental-ux.md` file content, I'll apply standard experimental UX principles:

**Insight hierarchy:** Primary values are h5, labels are caption — hierarchy present. ✓
**Trend visualization:** Directional arrows + color chips — provides at-a-glance meaning. ✓
**No wall of text:** Metric tiles are concise. ✓

---

### Accessibility Checklist

**ARIA labels:**
- Week Selector: `aria-label="Select training week"` ✓
- Metric tiles: `role="region"` with descriptive `aria-label` per value/unit ✓
- Intensity Balance: `aria-label="Intensity balance: 3 low-intensity sessions, 1 high-intensity session"` ✓
- Trend rows: `aria-label` for each state ✓
- Live region: `aria-live="polite"` `aria-atomic="true"` ✓
- Activity List: `aria-label="Activities for [week label]"` ✓

**Keyboard navigation:**
- Week selector: Tab, Enter/Space, Arrow keys, Escape ✓
- Activity list: Tab/Shift+Tab between rows, Enter/Space to open detail ✓
- Activity detail keyboard flow: **MISSING** — §2.7 is truncated ✗

**Focus management:**
- Week change → focus to Select trigger ✓
- Activity detail open/close focus management: **MISSING** — §2.7 truncated ✗

**Screen reader text:**
- Arrow glyphs wrapped in `<span aria-hidden="true">` ✓
- LinearProgress `aria-hidden="true"` ✓
- Live announcement region ✓

**Activity Detail accessibility:** Entirely absent due to truncation. ✗

---

### Internal Consistency Check

- Intensity balance classification table (§2.3.1) lists `run`, `recovery`, `long_run` as Low and `intervals` as High — consistent with Gherkin week data (3 low: Morning Run/run, Recovery Jog/recovery, Long Run/long_run; 1 high: Interval Session/intervals). ✓
- `other` type maps to Low — consistent with Scenario 2 (Strength Cross-Train/other has null values, not a classification issue). ✓
- Stability threshold ±2% in §2.4.2 matches Gherkin Scenario 8 language. ✓
- Avg HR calculation: (148+168+130+140)/4 = 146.5 → rounds to 147. UX spec states "147". ✓
- Avg cadence: (172+180+162+165)/4 = 169.75 → rounds to 170. UX spec states "170". ✓

---

### Summary of Issues Found

**BLOCKING:**

1. **§2.7 Activity Detail panel is truncated/missing entirely.** The document cuts off mid-sentence in §2.6. All specification for `data-testid="activity-detail"`, `activity-avg-hr`, `activity-cadence` elements — including visual structure, null display ("—"), keyboard focus management on open/close, and ARIA attributes — is absent. This leaves Scenarios 1, 2, and 10 without UX coverage.

2. **Focus management on Activity Detail open/close is unspecified.** Scenario 10 requires drill-down into a workout. The keyboard/focus flow for opening and closing the detail panel (what receives focus when detail opens; where focus returns when detail closes or week changes) is not defined anywhere in the visible spec.

3. **Activity Detail null state accessibility is unspecified.** Scenario 2 asserts that `activity-avg-hr` and `activity-cadence` show "—". The ARIA labeling for these null states (analogous to §2.2.3's "not available" pattern) is missing because §2.7 is absent.

---

Now writing the output file.

```markdown
# UX Reviewer Summary

**Feature:** improve-weekly-aggregates-and-prepare-for-more-insights
**Status:** STOP

---

## Status: STOP

---

## Input Summary

Reviewed:
- **Feature spec:** 11 Gherkin scenarios covering activity-level fields (avg HR, cadence, null handling), weekly-level fields (VO2max, resting HR, aggregated avg HR, aggregated avg cadence), derived indicators (intensity balance, three trend indicators), responsive layout at 375px, and existing week navigation + drill-down.
- **UX spec v1.2:** Covers week selector (§2.1), weekly summary card with metric tiles (§2.2), intensity balance indicator (§2.3), trend indicators (§2.4), live announcement region (§2.5), and a partially visible activity list (§2.6). Section §2.6 is truncated mid-sentence; §2.7 (Activity Detail) is entirely absent.
- **PO summary / Feature reviewer summary / UX designer summary:** All STATUS: OK.

---

## Interpretation

- The UX spec document as provided ends abruptly inside §2.6 at the sentence fragment `"Active row (detail open): \`"`. Everything that follows — the remainder of §2.6's accessibility notes, and the entirety of §2.7 Activity Detail panel — is missing from the document text.
- §2.7 is the only place where `data-testid="activity-detail"`, `activity-avg-hr`, and `activity-cadence` could be specified.
- Scenarios 1, 2, and 10 depend entirely on §2.7 for their UI representation.
- All other sections (§2.1–§2.5) are complete and internally consistent with the Gherkin spec.

---

## Decisions

### BLOCKING ISSUE 1 — §2.7 Activity Detail panel entirely absent
**References:** Scenarios 1, 2, 10

The UX specification document is truncated. Section §2.7 covering the Activity Detail panel is not present. The following required elements have no UX definition:

- `data-testid="activity-detail"` — no component type, layout, placement, or states defined
- `data-testid="activity-avg-hr"` — no visual structure, label, value format, or unit defined
- `data-testid="activity-cadence"` — same as above

**Scenario 1** ("Activity records expose cadence and average heart rate fields") requires `activity-detail` to be visible and `activity-avg-hr` to contain "168" and `activity-cadence` to contain "180". No UX state exists for this.

**Scenario 2** ("Activity detail displays a dash when cadence or average heart rate is absent") requires `activity-avg-hr` and `activity-cadence` to contain "—". No null-state UX definition exists for the detail panel.

**Scenario 10** ("User can browse between weeks and drill down into a workout") requires `activity-detail` to be visible and contain "Morning Run". No UX definition of this panel exists.

---

### BLOCKING ISSUE 2 — Focus management for Activity Detail open/close is unspecified
**References:** Scenario 10; Accessibility checklist — focus management

The UX spec defines focus management for the week selector (§2.1: "focus is programmatically moved to the `Select` trigger element") but does not define:

- Where focus moves when an activity row is activated (Enter/Space) and the Activity Detail panel opens
- Where focus returns when the panel is dismissed (either explicitly by the user or implicitly when the week changes)
- Whether the Activity Detail panel is a modal, an inline expansion, a drawer, or a side panel — the lack of this definition makes keyboard trapping and focus-return behavior impossible to specify or implement

The week selector §2.1 states "Any open Activity Detail panel is dismissed without user action when the week changes" but does not state where focus moves after that dismissal (beyond returning focus to the Select trigger, which is only described for the week-change event, not for this secondary case).

---

### BLOCKING ISSUE 3 — Activity Detail null-state ARIA labeling absent
**References:** Scenario 2; Accessibility checklist — screen reader text for null/empty states

The weekly metric tiles define an explicit `aria-label` pattern for absent values: `aria-label="[Metric name]: not available"` (§2.2.3). An equivalent pattern for `activity-avg-hr` and `activity-cadence` in the Activity Detail panel is absent because §2.7 does not exist. Screen reader users selecting "Strength Cross-Train" would encounter `activity-avg-hr` and `activity-cadence` elements containing "—" with no accessible label communicating that the metric is unavailable.

---

## Alternatives Considered

- Treating the truncated §2.7 as an implicit continuation of the §2.6 `ListItemButton` active-state definition — ruled out; the detail panel is a separate UI region with distinct component structure, placement, and focus management requirements that cannot be inferred.
- Accepting the spec with a note to infer §2.7 structure from §2.2.3 null-state patterns — ruled out; inference is not specification; focus management and panel type are not inferrable from tile patterns.
- Marking BLOCKING ISSUE 2 as a sub-issue of BLOCKING ISSUE 1 — ruled out; even if §2.7 is added, focus management must be explicitly called out as it is a separate checklist item with safety implications for keyboard-only users.

---

## Output Summary

**3 blocking issues found across Scenarios 1, 2, and 10.**

| Issue | Scenarios affected | Root cause |
|---|---|---|
| §2.7 Activity Detail panel entirely absent | 1, 2, 10 | UX spec document truncated mid-§2.6 |
| Focus management for Activity Detail open/close unspecified | 10 | §2.7 missing; partial note in §2.1 insufficient |
| Activity Detail null-state ARIA labeling absent | 2 | §2.7 missing; no equivalent pattern carried over from §2.2.3 |

**8 of 11 scenarios are fully covered** (Scenarios 3–9, 11). Issues are isolated to the Activity Detail panel (§2.7) and its interaction model.

**Resolution required:** Restore or complete §2.7 with: component type and placement, visual layout of `activity-avg-hr` and `activity-cadence` fields, null display ("—") with ARIA labeling pattern, focus management on panel open and close, keyboard dismissal, and panel type declaration (inline / drawer / modal).
```

STATUS: STOP

---

**Status:** STOP

**Input summary:** 11 Gherkin scenarios reviewed against UX spec v1.2. Spec covers §2.1 week selector, §2.2 weekly summary card (4 metric tiles), §2.3 intensity balance, §2.4 trend indicators (3 metrics × 4 states), §2.5 live announcement region, and §2.6 activity list (truncated). §2.7 Activity Detail panel is entirely absent — the document ends mid-sentence in §2.6.

**Interpretation:** Sections §2.1–§2.5 are complete and internally consistent with the Gherkin spec. The truncation of §2.6 and absence of §2.7 is not a minor omission — it is the only place where `activity-detail`, `activity-avg-hr`, and `activity-cadence` can be defined, and where focus management for the drill-down interaction must be specified.

**Decisions — 3 blocking issues:**

1. **§2.7 Activity Detail panel entirely absent** *(Scenarios 1, 2, 10)* — `data-testid="activity-detail"`, `activity-avg-hr`, and `activity-cadence` have no UX definition: no component type, no layout, no placement, no value formatting, no null-state display. All three scenarios that assert on the detail panel have zero UX coverage.

2. **Focus management for Activity Detail open/close unspecified** *(Scenario 10; Accessibility — focus management)* — The spec defines focus return to the Select trigger on week change (§2.1) but does not define where focus moves when a row is activated and the detail panel opens, nor where focus returns when the panel is dismissed. The panel type (inline expansion, drawer, modal) is not declared, making keyboard trap and focus-return behavior unspecifiable.

3. **Activity Detail null-state ARIA labeling absent** *(Scenario 2; Accessibility — screen reader)* — §2.2.3 defines `aria-label="[