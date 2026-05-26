export interface Activity {
  id: string
  name: string
  type: string
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
}

export interface Dataset {
  id: string
  name: string
  isTestFixture: boolean
  weeks: Week[]
}

export const fixtureDataset: Dataset = {
  id: 'half-marathon-build-up',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: true,
  weeks: [
    {
      weekNumber: 1,
      label: 'Week 1',
      activities: [
        { id: 'w1-a1', name: 'Easy Run', type: 'Restorative run', distanceKm: 6.0, durationMin: 38, avgHr: 138, cadence: 162 },
        { id: 'w1-a2', name: 'Intervals', type: 'Intervals', distanceKm: 7.5, durationMin: 45, avgHr: 162, cadence: 178 },
        { id: 'w1-a3', name: 'Long run', type: 'Long run', distanceKm: 14.0, durationMin: 88, avgHr: 142, cadence: 164 },
      ],
    },
    {
      weekNumber: 2,
      label: 'Week 2',
      activities: [
        { id: 'w2-a1', name: 'Restorative run', type: 'Restorative run', distanceKm: 6.0, durationMin: 40, avgHr: 136, cadence: 161 },
        { id: 'w2-a2', name: 'Intervals', type: 'Intervals', distanceKm: 8.0, durationMin: 46, avgHr: 164, cadence: 179 },
        { id: 'w2-a3', name: 'Long run', type: 'Long run', distanceKm: 16.0, durationMin: 100, avgHr: 143, cadence: 165 },
      ],
    },
    {
      weekNumber: 3,
      label: 'Week 3',
      activities: [
        { id: 'w3-a1', name: 'Restorative run', type: 'Restorative run', distanceKm: 6.0, durationMin: 38, avgHr: 135, cadence: 162 },
        { id: 'w3-a2', name: 'Intervals', type: 'Intervals', distanceKm: 8.0, durationMin: 44, avgHr: 165, cadence: 180 },
        { id: 'w3-a3', name: 'Long run', type: 'Long run', distanceKm: 17.0, durationMin: 106, avgHr: 141, cadence: 163 },
      ],
    },
    {
      weekNumber: 4,
      label: 'Week 4',
      activities: [],
      skipped: { reason: 'Skipped due to sickness' },
    },
    {
      weekNumber: 5,
      label: 'Week 5',
      activities: [
        { id: 'w5-a1', name: 'Restorative run', type: 'Restorative run', distanceKm: 5.0, durationMin: 34, avgHr: 136, cadence: 161 },
        { id: 'w5-a2', name: 'Intervals', type: 'Intervals', distanceKm: 7.5, durationMin: 44, avgHr: 161, cadence: 177 },
        { id: 'w5-a3', name: 'Long run', type: 'Long run', distanceKm: 16.0, durationMin: 102, avgHr: 140, cadence: 162 },
      ],
    },
    {
      weekNumber: 6,
      label: 'Week 6',
      activities: [
        { id: 'w6-a1', name: 'Restorative run', type: 'Restorative run', distanceKm: 6.0, durationMin: 38, avgHr: 134, cadence: 162 },
        { id: 'w6-a2', name: 'Intervals', type: 'Intervals', distanceKm: 8.5, durationMin: 47, avgHr: 163, cadence: 179 },
        { id: 'w6-a3', name: 'Long run', type: 'Long run', distanceKm: 18.0, durationMin: 112, avgHr: 140, cadence: 163 },
      ],
    },
    {
      weekNumber: 7,
      label: 'Week 7',
      activities: [
        { id: 'w7-a1', name: 'Restorative run', type: 'Restorative run', distanceKm: 6.0, durationMin: 37, avgHr: 133, cadence: 163 },
        { id: 'w7-a2', name: 'Intervals', type: 'Intervals', distanceKm: 9.0, durationMin: 48, avgHr: 165, cadence: 181 },
        { id: 'w7-a3', name: 'Long run', type: 'Long run', distanceKm: 19.0, durationMin: 118, avgHr: 139, cadence: 164 },
      ],
    },
    {
      weekNumber: 8,
      label: 'Week 8',
      activities: [
        { id: 'w8-a1', name: 'Restorative run', type: 'Restorative run', distanceKm: 5.0, durationMin: 32, avgHr: 132, cadence: 162 },
        { id: 'w8-a2', name: 'Intervals', type: 'Intervals', distanceKm: 8.0, durationMin: 44, avgHr: 160, cadence: 178 },
        { id: 'w8-a3', name: 'Long run', type: 'Long run', distanceKm: 21.1, durationMin: 130, avgHr: 144, cadence: 165 },
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