import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { WeeklyDashboard } from './WeeklyDashboard'
import { themeTokens } from '../theme/tokens'

function computeLuminance(rgb: string): number {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)!
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const ch = (c: number) => {
    const cs = c / 255
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

describe('Visual theme — layout tokens and Weekly Dashboard', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    document.body.removeAttribute('style')
    document.head.innerHTML = ''
  })

  // Layout token tests: verify themeTokens values directly rather than
  // rendering RootLayout (which emits <html> and causes jsdom nesting errors
  // with React 19). The layout.test.tsx file covers children pass-through.
  test('background token has low luminance (dark background)', () => {
    expect(computeLuminance(themeTokens['--color-background'])).toBeLessThan(0.2)
  })

  test('themeTokens contains all five required CSS custom property keys', () => {
    expect(themeTokens).toHaveProperty('--color-background')
    expect(themeTokens).toHaveProperty('--color-activity-long-run')
    expect(themeTokens).toHaveProperty('--color-activity-restorative-run')
    expect(themeTokens).toHaveProperty('--color-activity-intervals')
    expect(themeTokens).toHaveProperty('--color-activity-skipped')
  })

  test('All four activity-related tokens are pairwise unequal (canonical form)', () => {
    const values = [
      themeTokens['--color-activity-long-run'],
      themeTokens['--color-activity-restorative-run'],
      themeTokens['--color-activity-intervals'],
      themeTokens['--color-activity-skipped'],
    ]
    expect(new Set(values).size).toBe(4)
  })

  test('WeeklyDashboard renders with data-testid="weekly-dashboard-container"', () => {
    render(<WeeklyDashboard />)
    expect(screen.getByTestId('weekly-dashboard-container')).toBeInTheDocument()
  })

  test('WeeklyDashboard renders H1 "Weekly Dashboard"', () => {
    render(<WeeklyDashboard />)
    expect(
      screen.getByRole('heading', { level: 1, name: /weekly dashboard/i })
    ).toBeInTheDocument()
  })

  test('WeeklyDashboard does not render training-overview testid', () => {
    render(<WeeklyDashboard />)
    expect(screen.queryByTestId('training-overview')).not.toBeInTheDocument()
  })
})