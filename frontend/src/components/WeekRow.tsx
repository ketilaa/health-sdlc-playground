import React, { useState } from 'react'
import type { Week } from '@/data/datasets'
import { formatDistance, formatDuration, totalDistance, totalDuration } from '@/lib/format'
import { ActivityRow } from './ActivityRow'
import { SkippedActivity } from './SkippedActivity'

interface Props {
  week: Week
}

export function WeekRow({ week }: Props) {
  const [expanded, setExpanded] = useState(false)
  const distances = week.activities.map((a) => a.distanceKm)
  const durations = week.activities.map((a) => a.durationMinutes)
  const dist = totalDistance(distances)
  const dur = totalDuration(durations)
  const count = week.activities.length
  const panelId = `week-${week.weekNumber}-activities`

  return (
    <div data-testid="week-row" style={{ borderBottom: '1px solid #eee' }}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          padding: '1rem',
          cursor: 'pointer',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 700, minWidth: '5rem' }}>Week {week.weekNumber}</span>
        <span aria-hidden="true" style={{ flex: 1 }}>
          <span
            style={{
              display: 'inline-block',
              height: '8px',
              width: `${Math.min(100, dist * 4)}%`,
              background: week.skipped ? '#bbb' : '#3b82f6',
              borderRadius: '4px',
            }}
          />
        </span>
        <span data-testid="week-total-distance">{formatDistance(dist)}</span>
        <span data-testid="week-total-duration">{formatDuration(dur)}</span>
        <span data-testid="week-activity-count">{count} activities</span>
        {week.skipped && <span aria-label="sickness week" title="sickness">🩺</span>}
        <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded && (
        <div
          id={panelId}
          data-testid="week-activities"
          role="region"
          aria-label={`Activities for Week ${week.weekNumber}`}
          style={{ paddingLeft: '2rem', paddingBottom: '1rem' }}
        >
          {week.activities.map((a) => (
            <ActivityRow key={a.id} activity={a} />
          ))}
          {week.skipped && <SkippedActivity reason={week.skipped.reason} />}
        </div>
      )}
    </div>
  )
}