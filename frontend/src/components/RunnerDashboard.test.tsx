import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RunnerDashboard from './RunnerDashboard'
import { fixtureDataset } from '../data/datasets'
import { themeTokens } from '../theme/tokens'

// Helper: find the week-row containing the specified week label text and click its button
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

// ============================================================
// icon-based-trend-indicators — all 6 Gherkin scenarios
// This feature supersedes collapsed-week-trend-summary text labels.
// ============================================================

describe('RunnerDashboard — icon-based-trend-indicators Gherkin scenarios', () => {

  // Scenario 1: Metric icons are always visible in collapsed week rows regardless of trend availability
  describe('Scenario 1: Metric icons always visible in all collapsed week rows', () => {
    test('each element with data-testid "week-vo2max-trend" contains week-vo2max-metric-icon', () => {
      render(<RunnerDashboard />)
      const weekRows = screen.getAllByTestId('week-row')
      expect(weekRows.length).toBeGreaterThan(0)
      for (const row of weekRows) {
        const trendContainer = within(row).getByTestId('week-vo2max-trend')
        expect(within(trendContainer).getByTestId('week-vo2max-metric-icon')).toBeInTheDocument()
      }
    })

    test('each element with data-testid "week-resting-hr-trend" contains week-resting-hr-metric-icon', () => {
      render(<RunnerDashboard />)
      const weekRows = screen.getAllByTestId('week-row')
      expect(weekRows.length).toBeGreaterThan(0)
      for (const row of weekRows) {
        const trendContainer = within(row).getByTestId('week-resting-hr-trend')
        expect(within(trendContainer).getByTestId('week-resting-hr-metric-icon')).toBeInTheDocument()
      }
    })
  })

  // Scenario 2: Trend direction icons are visible for weeks that have a prior week for comparison
  describe('Scenario 2: Trend icons visible for weeks with a prior week (Week 8, Week 3)', () => {
    test('week-vo2max-trend within Week 8 row contains week-vo2max-trend-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 8')).getByTestId('week-vo2max-trend')
      expect(within(trendContainer).getByTestId('week-vo2max-trend-icon')).toBeInTheDocument()
    })

    test('week-resting-hr-trend within Week 8 row contains week-resting-hr-trend-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 8')).getByTestId('week-resting-hr-trend')
      expect(within(trendContainer).getByTestId('week-resting-hr-trend-icon')).toBeInTheDocument()
    })

    test('week-vo2max-trend within Week 3 row contains week-vo2max-trend-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 3')).getByTestId('week-vo2max-trend')
      expect(within(trendContainer).getByTestId('week-vo2max-trend-icon')).toBeInTheDocument()
    })

    test('week-resting-hr-trend within Week 3 row contains week-resting-hr-trend-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 3')).getByTestId('week-resting-hr-trend')
      expect(within(trendContainer).getByTestId('week-resting-hr-trend-icon')).toBeInTheDocument()
    })
  })

  // Scenario 3: The earliest week shows no trend direction icon
  describe('Scenario 3: Week 1 (earliest) shows no trend direction icon', () => {
    test('week-vo2max-trend within Week 1 does NOT contain week-vo2max-trend-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 1')).getByTestId('week-vo2max-trend')
      expect(within(trendContainer).queryByTestId('week-vo2max-trend-icon')).not.toBeInTheDocument()
    })

    test('week-resting-hr-trend within Week 1 does NOT contain week-resting-hr-trend-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 1')).getByTestId('week-resting-hr-trend')
      expect(within(trendContainer).queryByTestId('week-resting-hr-trend-icon')).not.toBeInTheDocument()
    })

    test('week-vo2max-trend within Week 1 still contains week-vo2max-metric-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 1')).getByTestId('week-vo2max-trend')
      expect(within(trendContainer).getByTestId('week-vo2max-metric-icon')).toBeInTheDocument()
    })

    test('week-resting-hr-trend within Week 1 still contains week-resting-hr-metric-icon', () => {
      render(<RunnerDashboard />)
      const trendContainer = within(getWeekRow('Week 1')).getByTestId('week-resting-hr-trend')
      expect(within(trendContainer).getByTestId('week-resting-hr-metric-icon')).toBeInTheDocument()
    })
  })

  // Scenario 4: Week 8 trend containers carry accessible labels reflecting increasing VO2max and decreasing resting HR
  describe('Scenario 4: Week 8 aria-labels reflect increasing VO2max and decreasing HR', () => {
    test('week-vo2max-trend within Week 8 has aria-label "VO2max trend: increasing"', () => {
      render(<RunnerDashboard />)
      expect(within(getWeekRow('Week 8')).getByTestId('week-vo2max-trend')).toHaveAttribute(
        'aria-label', 'VO2max trend: increasing'
      )
    })

    test('week-resting-hr-trend within Week 8 has aria-label "Resting HR trend: decreasing"', () => {
      render(<RunnerDashboard />)
      expect(within(getWeekRow('Week 8')).getByTestId('week-resting-hr-trend')).toHaveAttribute(
        'aria-label', 'Resting HR trend: decreasing'
      )
    })
  })

  // Scenario 5: Week 3 trend containers carry accessible labels reflecting stable trends
  describe('Scenario 5: Week 3 aria-labels reflect stable trends', () => {
    test('week-vo2max-trend within Week 3 has aria-label "VO2max trend: stable"', () => {
      render(<RunnerDashboard />)
      expect(within(getWeekRow('Week 3')).getByTestId('week-vo2max-trend')).toHaveAttribute(
        'aria-label', 'VO2max trend: stable'
      )
    })

    test('week-resting-hr-trend within Week 3 has aria-label "Resting HR trend: stable"', () => {
      render(<RunnerDashboard />)
      expect(within(getWeekRow('Week 3')).getByTestId('week-resting-hr-trend')).toHaveAttribute(
        'aria-label', 'Resting HR trend: stable'
      )
    })
  })

  // Scenario 6: The earliest week trend containers carry accessible labels indicating no comparison is available
  describe('Scenario 6: Week 1 aria-labels indicate no comparison available ("no data")', () => {
    test('week-vo2max-trend within Week 1 has aria-label "VO2max trend: no data"', () => {
      render(<RunnerDashboard />)
      expect(within(getWeekRow('Week 1')).getByTestId('week-vo2max-trend')).toHaveAttribute(
        'aria-label', 'VO2max trend: no data'
      )
    })

    test('week-resting-hr-trend within Week 1 has aria-label "Resting HR trend: no data"', () => {
      render(<RunnerDashboard />)
      expect(within(getWeekRow('Week 1')).getByTestId('week-resting-hr-trend')).toHaveAttribute(
        'aria-label', 'Resting HR trend: no data'
      )
    })
  })
})

