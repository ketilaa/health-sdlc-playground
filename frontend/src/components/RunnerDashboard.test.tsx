import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RunnerDashboard from './RunnerDashboard'
import { fixtureDataset } from '../data/datasets'

// Helper: find the week-row containing the specified week label text
// and click its button to expand/toggle the week activities.
async function expandWeek(user: ReturnType<typeof userEvent.setup>, weekLabel: string) {
  const weekRows = screen.getAllByTestId('week-row')
  const targetRow = weekRows.find((row) => row.textContent?.includes(weekLabel))
  if (!targetRow) throw new Error(`Week row containing "${weekLabel}" not found`)
  const button = within(targetRow).getByRole('button')
  await user.click(button)
}

// Helper: find the week-row containing the specified text
function getWeekRow(weekLabel: string): HTMLElement {
  const weekRows = screen.getAllByTestId('week-row')
  const targetRow = weekRows.find((row) => row.textContent?.includes(weekLabel))
  if (!targetRow) throw new Error(`Week row containing "${weekLabel}" not found`)
  return targetRow
}

describe('RunnerDashboard — enforce-visual-theme Gherkin scenarios', () => {
  // Scenario: Each activity row exposes its activity type for colour coding
  describe('Scenario 1: Each activity row has a non-empty data-activity-type attribute', () => {
    test('each activity-row within week-activities for Week 8 has non-empty data-activity-type', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 8')

      const weekActivities = screen.getByTestId('week-activities')
      const activityRows = within(weekActivities).getAllByTestId('activity-row')

      expect(activityRows.length).toBeGreaterThan(0)
      for (const row of activityRows) {
        const attrValue = row.getAttribute('data-activity-type')
        expect(attrValue).toBeTruthy()
        expect(attrValue!.trim()).not.toBe('')
      }
    })
  })

  // Scenario: Activity type attribute values match the known activity types
  describe('Scenario 2: Attribute values match known activity types (Week 8)', () => {
    test('long_run activity row is visible within week-activities', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 8')

      const weekActivities = screen.getByTestId('week-activities')
      const longRunRows = within(weekActivities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'long_run')

      expect(longRunRows.length).toBeGreaterThan(0)
    })

    test('restorative_run activity row is visible within week-activities', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 8')

      const weekActivities = screen.getByTestId('week-activities')
      const rows = within(weekActivities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'restorative_run')

      expect(rows.length).toBeGreaterThan(0)
    })

    test('intervals activity row is visible within week-activities', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 8')

      const weekActivities = screen.getByTestId('week-activities')
      const rows = within(weekActivities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'intervals')

      expect(rows.length).toBeGreaterThan(0)
    })
  })

  // Scenario: Skipped activity marker exposes its type for colour coding
  describe('Scenario 3: Skipped activity marker has data-activity-type="skipped"', () => {
    test('skipped-activity element within week-activities for Week 4 has data-activity-type="skipped"', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 4')

      const weekActivities = screen.getByTestId('week-activities')
      const skippedEl = within(weekActivities).getByTestId('skipped-activity')

      expect(skippedEl).toBeInTheDocument()
      expect(skippedEl.getAttribute('data-activity-type')).toBe('skipped')
    })

    test('skipped-activity has visible text communicating the skip reason (accessibility)', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 4')

      const weekActivities = screen.getByTestId('week-activities')
      const skippedEl = within(weekActivities).getByTestId('skipped-activity')

      expect(skippedEl.textContent?.trim()).not.toBe('')
    })
  })

  // Scenario: Activity type attribute is consistent for the same type across different weeks
  describe('Scenario 4: Attribute value for long_run is consistent across Week 8 and Week 7', () => {
    test('long_run data-activity-type is present in both Week 8 and Week 7', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      // Expand Week 8, check long_run
      await expandWeek(user, 'Week 8')
      const week8Activities = screen.getByTestId('week-activities')
      const week8LongRunRows = within(week8Activities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'long_run')
      expect(week8LongRunRows.length).toBeGreaterThan(0)
      const week8AttrValue = week8LongRunRows[0].getAttribute('data-activity-type')

      // Collapse Week 8 by clicking again, then expand Week 7
      await expandWeek(user, 'Week 8')
      await expandWeek(user, 'Week 7')

      const week7Activities = screen.getByTestId('week-activities')
      const week7LongRunRows = within(week7Activities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'long_run')
      expect(week7LongRunRows.length).toBeGreaterThan(0)
      const week7AttrValue = week7LongRunRows[0].getAttribute('data-activity-type')

      // Both should have the same attribute value
      expect(week8AttrValue).toBe(week7AttrValue)
      expect(week8AttrValue).toBe('long_run')
    })
  })

  // ============================================================
  // collapsed-week-trend-summary Gherkin scenarios
  // ============================================================

  describe('Scenario 1: Collapsed week rows display VO2max and resting HR trend indicators', () => {
    test('each week-row contains an element with data-testid "week-vo2max-trend"', () => {
      render(<RunnerDashboard />)
      const weekRows = screen.getAllByTestId('week-row')
      expect(weekRows.length).toBeGreaterThan(0)
      for (const row of weekRows) {
        expect(within(row).getByTestId('week-vo2max-trend')).toBeInTheDocument()
      }
    })

    test('each week-row contains an element with data-testid "week-resting-hr-trend"', () => {
      render(<RunnerDashboard />)
      const weekRows = screen.getAllByTestId('week-row')
      expect(weekRows.length).toBeGreaterThan(0)
      for (const row of weekRows) {
        expect(within(row).getByTestId('week-resting-hr-trend')).toBeInTheDocument()
      }
    })
  })

  describe('Scenario 2: Trend indicators visible without expanding; no week-activities visible', () => {
    test('week-vo2max-trend is visible within the first week-row without expansion', () => {
      render(<RunnerDashboard />)
      const weekRows = screen.getAllByTestId('week-row')
      const firstRow = weekRows[0]
      expect(within(firstRow).getByTestId('week-vo2max-trend')).toBeInTheDocument()
    })

    test('week-resting-hr-trend is visible within the first week-row without expansion', () => {
      render(<RunnerDashboard />)
      const weekRows = screen.getAllByTestId('week-row')
      const firstRow = weekRows[0]
      expect(within(firstRow).getByTestId('week-resting-hr-trend')).toBeInTheDocument()
    })

    test('week-activities is not visible on the page (no expansion)', () => {
      render(<RunnerDashboard />)
      expect(screen.queryByTestId('week-activities')).not.toBeInTheDocument()
    })
  })

  describe('Scenario 3: Week 8 shows increasing VO2max trend and decreasing resting HR trend', () => {
    test('week-vo2max-trend within Week 8 row contains text "↑ Increasing"', () => {
      render(<RunnerDashboard />)
      const week8Row = getWeekRow('Week 8')
      const vo2maxTrend = within(week8Row).getByTestId('week-vo2max-trend')
      expect(vo2maxTrend).toHaveTextContent('↑ Increasing')
    })

    test('week-resting-hr-trend within Week 8 row contains text "↓ Decreasing"', () => {
      render(<RunnerDashboard />)
      const week8Row = getWeekRow('Week 8')
      const hrTrend = within(week8Row).getByTestId('week-resting-hr-trend')
      expect(hrTrend).toHaveTextContent('↓ Decreasing')
    })
  })

  describe('Scenario 4: Week 3 shows stable trend indicators for both metrics', () => {
    test('week-vo2max-trend within Week 3 row contains text "→ Stable"', () => {
      render(<RunnerDashboard />)
      const week3Row = getWeekRow('Week 3')
      const vo2maxTrend = within(week3Row).getByTestId('week-vo2max-trend')
      expect(vo2maxTrend).toHaveTextContent('→ Stable')
    })

    test('week-resting-hr-trend within Week 3 row contains text "→ Stable"', () => {
      render(<RunnerDashboard />)
      const week3Row = getWeekRow('Week 3')
      const hrTrend = within(week3Row).getByTestId('week-resting-hr-trend')
      expect(hrTrend).toHaveTextContent('→ Stable')
    })
  })

  describe('Scenario 5: Week 1 (earliest) shows no comparison available for both indicators', () => {
    test('week-vo2max-trend within Week 1 row contains text "—"', () => {
      render(<RunnerDashboard />)
      const week1Row = getWeekRow('Week 1')
      const vo2maxTrend = within(week1Row).getByTestId('week-vo2max-trend')
      expect(vo2maxTrend).toHaveTextContent('—')
    })

    test('week-resting-hr-trend within Week 1 row contains text "—"', () => {
      render(<RunnerDashboard />)
      const week1Row = getWeekRow('Week 1')
      const hrTrend = within(week1Row).getByTestId('week-resting-hr-trend')
      expect(hrTrend).toHaveTextContent('—')
    })
  })

  // ============================================================
  // Structural and fixture validation tests
  // ============================================================

  describe('Component structure and fixture validation', () => {
    test('renders the runner-dashboard container', () => {
      render(<RunnerDashboard />)
      expect(screen.getByTestId('runner-dashboard')).toBeInTheDocument()
    })

    test('renders 8 week-row elements (one per week)', () => {
      render(<RunnerDashboard />)
      const weekRows = screen.getAllByTestId('week-row')
      expect(weekRows).toHaveLength(8)
    })

    test('week-activities is not visible before expanding a week', () => {
      render(<RunnerDashboard />)
      expect(screen.queryByTestId('week-activities')).not.toBeInTheDocument()
    })

    test('activity-type attribute value for Long Run is long_run (snake_case normalization)', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)
      await expandWeek(user, 'Week 8')
      const weekActivities = screen.getByTestId('week-activities')
      const rows = within(weekActivities).getAllByTestId('activity-row')
      const longRunRow = rows.find((el) => el.getAttribute('data-activity-type') === 'long_run')
      expect(longRunRow).toBeDefined()
    })

    // Fixture validation: Week 7 must contain a long_run activity (required by enforce-visual-theme Scenario 4)
    test('fixture Week 7 contains at least one long_run activity type', () => {
      const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)
      expect(week7).toBeDefined()
      const longRunActivities = week7!.activities.filter(
        (a) => a.type.toLowerCase().replace(/\s+/g, '_') === 'long_run'
      )
      expect(longRunActivities.length).toBeGreaterThan(0)
    })

    // Fixture validation: Week 4 must be the skipped/sickness week
    test('fixture Week 4 is marked as skipped', () => {
      const week4 = fixtureDataset.weeks.find((w) => w.weekNumber === 4)
      expect(week4).toBeDefined()
      expect(week4!.skipped).toBeDefined()
    })

    // Fixture validation: Week 8 must have long_run, restorative_run, and intervals
    test('fixture Week 8 has all three required activity types for enforce-visual-theme Scenario 2', () => {
      const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)
      expect(week8).toBeDefined()
      const attrValues = week8!.activities.map((a) =>
        a.type.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
      )
      expect(attrValues).toContain('long_run')
      expect(attrValues).toContain('restorative_run')
      expect(attrValues).toContain('intervals')
    })

    // Fixture validation for trend assertions
    test('fixture Week 1 has vo2max and restingHrAvg fields', () => {
      const week1 = fixtureDataset.weeks.find((w) => w.weekNumber === 1)!
      expect(typeof week1.vo2max).toBe('number')
      expect(typeof week1.restingHrAvg).toBe('number')
    })

    test('fixture Week 8 vo2max is >2% higher than Week 7 (for ↑ Increasing assertion)', () => {
      const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
      const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
      const change = (week8.vo2max - week7.vo2max) / week7.vo2max
      expect(change).toBeGreaterThan(0.02)
    })

    test('fixture Week 8 restingHrAvg is >2% lower than Week 7 (for ↓ Decreasing assertion)', () => {
      const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
      const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
      const change = (week8.restingHrAvg - week7.restingHrAvg) / week7.restingHrAvg
      expect(change).toBeLessThan(-0.02)
    })

    test('fixture Week 3 vo2max is within ±2% of Week 2 (for → Stable assertion)', () => {
      const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
      const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
      const change = Math.abs((week3.vo2max - week2.vo2max) / week2.vo2max)
      expect(change).toBeLessThanOrEqual(0.02)
    })

    test('fixture Week 3 restingHrAvg is within ±2% of Week 2 (for → Stable assertion)', () => {
      const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
      const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
      const change = Math.abs((week3.restingHrAvg - week2.restingHrAvg) / week2.restingHrAvg)
      expect(change).toBeLessThanOrEqual(0.02)
    })
  })
})