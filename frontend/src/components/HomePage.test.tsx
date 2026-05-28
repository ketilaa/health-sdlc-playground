import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from './HomePage'

// Mock next/navigation (useRouter) for all tests
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

beforeEach(() => {
  mockPush.mockClear()
})

// ============================================================
// top-bar-navigation-menu — 4 Gherkin scenarios
// ============================================================

describe('Top Bar Navigation Menu — Gherkin Scenarios', () => {
  // Scenario 1: Navigation menu is not visible before the trigger is activated
  test('Scenario 1: nav-menu is not in the DOM before trigger is clicked', () => {
    render(<HomePage />)
    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
  })

  // Scenario 2: Clicking the navigation menu trigger opens the menu
  test('Scenario 2: clicking nav-menu-trigger makes nav-menu visible', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    const trigger = screen.getByTestId('nav-menu-trigger')
    await user.click(trigger)
    expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
  })

  // Scenario 3: The open navigation menu contains a "Home" item
  test('Scenario 3: after opening menu, nav-menu-item-home is visible and contains "Home"', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
    const homeItem = screen.getByTestId('nav-menu-item-home')
    expect(homeItem).toBeInTheDocument()
    expect(homeItem).toHaveTextContent('Home')
  })

  // Scenario 4: Selecting "Home" from the navigation menu navigates to the root page
  test('Scenario 4: clicking Home item closes menu, navigates to root, and content-area is visible', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    // Open the menu
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
    // Click Home
    await user.click(screen.getByTestId('nav-menu-item-home'))
    // Menu closes after navigation (UX spec Section 4.4)
    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
    // Navigation was triggered
    expect(mockPush).toHaveBeenCalledWith('/')
    // content-area is still in the DOM (same page component)
    expect(screen.getByTestId('content-area')).toBeInTheDocument()
  })
})

// ============================================================
// Additional nav menu behavior tests
// ============================================================

describe('Top Bar Navigation Menu — additional behavior', () => {
  test('nav-menu-trigger is always visible (before and after menu open)', async () => {
    render(<HomePage />)
    expect(screen.getByTestId('nav-menu-trigger')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu-trigger')).toBeInTheDocument()
  })

  test('nav-menu-trigger has aria-expanded="false" initially', () => {
    render(<HomePage />)
    expect(screen.getByTestId('nav-menu-trigger')).toHaveAttribute('aria-expanded', 'false')
  })

  test('nav-menu-trigger has aria-expanded="true" when menu is open', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu-trigger')).toHaveAttribute('aria-expanded', 'true')
  })

  test('nav-menu-trigger has aria-controls="nav-menu"', () => {
    render(<HomePage />)
    expect(screen.getByTestId('nav-menu-trigger')).toHaveAttribute('aria-controls', 'nav-menu')
  })

  test('nav-menu-trigger has aria-label "Open navigation menu" when closed', () => {
    render(<HomePage />)
    expect(screen.getByTestId('nav-menu-trigger')).toHaveAttribute('aria-label', 'Open navigation menu')
  })

  test('nav-menu-trigger has aria-label "Close navigation menu" when open', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu-trigger')).toHaveAttribute('aria-label', 'Close navigation menu')
  })

  test('nav-menu has role="menu"', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu')).toHaveAttribute('role', 'menu')
  })

  test('nav-menu has id="nav-menu" (matches aria-controls on trigger)', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu')).toHaveAttribute('id', 'nav-menu')
  })

  test('nav-menu-item-home has role="menuitem"', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu-item-home')).toHaveAttribute('role', 'menuitem')
  })

  test('clicking trigger again closes the menu (toggle behavior)', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
  })

  // ---- Auto-focus on open (UX spec: first item receives focus) ----

  test('first menu item receives focus automatically when menu opens', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu-item-home')).toHaveFocus()
  })

  // ---- Arrow-key navigation (UX spec Section 9) ----
  // Events fired on the focused menu item (which bubbles to the menu container handler)

  test('ArrowDown on focused menu item keeps focus on the Home item (single item stays on same)', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    const homeItem = screen.getByTestId('nav-menu-item-home')
    // Item is auto-focused; fire ArrowDown on the focused item (bubbles to menu container)
    homeItem.focus()
    fireEvent.keyDown(homeItem, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(homeItem).toHaveFocus()
  })

  test('ArrowUp on focused menu item keeps focus on the Home item (single item stays on same)', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    const homeItem = screen.getByTestId('nav-menu-item-home')
    homeItem.focus()
    fireEvent.keyDown(homeItem, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(homeItem).toHaveFocus()
  })

  // ---- Tab key behavior (UX spec Section 9) ----

  test('Tab key on the focused menu item closes the menu', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
    const homeItem = screen.getByTestId('nav-menu-item-home')
    homeItem.focus()
    fireEvent.keyDown(homeItem, { key: 'Tab', code: 'Tab' })
    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
  })

  // ---- Escape key behavior ----

  test('Escape key closes the menu and returns focus to trigger', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    expect(screen.getByTestId('nav-menu')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
    expect(screen.getByTestId('nav-menu-trigger')).toHaveFocus()
  })

  // ---- Enter/Space activates the Home item ----

  test('pressing Enter on nav-menu-item-home triggers navigation to "/" and closes menu', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    const homeItem = screen.getByTestId('nav-menu-item-home')
    homeItem.focus()
    await user.keyboard('{Enter}')
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
  })

  test('pressing Space on nav-menu-item-home triggers navigation to "/" and closes menu', async () => {
    const user = userEvent.setup()
    render(<HomePage />)
    await user.click(screen.getByTestId('nav-menu-trigger'))
    const homeItem = screen.getByTestId('nav-menu-item-home')
    homeItem.focus()
    await user.keyboard('{ }')
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument()
  })
})

// ============================================================
// Home Page Structure — prior Gherkin scenarios (preserved)
// ============================================================

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