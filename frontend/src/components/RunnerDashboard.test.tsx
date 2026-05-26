import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RunnerDashboard from './RunnerDashboard'
import { fixtureDataset } from '../data/datasets'

// Helper: find the week-row button containing the specified week label text
// and click it to expand the week activities.
async function expandWeek(user: ReturnType<typeof userEvent.setup>, weekLabel: string) {
  const weekRows = screen.getAllByTestId('week-row')
  const targetRow = weekRows.find((row) => row.textContent?.includes(weekLabel))
  if (!targetRow) throw new Error(`Week row containing "${weekLabel}" not found`)
  const button = within(targetRow).getByRole('button')
  await user.click(button)
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

      // Visible text must communicate that the activity was skipped (UX spec Section 7)
      expect(skippedEl.textContent?.trim()).not.toBe('')
    })

    test('skipped-activity does not have a redundant aria-label conflicting with visible text', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 4')

      const weekActivities = screen.getByTestId('week-activities')
      const skippedEl = within(weekActivities).getByTestId('skipped-activity')

      // No aria-label that would conflict with the visible text content
      expect(skippedEl.getAttribute('aria-label')).toBeNull()
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

      // Collapse Week 8 by clicking again, then expand Week 7
      await expandWeek(user, 'Week 8')
      await expandWeek(user, 'Week 7')

      const week7Activities = screen.getByTestId('week-activities')
      const week7LongRunRows = within(week7Activities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'long_run')
      expect(week7LongRunRows.length).toBeGreaterThan(0)

      // Both should have the same attribute value
      expect(week8LongRunRows[0].getAttribute('data-activity-type')).toBe(
        week7LongRunRows[0].getAttribute('data-activity-type')
      )
    })
  })

  // Structural and fixture validation tests
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

    // Fixture validation: Week 7 must contain a long_run activity (required by Scenario 4)
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
    test('fixture Week 8 has all three required activity types for Scenario 2', () => {
      const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)
      expect(week8).toBeDefined()
      const attrValues = week8!.activities.map((a) =>
        a.type.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
      )
      expect(attrValues).toContain('long_run')
      expect(attrValues).toContain('restorative_run')
      expect(attrValues).toContain('intervals')
    })
  })
})