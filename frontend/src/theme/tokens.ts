// Theme tokens — canonical rgb(...) strings so getComputedStyle returns them verbatim.
export const themeTokens = {
  '--color-background': 'rgb(18, 20, 24)',
  '--color-activity-long-run': 'rgb(56, 132, 196)',
  '--color-activity-restorative-run': 'rgb(94, 164, 122)',
  '--color-activity-intervals': 'rgb(224, 138, 64)',
  '--color-activity-skipped': 'rgb(120, 124, 132)',
} as const

export type ThemeTokenName = keyof typeof themeTokens

export function activityTokenFor(
  type: 'long-run' | 'restorative-run' | 'intervals'
): string {
  switch (type) {
    case 'long-run':
      return themeTokens['--color-activity-long-run']
    case 'restorative-run':
      return themeTokens['--color-activity-restorative-run']
    case 'intervals':
      return themeTokens['--color-activity-intervals']
  }
}