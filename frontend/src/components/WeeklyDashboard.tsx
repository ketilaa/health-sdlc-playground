'use client'

import React, { useState } from 'react'
import {
  weeklyDashboardDataset,
  WeekData,
  DashboardActivity,
  computeWeeklyAvgHr,
  computeWeeklyAvgCadence,
  computeTrend,
  trendLabel,
  isHighIntensity,
} from '../data/weeklyDashboardData'

interface WeeklyDashboardProps {
  extraActivities?: DashboardActivity[]
  overrideDataset?: WeekData[]
}

function getPreviousWeekFromDataset(
  dataset: WeekData[],
  weekId: string
): WeekData | undefined {
  const sorted = [...dataset].sort((a, b) => a.weekId.localeCompare(b.weekId))
  const idx = sorted.findIndex((w) => w.weekId === weekId)
  if (idx <= 0) return undefined
  return sorted[idx - 1]
}

export function WeeklyDashboard({
  extraActivities = [],
  overrideDataset,
}: WeeklyDashboardProps) {
  const dataset = overrideDataset ?? weeklyDashboardDataset
  const sortedWeeks = [...dataset].sort((a, b) =>
    b.weekId.localeCompare(a.weekId)
  )
  const defaultWeekId = sortedWeeks[0]?.weekId ?? ''

  const [selectedWeekId, setSelectedWeekId] = useState(defaultWeekId)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  const currentWeek = dataset.find((w) => w.weekId === selectedWeekId)
  const activities: DashboardActivity[] = currentWeek
    ? [...currentWeek.activities, ...extraActivities]
    : []

  const previousWeek = currentWeek
    ? getPreviousWeekFromDataset(dataset, selectedWeekId)
    : undefined

  const selectedActivity =
    selectedActivityId != null
      ? activities.find((a) => a.id === selectedActivityId) ?? null
      : null

  const avgHr = activities.length > 0 ? computeWeeklyAvgHr(activities) : 0
  const avgCadence =
    activities.length > 0 ? computeWeeklyAvgCadence(activities) : 0

  const prevAvgHr = previousWeek
    ? computeWeeklyAvgHr(previousWeek.activities)
    : 0

  const trainingLoadTrend = previousWeek
    ? trendLabel(computeTrend(currentWeek!.trainingLoad, previousWeek.trainingLoad))
    : '—'

  const avgHrTrend = previousWeek
    ? trendLabel(computeTrend(avgHr, prevAvgHr))
    : '—'

  const restingHrTrend = previousWeek
    ? trendLabel(computeTrend(currentWeek!.restingHrAvg, previousWeek.restingHrAvg))
    : '—'

  const highCount = activities.filter((a) => isHighIntensity(a.type)).length
  const lowCount = activities.filter((a) => !isHighIntensity(a.type)).length

  function handleWeekChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedWeekId(e.target.value)
    setSelectedActivityId(null)
  }

  function handleActivityClick(activityId: string) {
    setSelectedActivityId((prev) => (prev === activityId ? null : activityId))
  }

  function handleCloseDetail() {
    setSelectedActivityId(null)
  }

  return (
    <div
      data-testid="weekly-dashboard-container"
      role="main"
      style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ fontSize: 28, margin: '0 0 16px 0' }}>Weekly Dashboard</h1>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="week-selector" style={{ marginRight: 8 }}>
          Week:
        </label>
        <select
          id="week-selector"
          data-testid="week-selector"
          value={selectedWeekId}
          onChange={handleWeekChange}
          style={{ maxWidth: '100%' }}
        >
          {sortedWeeks.map((w) => (
            <option key={w.weekId} value={w.weekId}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {currentWeek && (
        <>
          <div
            data-testid="weekly-summary-card"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>VO2max</div>
                <span data-testid="weekly-vo2max" style={{ fontWeight: 700 }}>
                  {currentWeek.vo2max}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Resting HR</div>
                <span data-testid="weekly-resting-hr" style={{ fontWeight: 700 }}>
                  {currentWeek.restingHrAvg}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Avg HR</div>
                <span data-testid="weekly-avg-hr" style={{ fontWeight: 700 }}>
                  {avgHr}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Avg Cadence</div>
                <span data-testid="weekly-avg-cadence" style={{ fontWeight: 700 }}>
                  {avgCadence}
                </span>
              </div>
            </div>

            <div
              data-testid="intensity-balance"
              aria-label={`Intensity balance: ${lowCount} low-intensity sessions, ${highCount} high-intensity session`}
              style={{ marginBottom: 12, fontSize: 14 }}
            >
              Low: {lowCount} · High: {highCount}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 14 }}>
              <div>
                Training load:{' '}
                <span data-testid="trend-training-load">{trainingLoadTrend}</span>
              </div>
              <div>
                Avg HR:{' '}
                <span data-testid="trend-avg-hr">{avgHrTrend}</span>
              </div>
              <div>
                Resting HR:{' '}
                <span data-testid="trend-resting-hr">{restingHrTrend}</span>
              </div>
            </div>
          </div>

          <ul
            data-testid="activity-list"
            style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', width: '100%', boxSizing: 'border-box' }}
          >
            {activities.map((activity) => (
              <li key={activity.id} style={{ marginBottom: 4 }}>
                <button
                  type="button"
                  aria-label={`Open ${activity.name} details`}
                  onClick={() => handleActivityClick(activity.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    color: 'inherit',
                    fontSize: 15,
                    boxSizing: 'border-box',
                  }}
                >
                  {activity.name}
                </button>
              </li>
            ))}
          </ul>

          {selectedActivity && (
            <div
              data-testid="activity-detail"
              style={{
                marginTop: 16,
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: 16,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>{selectedActivity.name}</h2>
                <button
                  type="button"
                  aria-label="Close activity details"
                  onClick={handleCloseDetail}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 20,
                    color: 'inherit',
                    padding: 4,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14 }}>
                <div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>Duration</div>
                  <div>{selectedActivity.durationMin} min</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>Distance</div>
                  <div>{selectedActivity.distanceKm} km</div>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>Avg HR</div>
                  <span data-testid="activity-avg-hr">
                    {selectedActivity.avgHr != null ? selectedActivity.avgHr : '—'}
                  </span>
                </div>
                <div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>Cadence</div>
                  <span data-testid="activity-cadence">
                    {selectedActivity.cadence != null ? selectedActivity.cadence : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default WeeklyDashboard