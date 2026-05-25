export type ActivityType = 'Long run' | 'Restorative run' | 'Intervals'

export interface Activity {
  id: string
  date: string // ISO date
  displayDate: string // e.g. "Mon, Oct 14"
  type: ActivityType
  distanceKm: number
  durationMinutes: number
}

export interface SkippedMarker {
  reason: string
}

export interface Week {
  weekNumber: number
  activities: Activity[]
  skipped?: SkippedMarker
}

export interface Dataset {
  id: string
  name: string
  isTestFixture: boolean
  weeks: Week[]
}

// Helper to build a typical 3-activity week.
function typicalWeek(weekNumber: number, totalKm: number, baseDateIso: string, baseDateLabel: string, distances: [number, number, number], durations: [number, number, number]): Week {
  void totalKm
  return {
    weekNumber,
    activities: [
      {
        id: `w${weekNumber}-long`,
        date: `${baseDateIso}-long`,
        displayDate: `${baseDateLabel} (Sun)`,
        type: 'Long run',
        distanceKm: distances[0],
        durationMinutes: durations[0],
      },
      {
        id: `w${weekNumber}-restorative`,
        date: `${baseDateIso}-rest`,
        displayDate: `${baseDateLabel} (Tue)`,
        type: 'Restorative run',
        distanceKm: distances[1],
        durationMinutes: durations[1],
      },
      {
        id: `w${weekNumber}-intervals`,
        date: `${baseDateIso}-int`,
        displayDate: `${baseDateLabel} (Thu)`,
        type: 'Intervals',
        distanceKm: distances[2],
        durationMinutes: durations[2],
      },
    ],
  }
}

// 8 weeks; week 4 is the sickness week (2 activities + skipped marker).
// Volumes grow consistently from week 1 (lowest) to week 8 (highest).
const weeks: Week[] = [
  typicalWeek(1, 22, '2025-08-25', 'Aug 25', [10.0, 5.0, 7.0], [60, 30, 40]),
  typicalWeek(2, 24, '2025-09-01', 'Sep 1', [11.0, 5.5, 7.5], [66, 33, 43]),
  typicalWeek(3, 26, '2025-09-08', 'Sep 8', [12.0, 6.0, 8.0], [72, 36, 46]),
  {
    weekNumber: 4,
    activities: [
      {
        id: 'w4-long',
        date: '2025-09-15-long',
        displayDate: 'Sep 15 (Sun)',
        type: 'Long run',
        distanceKm: 8.0,
        durationMinutes: 50,
      },
      {
        id: 'w4-restorative',
        date: '2025-09-17-rest',
        displayDate: 'Sep 17 (Tue)',
        type: 'Restorative run',
        distanceKm: 4.0,
        durationMinutes: 25,
      },
    ],
    skipped: { reason: 'Skipped due to sickness' },
  },
  typicalWeek(5, 28, '2025-09-22', 'Sep 22', [13.0, 6.5, 8.5], [78, 39, 49]),
  typicalWeek(6, 30, '2025-09-29', 'Sep 29', [13.5, 7.0, 9.5], [80, 42, 55]),
  typicalWeek(7, 30, '2025-10-06', 'Oct 6', [14.0, 7.0, 9.0], [82, 42, 52]),
  typicalWeek(8, 32, '2025-10-13', 'Oct 13', [14.0, 8.0, 10.0], [80, 45, 65]),
]

export const fixtureDataset: Dataset = {
  id: 'fixture-half-marathon-8wk',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: true,
  weeks,
}

export const allDatasets: Dataset[] = [fixtureDataset]

export function getSelectableDatasets(): Dataset[] {
  return allDatasets.filter((d) => !d.isTestFixture)
}

export function getDefaultDataset(): Dataset {
  return fixtureDataset
}