import { allDatasets, getDefaultDataset, getSelectableDatasets, fixtureDataset } from './datasets'

describe('datasets module', () => {
  test('default dataset name matches the preselected fixture name', () => {
    expect(getDefaultDataset().name).toBe('Half-Marathon Build-Up — 8 Week Consistent Plan')
  })

  test('fixture has 8 weeks', () => {
    expect(fixtureDataset.weeks).toHaveLength(8)
  })

  test('exactly one week (Week 4) is marked as skipped/sickness', () => {
    const skipped = fixtureDataset.weeks.filter((w) => w.skipped)
    expect(skipped).toHaveLength(1)
    expect(skipped[0].weekNumber).toBe(4)
    expect(skipped[0].skipped?.reason).toBe('Skipped due to sickness')
  })

  test('7 weeks have 3 activities and 1 week has 0 activities (skipped)', () => {
    const three = fixtureDataset.weeks.filter((w) => w.activities.length === 3).length
    const zero = fixtureDataset.weeks.filter((w) => w.activities.length === 0).length
    expect(three).toBe(7)
    expect(zero).toBe(1)
  })

  test('Week 8 contains Long run, Restorative run, and Intervals activity types', () => {
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const types = week8.activities.map((a) => a.type).sort()
    expect(types).toEqual(['Intervals', 'Long run', 'Restorative run'])
  })

  test('Week 7 contains a Long run activity (required for consistency scenario)', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const types = week7.activities.map((a) => a.type)
    expect(types).toContain('Long run')
  })

  test('selectable datasets exclude anything labeled Test Fixture', () => {
    const selectable = getSelectableDatasets()
    for (const d of selectable) {
      expect(d.name).not.toMatch(/Test Fixture/i)
      expect(d.isTestFixture).toBe(false)
    }
  })

  test('allDatasets includes the fixture', () => {
    expect(allDatasets.map((d) => d.id)).toContain(fixtureDataset.id)
  })

  test('all weeks have vo2max and restingHrAvg fields', () => {
    for (const week of fixtureDataset.weeks) {
      expect(typeof week.vo2max).toBe('number')
      expect(typeof week.restingHrAvg).toBe('number')
    }
  })

  test('Week 1 has no prior week (first entry — trend will show —)', () => {
    expect(fixtureDataset.weeks[0].weekNumber).toBe(1)
  })

  test('Week 8 vo2max is >2% higher than Week 7 (↑ Increasing)', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const change = (week8.vo2max - week7.vo2max) / week7.vo2max
    expect(change).toBeGreaterThan(0.02)
  })

  test('Week 8 restingHrAvg is >2% lower than Week 7 (↓ Decreasing)', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const change = (week8.restingHrAvg - week7.restingHrAvg) / week7.restingHrAvg
    expect(change).toBeLessThan(-0.02)
  })

  test('Week 3 vo2max is within ±2% of Week 2 (→ Stable)', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    const change = Math.abs((week3.vo2max - week2.vo2max) / week2.vo2max)
    expect(change).toBeLessThanOrEqual(0.02)
  })

  test('Week 3 restingHrAvg is within ±2% of Week 2 (→ Stable)', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    const change = Math.abs((week3.restingHrAvg - week2.restingHrAvg) / week2.restingHrAvg)
    expect(change).toBeLessThanOrEqual(0.02)
  })
})