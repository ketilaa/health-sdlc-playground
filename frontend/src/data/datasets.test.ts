import { fixtureDataset, getSelectableDatasets } from './datasets'

describe('fixtureDataset', () => {
  test('has exactly 8 weeks', () => {
    expect(fixtureDataset.weeks).toHaveLength(8)
  })

  test('week numbers are 1 through 8', () => {
    const weekNumbers = fixtureDataset.weeks.map((w) => w.weekNumber)
    expect(weekNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  test('each week has a label matching "Week N"', () => {
    for (const week of fixtureDataset.weeks) {
      expect(week.label).toBe(`Week ${week.weekNumber}`)
    }
  })

  test('Week 4 is skipped', () => {
    const week4 = fixtureDataset.weeks.find((w) => w.weekNumber === 4)!
    expect(week4.skipped).toBeDefined()
    expect(week4.activities).toHaveLength(0)
  })

  test('7 non-skipped weeks each have 3 activities', () => {
    const nonSkipped = fixtureDataset.weeks.filter((w) => !w.skipped)
    expect(nonSkipped).toHaveLength(7)
    for (const week of nonSkipped) {
      expect(week.activities).toHaveLength(3)
    }
  })

  test('every week has vo2max and restingHrAvg as numbers', () => {
    for (const week of fixtureDataset.weeks) {
      expect(typeof week.vo2max).toBe('number')
      expect(typeof week.restingHrAvg).toBe('number')
    }
  })

  test('Week 7 has a Long run activity', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const hasLongRun = week7.activities.some(
      (a) => a.type.toLowerCase().replace(/\s+/g, '_') === 'long_run'
    )
    expect(hasLongRun).toBe(true)
  })

  test('Week 8 has long_run, restorative_run, and intervals', () => {
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const types = week8.activities.map((a) =>
      a.type.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
    )
    expect(types).toContain('long_run')
    expect(types).toContain('restorative_run')
    expect(types).toContain('intervals')
  })

  test('Week 8 vo2max >2% higher than Week 7', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const change = (week8.vo2max - week7.vo2max) / week7.vo2max
    expect(change).toBeGreaterThan(0.02)
  })

  test('Week 8 restingHrAvg >2% lower than Week 7', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const change = (week8.restingHrAvg - week7.restingHrAvg) / week7.restingHrAvg
    expect(change).toBeLessThan(-0.02)
  })

  test('Week 3 vo2max within ±2% of Week 2', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    const change = Math.abs((week3.vo2max - week2.vo2max) / week2.vo2max)
    expect(change).toBeLessThanOrEqual(0.02)
  })

  test('Week 3 restingHrAvg within ±2% of Week 2', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    const change = Math.abs((week3.restingHrAvg - week2.restingHrAvg) / week2.restingHrAvg)
    expect(change).toBeLessThanOrEqual(0.02)
  })
})

describe('getSelectableDatasets', () => {
  test('returns an empty array (fixture dataset is not selectable)', () => {
    expect(getSelectableDatasets()).toEqual([])
  })
})