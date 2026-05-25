export type ActivityType = 'Long run' | 'Restorative run' | 'Intervals'

export interface Activity {
  id: string
  date: string
  type: ActivityType
  distanceKm: number
  durationMinutes: number
}

export interface Week {
  weekNumber: number
  activities: Activity[]
  skipped?: { reason: string }
}

export interface Dataset {
  id: string
  name: string
  isTestFixture: boolean
  weeks: Week[]
}

const sicknessWeek: Week = {
  weekNumber: 4,
  activities: [
    { id: 'w4-a1', date: 'Mon, Sep 9', type: 'Restorative run', distanceKm: 5.0, durationMinutes: 30 },
    { id: 'w4-a2', date: 'Wed, Sep 11', type: 'Intervals', distanceKm: 6.0, durationMinutes: 35 },
  ],
  skipped: { reason: 'Skipped due to sickness' },
}

function buildTypicalWeek(weekNumber: number, longKm: number, dateMonday: string, dateWednesday: string, dateSaturday: string): Week {
  return {
    weekNumber,
    activities: [
      { id: `w${weekNumber}-a1`, date: dateMonday, type: 'Restorative run', distanceKm: 5.0 + weekNumber * 0.2, durationMinutes: 30 + weekNumber },
      { id: `w${weekNumber}-a2`, date: dateWednesday, type: 'Intervals', distanceKm: 7.0 + weekNumber * 0.3, durationMinutes: 40 + weekNumber },
      { id: `w${weekNumber}-a3`, date: dateSaturday, type: 'Long run', distanceKm: longKm, durationMinutes: 60 + weekNumber * 5 },
    ],
  }
}

const week1 = buildTypicalWeek(1, 8, 'Mon, Aug 19', 'Wed, Aug 21', 'Sat, Aug 24')
const week2 = buildTypicalWeek(2, 10, 'Mon, Aug 26', 'Wed, Aug 28', 'Sat, Aug 31')
const week3 = buildTypicalWeek(3, 12, 'Mon, Sep 2', 'Wed, Sep 4', 'Sat, Sep 7')
const week5 = buildTypicalWeek(5, 13, 'Mon, Sep 16', 'Wed, Sep 18', 'Sat, Sep 21')
const week6 = buildTypicalWeek(6, 14, 'Mon, Sep 23', 'Wed, Sep 25', 'Sat, Sep 28')
const week7 = buildTypicalWeek(7, 15, 'Mon, Sep 30', 'Wed, Oct 2', 'Sat, Oct 5')
const week8 = buildTypicalWeek(8, 16, 'Mon, Oct 7', 'Wed, Oct 9', 'Sat, Oct 12')

export const fixtureDataset: Dataset = {
  id: 'half-marathon-consistent-8w',
  name: 'Half-Marathon Build-Up — 8 Week Consistent Plan',
  isTestFixture: false,
  weeks: [week1, week2, week3, sicknessWeek, week5, week6, week7, week8],
}

export const allDatasets: Dataset[] = [fixtureDataset]

export function getDefaultDataset(): Dataset {
  return fixtureDataset
}

export function getSelectableDatasets(): Dataset[] {
  return allDatasets.filter((d) => !d.isTestFixture && !/Test Fixture/i.test(d.name))
}