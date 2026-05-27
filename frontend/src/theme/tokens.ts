export const themeTokens: Record<string, string> = {
  '--color-background': 'rgb(18, 20, 24)',
  '--color-surface': 'rgb(28, 30, 36)',
  '--color-activity-long-run': 'rgb(56, 132, 196)',
  '--color-activity-restorative-run': 'rgb(94, 164, 122)',
  '--color-activity-intervals': 'rgb(224, 138, 64)',
  '--color-activity-skipped': 'rgb(120, 124, 132)',
  '--color-metric-vo2max': 'rgb(74, 144, 226)',
  '--color-metric-hr': 'rgb(229, 115, 115)',
  '--color-trend-up': 'rgb(102, 187, 106)',
  '--color-trend-down': 'rgb(239, 83, 80)',
  '--color-trend-stable': 'rgb(158, 158, 158)',
}

/**
 * Maps an activity type attribute value (snake_case, as used in data-activity-type)
 * to its resolved color value from themeTokens.
 */
export function activityTokenFor(activityType: string): string {
  const key = `--color-activity-${activityType.replace(/_/g, '-')}`
  return themeTokens[key] ?? ''
}