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
  vo2max: number
  restingHrAvg: number
  trainingLoad: number
  activities: Activity[]
  skipped?: SkippedWeek
}

export interface Dataset {
  id: string
  name: string
  isTestFixture?: boolean
  weeks: Week[]
}

// Half-Marathon Build-Up — 8 Week Consistent Plan
// Fixture data satisfying all Gherkin trend assertions:
//   Week 1: no previous → "—" for both
//   Week 3: vo2max within ±2% of Week 2, restingHrAvg within ±2% of Week 2 → "→ Stable"
//   Week 8: vo2max >2% higher than Week 7 → "↑ Increasing"
//            restingHrAvg >2% lower than Week 7 → "↓ Decreasing"
//
// Week vo2max values:
//   W1=42, W2=43, W3=43 (0% change W2→W3 ≤ 2%), W4=0(skipped), W5=44, W6=45, W7=46, W8=48
//   W7→W8: (48-46)/46 = 4.3% > 2% → ↑ Increasing ✓
//   W2→W3: (43-43)/43 = 0% ≤ 2% → → Stable ✓
//
// Week restingHrAvg values:
//   W1=58, W2=57, W3=57 (0% change W2→W3 ≤ 2%), W4=58(skipped), W5=56, W6=55, W7=54, W8=52
//   W7→W8: (52-54)/54 = -3.7% < -2% → ↓ Decreasing ✓
//   W2→W3: (57-57)/57 = 0% ≤ 2% → → Stable ✓

export const fixtureDataset: Dataset = {
  id: 'half-marathon-build-up',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: true,
  weeks: [
    {
      weekNumber: 1,
      label: 'Week 1',
      vo2max: 42,
      restingHrAvg: 58,
      trainingLoad: 80,
      activities: [
        {
          id: 'w1-a1',
          type: 'Long run',
          name: 'Sunday Long Run',
          distanceKm: 10,
          durationMin: 65,
          avgHr: 148,
          cadence: 168,
        },
        {
          id: 'w1-a2',
          type: 'Restorative run',
          name: 'Easy Recovery Run',
          distanceKm: 5,
          durationMin: 32,
          avgHr: 135,
          cadence: 162,
        },
        {
          id: 'w1-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 8,
          durationMin: 50,
          avgHr: 168,
          cadence: 180,
        },
      ],
    },
    {
      weekNumber: 2,
      label: 'Week 2',
      vo2max: 43,
      restingHrAvg: 57,
      trainingLoad: 90,
      activities: [
        {
          id: 'w2-a1',
          type: 'Long run',
          name: 'Sunday Long Run',
          distanceKm: 11,
          durationMin: 70,
          avgHr: 149,
          cadence: 169,
        },
        {
          id: 'w2-a2',
          type: 'Restorative run',
          name: 'Easy Recovery Run',
          distanceKm: 5,
          durationMin: 33,
          avgHr: 134,
          cadence: 161,
        },
        {
          id: 'w2-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 8,
          durationMin: 49,
          avgHr: 167,
          cadence: 181,
        },
      ],
    },
    {
      weekNumber: 3,
      label: 'Week 3',
      // Exactly same as Week 2 → 0% change → Stable for both metrics
      vo2max: 43,
      restingHrAvg: 57,
      trainingLoad: 88,
      activities: [
        {
          id: 'w3-a1',
          type: 'Long run',
          name: 'Sunday Long Run',
          distanceKm: 12,
          durationMin: 75,
          avgHr: 150,
          cadence: 170,
        },
        {
          id: 'w3-a2',
          type: 'Restorative run',
          name: 'Easy Recovery Run',
          distanceKm: 5,
          durationMin: 32,
          avgHr: 133,
          cadence: 161,
        },
        {
          id: 'w3-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 9,
          durationMin: 52,
          avgHr: 166,
          cadence: 180,
        },
      ],
    },
    {
      weekNumber: 4,
      label: 'Week 4',
      vo2max: 43,
      restingHrAvg: 58,
      trainingLoad: 0,
      activities: [],
      skipped: {
        reason: 'Illness — week skipped',
      },
    },
    {
      weekNumber: 5,
      label: 'Week 5',
      vo2max: 44,
      restingHrAvg: 56,
      trainingLoad: 100,
      activities: [
        {
          id: 'w5-a1',
          type: 'Long run',
          name: 'Sunday Long Run',
          distanceKm: 13,
          durationMin: 80,
          avgHr: 150,
          cadence: 170,
        },
        {
          id: 'w5-a2',
          type: 'Restorative run',
          name: 'Easy Recovery Run',
          distanceKm: 6,
          durationMin: 38,
          avgHr: 133,
          cadence: 162,
        },
        {
          id: 'w5-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 9,
          durationMin: 52,
          avgHr: 168,
          cadence: 182,
        },
      ],
    },
    {
      weekNumber: 6,
      label: 'Week 6',
      vo2max: 45,
      restingHrAvg: 55,
      trainingLoad: 115,
      activities: [
        {
          id: 'w6-a1',
          type: 'Long run',
          name: 'Sunday Long Run',
          distanceKm: 15,
          durationMin: 92,
          avgHr: 151,
          cadence: 171,
        },
        {
          id: 'w6-a2',
          type: 'Restorative run',
          name: 'Easy Recovery Run',
          distanceKm: 6,
          durationMin: 38,
          avgHr: 132,
          cadence: 161,
        },
        {
          id: 'w6-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 10,
          durationMin: 55,
          avgHr: 169,
          cadence: 183,
        },
      ],
    },
    {
      weekNumber: 7,
      label: 'Week 7',
      vo2max: 46,
      restingHrAvg: 54,
      trainingLoad: 125,
      activities: [
        {
          id: 'w7-a1',
          type: 'Long run',
          name: 'Sunday Long Run',
          distanceKm: 17,
          durationMin: 105,
          avgHr: 152,
          cadence: 172,
        },
        {
          id: 'w7-a2',
          type: 'Restorative run',
          name: 'Easy Recovery Run',
          distanceKm: 6,
          durationMin: 38,
          avgHr: 132,
          cadence: 161,
        },
        {
          id: 'w7-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 10,
          durationMin: 54,
          avgHr: 170,
          cadence: 184,
        },
      ],
    },
    {
      weekNumber: 8,
      label: 'Week 8',
      // vo2max: 48 vs W7=46 → (48-46)/46 = 4.35% > 2% → ↑ Increasing ✓
      vo2max: 48,
      // restingHrAvg: 52 vs W7=54 → (52-54)/54 = -3.7% < -2% → ↓ Decreasing ✓
      restingHrAvg: 52,
      trainingLoad: 140,
      activities: [
        {
          id: 'w8-a1',
          type: 'Long run',
          name: 'Sunday Long Run',
          distanceKm: 19,
          durationMin: 115,
          avgHr: 153,
          cadence: 173,
        },
        {
          id: 'w8-a2',
          type: 'Restorative run',
          name: 'Easy Recovery Run',
          distanceKm: 7,
          durationMin: 44,
          avgHr: 131,
          cadence: 160,
        },
        {
          id: 'w8-a3',
          type: 'Intervals',
          name: 'Track Intervals',
          distanceKm: 11,
          durationMin: 58,
          avgHr: 171,
          cadence: 185,
        },
      ],
    },
  ],
}

export function getSelectableDatasets(): Dataset[] {
  return []
}