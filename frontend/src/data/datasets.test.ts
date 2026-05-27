import { fixtureDataset, getSelectableDatasets } from './datasets'

describe('fixtureDataset', () => {
  test('has 8 weeks', () => {
    expect(fixtureDataset.weeks).toHaveLength(8)
  })

  test('weeks are numbered 1 through 8', () => {
    const numbers = fixtureDataset.weeks.map((w) => w.weekNumber)
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  test('each week has a label matching "Week N"', () => {
    for (const week of fixtureDataset.weeks) {
      expect(week.label).toBe(`Week ${week.weekNumber}`)
    }
  })

  test('7 weeks have activities and 1 week is skipped (Week 4)', () => {
    const skippedWeeks = fixtureDataset.weeks.filter((w) => w.skipped !== undefined)
    const activeWeeks = fixtureDataset.weeks.filter((w) => w.skipped === undefined)
    expect(skippedWeeks).toHaveLength(1)
    expect(activeWeeks).toHaveLength(7)
    expect(skippedWeeks[0].weekNumber).toBe(4)
  })

  test('each non-skipped week has at least 1 activity', () => {
    for (const week of fixtureDataset.weeks) {
      if (!week.skipped) {
        expect(week.activities.length).toBeGreaterThan(0)
      }
    }
  })

  test('each week has vo2max as a positive number', () => {
    for (const week of fixtureDataset.weeks) {
      expect(typeof week.vo2max).toBe('number')
      expect(week.vo2max).toBeGreaterThan(0)
    }
  })

  test('each week has restingHrAvg as a positive number', () => {
    for (const week of fixtureDataset.weeks) {
      expect(typeof week.restingHrAvg).toBe('number')
      expect(week.restingHrAvg).toBeGreaterThan(0)
    }
  })

  test('isTestFixture is true', () => {
    expect(fixtureDataset.isTestFixture).toBe(true)
  })

  test('getSelectableDatasets returns empty array (fixture-only mode)', () => {
    expect(getSelectableDatasets()).toHaveLength(0)
  })

  // Trend constraints for collapsed-week-trend-summary feature
  test('Week 8 vo2max is >2% higher than Week 7', () => {
    const w7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const w8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    expect((w8.vo2max - w7.vo2max) / w7.vo2max).toBeGreaterThan(0.02)
  })

  test('Week 8 restingHrAvg is >2% lower than Week 7', () => {
    const w7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const w8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    expect((w8.restingHrAvg - w7.restingHrAvg) / w7.restingHrAvg).toBeLessThan(-0.02)
  })

  test('Week 3 vo2max is within ±2% of Week 2', () => {
    const w2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const w3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    expect(Math.abs((w3.vo2max - w2.vo2max) / w2.vo2max)).toBeLessThanOrEqual(0.02)
  })

  test('Week 3 restingHrAvg is within ±2% of Week 2', () => {
    const w2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const w3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    expect(Math.abs((w3.restingHrAvg - w2.restingHrAvg) / w2.restingHrAvg)).toBeLessThanOrEqual(0.02)
  })
})