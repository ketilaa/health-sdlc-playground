import React from 'react'
import { themeTokens } from '../theme/tokens'

export const metadata = {
  title: 'Weekly Dashboard',
  description: 'Weekly Training Dashboard',
}

const rootCss = `
:root {
  --color-background: ${themeTokens['--color-background']};
  --color-activity-long-run: ${themeTokens['--color-activity-long-run']};
  --color-activity-restorative-run: ${themeTokens['--color-activity-restorative-run']};
  --color-activity-intervals: ${themeTokens['--color-activity-intervals']};
  --color-activity-skipped: ${themeTokens['--color-activity-skipped']};
}
html, body { margin: 0; padding: 0; }
body {
  background-color: ${themeTokens['--color-background']};
  color: rgb(255, 255, 255);
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: rootCss }} />
      </head>
      <body
        style={{
          margin: 0,
          backgroundColor: themeTokens['--color-background'],
          color: 'rgb(255, 255, 255)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}