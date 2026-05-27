'use client'

import React, { useState } from 'react'
import { fixtureDataset } from '../data/datasets'
import { themeTokens } from '../theme/tokens'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Activity {
  type: string
  distanceKm?: number
  durationMin?: number
  notes?: string
}

interface WeekData {
  weekNumber: number
  label: string
  totalDistanceKm: number
  activities: Activity[]
  skipped?: boolean
  vo2max: number
  restingHrAvg: number
}

type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'none'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeTrend(current: number, previous: number): TrendDirection {
  const delta = (current - previous) / previous
  if (delta > 0.02) return 'increasing'
  if (delta < -0.02) return 'decreasing'
  return 'stable'
}

function activityTypeAttr(type: string): string {
  return type.toLowerCase().replace(/\s+/g, '_')
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

/** VO2max metric icon — running figure silhouette */
function Vo2maxMetricIcon({ color }: { color: string }) {
  return (
    <svg
      data-testid="week-vo2max-metric-icon"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
    </svg>
  )
}

/** Resting HR metric icon — heart shape */
function HrMetricIcon({ color }: { color: string }) {
  return (
    <svg
      data-testid="week-resting-hr-metric-icon"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

/** Upward arrow trend icon */
function ArrowUpIcon({ color, testId }: { color: string; testId: string }) {
  return (
    <svg
      data-testid={testId}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
    </svg>
  )
}

/** Downward arrow trend icon */
function ArrowDownIcon({ color, testId }: { color: string; testId: string }) {
  return (
    <svg
      data-testid={testId}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
    </svg>
  )
}

/** Rightward arrow trend icon */
function ArrowRightIcon({ color, testId }: { color: string; testId: string }) {
  return (
    <svg
      data-testid={testId}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.58L12 20l8-8z" />
    </svg>
  )
}

// ─── Trend icon selector ──────────────────────────────────────────────────────

function TrendDirectionIcon({
  trend,
  testId,
}: {
  trend: TrendDirection
  testId: string
}) {
  const upColor = themeTokens['--color-trend-up']
  const downColor = themeTokens['--color-trend-down']
  const stableColor = themeTokens['--color-trend-stable']

  if (trend === 'increasing') {
    return <ArrowUpIcon color={upColor} testId={testId} />
  }
  if (trend === 'decreasing') {
    return <ArrowDownIcon color={downColor} testId={testId} />
  }
  return <ArrowRightIcon color={stableColor} testId={testId} />
}

// ─── Trend container aria-label helpers ──────────────────────────────────────

function vo2maxAriaLabel(trend: TrendDirection, hasPriorWeek: boolean): string {
  if (!hasPriorWeek) return 'VO2max trend: no data'
  return `VO2max trend: ${trend}`
}

function hrAriaLabel(trend: TrendDirection, hasPriorWeek: boolean): string {
  if (!hasPriorWeek) return 'Resting HR trend: no data'
  return `Resting HR trend: ${trend}`
}

// ─── TrendIndicator (icon-based) ─────────────────────────────────────────────

interface TrendIndicatorProps {
  metric: 'vo2max' | 'hr'
  trend: TrendDirection
  hasPriorWeek: boolean
}

function TrendIndicator({ metric, trend, hasPriorWeek }: TrendIndicatorProps) {
  const isVo2max = metric === 'vo2max'
  const containerId = isVo2max ? 'week-vo2max-trend' : 'week-resting-hr-trend'
  const trendIconId = isVo2max ? 'week-vo2max-trend-icon' : 'week-resting-hr-trend-icon'
  const ariaLabel = isVo2max
    ? vo2maxAriaLabel(trend, hasPriorWeek)
    : hrAriaLabel(trend, hasPriorWeek)

  const metricColor = isVo2max
    ? themeTokens['--color-metric-vo2max']
    : themeTokens['--color-metric-hr']

  return (
    <div
      data-testid={containerId}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
    >
      {/* Metric icon — always present */}
      {isVo2max ? (
        <Vo2maxMetricIcon color={metricColor} />
      ) : (
        <HrMetricIcon color={metricColor} />
      )}

      {/* Trend direction icon — only when prior week exists */}
      {hasPriorWeek && (
        <TrendDirectionIcon trend={trend} testId={trendIconId} />
      )}
    </div>
  )
}

// ─── RunnerDashboard ─────────────────────────────────────────────────────────

export default function RunnerDashboard() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)
  const weeks = fixtureDataset.weeks as WeekData[]

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeek((prev) => (prev === weekNumber ? null : weekNumber))
  }

  return (
    <div data-testid="runner-dashboard">
      {weeks.map((week, index) => {
        const isExpanded = expandedWeek === week.weekNumber
        const hasPriorWeek = index > 0
        const priorWeek = hasPriorWeek ? weeks[index - 1] : null

        const vo2maxTrend: TrendDirection =
          hasPriorWeek && priorWeek
            ? computeTrend(week.vo2max, priorWeek.vo2max)
            : 'none'

        const hrTrend: TrendDirection =
          hasPriorWeek && priorWeek
            ? computeTrend(week.restingHrAvg, priorWeek.restingHrAvg)
            : 'none'

        return (
          <div
            key={week.weekNumber}
            data-testid="week-row"
            className={`week-row${week.skipped ? ' sickness' : ''}`}
          >
            <button
              className="week-row-trigger"
              aria-expanded={isExpanded}
              onClick={() => toggleWeek(week.weekNumber)}
            >
              <span className="week-label">{week.label}</span>
              <span
                className="week-bar"
                style={{ width: `${Math.min(week.totalDistanceKm * 4, 160)}px` }}
              />
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
                <TrendIndicator
                  metric="vo2max"
                  trend={vo2maxTrend}
                  hasPriorWeek={hasPriorWeek}
                />
                <TrendIndicator
                  metric="hr"
                  trend={hrTrend}
                  hasPriorWeek={hasPriorWeek}
                />
              </span>
            </button>

            {isExpanded && (
              <div data-testid="week-activities" role="region" aria-label={`${week.label} activities`}>
                {week.skipped ? (
                  <div
                    data-testid="skipped-activity"
                    data-activity-type="skipped"
                    className="skipped-activity"
                  >
                    Week skipped — illness / rest
                  </div>
                ) : (
                  week.activities.map((activity, i) => (
                    <div
                      key={i}
                      data-testid="activity-row"
                      data-activity-type={activityTypeAttr(activity.type)}
                      className="activity-row"
                    >
                      <span>{activity.type}</span>
                      {activity.distanceKm != null && (
                        <span>{activity.distanceKm} km</span>
                      )}
                      {activity.durationMin != null && (
                        <span>{activity.durationMin} min</span>
                      )}
                      {activity.notes && <span>{activity.notes}</span>}
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