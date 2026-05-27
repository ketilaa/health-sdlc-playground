import React from 'react'
import AppThemeProvider from '../components/AppThemeProvider'
import { themeTokens } from '../theme/tokens'

export const metadata = {
  title: 'Health Playground',
  description: 'Health Playground — Training Overview and Insights',
}

// Injected server-side to prevent background flash before client JS hydrates.
const rootCss = `
:root {
  --color-background: ${themeTokens['--color-background']};
  --color-surface: ${themeTokens['--color-surface']};
  --color-activity-long-run: ${themeTokens['--color-activity-long-run']};
  --color-activity-restorative-run: ${themeTokens['--color-activity-restorative-run']};
  --color-activity-intervals: ${themeTokens['--color-activity-intervals']};
  --color-activity-skipped: ${themeTokens['--color-activity-skipped']};
  --color-metric-vo2max: ${themeTokens['--color-metric-vo2max']};
  --color-metric-hr: ${themeTokens['--color-metric-hr']};
  --color-trend-up: ${themeTokens['--color-trend-up']};
  --color-trend-down: ${themeTokens['--color-trend-down']};
  --color-trend-stable: ${themeTokens['--color-trend-stable']};
}
[data-activity-type="long_run"] { background-color: var(--color-activity-long-run); }
[data-activity-type="restorative_run"] { background-color: var(--color-activity-restorative-run); }
[data-activity-type="intervals"] { background-color: var(--color-activity-intervals); }
[data-activity-type="skipped"] { background-color: var(--color-activity-skipped); }
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: rootCss }} />
      </head>
      <body style={{ margin: 0, backgroundColor: themeTokens['--color-background'] }}>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </body>
    </html>
  )
}