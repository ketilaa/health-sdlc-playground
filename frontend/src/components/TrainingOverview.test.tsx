import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrainingOverview } from './TrainingOverview'

async function renderAndLoad() {
  render(<TrainingOverview />)
  await waitFor(() => {
    expect(screen.queryAllByTestId('week-row').length).toBeGreaterThan(0)
  })
}

describe('TrainingOverview', () => {
  test('dataset selector is visible in the top bar with preselected dataset name', async () => {
    await renderAndLoad()
    const selector = screen.getByTestId('dataset-selector')
    expect(selector).toBeVisible()
    expect(selector).toHaveTextContent('Half-Marathon Build-Up — 8 Week Consistent Plan')
  })

  test('renders exactly 8 week rows with Week 1 and Week 8 visible', async () => {
    await renderAndLoad()
    const rows = screen.getAllByTestId('week-row')
    expect(rows).toHaveLength(8)
    expect(screen.getByText('Week 8')).toBeInTheDocument()
    expect(screen.getByText('Week 1')).toBeInTheDocument()
  })

  test('weeks are sorted newest to oldest (Week 8 first, Week 1 last)', async () => {
    await renderAndLoad()
    const rows = screen.getAllByTestId('week-row')
    expect(rows[0]).toHaveTextContent('Week 8')
    expect(rows[rows.length - 1]).toHaveTextContent('Week 1')
  })

  test('each week row exposes only overview-relevant aggregate fields', async () => {
    await renderAndLoad()
    const rows = screen.getAllByTestId('week-row')
    for (const row of rows) {
      expect(within(row).getByTestId('week-total-distance')).toBeInTheDocument()
      expect(within(row).getByTestId('week-total-duration')).toBeInTheDocument()
      expect(within(row).getByTestId('week-activity-count')).toBeInTheDocument()
    }
    expect(screen.queryByTestId('week-average-pace')).not.toBeInTheDocument()
    expect(screen.queryByTestId('week-average-heart-rate')).not.toBeInTheDocument()
    expect(screen.queryByTestId('week-trend')).not.toBeInTheDocument()
  })

  test('7 weeks have 3 activities and exactly 1 week has 2 activities', async () => {
    await renderAndLoad()
    const rows = screen.getAllByTestId('week-row')
    const threeCount = rows.filter((r) => /3 activities/.test(r.textContent || '')).length
    const twoCount = rows.filter((r) => /2 activities/.test(r.textContent || '')).length
    expect(threeCount).toBe(7)
    expect(twoCount).toBe(1)
  })

  test('clicking Week 8 reveals 3 activity rows with expected types', async () => {
    const user = userEvent.setup()
    await renderAndLoad()
    const week8Row = screen.getAllByTestId('week-row').find((r) => /Week 8/.test(r.textContent || ''))!
    await user.click(within(week8Row).getByRole('button'))

    const panel = await screen.findByTestId('week-activities')
    expect(panel).toBeVisible()
    const activities = within(panel).getAllByTestId('activity-row')
    expect(activities).toHaveLength(3)
    expect(within(panel).getByText('Long run')).toBeInTheDocument()
    expect(within(panel).getByText('Restorative run')).toBeInTheDocument()
    expect(within(panel).getByText('Intervals')).toBeInTheDocument()
  })

  test('clicking Week 4 reveals 2 activity rows plus a skipped marker', async () => {
    const user = userEvent.setup()
    await renderAndLoad()
    const week4Row = screen.getAllByTestId('week-row').find((r) => /Week 4/.test(r.textContent || ''))!
    await user.click(within(week4Row).getByRole('button'))

    const panel = await screen.findByTestId('week-activities')
    expect(panel).toBeVisible()
    const activities = within(panel).getAllByTestId('activity-row')
    expect(activities).toHaveLength(2)
    expect(within(panel).getByTestId('skipped-activity')).toBeInTheDocument()
    expect(within(panel).getByText('Skipped due to sickness')).toBeInTheDocument()
  })

  test('activity rows show only overview-relevant fields (no pace, no heart rate)', async () => {
    const user = userEvent.setup()
    await renderAndLoad()
    const week8Row = screen.getAllByTestId('week-row').find((r) => /Week 8/.test(r.textContent || ''))!
    await user.click(within(week8Row).getByRole('button'))

    const panel = await screen.findByTestId('week-activities')
    const activities = within(panel).getAllByTestId('activity-row')
    for (const a of activities) {
      expect(within(a).getByTestId('activity-date')).toBeInTheDocument()
      expect(within(a).getByTestId('activity-type')).toBeInTheDocument()
      expect(within(a).getByTestId('activity-distance')).toBeInTheDocument()
      expect(within(a).getByTestId('activity-duration')).toBeInTheDocument()
    }
    expect(screen.queryByTestId('activity-pace')).not.toBeInTheDocument()
    expect(screen.queryByTestId('activity-heart-rate')).not.toBeInTheDocument()
  })

  test('dataset selector dropdown does not list any option containing "Test Fixture"', async () => {
    const user = userEvent.setup()
    await renderAndLoad()
    const selector = screen.getByTestId('dataset-selector')
    await user.click(selector)

    const listbox = screen.getByRole('listbox')
    const options = within(listbox).getAllByRole('option')
    for (const opt of options) {
      expect(opt.textContent || '').not.toMatch(/Test Fixture/i)
    }
  })

  test('loading state is shown before week rows render and disappears afterwards', async () => {
    jest.useFakeTimers()
    try {
      render(<TrainingOverview />)
      // Before any timer flushes, the loader should be in the DOM and no week rows present.
      expect(screen.getByTestId('dataset-loading')).toBeInTheDocument()
      expect(screen.queryAllByTestId('week-row')).toHaveLength(0)

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.queryAllByTestId('week-row').length).toBeGreaterThan(0)
      })
      expect(screen.queryByTestId('dataset-loading')).not.toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })
})