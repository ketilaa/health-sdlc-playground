I'll systematically validate the UX specification against all required checks.

## Validation Process

### 1. Scenario-to-UI Coverage Check

| Gherkin Scenario | UX Coverage | Status |
|---|---|---|
| Activity records expose cadence and avg HR fields | Flow 2 + Activity Detail spec | ✅ |
| Activity detail displays dash when absent | Flow 3 + Missing Metric State + Edge Cases | ✅ |
| Weekly summary displays VO2max and resting HR | Flow 1 + Metric Tiles table | ✅ |
| Weekly summary shows avg HR (147) | Flow 1 table row | ✅ |
| Weekly summary shows avg cadence (170) | Flow 1 table row | ✅ |
| Intensity balance Low:3 High:1 with aria-label | Flow 1 Step 4 + Intensity Balance spec | ✅ |
| Trend indicators increasing/decreasing | Flow 1 Step 5 + Trend table | ✅ |
| Trend indicators stable within 2% | Flow 5 + Stable Trend State | ✅ |
| Trend indicators "—" for earliest week | Flow 4 + No Prior Week State | ✅ |
| Browse weeks and drill down | Flow 1 + Flow 2 | ✅ |
| Responsive 375px | Flow 6 + Mobile layout spec | ✅ |

All 11 scenarios covered. ✅

### 2. UI States Check

- Loading: spec explicitly states data is synchronous and mocked — no loading state required. ✅
- Empty: not required by any scenario — no week without data is tested. ✅
- Error: not required by any scenario. ✅
- Success/Default: State 1 defined. ✅
- Partial data (missing fields): State 3 defined. ✅
- Earliest week (no prior): State 4 defined. ✅
- Stable trend: State 5 defined. ✅
- Activity detail expanded: State 2 defined. ✅

### 3. User Flows — Dead Ends and Missing Transitions

- Flow 1→2 (drill down and return): Back navigation specified; focus returns to list item. ✅
- Week switch while detail open: Edge case table covers this ("Activity Detail closes or resets"). ✅
- Escape key closes detail: Specified in Activity Detail keyboard section. ✅
- All flows have explicit entry points and exit conditions. ✅

### 4. Accessibility Review

**ARIA labels:**
- `intensity-balance`: `aria-label` specified verbatim. ✅
- Trend chips: `aria-label` per chip specified with examples. ✅
- Metric tiles: `aria-label` pattern specified (e.g. "VO2max: 54 ml/kg/min"). ✅
- Missing value fields: `aria-label="Average heart rate: not available"` specified. ✅
- Activity List items: `aria-label="Open [activity name] details"` specified. ✅
- Week Selector: `role="listbox"` or native select specified. ✅

**Keyboard navigation:**
- Week Selector: arrow keys / standard select behavior. ✅
- Activity List: arrow keys navigate; Enter/Space activates. ✅
- Activity Detail: Tab navigates within; Escape closes. ✅
- Display-only components (trend chips, intensity balance): marked as non-interactive. ✅

**Focus management:**
- Open drill-down: focus moves to Activity Detail heading. ✅
- Close drill-down: focus returns to triggering list item. ✅
- Escape key: focus return specified. ✅

**Color not sole conveyor:** Trend chips include directional arrow + text alongside color. ✅

**Color contrast:** WCAG AA specified. ✅

**Heading hierarchy:** Activity name is `<h2>` or logical heading level; noted in Activity Detail spec. ✅

### 5. Contradiction Check

- Gherkin: `trend-resting-hr` shows "↓ Decreasing" for W10 vs W09 (W10 resting HR = 52, W09 = 54 — decrease is correct). UX spec: "↓ Decreasing" for resting HR. ✅
- Gherkin: `trend-avg-hr` shows "↑ Increasing" (W10 avg = 147, W09 = 145 — increase correct). UX spec: "↑ Increasing". ✅
- Gherkin: intensity balance aria-label exact string: `"Intensity balance: 3 low-intensity sessions, 1 high-intensity session"`. UX spec specifies exactly this string. ✅
- Gherkin: "—" (dash) for missing metrics and earliest week. UX spec uses em dash U+2014 consistently. ✅
- No contradictions found. ✅

### 6. Design Principles Check

**MUI components identified:** Full component inventory table maps every element to a specific MUI component (Select, ToggleButtonGroup, Card, Typography, List, ListItem, ListItemButton, Chip, Box, Drawer). ✅

**Glanceability:** Weekly Summary Card uses metric tiles with large bold numeric value + small muted label. Typography hierarchy explicitly described. Primary values (54, 52, 147, 170) are prominent. Trend chips with directional symbols are immediately scannable. ✅

**Visual hierarchy:** Color, size, and typography weight described (label in small muted text; value in large bold text). Chip color states mapped to MUI color props. Intensity balance uses cool vs warm color distinction. ✅

