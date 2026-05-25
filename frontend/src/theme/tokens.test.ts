import { themeTokens, activityTokenFor } from './tokens'

describe('theme tokens', () => {
  test('all activity-related tokens are pairwise distinct strings', () => {
    const colors = [
      themeTokens['--color-activity-long-run'],
      themeTokens['--color-activity-restorative-run'],
      themeTokens['--color-activity-intervals'],
      themeTokens['--color-activity-skipped'],
    ]
    expect(new Set(colors).size).toBe(colors.length)
  })

  test('background luminance is below 0.2 (WCAG)', () => {
    const m = themeTokens['--color-background'].match(
      /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
    )!
    const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
    const channel = (c: number) => {
      const cs = c / 255
      return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
    }
    const L = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    expect(L).toBeLessThan(0.2)
  })

  test('activityTokenFor maps each activity type to its token', () => {
    expect(activityTokenFor('long-run')).toBe(themeTokens['--color-activity-long-run'])
    expect(activityTokenFor('restorative-run')).toBe(themeTokens['--color-activity-restorative-run'])
    expect(activityTokenFor('intervals')).toBe(themeTokens['--color-activity-intervals'])
  })
})