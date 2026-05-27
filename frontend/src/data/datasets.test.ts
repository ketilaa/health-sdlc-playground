import { fixtureDataset, getSelectableDatasets } from './datasets'

describe('fixtureDataset', () => {
  test('has 8 weeks', () => {
    expect(fixtureDataset.weeks).toHaveLength(8)
  })

  test('week numbers run from 1 to 8', () => {
    const nums = fixtureDataset.weeks.map((w) => w.weekNumber)
    expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  test('each week has a label matching "Week N"', () => {
    fixtureDataset.weeks.forEach((w) => {
      expect(w.label).toBe(`Week ${w.weekNumber}`)
    })
  })

  test('each week has vo2max and restingHrAvg fields (numbers)', () => {
    fixtureDataset.weeks.forEach((w) => {
      expect(typeof w.vo2max).toBe('number')
      expect(typeof w.restingHrAvg).toBe('number')
    })
  })

  test('week 4 is skipped (sickness)', () => {
    const week4 = fixtureDataset.weeks.find((w) => w.weekNumber === 4)!
    expect(week4.skipped).toBeDefined()
    expect(week4.activities).toHaveLength(0)
  })

  test('all non-skipped weeks have 3 activities', () => {
    fixtureDataset.weeks
      .filter((w) => !w.skipped)
      .forEach((w) => {
        expect(w.activities).toHaveLength(3)
      })
  })

  test('week 8 has long_run, restorative_run, intervals activity types', () => {
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const types = week8.activities.map((a) =>
      a.type.toLowerCase().replace(/\s+/g, '_')
    )
    expect(types).toContain('long_run')
    expect(types).toContain('restorative_run')
    expect(types).toContain('intervals')
  })

  test('week 7 has a long_run activity', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const hasLongRun = week7.activities.some(
      (a) => a.type.toLowerCase().replace(/\s+/g, '_') === 'long_run'
    )
    expect(hasLongRun).toBe(true)
  })

  // Trend assertions
  test('week 8 vo2max is >2% higher than week 7 (→ ↑ Increasing)', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const change = (week8.vo2max - week7.vo2max) / week7.vo2max
    expect(change).toBeGreaterThan(0.02)
  })

  test('week 8 restingHrAvg is >2% lower than week 7 (→ ↓ Decreasing)', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const change = (week8.restingHrAvg - week7.restingHrAvg) / week7.restingHrAvg
    expect(change).toBeLessThan(-0.02)
  })

  test('week 3 vo2max is within ±2% of week 2 (→ → Stable)', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    const change = Math.abs((week3.vo2max - week2.vo2max) / week2.vo2max)
    expect(change).toBeLessThanOrEqual(0.02)
  })

  test('week 3 restingHrAvg is within ±2% of week 2 (→ → Stable)', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    const change = Math.abs((week3.restingHrAvg - week2.restingHrAvg) / week2.restingHrAvg)
    expect(change).toBeLessThanOrEqual(0.02)
  })
})

describe('getSelectableDatasets', () => {
  test('returns empty array (no selectable non-fixture datasets)', () => {
    expect(getSelectableDatasets()).toEqual([])
  })
})