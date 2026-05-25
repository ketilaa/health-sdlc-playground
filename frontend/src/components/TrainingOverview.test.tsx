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

  test('renders exactly 8 week sections with Week 1 and Week 8 visible', async () => {
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

  test('Week 8 contains three activity rows with the three activity types', async () => {
    await renderAndLoad()
    const rows = screen.getAllByTestId('week-row')
    const week8 = rows[0]
    const activities = within(week8).getAllByTestId('activity-row')
    expect(activities).toHaveLength(3)
    const types = activities.map((a) => a.getAttribute('data-activity-type')).sort()
    expect(types).toEqual(['intervals', 'long-run', 'restorative-run'])
  })

  test('Week 4 has two activities plus a skipped marker', async () => {
    await renderAndLoad()
    const rows = screen.getAllByTestId('week-row')
    const week4 = rows.find((r) => /Week 4/.test(r.textContent || ''))!
    const activities = within(week4).getAllByTestId('activity-row')
    expect(activities).toHaveLength(2)
    expect(within(week4).getByTestId('skipped-activity-marker')).toBeInTheDocument()
    expect(within(week4).getByText(/Skipped due to sickness/)).toBeInTheDocument()
  })

  test('clicking an activity-row-toggle reveals its expanded panel', async () => {
    const user = userEvent.setup()
    await renderAndLoad()
    const firstRow = screen.getAllByTestId('activity-row')[0]
    const toggle = within(firstRow).getByTestId('activity-row-toggle')
    await user.click(toggle)
    expect(within(firstRow).getByTestId('activity-row-expanded')).toBeVisible()
  })

  test('dataset selector dropdown does not list any option containing "Test Fixture"', async () => {
    const user = userEvent.setup()
    await renderAndLoad()
    const selector = screen.getByTestId('dataset-selector')
    await user.click(selector)

    const listbox = screen.getByRole('listbox')
    const options = within(listbox).queryAllByRole('option')
    for (const opt of options) {
      expect(opt.textContent || '').not.toMatch(/Test Fixture/i)
    }
  })

  test('loading state is shown before activity rows render and disappears afterwards', async () => {
    jest.useFakeTimers()
    try {
      render(<TrainingOverview />)
      expect(screen.getByTestId('dataset-loading')).toBeInTheDocument()
      expect(screen.queryAllByTestId('activity-row')).toHaveLength(0)

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.queryAllByTestId('activity-row').length).toBeGreaterThan(0)
      })
      expect(screen.queryByTestId('dataset-loading')).not.toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })

  test('renders a hidden color-probe element', async () => {
    await renderAndLoad()
    expect(screen.getByTestId('color-probe')).toBeInTheDocument()
  })
})