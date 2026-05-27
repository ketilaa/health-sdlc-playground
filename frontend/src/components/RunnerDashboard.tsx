'use client'

import React, { useState } from 'react'
import { fixtureDataset, Week } from '../data/datasets'

type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'none'

interface TrendResult {
  direction: TrendDirection
}

function computeTrend(current: number, previous: number | undefined): TrendResult {
  if (previous === undefined || previous === 0) {
    return { direction: 'none' }
  }
  const change = (current - previous) / previous
  if (change > 0.02) return { direction: 'increasing' }
  if (change < -0.02) return { direction: 'decreasing' }
  return { direction: 'stable' }
}

function activityTypeAttr(type: string): string {
  return type.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
}

function buildVo2maxAriaLabel(trend: TrendResult, hasPriorWeek: boolean): string {
  if (!hasPriorWeek) return 'VO2max trend: no data'
  switch (trend.direction) {
    case 'increasing': return 'VO2max trend: increasing'
    case 'decreasing': return 'VO2max trend: decreasing'
    case 'stable':     return 'VO2max trend: stable'
    default:           return 'VO2max trend: no data'
  }
}

function buildHrAriaLabel(trend: TrendResult, hasPriorWeek: boolean): string {
  if (!hasPriorWeek) return 'Resting HR trend: no data'
  switch (trend.direction) {
    case 'increasing': return 'Resting HR trend: increasing'
    case 'decreasing': return 'Resting HR trend: decreasing'
    case 'stable':     return 'Resting HR trend: stable'
    default:           return 'Resting HR trend: no data'
  }
}

// VO2max metric icon — running figure (DirectionsRun-style)
function Vo2maxMetricIcon() {
  return (
    <svg
      data-testid="week-vo2max-metric-icon"
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: 'var(--color-metric-vo2max)', fill: 'currentColor', flexShrink: 0 }}
    >
      <circle cx="13.5" cy="5.5" r="1.5" />
      <path d="M9 16.1 5 17l.8-4 2.2 2.1zM14.7 13H11l-2.4-4.3C8.3 8 7.6 7.4 6.7 7.1c-.9-.3-1.8-.1-2.5.4L2 9l1.2 1.8 2.3-1.5.7 1.3L3 12.7l3.6 3.5-1.5 5.7 2 .5 1.7-6.5L7 14.2 9.1 11H13l3.3 4.7 3.7 1V15l-3.1-.7L14.7 13z" />
    </svg>
  )
}

// HR metric icon — heart shape (Favorite-style)
function HrMetricIcon() {
  return (
    <svg
      data-testid="week-resting-hr-metric-icon"
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: 'var(--color-metric-hr)', fill: 'currentColor', flexShrink: 0 }}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function ArrowUpSvg() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ fill: 'currentColor', flexShrink: 0 }}
    >
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
    </svg>
  )
}

function ArrowDownSvg() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ fill: 'currentColor', flexShrink: 0 }}
    >
      <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
    </svg>
  )
}

function ArrowRightSvg() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ fill: 'currentColor', flexShrink: 0 }}
    >
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.58L12 20l8-8-8-8z" />
    </svg>
  )
}

interface TrendDirectionIconProps {
  testId: string
  direction: TrendDirection
  isHr: boolean
}

function TrendDirectionIcon({ testId, direction, isHr }: TrendDirectionIconProps) {
  // Color semantics:
  // VO2max: increasing=trend-up(green), decreasing=trend-down(red), stable=trend-stable
  // HR (inverted): decreasing=trend-up(green, lower HR=good), increasing=trend-down(red)
  let colorVar: string
  let ArrowSvg: () => React.JSX.Element

  if (direction === 'stable') {
    colorVar = 'var(--color-trend-stable)'
    ArrowSvg = ArrowRightSvg
  } else if (direction === 'increasing') {
    colorVar = isHr ? 'var(--color-trend-down)' : 'var(--color-trend-up)'
    ArrowSvg = ArrowUpSvg
  } else {
    // decreasing
    colorVar = isHr ? 'var(--color-trend-up)' : 'var(--color-trend-down)'
    ArrowSvg = ArrowDownSvg
  }

  return (
    <span
      data-testid={testId}
      style={{ color: colorVar, display: 'inline-flex', alignItems: 'center' }}
    >
      <ArrowSvg />
    </span>
  )
}

interface TrendContainerProps {
  testId: string
  ariaLabel: string
  metricIcon: React.ReactNode
  trendIconTestId: string
  trend: TrendResult
  hasPriorWeek: boolean
  isHr: boolean
}

function TrendContainer({
  testId,
  ariaLabel,
  metricIcon,
  trendIconTestId,
  trend,
  hasPriorWeek,
  isHr,
}: TrendContainerProps) {
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
      }}
    >
      {metricIcon}
      {hasPriorWeek && trend.direction !== 'none' && (
        <TrendDirectionIcon
          testId={trendIconTestId}
          direction={trend.direction}
          isHr={isHr}
        />
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
  const hasPriorWeek = previousWeek !== undefined
  const vo2maxTrend = computeTrend(week.vo2max, previousWeek?.vo2max)
  const restingHrTrend = computeTrend(week.restingHrAvg, previousWeek?.restingHrAvg)

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
          <TrendContainer
            testId="week-vo2max-trend"
            ariaLabel={buildVo2maxAriaLabel(vo2maxTrend, hasPriorWeek)}
            metricIcon={<Vo2maxMetricIcon />}
            trendIconTestId="week-vo2max-trend-icon"
            trend={vo2maxTrend}
            hasPriorWeek={hasPriorWeek}
            isHr={false}
          />
          <TrendContainer
            testId="week-resting-hr-trend"
            ariaLabel={buildHrAriaLabel(restingHrTrend, hasPriorWeek)}
            metricIcon={<HrMetricIcon />}
            trendIconTestId="week-resting-hr-trend-icon"
            trend={restingHrTrend}
            hasPriorWeek={hasPriorWeek}
            isHr={true}
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