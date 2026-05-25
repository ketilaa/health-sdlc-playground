'use client'

import React from 'react'

// Persistent hidden DOM element for tests to resolve --token values via
// getComputedStyle. Intentionally NOT "visible" (zero size, off-flow).
export default function ColorProbe() {
  return (
    <div
      data-testid="color-probe"
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  )
}