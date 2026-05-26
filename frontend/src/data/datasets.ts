export interface Activity {
  id: string
  name: string
  type: string
  distanceKm?: number
  durationMin?: number
}

export interface SkippedInfo {
  reason: string
}

export interface Week {
  weekNumber: number
  label: string
  activities: Activity[]
  skipped?: SkippedInfo
}

export interface Dataset {
  id: string
  name: string
  isTestFixture: boolean
  weeks: Week[]
}

export const fixtureDataset: Dataset = {
  id: 'fixture-half-marathon-8w',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: true,
  weeks: [
    {
      weekNumber: 1,
      label: 'Week 1',
      activities: [
        { id: 'w1-a1', name: 'Long Run', type: 'Long run', distanceKm: 12, durationMin: 70 },
        { id: 'w1-a2', name: 'Restorative Run', type: 'Restorative run', distanceKm: 5, durationMin: 35 },
        { id: 'w1-a3', name: 'Intervals', type: 'Intervals', distanceKm: 8, durationMin: 50 },
      ],
    },
    {
      weekNumber: 2,
      label: 'Week 2',
      activities: [
        { id: 'w2-a1', name: 'Long Run', type: 'Long run', distanceKm: 13, durationMin: 75 },
        { id: 'w2-a2', name: 'Restorative Run', type: 'Restorative run', distanceKm: 5, durationMin: 35 },
        { id: 'w2-a3', name: 'Intervals', type: 'Intervals', distanceKm: 8, durationMin: 52 },
      ],
    },
    {
      weekNumber: 3,
      label: 'Week 3',
      activities: [
        { id: 'w3-a1', name: 'Long Run', type: 'Long run', distanceKm: 14, durationMin: 80 },
        { id: 'w3-a2', name: 'Restorative Run', type: 'Restorative run', distanceKm: 6, durationMin: 38 },
        { id: 'w3-a3', name: 'Intervals', type: 'Intervals', distanceKm: 9, durationMin: 55 },
      ],
    },
    {
      weekNumber: 4,
      label: 'Week 4',
      activities: [
        { id: 'w4-a1', name: 'Easy Run', type: 'Restorative run', distanceKm: 4, durationMin: 28 },
        { id: 'w4-a2', name: 'Short Run', type: 'Restorative run', distanceKm: 3, durationMin: 22 },
      ],
      skipped: { reason: 'Skipped due to sickness' },
    },
    {
      weekNumber: 5,
      label: 'Week 5',
      activities: [
        { id: 'w5-a1', name: 'Long Run', type: 'Long run', distanceKm: 15, durationMin: 85 },
        { id: 'w5-a2', name: 'Restorative Run', type: 'Restorative run', distanceKm: 6, durationMin: 38 },
        { id: 'w5-a3', name: 'Intervals', type: 'Intervals', distanceKm: 9, durationMin: 56 },
      ],
    },
    {
      weekNumber: 6,
      label: 'Week 6',
      activities: [
        { id: 'w6-a1', name: 'Long Run', type: 'Long run', distanceKm: 16, durationMin: 90 },
        { id: 'w6-a2', name: 'Restorative Run', type: 'Restorative run', distanceKm: 7, durationMin: 42 },
        { id: 'w6-a3', name: 'Intervals', type: 'Intervals', distanceKm: 10, durationMin: 58 },
      ],
    },
    {
      weekNumber: 7,
      label: 'Week 7',
      activities: [
        { id: 'w7-a1', name: 'Long Run', type: 'Long run', distanceKm: 18, durationMin: 100 },
        { id: 'w7-a2', name: 'Restorative Run', type: 'Restorative run', distanceKm: 7, durationMin: 42 },
        { id: 'w7-a3', name: 'Intervals', type: 'Intervals', distanceKm: 10, durationMin: 60 },
      ],
    },
    {
      weekNumber: 8,
      label: 'Week 8',
      activities: [
        { id: 'w8-a1', name: 'Long Run', type: 'Long run', distanceKm: 20, durationMin: 110 },
        { id: 'w8-a2', name: 'Restorative Run', type: 'Restorative run', distanceKm: 8, durationMin: 45 },
        { id: 'w8-a3', name: 'Intervals', type: 'Intervals', distanceKm: 11, durationMin: 62 },
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