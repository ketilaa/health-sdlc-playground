export type ActivityType = 'run' | 'intervals' | 'recovery' | 'long_run' | 'other'

export interface DashboardActivity {
  id: string
  name: string
  type: ActivityType
  durationMin: number
  distanceKm: number
  avgHr?: number
  cadence?: number
}

export interface WeekData {
  weekId: string // e.g. "2024-W10"
  label: string  // e.g. "W10 · 2024"
  activities: DashboardActivity[]
  restingHrAvg: number
  vo2max: number
  // derived:
  trainingLoad: number // sum of durationMin (simple proxy)
}

export const weeklyDashboardDataset: WeekData[] = [
  {
    weekId: '2024-W08',
    label: 'W08 · 2024',
    activities: [
      { id: 'w08-a1', name: 'Easy Run', type: 'run', durationMin: 40, distanceKm: 7.0, avgHr: 142, cadence: 168 },
      { id: 'w08-a2', name: 'Long Run', type: 'long_run', durationMin: 80, distanceKm: 14.0, avgHr: 138, cadence: 163 },
      { id: 'w08-a3', name: 'Intervals', type: 'intervals', durationMin: 28, distanceKm: 5.5, avgHr: 165, cadence: 178 },
    ],
    restingHrAvg: 55,
    vo2max: 52,
    trainingLoad: 148,
  },
  {
    weekId: '2024-W09',
    label: 'W09 · 2024',
    // W09: training load lower than W10, avg HR 145, resting HR 54
    // For stable scenario (W09 vs W08): we set W09 values within 2% of W08
    // W08 trainingLoad = 148. Within 2% => 148 * 1.02 = 150.96. Use 150.
    // W08 avg HR = (142 + 138 + 165) / 3 = 445/3 = 148.3. Within 2% = ~148.3±2.97. Use 147.
    // W08 resting HR = 55. Within 2% = 55±1.1. Use 55.
    // BUT W09 also needs avg HR = 145 for W10 trend test.
    // These are conflicting requirements unless W09 has different activities for different test scenarios.
    // Resolution: The "stable" scenario redefines W09 via a Given step - it's a separate test context.
    // The actual mock data for W09 needs to satisfy the W10 trend tests: avgHR=145, restingHR=54, lower trainingLoad.
    // The stable scenario test provides its own data context via "Given week 2024-W09 has..."
    // So we set W09 to satisfy the W10 comparison scenario.
    activities: [
      { id: 'w09-a1', name: 'Morning Run', type: 'run', durationMin: 38, distanceKm: 7.0, avgHr: 144, cadence: 167 },
      { id: 'w09-a2', name: 'Easy Jog', type: 'recovery', durationMin: 35, distanceKm: 5.5, avgHr: 128, cadence: 160 },
      { id: 'w09-a3', name: 'Tempo Run', type: 'intervals', durationMin: 32, distanceKm: 6.0, avgHr: 163, cadence: 176 },
    ],
    restingHrAvg: 54,
    vo2max: 53,
    // trainingLoad must be less than W10 (205 min). Use 105 to be clearly lower.
    trainingLoad: 105,
  },
  {
    weekId: '2024-W10',
    label: 'W10 · 2024',
    activities: [
      { id: 'w10-a1', name: 'Morning Run', type: 'run', durationMin: 45, distanceKm: 8.2, avgHr: 148, cadence: 172 },
      { id: 'w10-a2', name: 'Interval Session', type: 'intervals', durationMin: 30, distanceKm: 6.0, avgHr: 168, cadence: 180 },
      { id: 'w10-a3', name: 'Recovery Jog', type: 'recovery', durationMin: 40, distanceKm: 6.5, avgHr: 130, cadence: 162 },
      { id: 'w10-a4', name: 'Long Run', type: 'long_run', durationMin: 90, distanceKm: 16.0, avgHr: 140, cadence: 165 },
    ],
    restingHrAvg: 52,
    vo2max: 54,
    trainingLoad: 205, // sum of durationMin
  },
]

// Activities for the "missing metrics" scenario
export const strengthCrossTrainActivity: DashboardActivity = {
  id: 'w10-strength',
  name: 'Strength Cross-Train',
  type: 'other',
  durationMin: 45,
  distanceKm: 0,
  avgHr: undefined,
  cadence: undefined,
}

export function getWeeklyDashboardDataset(): WeekData[] {
  return weeklyDashboardDataset
}

export function getWeekById(weekId: string, dataset: WeekData[] = weeklyDashboardDataset): WeekData | undefined {
  return dataset.find((w) => w.weekId === weekId)
}

export function getPreviousWeek(weekId: string, dataset: WeekData[] = weeklyDashboardDataset): WeekData | undefined {
  const sorted = [...dataset].sort((a, b) => a.weekId.localeCompare(b.weekId))
  const idx = sorted.findIndex((w) => w.weekId === weekId)
  if (idx <= 0) return undefined
  return sorted[idx - 1]
}

export function isHighIntensity(type: ActivityType): boolean {
  return type === 'intervals'
}

export function computeWeeklyAvgHr(activities: DashboardActivity[]): number {
  const withHr = activities.filter((a) => a.avgHr !== undefined)
  if (withHr.length === 0) return 0
  const sum = withHr.reduce((acc, a) => acc + (a.avgHr ?? 0), 0)
  return Math.round(sum / withHr.length)
}

export function computeWeeklyAvgCadence(activities: DashboardActivity[]): number {
  const withCadence = activities.filter((a) => a.cadence !== undefined)
  if (withCadence.length === 0) return 0
  const sum = withCadence.reduce((acc, a) => acc + (a.cadence ?? 0), 0)
  return Math.round(sum / withCadence.length)
}

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'none'

export function computeTrend(current: number, previous: number): TrendDirection {
  if (previous === 0) return 'none'
  const pctChange = (current - previous) / previous
  if (Math.abs(pctChange) <= 0.02) return 'stable'
  return pctChange > 0 ? 'increasing' : 'decreasing'
}

export function trendLabel(direction: TrendDirection): string {
  switch (direction) {
    case 'increasing': return '↑ Increasing'
    case 'decreasing': return '↓ Decreasing'
    case 'stable': return '→ Stable'
    case 'none': return '—'
  }
}