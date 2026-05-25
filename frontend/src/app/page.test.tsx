import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import HomePage from './page'

describe('HomePage', () => {
  test('renders the training overview with the preselected dataset', async () => {
    render(<HomePage />)
    expect(screen.getByTestId('dataset-loading')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryAllByTestId('activity-row').length).toBeGreaterThan(0)
    })
    expect(screen.getByTestId('dataset-selector')).toHaveTextContent(
      'Half-Marathon Build-Up — 8 Week Consistent Plan'
    )
  })

  test('renders the Training Overview heading', async () => {
    render(<HomePage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /training overview/i })).toBeInTheDocument()
    })
  })
})