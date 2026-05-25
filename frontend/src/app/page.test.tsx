import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from './page'

// Scenario 1: Root route renders Weekly Dashboard (HTTP 200 deferred to E2E)
// Scenario 2: Root route does not render Training Overview

describe('HomePage (root route)', () => {
  test('renders the Weekly Dashboard heading (Scenario 1)', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('heading', { name: /weekly dashboard/i })
    ).toBeInTheDocument()
  })

  test('renders the weekly-dashboard-container (Scenario 1)', () => {
    render(<HomePage />)
    expect(screen.getByTestId('weekly-dashboard-container')).toBeInTheDocument()
  })

  test('does not render a training-overview element (Scenario 2)', () => {
    render(<HomePage />)
    expect(screen.queryByTestId('training-overview')).not.toBeInTheDocument()
  })

  test('does not render the Training Overview heading (Scenario 2)', () => {
    render(<HomePage />)
    expect(
      screen.queryByRole('heading', { name: /^training overview$/i })
    ).not.toBeInTheDocument()
  })
})