## Outer Iteration 1 — TDD Attempt 1

I'll analyze the Gherkin spec and implement the weekly training dashboard with all required features.

**Analysis:**
- This is a frontend feature requiring a new weekly dashboard view with week selector, weekly summary metrics, intensity balance, trend indicators, and activity drill-down
- The existing app uses a different data model (simple activity types, week numbers) - I need to create a new dashboard alongside it
- The new feature needs a completely different data model with ISO week codes, cadence, avg_hr, vo2max, resting HR

**Key calculations for 2024-W10:**
- avg_hr = (148 + 168 + 130 + 140) / 4 = 586/4 = 146.5 → rounds to 147 ✓
- avg_cadence = (172 + 180 + 162 + 165) / 4 = 679/4 = 169.75 → rounds to 170 ✓
- intensity: intervals = high (1), rest = low, recovery = low, long_run = low → Low: 3, High: 1 ✓

**Trend logic for W10 vs W09:**
- Training load W10 > W09 → ↑ Increasing
- Avg HR W10 (147) > W09 (145) → ↑ Increasing  
- Resting HR W10 (52) < W09 (54) → ↓ Decreasing

**Stable scenario for W09 vs W08:** All metrics within 2% of W08








Now I need to fix the `WeeklyDashboard.tsx` to avoid using `require()` (not ideal) and use a proper import instead: