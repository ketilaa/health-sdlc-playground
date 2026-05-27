'use client'

import React, { useState } from 'react'
import { fixtureDataset, Week } from '../data/datasets'
import { themeTokens } from '../theme/tokens'

type TrendDirection = 'increasing' | 'decreasing' | 'stable'

// ─── Trend computation ────────────────────────────────────────────────────────

function computeTrend(current: number, previous: number): TrendDirection {
  const change = (current - previous) / previous
  if (change > 0.02) return 'increasing'
  if (change < -0.02) return 'decreasing'
  return 'stable'
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

// VO2max metric icon — running figure (activity)
function Vo2maxMetricIcon({ color }: { color: string }) {
  return (
    <svg
      data-testid="week-vo2max-metric-icon"
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Running figure */}
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
    </svg>
  )
}

// Resting HR metric icon — heart
function HrMetricIcon({ color }: { color: string }) {
  return (
    <svg
      data-testid="week-resting-hr-metric-icon"
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart shape */}
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

// Trend direction icon — arrow up, down, or right
function TrendDirectionIcon({
  direction,
  color,
  testId,
}: {
  direction: TrendDirection
  color: string
  testId: string
}) {
  // Up arrow path
  const upPath = 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z'
  // Down arrow path
  const downPath = 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z'
  // Right arrow path
  const rightPath = 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z'

  const pathData =
    direction === 'increasing' ? upPath : direction === 'decreasing' ? downPath : rightPath

  return (
    <svg
      data-testid={testId}
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={pathData} />
    </svg>
  )
}

// ─── Trend color resolution ───────────────────────────────────────────────────

function getTrendColor(direction: TrendDirection, isImprovedWhenLower: boolean): string {
  if (direction === 'stable') return themeTokens['--color-trend-stable']
  const isImprovement =
    (direction === 'increasing' && !isImprovedWhenLower) ||
    (direction === 'decreasing' && isImprovedWhenLower)
  return isImprovement ? themeTokens['--color-trend-up'] : themeTokens['--color-trend-down']
}

// ─── Trend Indicator Component ────────────────────────────────────────────────

interface TrendIndicatorProps {
  label: 'vo2max' | 'resting-hr'
  current: number
  previous: number | null
}

function TrendIndicator({ label, current, previous }: TrendIndicatorProps) {
  const isHr = label === 'resting-hr'
  const isImprovedWhenLower = isHr

  const metricColor = isHr
    ? themeTokens['--color-metric-hr']
    : themeTokens['--color-metric-vo2max']

  const hasPriorWeek = previous !== null
  const direction: TrendDirection | null = hasPriorWeek
    ? computeTrend(current, previous!)
    : null

  const trendColor =
    direction !== null ? getTrendColor(direction, isImprovedWhenLower) : metricColor

  // aria-label: exact strings per Gherkin
  let ariaState: string
  if (!hasPriorWeek) {
    ariaState = 'no data'
  } else {
    ariaState = direction!
  }

  const metricName = isHr ? 'Resting HR' : 'VO2max'
  const ariaLabel = `${metricName} trend: ${ariaState}`

  const containerTestId = isHr ? 'week-resting-hr-trend' : 'week-vo2max-trend'
  const trendIconTestId = isHr ? 'week-resting-hr-trend-icon' : 'week-vo2max-trend-icon'

  return (
    <div
      data-testid={containerTestId}
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
      }}
    >
      {isHr ? (
        <HrMetricIcon color={metricColor} />
      ) : (
        <Vo2maxMetricIcon color={metricColor} />
      )}
      {hasPriorWeek && direction !== null && (
        <TrendDirectionIcon
          direction={direction}
          color={trendColor}
          testId={trendIconTestId}
        />
      )}
    </div>
  )
}

// ─── Activity type → CSS attribute ───────────────────────────────────────────

function activityTypeAttr(type: string): string {
  return type.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
}

// ─── RunnerDashboard ──────────────────────────────────────────────────────────

export default function RunnerDashboard() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

  const weeks = fixtureDataset.weeks

  function toggleWeek(weekNumber: number) {
    setExpandedWeek((prev) => (prev === weekNumber ? null : weekNumber))
  }

  return (
    <div data-testid="runner-dashboard">
      {weeks.map((week, index) => {
        const previousWeek = index > 0 ? weeks[index - 1] : null
        const isExpanded = expandedWeek === week.weekNumber

        return (
          <div key={week.weekNumber} data-testid="week-row">
            <button
              onClick={() => toggleWeek(week.weekNumber)}
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '12px 0',
                cursor: 'pointer',
                fontSize: 16,
                textAlign: 'left',
              }}
              aria-expanded={isExpanded}
            >
              <span style={{ fontWeight: 600, minWidth: 80 }}>{week.label}</span>
              <span style={{ flex: 1 }} />
              <TrendIndicator
                label="vo2max"
                current={week.vo2max}
                previous={previousWeek ? previousWeek.vo2max : null}
              />
              <TrendIndicator
                label="resting-hr"
                current={week.restingHrAvg}
                previous={previousWeek ? previousWeek.restingHrAvg : null}
              />
              <span>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div
                data-testid="week-activities"
                role="region"
                aria-label={`${week.label} activities`}
              >
                {week.skipped ? (
                  <div data-testid="skipped-activity" data-activity-type="skipped">
                    Week skipped —{' '}
                    {week.skipped.reason}
                  </div>
                ) : (
                  week.activities.map((activity, i) => (
                    <div
                      key={i}
                      data-testid="activity-row"
                      data-activity-type={activityTypeAttr(activity.type)}
                      style={{ display: 'flex', gap: 16, padding: '8px 0' }}
                    >
                      <span>{activity.type}</span>
                      {activity.distanceKm !== undefined && (
                        <span>{activity.distanceKm} km</span>
                      )}
                      {activity.durationMin !== undefined && (
                        <span>{activity.durationMin} min</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}