// ============================================================
// enforce-visual-theme — prior feature scenarios (preserved)
// ============================================================

describe('RunnerDashboard — enforce-visual-theme Gherkin scenarios', () => {

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

  describe('Scenario 2: Attribute values match known activity types (Week 8)', () => {
    test('long_run activity row present within week-activities', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)
      await expandWeek(user, 'Week 8')
      const weekActivities = screen.getByTestId('week-activities')
      const rows = within(weekActivities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'long_run')
      expect(rows.length).toBeGreaterThan(0)
    })

    test('restorative_run activity row present within week-activities', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)
      await expandWeek(user, 'Week 8')
      const weekActivities = screen.getByTestId('week-activities')
      const rows = within(weekActivities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'restorative_run')
      expect(rows.length).toBeGreaterThan(0)
    })

    test('intervals activity row present within week-activities', async () => {
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

  describe('Scenario 3: Skipped activity marker has data-activity-type="skipped"', () => {
    test('skipped-activity in Week 4 has data-activity-type="skipped"', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)
      await expandWeek(user, 'Week 4')
      const weekActivities = screen.getByTestId('week-activities')
      const skippedEl = within(weekActivities).getByTestId('skipped-activity')
      expect(skippedEl).toBeInTheDocument()
      expect(skippedEl.getAttribute('data-activity-type')).toBe('skipped')
    })

    test('skipped-activity has non-empty visible text', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)
      await expandWeek(user, 'Week 4')
      const weekActivities = screen.getByTestId('week-activities')
      expect(within(weekActivities).getByTestId('skipped-activity').textContent?.trim()).not.toBe('')
    })
  })

  describe('Scenario 4: long_run data-activity-type consistent across Week 8 and Week 7', () => {
    test('long_run attribute value is "long_run" in both Week 8 and Week 7', async () => {
      const user = userEvent.setup()
      render(<RunnerDashboard />)

      await expandWeek(user, 'Week 8')
      const week8Activities = screen.getByTestId('week-activities')
      const week8LongRun = within(week8Activities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'long_run')
      expect(week8LongRun.length).toBeGreaterThan(0)

      await expandWeek(user, 'Week 8') // collapse
      await expandWeek(user, 'Week 7')

      const week7Activities = screen.getByTestId('week-activities')
      const week7LongRun = within(week7Activities)
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === 'long_run')
      expect(week7LongRun.length).toBeGreaterThan(0)
      expect(week7LongRun[0].getAttribute('data-activity-type')).toBe('long_run')
    })
  })
})

// ============================================================
// Structural, fixture validation, and design system tests
// ============================================================

