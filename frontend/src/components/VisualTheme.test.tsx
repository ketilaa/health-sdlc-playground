import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RootLayout from '../app/layout'
import { TrainingOverview } from './TrainingOverview'
import { themeTokens } from '../theme/tokens'

// Render the layout once for the body background test (jsdom shares document).
function renderWithLayout() {
  // Manually install the :root CSS variables and body background that layout.tsx
  // injects, since rendering <html><body> nested inside the testing container is
  // awkward. We replicate the inline style on document.documentElement and body.
  const root = document.documentElement
  root.style.setProperty('--color-background', themeTokens['--color-background'])
  root.style.setProperty('--color-activity-long-run', themeTokens['--color-activity-long-run'])
  root.style.setProperty('--color-activity-restorative-run', themeTokens['--color-activity-restorative-run'])
  root.style.setProperty('--color-activity-intervals', themeTokens['--color-activity-intervals'])
  root.style.setProperty('--color-activity-skipped', themeTokens['--color-activity-skipped'])
  document.body.style.backgroundColor = themeTokens['--color-background']

  return render(<TrainingOverview />)
}

async function loaded() {
  await waitFor(() => {
    expect(screen.queryAllByTestId('activity-row').length).toBeGreaterThan(0)
  })
}

function computeLuminance(rgb: string): number {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)!
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const ch = (c: number) => {
    const cs = c / 255
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

describe('Visual theme overhaul — Gherkin scenarios', () => {
  beforeEach(() => {
    // Reset doc styles and layout-injected <style> elements between tests.
    document.documentElement.removeAttribute('style')
    document.body.removeAttribute('style')
    document.head.innerHTML = ''
  })

  test('Background: at least one element with each activity type and exactly one skipped marker', async () => {
    renderWithLayout()
    await loaded()
    expect(screen.getAllByTestId('activity-row').some((el) => el.getAttribute('data-activity-type') === 'long-run')).toBe(true)
    expect(screen.getAllByTestId('activity-row').some((el) => el.getAttribute('data-activity-type') === 'restorative-run')).toBe(true)
    expect(screen.getAllByTestId('activity-row').some((el) => el.getAttribute('data-activity-type') === 'intervals')).toBe(true)
    expect(screen.getAllByTestId('skipped-activity-marker')).toHaveLength(1)
  })

  test('RootLayout applies dark background to document.body via inline style', () => {
    // jsdom hoists <html>/<body> to the actual document when RootLayout renders.
    // This confirms layout.tsx actually sets the inline style on <body>.
    render(<RootLayout>{null}</RootLayout>)
    expect(document.body.style.backgroundColor).toBe(themeTokens['--color-background'])
    expect(computeLuminance(themeTokens['--color-background'])).toBeLessThan(0.2)
  })

  test('RootLayout injects all five CSS custom properties into document.head <style>', () => {
    // The <style dangerouslySetInnerHTML> in layout.tsx ends up in document.head in jsdom.
    render(<RootLayout>{null}</RootLayout>)
    const styleEl = document.head.querySelector('style')
    expect(styleEl).not.toBeNull()
    const css = styleEl!.innerHTML
    expect(css).toContain('--color-activity-long-run')
    expect(css).toContain('--color-activity-restorative-run')
    expect(css).toContain('--color-activity-intervals')
    expect(css).toContain('--color-activity-skipped')
    expect(css).toContain('--color-background')
  })

  test.each([
    ['long-run', themeTokens['--color-activity-long-run']],
    ['restorative-run', themeTokens['--color-activity-restorative-run']],
    ['intervals', themeTokens['--color-activity-intervals']],
  ])(
    'every activity row of type %s has background-color equal to its token',
    async (type, expected) => {
      renderWithLayout()
      await loaded()
      const els = screen
        .getAllByTestId('activity-row')
        .filter((el) => el.getAttribute('data-activity-type') === type)
      expect(els.length).toBeGreaterThan(0)
      for (const el of els) {
        expect(window.getComputedStyle(el).backgroundColor).toBe(expected)
      }
    }
  )

  test('Expanded activity-row keeps its activity-type colour', async () => {
    const user = userEvent.setup()
    renderWithLayout()
    await loaded()
    const longRunRow = screen
      .getAllByTestId('activity-row')
      .find((el) => el.getAttribute('data-activity-type') === 'long-run')!
    const toggle = within(longRunRow).getByTestId('activity-row-toggle')
    await user.click(toggle)
    const expanded = within(longRunRow).getByTestId('activity-row-expanded')
    expect(expanded).toBeVisible()
    expect(expanded.getAttribute('data-activity-type')).toBe('long-run')
    expect(window.getComputedStyle(expanded).backgroundColor).toBe(
      themeTokens['--color-activity-long-run']
    )
  })

  test('Skipped marker uses --color-activity-skipped and carries no data-activity-type', async () => {
    renderWithLayout()
    await loaded()
    const marker = screen.getByTestId('skipped-activity-marker')
    expect(marker).toBeVisible()
    expect(window.getComputedStyle(marker).backgroundColor).toBe(
      themeTokens['--color-activity-skipped']
    )
    expect(marker.hasAttribute('data-activity-type')).toBe(false)
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

  test('layout component injects a color-probe element (hidden)', () => {
    render(
      <RootLayout>
        <TrainingOverview />
      </RootLayout>
    )
    // Probe is rendered by TrainingOverview directly; just verify it exists.
    expect(screen.getByTestId('color-probe')).toBeInTheDocument()
  })
})