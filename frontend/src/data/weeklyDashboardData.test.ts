import '@testing-library/jest-dom'
import {
  weeklyDashboardDataset,
  getWeekById,
  getPreviousWeek,
  computeWeeklyAvgHr,
  computeWeeklyAvgCadence,
  computeTrend,
  trendLabel,
  isHighIntensity,
} from './weeklyDashboardData'

describe('weeklyDashboardData', () => {
  test('dataset contains at least 3 weeks', () => {
    expect(weeklyDashboardDataset.length).toBeGreaterThanOrEqual(3)
  })

  test('2024-W10 has 4 activities', () => {
    const week = getWeekById('2024-W10')
    expect(week).toBeDefined()
    expect(week!.activities).toHaveLength(4)
  })

  test('2024-W10 has correct vo2max and restingHrAvg', () => {
    const week = getWeekById('2024-W10')
    expect(week!.vo2max).toBe(54)
    expect(week!.restingHrAvg).toBe(52)
  })

  test('2024-W10 Interval Session has avgHr=168 and cadence=180', () => {
    const week = getWeekById('2024-W10')!
    const interval = week.activities.find((a) => a.name === 'Interval Session')
    expect(interval).toBeDefined()
    expect(interval!.avgHr).toBe(168)
    expect(interval!.cadence).toBe(180)
  })

  test('2024-W09 exists with restingHrAvg=54', () => {
    const week = getWeekById('2024-W09')
    expect(week).toBeDefined()
    expect(week!.restingHrAvg).toBe(54)
  })

  test('2024-W09 training load is lower than 2024-W10', () => {
    const w09 = getWeekById('2024-W09')!
    const w10 = getWeekById('2024-W10')!
    expect(w09.trainingLoad).toBeLessThan(w10.trainingLoad)
  })

  test('2024-W08 exists', () => {
    const week = getWeekById('2024-W08')
    expect(week).toBeDefined()
  })

  test('getPreviousWeek returns W09 for W10', () => {
    const prev = getPreviousWeek('2024-W10')
    expect(prev?.weekId).toBe('2024-W09')
  })

  test('getPreviousWeek returns undefined for earliest week W08', () => {
    const prev = getPreviousWeek('2024-W08')
    expect(prev).toBeUndefined()
  })

  test('computeWeeklyAvgHr for W10 activities = 147', () => {
    const week = getWeekById('2024-W10')!
    expect(computeWeeklyAvgHr(week.activities)).toBe(147)
  })

  test('computeWeeklyAvgCadence for W10 activities = 170', () => {
    const week = getWeekById('2024-W10')!
    expect(computeWeeklyAvgCadence(week.activities)).toBe(170)
  })

  test('isHighIntensity: intervals = true, others = false', () => {
    expect(isHighIntensity('intervals')).toBe(true)
    expect(isHighIntensity('run')).toBe(false)
    expect(isHighIntensity('recovery')).toBe(false)
    expect(isHighIntensity('long_run')).toBe(false)
    expect(isHighIntensity('other')).toBe(false)
  })

  test('W10 has 1 high-intensity and 3 low-intensity activities', () => {
    const week = getWeekById('2024-W10')!
    const high = week.activities.filter((a) => isHighIntensity(a.type)).length
    const low = week.activities.filter((a) => !isHighIntensity(a.type)).length
    expect(high).toBe(1)
    expect(low).toBe(3)
  })

  test('computeTrend: increasing when above 2%', () => {
    expect(computeTrend(110, 100)).toBe('increasing')
  })

  test('computeTrend: decreasing when below -2%', () => {
    expect(computeTrend(90, 100)).toBe('decreasing')
  })

  test('computeTrend: stable when within 2%', () => {
    expect(computeTrend(101, 100)).toBe('stable')
    expect(computeTrend(99, 100)).toBe('stable')
  })

  test('computeTrend: none when previous is 0', () => {
    expect(computeTrend(100, 0)).toBe('none')
  })

  test('trendLabel returns correct strings', () => {
    expect(trendLabel('increasing')).toBe('↑ Increasing')
    expect(trendLabel('decreasing')).toBe('↓ Decreasing')
    expect(trendLabel('stable')).toBe('→ Stable')
    expect(trendLabel('none')).toBe('—')
  })
})