describe('RunnerDashboard — structural and fixture validation', () => {
  test('renders the runner-dashboard container', () => {
    render(<RunnerDashboard />)
    expect(screen.getByTestId('runner-dashboard')).toBeInTheDocument()
  })

  test('renders 8 week-row elements (one per week)', () => {
    render(<RunnerDashboard />)
    expect(screen.getAllByTestId('week-row')).toHaveLength(8)
  })

  test('week-activities not present before any expansion', () => {
    render(<RunnerDashboard />)
    expect(screen.queryByTestId('week-activities')).not.toBeInTheDocument()
  })

  test('trend containers are visible in collapsed state without interaction', () => {
    render(<RunnerDashboard />)
    const firstRow = screen.getAllByTestId('week-row')[0]
    expect(within(firstRow).getByTestId('week-vo2max-trend')).toBeInTheDocument()
    expect(within(firstRow).getByTestId('week-resting-hr-trend')).toBeInTheDocument()
  })

  // Metric icon visual distinctness: VO2max and HR icons must use different SVG paths
  test('week-vo2max-metric-icon and week-resting-hr-metric-icon have different SVG paths', () => {
    render(<RunnerDashboard />)
    const firstRow = screen.getAllByTestId('week-row')[0]
    const vo2maxIcon = within(firstRow).getByTestId('week-vo2max-metric-icon')
    const hrIcon = within(firstRow).getByTestId('week-resting-hr-metric-icon')
    // Each icon must contain at least one path element
    const vo2maxPaths = vo2maxIcon.querySelectorAll('path,circle')
    const hrPaths = hrIcon.querySelectorAll('path,circle')
    expect(vo2maxPaths.length).toBeGreaterThan(0)
    expect(hrPaths.length).toBeGreaterThan(0)
    // The primary path data must differ between the two icons
    const vo2maxPathD = vo2maxIcon.querySelector('path')?.getAttribute('d')
    const hrPathD = hrIcon.querySelector('path')?.getAttribute('d')
    expect(vo2maxPathD).toBeTruthy()
    expect(hrPathD).toBeTruthy()
    expect(vo2maxPathD).not.toBe(hrPathD)
  })

  // Design system: metric and trend tokens must be present in themeTokens
  test('themeTokens includes all metric and trend color tokens', () => {
    expect(themeTokens).toHaveProperty('--color-metric-vo2max')
    expect(themeTokens).toHaveProperty('--color-metric-hr')
    expect(themeTokens).toHaveProperty('--color-trend-up')
    expect(themeTokens).toHaveProperty('--color-trend-down')
    expect(themeTokens).toHaveProperty('--color-trend-stable')
  })

  test('metric tokens are visually distinct (different values)', () => {
    expect(themeTokens['--color-metric-vo2max']).not.toBe(themeTokens['--color-metric-hr'])
  })

  test('trend-up and trend-down tokens are distinct', () => {
    expect(themeTokens['--color-trend-up']).not.toBe(themeTokens['--color-trend-down'])
  })

  // Fixture validation
  test('fixture Week 7 contains at least one long_run activity', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    expect(week7.activities.filter(
      (a) => a.type.toLowerCase().replace(/\s+/g, '_') === 'long_run'
    ).length).toBeGreaterThan(0)
  })

  test('fixture Week 4 is marked as skipped', () => {
    const week4 = fixtureDataset.weeks.find((w) => w.weekNumber === 4)!
    expect(week4.skipped).toBeDefined()
  })

  test('fixture Week 8 has long_run, restorative_run, and intervals', () => {
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    const types = week8.activities.map((a) =>
      a.type.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
    )
    expect(types).toContain('long_run')
    expect(types).toContain('restorative_run')
    expect(types).toContain('intervals')
  })

  test('fixture Week 8 vo2max is >2% higher than Week 7 (increasing assertion)', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    expect((week8.vo2max - week7.vo2max) / week7.vo2max).toBeGreaterThan(0.02)
  })

  test('fixture Week 8 restingHrAvg is >2% lower than Week 7 (decreasing assertion)', () => {
    const week7 = fixtureDataset.weeks.find((w) => w.weekNumber === 7)!
    const week8 = fixtureDataset.weeks.find((w) => w.weekNumber === 8)!
    expect((week8.restingHrAvg - week7.restingHrAvg) / week7.restingHrAvg).toBeLessThan(-0.02)
  })

  test('fixture Week 3 vo2max within ±2% of Week 2 (stable assertion)', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    expect(Math.abs((week3.vo2max - week2.vo2max) / week2.vo2max)).toBeLessThanOrEqual(0.02)
  })

  test('fixture Week 3 restingHrAvg within ±2% of Week 2 (stable assertion)', () => {
    const week2 = fixtureDataset.weeks.find((w) => w.weekNumber === 2)!
    const week3 = fixtureDataset.weeks.find((w) => w.weekNumber === 3)!
    expect(Math.abs((week3.restingHrAvg - week2.restingHrAvg) / week2.restingHrAvg)).toBeLessThanOrEqual(0.02)
  })
})