import React from 'react'

export default function TopBar() {
  return (
    <header
      data-testid="top-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #eee',
        background: '#fff',
      }}
    >
      <h1 style={{ fontSize: 18, margin: 0 }}>Health Playground</h1>
      <div
        data-testid="dataset-selector-placeholder"
        tabIndex={-1}
        aria-label="Dataset selector placeholder, not yet available"
        style={{
          color: '#999',
          fontSize: 14,
          padding: '6px 10px',
          border: '1px dashed #ddd',
          borderRadius: 4,
        }}
      >
        Dataset selector (coming soon)
      </div>
    </header>
  )
}