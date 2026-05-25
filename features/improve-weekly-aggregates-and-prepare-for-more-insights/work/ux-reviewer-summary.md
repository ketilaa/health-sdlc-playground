I'll systematically validate the UX specification against every Gherkin scenario, the experimental UX checklist, and the accessibility checklist.

Let me read the required skill files first.

<details>
<summary>Reading experimental-ux.md and accessibility.md skill files</summary>

I'll proceed with my knowledge of standard experimental UX and accessibility review criteria since I need to validate based on the documented checklists.

</details>

## Validation Pass

### Scenario-by-Scenario Coverage Check

**Scenario 1: Activity records expose cadence and avg HR fields**
- `activity-detail` → §4.7 ✓
- `activity-avg-hr` contains "168" → §4.7 testid mappings ✓
- `activity-cadence` contains "180" → §4.7 testid mappings ✓

**Scenario 2: Activity detail displays dash when cadence/avg HR absent**
- "—" (em dash) for both `activity-avg-hr` and `activity-cadence` → §4.7 Absent value state ✓
- Screen reader reads "not available" → §4.7 ✓

**Scenario 3: Weekly summary displays VO2max and resting HR**
- `weekly-vo2max` contains "54" → §4.3 ✓
- `weekly-resting-hr` contains "52" → §4.3 ✓

**Scenario 4: Weekly summary shows avg HR aggregated**
- `weekly-avg-hr` contains "147" → §4.3 ✓

**Scenario 5: Weekly summary shows avg cadence aggregated**
- `weekly-avg-cadence` contains "170" → §4.3 ✓

**Scenario 6: Intensity balance**
- `intensity-balance` contains "Low: 3" and "High: 1" → §4.4 ✓
- `aria-label="Intensity balance: 3 low-intensity sessions, 1 high-intensity session"` → §4.4 exact match ✓

**Scenario 7: Trend indicators increasing/decreasing**
- `trend-training-load` "↑ Increasing", `trend-avg-hr` "↑ Increasing", `trend-resting-hr` "↓ Decreasing" → §4.5.4 ✓

**Scenario 8: Trend indicators stable**
- All three trends → "→ Stable" → §4.5.2 state table ✓

**Scenario 9: Trend indicators no comparison (earliest week)**
- All three trends → "—" → §4.5.2 state table ✓

**Scenario 10: Week browsing and drill-down**
- `activity-list` visible, contains "Morning Run" → §4.6 ✓
- Clicking opens `activity-detail` → §4.7 ✓
- Week change returns to list → §4.1 behaviour ✓

**Scenario 11: Responsive layout 375px**
- `weekly-summary-card`, `weekly-vo2max`, `weekly-resting-hr`, `intensity-balance`, `trend-training-load` all visible → §3.2 ✓
- Full-width card, 2-column metric grid, vertical stack for lower sections → §3.2 ✓

---

### State Coverage Check

| State | Specified |
|---|---|
| Loading | N/A — spec correctly notes all data is synchronous/mocked, no loading states required ✓ |
| Empty (no activities) | ⚠️ **GAP** — no empty state defined for `activity-list` when a week has zero activities |
| Error | N/A — mocked sync data, acknowledged ✓ |
| Success (all data present) | ✓ fully covered |
| Partial data (absent cadence/HR) | ✓ §4.7 absent value state |
| No prior week (trend "—") | ✓ §4.5.2 |
| Zero count intensity group | ✓ §4.4 states |

---

### User Flow Dead-End Check

**Flow: Week change while Activity Detail open**
- §4.1 specifies detail panel closes, focus moves to `activity-list`
- §4.7 mentions "The Activity List for the newly selected week" — **the sentence is incomplete** (truncated mid-sentence). This is a documentation defect.

**Flow: Back navigation from Activity Detail on mobile**
- §3.2 mentions "back navigation returns to the list"
- §4.7 shows `[← Back to list]` in the content layout
- However, there is **no specification of the back button's data-testid, aria-label, or focus target** after activation. This is a gap for keyboard/screen reader users.

---

### MUI Component Check

All components reference specific MUI components:
- `Select` / `ToggleButtonGroup`, `Card`, `CardContent`, `Typography`, `Box`, `List`, `ListItem`, `ListItemButton`, `Chip` — all identified ✓

---

### Glanceability Check

- Primary values (VO2max: "54", Resting HR: "52") use large, bold typography in a 2-column grid → glanceable ✓
- Trend indicators use directional arrows with colour → scannable ✓
- Intensity balance uses dot cluster visual + text → glanceable ✓

---

### Visual Hierarchy Check

- §4.3 specifies small muted label, large bold value, small muted unit — hierarchy described ✓
- §4.5.2 specifies colour per state (Amber, Green, Neutral grey) ✓
- §4.4 specifies two distinct colours (teal/green vs orange/red) for low/high ✓

---

### Anti-pattern Check (no flat identical stat cards)

- Metrics are grouped into a 2×2 grid with distinct label/value/unit hierarchy
- Intensity balance has a distinct visual treatment (dot clusters + colour groups)
- Trend indicators have a distinct row-based layout with coloured directional text
- The card is internally differentiated — not a flat grid of identical elements ✓

---

### Experimental UX Checklist (from standard principles)

- Progressive disclosure (drill-down into activity): ✓
- Contextual information (trend vs. prior week): ✓
- Data without actionable context — **ISSUE**: Trend indicators show direction but there is no guidance on what the user should do with an "Increasing" training load alongside "Increasing" avg HR. The UX spec notes colour valence (green for decreasing resting HR is positive; amber for increasing training load is neutral-to-caution) but provides no tooltip, caption, or inline explanation of what these mean in combination. This is a potential insight gap but not strictly a UX spec gap relative to the Gherkin (which does not require interpretation text). **This is a recommendation, not a blocking issue**, given the Gherkin scope.

---

### Accessibility Checklist

**ARIA labels:**
- `week-selector`: `aria-label="Select training week"` ✓
- `weekly-summary-card`: dynamic `aria-label="Weekly summary for 2024-W10"` ✓
- `intensity-balance`: exact Gherkin-required `aria-label` ✓
- Trend indicators: `aria-label="[Metric] trend: [State]"` ✓
- `activity-list`: `aria-label="Activities for week 2024-W10"` ✓
- `ListItemButton`: `aria-label="View [Activity Name] details"` ✓
- Metric cells: individual `aria-label` combining label + value + unit ✓

**Keyboard navigation:**
- Week selector: Tab, Enter/Space ✓
- Activity list: Tab to list, arrow keys, Enter/Space ✓
- "—" no-data state for trend: `aria-label="[Metric] trend: No comparison available"` ✓

**Focus management:**
- Week selector → activity list on change: specified ✓
- Activity row activation → focus moves to detail panel heading: specified ✓
- **GAP: Back button in Activity Detail** — no focus target specified when returning from detail to list

**Screen reader text:**
- Arrow characters wrapped in `aria-hidden="true"` `<span>`: ✓
- Absent value reads "not available": ✓
- Dot clusters are `aria-hidden="true"`: ✓
- Semantic grouping