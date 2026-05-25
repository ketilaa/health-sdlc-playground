import React from 'react'
import type { Activity } from '@/data/datasets'
import { formatDistance, formatDuration } from '@/lib/format'

interface Props {
  activity: Activity
}

export function ActivityRow({ activity }: Props) {
  return (
    <div data-testid="activity-row" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1rem' }}>
      <span data-testid="activity-date" style={{ color: '#666' }}>{activity.date}</span>
      <span data-testid="activity-type" style={{ fontWeight: 600 }}>{activity.type}</span>
      <span data-testid="activity-distance">{formatDistance(activity.distanceKm)}</span>
      <span data-testid="activity-duration">{formatDuration(activity.durationMinutes)}</span>
    </div>
  )
}