import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeeklyDashboard } from './WeeklyDashboard'
import {
  weeklyDashboardDataset,
  WeekData,
  strengthCrossTrainActivity,
} from '../data/weeklyDashboardData'

// Helper to select a specific week via the selector
async function selectWeek(user: ReturnType<typeof userEvent.setup>, weekId: string) {
  const selector = screen.getByTestId('week-selector')
  // The select element shows week labels; we find by value
  await user.selectOptions(selector, weekId)
}

// Helper to click an activity by name in the activity list
async function clickActivity(user: ReturnType<typeof userEvent.setup>, name: string) {
  const list = screen.getByTestId('activity-list')
  const btn = within(list).getByRole('button', { name: `Open ${name} details` })
  await user.click(btn)
}

describe('WeeklyDashboard', () => {
  describe('Scenario: Activity records expose cadence and average heart rate fields', () => {
    test('Interval Session shows avgHr=168 and cadence=180', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      await clickActivity(user, 'Interval Session')
      expect(screen.getByTestId('activity-detail')).toBeVisible()
      expect(screen.getByTestId('activity-avg-hr')).toHaveTextContent('168')
      expect(screen.getByTestId('activity-cadence')).toHaveTextContent('180')
    })
  })

  describe('Scenario: Activity detail displays a dash when cadence or average heart rate is absent', () => {
    test('Strength Cross-Train shows em dash for missing fields', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard extraActivities={[strengthCrossTrainActivity]} />)
      await selectWeek(user, '2024-W10')
      await clickActivity(user, 'Strength Cross-Train')
      expect(screen.getByTestId('activity-avg-hr')).toHaveTextContent('\u2014')
      expect(screen.getByTestId('activity-cadence')).toHaveTextContent('\u2014')
    })
  })

  describe('Scenario: Weekly summary displays VO2max and average resting heart rate', () => {
    test('W10 shows vo2max=54 and resting HR=52', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      expect(screen.getByTestId('weekly-vo2max')).toBeVisible()
      expect(screen.getByTestId('weekly-vo2max')).toHaveTextContent('54')
      expect(screen.getByTestId('weekly-resting-hr')).toBeVisible()
      expect(screen.getByTestId('weekly-resting-hr')).toHaveTextContent('52')
    })
  })

  describe('Scenario: Weekly summary shows average heart rate aggregated from activities', () => {
    test('W10 avg HR = 147', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      expect(screen.getByTestId('weekly-avg-hr')).toBeVisible()
      expect(screen.getByTestId('weekly-avg-hr')).toHaveTextContent('147')
    })
  })

  describe('Scenario: Weekly summary shows average cadence aggregated from activities', () => {
    test('W10 avg cadence = 170', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      expect(screen.getByTestId('weekly-avg-cadence')).toBeVisible()
      expect(screen.getByTestId('weekly-avg-cadence')).toHaveTextContent('170')
    })
  })

  describe('Scenario: Weekly summary shows intensity balance', () => {
    test('W10 intensity balance: Low 3, High 1', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      const balance = screen.getByTestId('intensity-balance')
      expect(balance).toBeVisible()
      expect(balance).toHaveTextContent('Low: 3')
      expect(balance).toHaveTextContent('High: 1')
      expect(balance).toHaveAttribute(
        'aria-label',
        'Intensity balance: 3 low-intensity sessions, 1 high-intensity session'
      )
    })
  })

  describe('Scenario: Trend indicators for W10 vs W09', () => {
    test('training load increasing, avg HR increasing, resting HR decreasing', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      expect(screen.getByTestId('trend-training-load')).toBeVisible()
      expect(screen.getByTestId('trend-training-load')).toHaveTextContent('↑ Increasing')
      expect(screen.getByTestId('trend-avg-hr')).toBeVisible()
      expect(screen.getByTestId('trend-avg-hr')).toHaveTextContent('↑ Increasing')
      expect(screen.getByTestId('trend-resting-hr')).toBeVisible()
      expect(screen.getByTestId('trend-resting-hr')).toHaveTextContent('↓ Decreasing')
    })
  })

  describe('Scenario: Trend indicators show stable within 2%', () => {
    test('W09 vs stable W08 shows all stable trends', async () => {
      const user = userEvent.setup()
      // Build a custom dataset where W09 is within 2% of W08 for all metrics
      // W08: trainingLoad=148, restingHrAvg=55
      // W08 avgHr = (142+138+165)/3 = 148.33
      // W09 within 2% of W08:
      //   trainingLoad: 148 * 1.01 = 149.48, use 150 (within 2%)
      //   restingHrAvg: 55 (same, within 2%)
      //   avgHr: W09 needs to produce 148 avg — set activities to achieve this
      const stableDataset: WeekData[] = [
        {
          weekId: '2024-W08',
          label: 'W08 · 2024',
          activities: [
            { id: 'w08-s1', name: 'Run A', type: 'run', durationMin: 50, distanceKm: 8.0, avgHr: 148, cadence: 168 },
            { id: 'w08-s2', name: 'Run B', type: 'recovery', durationMin: 50, distanceKm: 7.0, avgHr: 148, cadence: 165 },
            { id: 'w08-s3', name: 'Run C', type: 'intervals', durationMin: 50, distanceKm: 6.0, avgHr: 148, cadence: 175 },
          ],
          restingHrAvg: 55,
          vo2max: 52,
          trainingLoad: 150,
        },
        {
          weekId: '2024-W09',
          label: 'W09 · 2024',
          activities: [
            { id: 'w09-s1', name: 'Run A', type: 'run', durationMin: 50, distanceKm: 8.0, avgHr: 149, cadence: 168 },
            { id: 'w09-s2', name: 'Run B', type: 'recovery', durationMin: 50, distanceKm: 7.0, avgHr: 148, cadence: 165 },
            { id: 'w09-s3', name: 'Run C', type: 'intervals', durationMin: 50, distanceKm: 6.0, avgHr: 148, cadence: 175 },
          ],
          restingHrAvg: 55,
          vo2max: 52,
          // W09 trainingLoad within 2% of W08(150): 150 * 1.01 = 151.5, use 151
          trainingLoad: 151,
        },
      ]
      render(<WeeklyDashboard overrideDataset={stableDataset} />)
      await selectWeek(user, '2024-W09')
      expect(screen.getByTestId('trend-training-load')).toHaveTextContent('→ Stable')
      expect(screen.getByTestId('trend-avg-hr')).toHaveTextContent('→ Stable')
      expect(screen.getByTestId('trend-resting-hr')).toHaveTextContent('→ Stable')
    })
  })

  describe('Scenario: No comparison available for earliest week', () => {
    test('W08 shows em dash for all trends', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W08')
      expect(screen.getByTestId('trend-training-load')).toHaveTextContent('\u2014')
      expect(screen.getByTestId('trend-avg-hr')).toHaveTextContent('\u2014')
      expect(screen.getByTestId('trend-resting-hr')).toHaveTextContent('\u2014')
    })
  })

  describe('Scenario: User can browse between weeks and drill down', () => {
    test('browse W10, open Morning Run, switch to W09', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      expect(screen.getByTestId('activity-list')).toBeVisible()
      expect(screen.getByTestId('activity-list')).toHaveTextContent('Morning Run')
      await clickActivity(user, 'Morning Run')
      expect(screen.getByTestId('activity-detail')).toBeVisible()
      expect(screen.getByTestId('activity-detail')).toHaveTextContent('Morning Run')
      await selectWeek(user, '2024-W09')
      expect(screen.getByTestId('activity-list')).toBeVisible()
    })
  })

  describe('Scenario: Weekly summary card visible at 375px', () => {
    test('all required elements are present in the DOM at 375px', async () => {
      // jsdom doesn't enforce viewport but we verify elements exist
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      expect(screen.getByTestId('weekly-summary-card')).toBeInTheDocument()
      expect(screen.getByTestId('weekly-vo2max')).toBeInTheDocument()
      expect(screen.getByTestId('weekly-resting-hr')).toBeInTheDocument()
      expect(screen.getByTestId('intensity-balance')).toBeInTheDocument()
      expect(screen.getByTestId('trend-training-load')).toBeInTheDocument()
    })
  })

  describe('Default state', () => {
    test('defaults to the most recent week (W10)', () => {
      render(<WeeklyDashboard />)
      const selector = screen.getByTestId('week-selector') as HTMLSelectElement
      expect(selector.value).toBe('2024-W10')
    })

    test('activity detail is not visible initially', () => {
      render(<WeeklyDashboard />)
      expect(screen.queryByTestId('activity-detail')).not.toBeInTheDocument()
    })
  })

  describe('Activity detail close behavior', () => {
    test('close button hides activity detail', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      await clickActivity(user, 'Morning Run')
      expect(screen.getByTestId('activity-detail')).toBeInTheDocument()
      const closeBtn = screen.getByRole('button', { name: /close activity details/i })
      await user.click(closeBtn)
      expect(screen.queryByTestId('activity-detail')).not.toBeInTheDocument()
    })

    test('clicking same activity again toggles detail off', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      await clickActivity(user, 'Morning Run')
      expect(screen.getByTestId('activity-detail')).toBeInTheDocument()
      await clickActivity(user, 'Morning Run')
      expect(screen.queryByTestId('activity-detail')).not.toBeInTheDocument()
    })
  })

  describe('Morning Run activity detail metrics', () => {
    test('Morning Run shows avgHr=148 and cadence=172', async () => {
      const user = userEvent.setup()
      render(<WeeklyDashboard />)
      await selectWeek(user, '2024-W10')
      await clickActivity(user, 'Morning Run')
      expect(screen.getByTestId('activity-avg-hr')).toHaveTextContent('148')
      expect(screen.getByTestId('activity-cadence')).toHaveTextContent('172')
    })
  })
})