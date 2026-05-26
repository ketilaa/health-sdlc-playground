import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import HomePage from './HomePage'

// Suppress MUI SSR/client mismatch warnings in jsdom
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (
      typeof msg === 'string' &&
      (msg.includes('Warning:') || msg.includes('useLayoutEffect'))
    ) {
      return
    }
    console.warn(msg, ...args)
  })
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('Home Page Structure — Gherkin Scenarios', () => {
  // Scenario: Top bar displays the application title
  test('Scenario 1: "Health Playground" text is visible on the page', () => {
    render(<HomePage />)
    expect(screen.getByText('Health Playground')).toBeInTheDocument()
  })

  // Scenario: Top bar contains the dataset selector
  test('Scenario 2: element with data-testid "dataset-selector" is visible', () => {
    render(<HomePage />)
    expect(screen.getByTestId('dataset-selector')).toBeInTheDocument()
  })

  // Scenario: Page layout contains a two-column content area below the top bar
  test('Scenario 3: content-area is visible', () => {
    render(<HomePage />)
    expect(screen.getByTestId('content-area')).toBeInTheDocument()
  })

  test('Scenario 3: left-column is visible', () => {
    render(<HomePage />)
    expect(screen.getByTestId('left-column')).toBeInTheDocument()
  })

  test('Scenario 3: right-column is visible', () => {
    render(<HomePage />)
    expect(screen.getByTestId('right-column')).toBeInTheDocument()
  })

  // Scenario: Left column contains Training Overview above Weekly Dashboard
  test('Scenario 4: training-overview is visible within left-column', () => {
    render(<HomePage />)
    const leftColumn = screen.getByTestId('left-column')
    expect(within(leftColumn).getByTestId('training-overview')).toBeInTheDocument()
  })

  test('Scenario 4: weekly-dashboard is visible within left-column', () => {
    render(<HomePage />)
    const leftColumn = screen.getByTestId('left-column')
    expect(within(leftColumn).getByTestId('weekly-dashboard')).toBeInTheDocument()
  })

  test('Scenario 4: training-overview appears before weekly-dashboard in DOM order', () => {
    render(<HomePage />)
    const trainingOverview = screen.getByTestId('training-overview')
    const weeklyDashboard = screen.getByTestId('weekly-dashboard')
    // Node.DOCUMENT_POSITION_FOLLOWING means weeklyDashboard comes after trainingOverview
    const position = trainingOverview.compareDocumentPosition(weeklyDashboard)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  // Scenario: Training Overview shows placeholder content
  test('Scenario 5: "Training Overview" text is visible within training-overview element', () => {
    render(<HomePage />)
    const trainingOverview = screen.getByTestId('training-overview')
    expect(within(trainingOverview).getByText('Training Overview')).toBeInTheDocument()
  })

  // Scenario: Right column contains the Insights component
  test('Scenario 6: insights is visible within right-column', () => {
    render(<HomePage />)
    const rightColumn = screen.getByTestId('right-column')
    expect(within(rightColumn).getByTestId('insights')).toBeInTheDocument()
  })

  // Scenario: Insights component shows placeholder content
  test('Scenario 7: "Insights" text is visible within insights element', () => {
    render(<HomePage />)
    const insights = screen.getByTestId('insights')
    expect(within(insights).getByText('Insights')).toBeInTheDocument()
  })
})