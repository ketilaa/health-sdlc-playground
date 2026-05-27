'use client'

import React, { useState } from 'react'
import { fixtureDataset, Week } from '../data/datasets'

type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'none'

interface TrendResult {
  direction: TrendDirection
  arrow: string
  label: string
}

function computeTrend(current: number, previous: number | undefined): TrendResult {
  if (previous === undefined || previous === 0) {
    return { direction: 'none', arrow: '—', label: '' }
  }
  const change = (current - previous) / previous
  if (change > 0.02) {
    return { direction: 'increasing', arrow: '↑', label: 'Increasing' }
  }
  if (change < -0.02) {
    return { direction: 'decreasing', arrow: '↓', label: 'Decreasing' }
  }
  return { direction: 'stable', arrow: '→', label: 'Stable' }
}

function activityTypeAttr(type: string): string {
  return type
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
}

interface TrendIndicatorProps {
  testId: string
  trend: TrendResult
  ariaLabel: string
}

function TrendIndicator({ testId, trend, ariaLabel }: TrendIndicatorProps) {
  return (
    <div
      data-testid={testId}
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.75rem',
      }}
    >
      <span aria-hidden="true">{trend.arrow}</span>
      {trend.label && (
        <>
          {' '}
          <span>{trend.label}</span>
        </>
      )}
    </div>
  )
}

interface WeekRowProps {
  week: Week
  previousWeek: Week | undefined
  isExpanded: boolean
  onToggle: () => void
}

function WeekRowItem({ week, previousWeek, isExpanded, onToggle }: WeekRowProps) {
  const vo2maxTrend = computeTrend(week.vo2max, previousWeek?.vo2max)
  const restingHrTrend = computeTrend(week.restingHrAvg, previousWeek?.restingHrAvg)

  const vo2maxAriaLabel =
    vo2maxTrend.direction === 'none'
      ? 'VO2max trend: No comparison available'
      : `VO2max trend: ${vo2maxTrend.label}`

  const restingHrAriaLabel =
    restingHrTrend.direction === 'none'
      ? 'Resting HR trend: No comparison available'
      : `Resting HR trend: ${restingHrTrend.label}`

  return (
    <div data-testid="week-row" className="week-row">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`week-activities-${week.weekNumber}`}
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '16px 0',
          cursor: 'pointer',
          fontSize: 16,
          textAlign: 'left',
          color: 'inherit',
        }}
      >
        <span style={{ fontWeight: 600, minWidth: 80 }}>{week.label}</span>
        {week.skipped && (
          <span style={{ color: '#888', fontStyle: 'italic' }}>
            {week.skipped.reason}
          </span>
        )}

        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            marginLeft: 'auto',
          }}
        >
          <TrendIndicator
            testId="week-vo2max-trend"
            trend={vo2maxTrend}
            ariaLabel={vo2maxAriaLabel}
          />
          <TrendIndicator
            testId="week-resting-hr-trend"
            trend={restingHrTrend}
            ariaLabel={restingHrAriaLabel}
          />
        </div>
      </button>

      {isExpanded && (
        <div
          data-testid="week-activities"
          id={`week-activities-${week.weekNumber}`}
          role="region"
          aria-label={`Activities for ${week.label}`}
        >
          {week.skipped ? (
            <div
              data-testid="skipped-activity"
              data-activity-type="skipped"
              style={{
                padding: '8px 0 8px 80px',
                fontStyle: 'italic',
                color: '#888',
                borderTop: '1px dashed #ccc',
              }}
            >
              {week.skipped.reason}
            </div>
          ) : (
            week.activities.map((activity) => (
              <div
                key={activity.id}
                data-testid="activity-row"
                data-activity-type={activityTypeAttr(activity.type)}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '8px 0 8px 80px',
                  fontSize: 14,
                }}
              >
                <span>{activity.name}</span>
                {activity.distanceKm != null && (
                  <span>{activity.distanceKm.toFixed(1)} km</span>
                )}
                {activity.durationMin != null && (
                  <span>{activity.durationMin} min</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function RunnerDashboard() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
  const weeks = fixtureDataset.weeks

  function toggleWeek(weekNumber: number) {
    setExpandedWeek((prev) => (prev === weekNumber ? null : weekNumber))
  }

  return (
    <div data-testid="runner-dashboard">
      <div className="week-list">
        {weeks.map((week, index) => {
          const previousWeek = index > 0 ? weeks[index - 1] : undefined
          return (
            <WeekRowItem
              key={week.weekNumber}
              week={week}
              previousWeek={previousWeek}
              isExpanded={expandedWeek === week.weekNumber}
              onToggle={() => toggleWeek(week.weekNumber)}
            />
          )
        })}
      </div>
    </div>
  )
}