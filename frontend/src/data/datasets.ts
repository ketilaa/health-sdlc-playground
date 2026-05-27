export interface Activity {
  id: string
  name: string
  type: string
  distanceKm?: number
  durationMin?: number
  avgHr?: number
  cadence?: number
}

export interface Week {
  weekNumber: number
  label: string
  vo2max: number
  restingHrAvg: number
  trainingLoad: number
  activities: Activity[]
  skipped?: {
    reason: string
  }
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
 * Fixture constraints (from Gherkin scenarios):
 * - Week 1: no prior week → shows "—" for both trends
 * - Week 3: vo2max and restingHrAvg within ±2% of Week 2 → shows "→ Stable"
 * - Week 8: vo2max >2% higher than Week 7 → "↑ Increasing"
 *           restingHrAvg >2% lower than Week 7 → "↓ Decreasing"
 * - Week 4: skipped (illness)
 * - Week 7: contains Long Run activity (for enforce-visual-theme Scenario 4)
 * - Week 8: contains long_run, restorative_run, intervals (for enforce-visual-theme Scenario 2)
 */
export const fixtureDataset: Dataset = {
  id: 'half-marathon-build-up',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: true,
  weeks: [
    {
      weekNumber: 1,
      label: 'Week 1',
      vo2max: 48.0,
      restingHrAvg: 58,
      trainingLoad: 80,
      activities: [
        {
          id: 'w1-a1',
          name: 'Easy Run',
          type: 'Restorative run',
          distanceKm: 5.0,
          durationMin: 32,
          avgHr: 138,
          cadence: 162,
        },
        {
          id: 'w1-a2',
          name: 'Tempo Run',
          type: 'Long run',
          distanceKm: 8.0,
          durationMin: 48,
          avgHr: 155,
          cadence: 168,
        },
        {
          id: 'w1-a3',
          name: 'Interval Session',
          type: 'Intervals',
          distanceKm: 6.0,
          durationMin: 40,
          avgHr: 172,
          cadence: 176,
        },
      ],
    },
    {
      // Week 2: baseline for Week 3 stable comparison
      weekNumber: 2,
      label: 'Week 2',
      vo2max: 48.5,
      restingHrAvg: 57,
      trainingLoad: 100,
      activities: [
        {
          id: 'w2-a1',
          name: 'Easy Run',
          type: 'Restorative run',
          distanceKm: 5.5,
          durationMin: 34,
          avgHr: 136,
          cadence: 163,
        },
        {
          id: 'w2-a2',
          name: 'Long Run',
          type: 'Long run',
          distanceKm: 10.0,
          durationMin: 62,
          avgHr: 148,
          cadence: 165,
        },
        {
          id: 'w2-a3',
          name: 'Interval Session',
          type: 'Intervals',
          distanceKm: 6.0,
          durationMin: 38,
          avgHr: 170,
          cadence: 178,
        },
      ],
    },
    {
      // Week 3: stable vs Week 2
      // vo2max: 48.7 vs 48.5 → change = 0.4% (within ±2%) → Stable
      // restingHrAvg: 57 vs 57 → change = 0% → Stable
      weekNumber: 3,
      label: 'Week 3',
      vo2max: 48.7,
      restingHrAvg: 57,
      trainingLoad: 105,
      activities: [
        {
          id: 'w3-a1',
          name: 'Recovery Jog',
          type: 'Restorative run',
          distanceKm: 5.0,
          durationMin: 33,
          avgHr: 135,
          cadence: 161,
        },
        {
          id: 'w3-a2',
          name: 'Long Run',
          type: 'Long run',
          distanceKm: 11.0,
          durationMin: 66,
          avgHr: 150,
          cadence: 166,
        },
        {
          id: 'w3-a3',
          name: 'Interval Session',
          type: 'Intervals',
          distanceKm: 6.5,
          durationMin: 40,
          avgHr: 172,
          cadence: 179,
        },
      ],
    },
    {
      // Week 4: skipped due to illness
      weekNumber: 4,
      label: 'Week 4',
      vo2max: 48.5,
      restingHrAvg: 60,
      trainingLoad: 0,
      activities: [],
      skipped: {
        reason: 'Illness — week skipped',
      },
    },
    {
      weekNumber: 5,
      label: 'Week 5',
      vo2max: 49.0,
      restingHrAvg: 56,
      trainingLoad: 110,
      activities: [
        {
          id: 'w5-a1',
          name: 'Easy Run',
          type: 'Restorative run',
          distanceKm: 5.5,
          durationMin: 34,
          avgHr: 137,
          cadence: 163,
        },
        {
          id: 'w5-a2',
          name: 'Long Run',
          type: 'Long run',
          distanceKm: 13.0,
          durationMin: 78,
          avgHr: 151,
          cadence: 167,
        },
        {
          id: 'w5-a3',
          name: 'Interval Session',
          type: 'Intervals',
          distanceKm: 7.0,
          durationMin: 42,
          avgHr: 173,
          cadence: 180,
        },
      ],
    },
    {
      weekNumber: 6,
      label: 'Week 6',
      vo2max: 49.5,
      restingHrAvg: 55,
      trainingLoad: 130,
      activities: [
        {
          id: 'w6-a1',
          name: 'Recovery Run',
          type: 'Restorative run',
          distanceKm: 5.0,
          durationMin: 32,
          avgHr: 134,
          cadence: 162,
        },
        {
          id: 'w6-a2',
          name: 'Long Run',
          type: 'Long run',
          distanceKm: 15.0,
          durationMin: 90,
          avgHr: 152,
          cadence: 168,
        },
        {
          id: 'w6-a3',
          name: 'Interval Session',
          type: 'Intervals',
          distanceKm: 7.5,
          durationMin: 44,
          avgHr: 175,
          cadence: 181,
        },
      ],
    },
    {
      // Week 7: must contain Long Run (for enforce-visual-theme Scenario 4)
      // vo2max: 50.0, restingHrAvg: 54
      weekNumber: 7,
      label: 'Week 7',
      vo2max: 50.0,
      restingHrAvg: 54,
      trainingLoad: 150,
      activities: [
        {
          id: 'w7-a1',
          name: 'Recovery Jog',
          type: 'Restorative run',
          distanceKm: 5.0,
          durationMin: 31,
          avgHr: 132,
          cadence: 161,
        },
        {
          id: 'w7-a2',
          name: 'Long Run',
          type: 'Long run',
          distanceKm: 17.0,
          durationMin: 102,
          avgHr: 150,
          cadence: 167,
        },
        {
          id: 'w7-a3',
          name: 'Interval Session',
          type: 'Intervals',
          distanceKm: 8.0,
          durationMin: 46,
          avgHr: 174,
          cadence: 182,
        },
      ],
    },
    {
      // Week 8: must satisfy:
      //   vo2max > 50.0 * 1.02 = 51.0 → use 51.5 (+3% from 50.0) → Increasing
      //   restingHrAvg < 54 * 0.98 = 52.92 → use 52 (-3.7% from 54) → Decreasing
      //   Must contain: long_run, restorative_run, intervals (enforce-visual-theme)
      weekNumber: 8,
      label: 'Week 8',
      vo2max: 51.5,
      restingHrAvg: 52,
      trainingLoad: 170,
      activities: [
        {
          id: 'w8-a1',
          name: 'Recovery Jog',
          type: 'Restorative run',
          distanceKm: 4.0,
          durationMin: 26,
          avgHr: 130,
          cadence: 160,
        },
        {
          id: 'w8-a2',
          name: 'Long Run',
          type: 'Long run',
          distanceKm: 19.0,
          durationMin: 113,
          avgHr: 149,
          cadence: 166,
        },
        {
          id: 'w8-a3',
          name: 'Interval Session',
          type: 'Intervals',
          distanceKm: 8.5,
          durationMin: 48,
          avgHr: 176,
          cadence: 183,
        },
      ],
    },
  ],
}

export function getSelectableDatasets(): Dataset[] {
  return []
}