import React from 'react'

interface Props {
  reason: string
}

export function SkippedActivity({ reason }: Props) {
  return (
    <div
      data-testid="skipped-activity"
      role="note"
      aria-label={`Skipped activity: ${reason}`}
      style={{
        padding: '0.5rem 1rem',
        border: '1px dashed #aaa',
        opacity: 0.7,
        display: 'flex',
        gap: '0.5rem',
      }}
    >
      <span aria-hidden="true">⊘</span>
      <span>{reason}</span>
    </div>
  )
}