**Avoids generic dashboard patterns:** The spec differentiates between metric tiles (2×2/2×3 grid), intensity balance (chip-based low/high split), and trend row (directional chips with color semantics). Not a flat grid of identical stat cards — the intensity balance and trend row provide structural differentiation. ✅

### 7. Experimental UX Checklist

Reviewing against `.claude/skills/experimental-ux.md` principles:

- **Progressive disclosure:** Activity detail only appears on click (not all data shown at once). ✅
- **Contextual data:** Trend indicators are computed in context of the selected week. ✅
- **Visual metaphors are consistent:** Arrow symbols (↑ ↓ →) are used consistently across all three trend chips. ✅
- **No information overload on primary view:** Summary Card shows aggregates, not raw activity data. ✅
- **State transitions are explicit:** All states (default, detail open, missing data, no prior week) are defined with triggers. ✅

### 8. Accessibility Checklist (from `.claude/skills/accessibility.md`)

- **Keyboard accessibility for all interactive elements:** ✅
- **Focus management on modal/panel open and close:** ✅
- **ARIA labels on non-textual/display-only elements:** ✅
- **Color contrast WCAG AA:** ✅
- **Color not sole indicator:** ✅
- **Screen reader text for non-obvious states (dashes, missing data):** ✅
- **Heading hierarchy:** ✅
- **Responsive layout preserves accessibility:** All required elements remain visible at 375px, no elements hidden. ✅

### 9. Internal Consistency Check

- Metric tile units are consistent throughout (bpm for HR metrics, spm for cadence, ml/kg/min for VO2max).
- The "—" character is consistently described as em dash U+2014 throughout.
- data-testid values are consistent between the component inventory, flows, and scenario mapping table.
- Trend chip color note explicitly flags that color valence is deferred — no internal contradiction.
- Activity Detail described as "MUI Card or MUI Drawer (mobile)" — consistent with mobile layout description. ✅

---

## Output

All validation checks pass. Writing output file now.

```markdown
# UX Reviewer Summary

**Status:** OK

**Input summary:**  
Reviewed an 11-scenario Gherkin feature spec and a comprehensive UX specification for a weekly training dashboard. The feature adds activity-level cadence/avg HR fields, weekly-level VO2max/resting HR, computed weekly aggregates, intensity balance indicator, and week-over-week trend indicators. The UX spec includes a full component inventory with MUI mappings, 6 user flows, 5 UI states, component-level specifications, accessibility requirements summary, edge case coverage table, and a scenario-to-UI-state mapping table.

**Interpretation:**  
- "Synchronous and mocked" data means no loading states are required; this is validated as consistent with all 11 scenarios.  
- Em dash "—" (U+2014) is the consistent representation for absent/unavailable values across both activity-level and week-level states.  
- The color-direction note in the trend indicator table is a deliberate deferral, not an omission — directional color only, no valence applied.  
- Activity Detail as "Card or Drawer (mobile)" is treated as a single component with two responsive presentations; both are consistently covered.

**Decisions:**  
- All 11 Gherkin scenarios are explicitly mapped to UX flows and/or UI states with zero gaps.  
- All 5 required UI states (default, detail expanded, missing metric, no prior week, stable trend) are defined with explicit triggers and visible element lists.  
- Every user flow has a defined entry point, step sequence, and exit/return path — no dead ends found.  
- Accessibility coverage is complete: ARIA labels specified for all display-only data elements (metric tiles, intensity balance, trend chips, missing value fields); keyboard navigation specified for all interactive elements; focus management on open/close of Activity Detail is fully defined; color contrast and color-not-sole-indicator requirements are present.  
- All components are identified as specific MUI components (no generic descriptions).  
- Visual hierarchy is explicitly described (large bold value, small muted label, chip color semantics, cool/warm color split for intensity balance).  
- Design avoids a flat identical-card grid: metric tiles, intensity balance row, and trend row are structurally differentiated.  
- Glanceability satisfied: primary numeric values are prominent; trend direction is conveyed by symbol + text + color simultaneously.  
- No contradictions found between Gherkin assertions and UX spec content (text values, ARIA strings, and directional arrows all agree with the test data defined in the Background).

**Alternatives considered:**  
- Flagging the "Card or Drawer" ambiguity in Activity Detail as a gap — ruled out; the spec explicitly states Card for desktop and Drawer for mobile, which is internally consistent with the responsive layout section.  
- Flagging absence of an explicit "loading" state as missing — ruled out; the spec explicitly and correctly documents that data is synchronous and mocked, which aligns with all Gherkin scenarios.  
- Flagging trend color valence as a gap — ruled out; the spec explicitly acknowledges this as a deliberate deferral with a clear note for future revisit.  
- Requiring explicit empty-week error state — ruled out; no Gherkin scenario tests a week with no activities, and the spec correctly omits this state.

**Output summary:**  
All 11 scenarios covered. All UI states defined. All user flows complete with no dead ends. All accessibility requirements present and specific. No contradictions. All design principle checks passed. Specification is ready for implementation.
```

STATUS: OK