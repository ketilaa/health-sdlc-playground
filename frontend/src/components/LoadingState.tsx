import React from 'react'

export function LoadingState() {
  return (
    <div
      data-testid="dataset-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{ padding: '1rem' }}
    >
      <span style={{ position: 'absolute', left: '-9999px' }}>Loading training data</span>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            height: '3rem',
            margin: '0.5rem 0',
            background: 'linear-gradient(90deg, #eee, #f5f5f5, #eee)',
            borderRadius: '4px',
          }}
        />
      ))}
    </div>
  )
}