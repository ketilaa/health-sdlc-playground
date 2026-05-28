import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Page from './page'

// HomePage uses useRouter — mock next/navigation so it works outside App Router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}))

// Scenario: Root route renders the Home Page with Health Playground layout
// HTTP 200 status assertion deferred to E2E (requires a running server)

describe('Page (root route)', () => {
  test('renders "Health Playground" title text', () => {
    render(<Page />)
    expect(screen.getByText('Health Playground')).toBeInTheDocument()
  })

  test('renders content-area', () => {
    render(<Page />)
    expect(screen.getByTestId('content-area')).toBeInTheDocument()
  })

  test('renders training-overview element', () => {
    render(<Page />)
    expect(screen.getByTestId('training-overview')).toBeInTheDocument()
  })

  test('renders dataset-selector element', () => {
    render(<Page />)
    expect(screen.getByTestId('dataset-selector')).toBeInTheDocument()
  })
})