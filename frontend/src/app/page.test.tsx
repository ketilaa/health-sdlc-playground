import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from './page'

describe('HomePage (root route)', () => {
  test('renders the Weekly Dashboard heading', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('heading', { name: /weekly dashboard/i })
    ).toBeInTheDocument()
  })

  test('renders the weekly-dashboard-container', () => {
    render(<HomePage />)
    expect(screen.getByTestId('weekly-dashboard-container')).toBeInTheDocument()
  })

  test('does not render a training-overview element', () => {
    render(<HomePage />)
    expect(screen.queryByTestId('training-overview')).not.toBeInTheDocument()
  })

  test('does not render the Training Overview heading', () => {
    render(<HomePage />)
    expect(
      screen.queryByRole('heading', { name: /^training overview$/i })
    ).not.toBeInTheDocument()
  })
})