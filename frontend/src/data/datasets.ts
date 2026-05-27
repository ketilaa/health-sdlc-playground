export interface Activity {
  id: string
  type: string
  name: string
  distanceKm?: number
  durationMin?: number
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
}

export interface Dataset {
  id: string
  name: string
  isTestFixture: boolean
  weeks: Week[]
}

export const fixtureDataset: Dataset = {
  id: 'half-marathon-8week',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: true,
  weeks: [
    {
      weekNumber: 1,
      label: 'Week 1',
      vo2max: 40,
      restingHrAvg: 60,
      activities: [
        { id: 'w1-1', type: 'Long run', name: 'Long run', distanceKm: 10, durationMin: 65 },
        { id: 'w1-2', type: 'Restorative run', name: 'Recovery run', distanceKm: 5, durationMin: 35 },
        { id: 'w1-3', type: 'Intervals', name: 'Track intervals', distanceKm: 6, durationMin: 40 },
      ],
    },
    {
      weekNumber: 2,
      label: 'Week 2',
      vo2max: 41,
      restingHrAvg: 59,
      activities: [
        { id: 'w2-1', type: 'Long run', name: 'Long run', distanceKm: 11, durationMin: 70 },
        { id: 'w2-2', type: 'Restorative run', name: 'Recovery run', distanceKm: 5, durationMin: 35 },
        { id: 'w2-3', type: 'Intervals', name: 'Track intervals', distanceKm: 6, durationMin: 40 },
      ],
    },
    {
      weekNumber: 3,
      label: 'Week 3',
      // vo2max=41 vs prior 41 => 0% change => Stable
      // restingHrAvg=59 vs prior 59 => 0% change => Stable
      vo2max: 41,
      restingHrAvg: 59,
      activities: [
        { id: 'w3-1', type: 'Long run', name: 'Long run', distanceKm: 12, durationMin: 75 },
        { id: 'w3-2', type: 'Restorative run', name: 'Recovery run', distanceKm: 5, durationMin: 35 },
        { id: 'w3-3', type: 'Intervals', name: 'Track intervals', distanceKm: 6, durationMin: 40 },
      ],
    },
    {
      weekNumber: 4,
      label: 'Week 4',
      vo2max: 41,
      restingHrAvg: 59,
      activities: [],
      skipped: { reason: 'Skipped due to sickness' },
    },
    {
      weekNumber: 5,
      label: 'Week 5',
      vo2max: 42,
      restingHrAvg: 58,
      activities: [
        { id: 'w5-1', type: 'Long run', name: 'Long run', distanceKm: 13, durationMin: 80 },
        { id: 'w5-2', type: 'Restorative run', name: 'Recovery run', distanceKm: 5, durationMin: 35 },
        { id: 'w5-3', type: 'Intervals', name: 'Track intervals', distanceKm: 7, durationMin: 45 },
      ],
    },
    {
      weekNumber: 6,
      label: 'Week 6',
      vo2max: 43,
      restingHrAvg: 57,
      activities: [
        { id: 'w6-1', type: 'Long run', name: 'Long run', distanceKm: 14, durationMin: 85 },
        { id: 'w6-2', type: 'Restorative run', name: 'Recovery run', distanceKm: 5, durationMin: 35 },
        { id: 'w6-3', type: 'Intervals', name: 'Track intervals', distanceKm: 7, durationMin: 45 },
      ],
    },
    {
      weekNumber: 7,
      label: 'Week 7',
      vo2max: 44,
      restingHrAvg: 56,
      activities: [
        { id: 'w7-1', type: 'Long run', name: 'Long run', distanceKm: 15, durationMin: 90 },
        { id: 'w7-2', type: 'Restorative run', name: 'Recovery run', distanceKm: 5, durationMin: 35 },
        { id: 'w7-3', type: 'Intervals', name: 'Track intervals', distanceKm: 8, durationMin: 50 },
      ],
    },
    {
      weekNumber: 8,
      label: 'Week 8',
      // vo2max=46 vs prior 44 => +4.5% => Increasing ✓
      // restingHrAvg=54 vs prior 56 => -3.6% => Decreasing ✓
      vo2max: 46,
      restingHrAvg: 54,
      activities: [
        { id: 'w8-1', type: 'Long run', name: 'Long run', distanceKm: 16, durationMin: 95 },
        { id: 'w8-2', type: 'Restorative run', name: 'Recovery run', distanceKm: 5, durationMin: 35 },
        { id: 'w8-3', type: 'Intervals', name: 'Track intervals', distanceKm: 8, durationMin: 50 },
      ],
    },
  ],
}

export const allDatasets: Dataset[] = [fixtureDataset]

export function getDefaultDataset(): Dataset {
  return fixtureDataset
}

export function getSelectableDatasets(): Dataset[] {
  return allDatasets.filter((d) => !d.isTestFixture)
}