export interface Activity {
  id: string
  type: string
  name: string
  distanceKm?: number
  durationMin?: number
  avgHr?: number
  cadence?: number
}

export interface SkippedWeek {
  reason: string
}

export interface Week {
  weekNumber: number
  label: string
  activities: Activity[]
  skipped?: SkippedWeek
  vo2max: number
  restingHrAvg: number
  trainingLoad?: number
}

export interface Dataset {
  id: string
  name: string
  isTestFixture?: boolean
  weeks: Week[]
}

/**
 * Half-Marathon Build-Up — 8 Week Consistent Plan
 *
 * Fixture dataset for testing. Values chosen to satisfy all Gherkin assertions:
 * - Week 1: no prior week → "—" for both trends
 * - Week 3: vo2max and restingHrAvg both within ±2% of Week 2 → "→ Stable"
 * - Week 8: vo2max >+2% vs Week 7 → "↑ Increasing"; restingHrAvg >-2% vs Week 7 → "↓ Decreasing"
 * - Week 4: skipped (sickness)
 * - Week 7 & 8: have long_run activities (enforce-visual-theme Scenario 4)
 * - Week 8: has long_run, restorative_run, intervals (enforce-visual-theme Scenario 2)
 */
export const fixtureDataset: Dataset = {
  id: 'half-marathon-8-week',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: true,
  weeks: [
    // Week 1 — baseline, no prior week for comparison → "—"
    {
      weekNumber: 1,
      label: 'Week 1',
      vo2max: 42.0,
      restingHrAvg: 58,
      trainingLoad: 80,
      activities: [
        {
          id: 'w1-a1',
          type: 'Long run',
          name: 'Easy Long Run',
          distanceKm: 10.0,
          durationMin: 75,
          avgHr: 142,
          cadence: 168,
        },
        {
          id: 'w1-a2',
          type: 'Restorative run',
          name: 'Recovery Jog',
          distanceKm: 5.0,
          durationMin: 35,
          avgHr: 132,
          cadence: 164,
        },
        {
          id: 'w1-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 7.0,
          durationMin: 45,
          avgHr: 158,
          cadence: 178,
        },
      ],
    },
    // Week 2 — slight improvement
    {
      weekNumber: 2,
      label: 'Week 2',
      vo2max: 42.5,
      restingHrAvg: 57,
      trainingLoad: 95,
      activities: [
        {
          id: 'w2-a1',
          type: 'Long run',
          name: 'Long Run',
          distanceKm: 12.0,
          durationMin: 85,
          avgHr: 143,
          cadence: 169,
        },
        {
          id: 'w2-a2',
          type: 'Restorative run',
          name: 'Recovery Run',
          distanceKm: 5.5,
          durationMin: 38,
          avgHr: 133,
          cadence: 165,
        },
        {
          id: 'w2-a3',
          type: 'Intervals',
          name: 'Speed Work',
          distanceKm: 7.5,
          durationMin: 48,
          avgHr: 159,
          cadence: 179,
        },
      ],
    },
    // Week 3 — stable (within ±2% of Week 2 for both vo2max and restingHrAvg)
    // Week 2 vo2max = 42.5 → ±2% = [41.65, 43.35]. Week 3 = 42.6 (change = 0.235% < 2%) ✓
    // Week 2 restingHrAvg = 57 → ±2% = [55.86, 58.14]. Week 3 = 57 (change = 0%) ✓
    {
      weekNumber: 3,
      label: 'Week 3',
      vo2max: 42.6,
      restingHrAvg: 57,
      trainingLoad: 100,
      activities: [
        {
          id: 'w3-a1',
          type: 'Long run',
          name: 'Long Run',
          distanceKm: 13.0,
          durationMin: 92,
          avgHr: 144,
          cadence: 169,
        },
        {
          id: 'w3-a2',
          type: 'Restorative run',
          name: 'Recovery Run',
          distanceKm: 6.0,
          durationMin: 40,
          avgHr: 134,
          cadence: 165,
        },
        {
          id: 'w3-a3',
          type: 'Intervals',
          name: 'Tempo Run',
          distanceKm: 8.0,
          durationMin: 50,
          avgHr: 160,
          cadence: 179,
        },
      ],
    },
    // Week 4 — skipped (sickness)
    {
      weekNumber: 4,
      label: 'Week 4',
      vo2max: 42.6,
      restingHrAvg: 60,
      trainingLoad: 0,
      activities: [],
      skipped: {
        reason: 'Sick — no training this week',
      },
    },
    // Week 5 — returning after illness
    {
      weekNumber: 5,
      label: 'Week 5',
      vo2max: 42.8,
      restingHrAvg: 58,
      trainingLoad: 70,
      activities: [
        {
          id: 'w5-a1',
          type: 'Long run',
          name: 'Easy Return Run',
          distanceKm: 10.0,
          durationMin: 75,
          avgHr: 140,
          cadence: 167,
        },
        {
          id: 'w5-a2',
          type: 'Restorative run',
          name: 'Gentle Jog',
          distanceKm: 5.0,
          durationMin: 36,
          avgHr: 131,
          cadence: 163,
        },
        {
          id: 'w5-a3',
          type: 'Intervals',
          name: 'Light Speed Work',
          distanceKm: 6.0,
          durationMin: 40,
          avgHr: 155,
          cadence: 175,
        },
      ],
    },
    // Week 6 — building back
    {
      weekNumber: 6,
      label: 'Week 6',
      vo2max: 43.5,
      restingHrAvg: 56,
      trainingLoad: 110,
      activities: [
        {
          id: 'w6-a1',
          type: 'Long run',
          name: 'Progression Long Run',
          distanceKm: 14.0,
          durationMin: 98,
          avgHr: 145,
          cadence: 170,
        },
        {
          id: 'w6-a2',
          type: 'Restorative run',
          name: 'Recovery Run',
          distanceKm: 6.0,
          durationMin: 40,
          avgHr: 133,
          cadence: 165,
        },
        {
          id: 'w6-a3',
          type: 'Intervals',
          name: 'Interval Session',
          distanceKm: 8.5,
          durationMin: 52,
          avgHr: 162,
          cadence: 180,
        },
      ],
    },
    // Week 7 — strong week (used as previous for Week 8 trend comparison)
    // vo2max = 44.0, restingHrAvg = 55
    // Week 8 must have vo2max > 44.0 * 1.02 = 44.88 → use 45.5 (change = 3.4% > 2%) ✓
    // Week 8 must have restingHrAvg < 55 * 0.98 = 53.9 → use 53 (change = -3.6% < -2%) ✓
    {
      weekNumber: 7,
      label: 'Week 7',
      vo2max: 44.0,
      restingHrAvg: 55,
      trainingLoad: 130,
      activities: [
        {
          id: 'w7-a1',
          type: 'Long run',
          name: 'Long Run',
          distanceKm: 16.0,
          durationMin: 110,
          avgHr: 146,
          cadence: 171,
        },
        {
          id: 'w7-a2',
          type: 'Restorative run',
          name: 'Recovery Run',
          distanceKm: 7.0,
          durationMin: 46,
          avgHr: 134,
          cadence: 166,
        },
        {
          id: 'w7-a3',
          type: 'Intervals',
          name: 'Race Pace Intervals',
          distanceKm: 9.0,
          durationMin: 55,
          avgHr: 163,
          cadence: 181,
        },
      ],
    },
    // Week 8 — peak week (improving trends vs Week 7)
    // vo2max = 45.5, change vs 44.0 = 3.4% > 2% → "↑ Increasing" ✓
    // restingHrAvg = 53, change vs 55 = -3.6% < -2% → "↓ Decreasing" ✓
    // Must include: long_run, restorative_run, intervals (enforce-visual-theme Scenario 2)
    {
      weekNumber: 8,
      label: 'Week 8',
      vo2max: 45.5,
      restingHrAvg: 53,
      trainingLoad: 150,
      activities: [
        {
          id: 'w8-a1',
          type: 'Long run',
          name: 'Peak Long Run',
          distanceKm: 18.0,
          durationMin: 122,
          avgHr: 148,
          cadence: 172,
        },
        {
          id: 'w8-a2',
          type: 'Restorative run',
          name: 'Recovery Jog',
          distanceKm: 6.0,
          durationMin: 42,
          avgHr: 130,
          cadence: 162,
        },
        {
          id: 'w8-a3',
          type: 'Intervals',
          name: 'Final Interval Session',
          distanceKm: 10.0,
          durationMin: 58,
          avgHr: 165,
          cadence: 182,
        },
      ],
    },
  ],
}

export function getSelectableDatasets(): Dataset[] {
  return []
}