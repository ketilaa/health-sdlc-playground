'use client'

import React, { useState } from 'react'
import {
  WeekData,
  DashboardActivity,
  getWeekById,
  getPreviousWeek,
  computeWeeklyAvgHr,
  computeWeeklyAvgCadence,
  computeTrend,
  trendLabel,
  isHighIntensity,
  weeklyDashboardDataset,
  TrendDirection,
} from '../data/weeklyDashboardData'

const EM_DASH = '\u2014'

interface WeekSelectorProps {
  weeks: WeekData[]
  selectedWeekId: string
  onChange: (weekId: string) => void
}

function WeekSelector({ weeks, selectedWeekId, onChange }: WeekSelectorProps) {
  const sorted = [...weeks].sort((a, b) => b.weekId.localeCompare(a.weekId))
  return (
    <select
      data-testid="week-selector"
      value={selectedWeekId}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select week"
      style={{
        padding: '8px 12px',
        fontSize: 16,
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.08)',
        color: 'inherit',
        cursor: 'pointer',
        width: '100%',
        maxWidth: 300,
      }}
    >
      {sorted.map((w) => (
        <option key={w.weekId} value={w.weekId}>
          {w.label}
        </option>
      ))}
    </select>
  )
}

interface MetricTileProps {
  label: string
  value: string | number
  unit?: string
  testId: string
  ariaLabel: string
}

function MetricTile({ label, value, unit, testId, ariaLabel }: MetricTileProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '12px 8px',
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      <span
        data-testid={testId}
        aria-label={ariaLabel}
        style={{ fontSize: 24, fontWeight: 700 }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 400,
              marginLeft: 4,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            {unit}
          </span>
        )}
      </span>
    </div>
  )
}

interface TrendChipProps {
  direction: TrendDirection
  testId: string
  ariaLabel: string
}

function trendChipStyle(direction: TrendDirection): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 16,
    fontSize: 13,
    fontWeight: 600,
  }
  switch (direction) {
    case 'increasing':
      return { ...base, background: 'rgba(76,175,80,0.2)', color: 'rgb(129,199,132)' }
    case 'decreasing':
      return { ...base, background: 'rgba(244,67,54,0.2)', color: 'rgb(229,115,115)' }
    case 'stable':
      return { ...base, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
    case 'none':
      return { ...base, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
  }
}

function TrendChip({ direction, testId, ariaLabel }: TrendChipProps) {
  return (
    <span
      data-testid={testId}
      aria-label={ariaLabel}
      style={trendChipStyle(direction)}
    >
      {trendLabel(direction)}
    </span>
  )
}

interface IntensityBalanceProps {
  lowCount: number
  highCount: number
}

function IntensityBalance({ lowCount, highCount }: IntensityBalanceProps) {
  return (
    <div
      data-testid="intensity-balance"
      aria-label={`Intensity balance: ${lowCount} low-intensity sessions, ${highCount} high-intensity session`}
      style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: 16,
          fontSize: 13,
          background: 'rgba(33,150,243,0.2)',
          color: 'rgb(100,181,246)',
        }}
      >
        Low: {lowCount}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: 16,
          fontSize: 13,
          background: 'rgba(255,152,0,0.2)',
          color: 'rgb(255,183,77)',
        }}
      >
        High: {highCount}
      </span>
    </div>
  )
}

interface WeeklySummaryCardProps {
  week: WeekData
  previousWeek: WeekData | undefined
}

function WeeklySummaryCard({ week, previousWeek }: WeeklySummaryCardProps) {
  const avgHr = computeWeeklyAvgHr(week.activities)
  const avgCadence = computeWeeklyAvgCadence(week.activities)
  const lowCount = week.activities.filter((a) => !isHighIntensity(a.type)).length
  const highCount = week.activities.filter((a) => isHighIntensity(a.type)).length

  const prevAvgHr = previousWeek ? computeWeeklyAvgHr(previousWeek.activities) : 0

  const trendLoad: TrendDirection = previousWeek
    ? computeTrend(week.trainingLoad, previousWeek.trainingLoad)
    : 'none'
  const trendAvgHr: TrendDirection = previousWeek
    ? computeTrend(avgHr, prevAvgHr)
    : 'none'
  const trendRestingHr: TrendDirection = previousWeek
    ? computeTrend(week.restingHrAvg, previousWeek.restingHrAvg)
    : 'none'

  return (
    <div
      data-testid="weekly-summary-card"
      style={{
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        padding: '16px',
        minWidth: 0,
      }}
    >
      <h2
        style={{
          margin: '0 0 12px 0',
          fontSize: 16,
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 600,
        }}
      >
        Weekly Summary
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '4px 8px',
        }}
      >
        <MetricTile
          label="VO2max"
          value={week.vo2max}
          unit="ml/kg/min"
          testId="weekly-vo2max"
          ariaLabel={`VO2max: ${week.vo2max} ml/kg/min`}
        />
        <MetricTile
          label="Resting HR"
          value={week.restingHrAvg}
          unit="bpm"
          testId="weekly-resting-hr"
          ariaLabel={`Resting HR: ${week.restingHrAvg} bpm`}
        />
        <MetricTile
          label="Avg HR"
          value={avgHr}
          unit="bpm"
          testId="weekly-avg-hr"
          ariaLabel={`Avg HR: ${avgHr} bpm`}
        />
        <MetricTile
          label="Avg Cadence"
          value={avgCadence}
          unit="spm"
          testId="weekly-avg-cadence"
          ariaLabel={`Avg Cadence: ${avgCadence} spm`}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Intensity Balance
        </span>
        <div style={{ marginTop: 6 }}>
          <IntensityBalance lowCount={lowCount} highCount={highCount} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Trends vs Previous Week
        </span>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginTop: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                minWidth: 100,
              }}
            >
              Training Load
            </span>
            <TrendChip
              direction={trendLoad}
              testId="trend-training-load"
              ariaLabel={
                trendLoad === 'none'
                  ? 'Training load trend: no comparison available'
                  : `Training load trend: ${trendLabel(trendLoad)}`
              }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                minWidth: 100,
              }}
            >
              Avg HR
            </span>
            <TrendChip
              direction={trendAvgHr}
              testId="trend-avg-hr"
              ariaLabel={
                trendAvgHr === 'none'
                  ? 'Average HR trend: no comparison available'
                  : `Average HR trend: ${trendLabel(trendAvgHr)}`
              }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                minWidth: 100,
              }}
            >
              Resting HR
            </span>
            <TrendChip
              direction={trendRestingHr}
              testId="trend-resting-hr"
              ariaLabel={
                trendRestingHr === 'none'
                  ? 'Resting HR trend: no comparison available'
                  : `Resting HR trend: ${trendLabel(trendRestingHr)}`
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ActivityListProps {
  activities: DashboardActivity[]
  selectedId: string | null
  onSelect: (activity: DashboardActivity) => void
}

function ActivityList({ activities, selectedId, onSelect }: ActivityListProps) {
  return (
    <ul
      data-testid="activity-list"
      role="list"
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {activities.map((activity) => (
        <li
          key={activity.id}
          role="listitem"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            type="button"
            aria-label={`Open ${activity.name} details`}
            aria-selected={selectedId === activity.id}
            onClick={() => onSelect(activity)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              background:
                selectedId === activity.id
                  ? 'rgba(255,255,255,0.1)'
                  : 'transparent',
              border: 'none',
              color: 'inherit',
              padding: '12px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 14,
            }}
          >
            <span style={{ flex: 1, fontWeight: 500 }}>{activity.name}</span>
            <span
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            >
              {activity.durationMin}m
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

interface ActivityDetailProps {
  activity: DashboardActivity
  onClose: () => void
}

function ActivityDetail({ activity, onClose }: ActivityDetailProps) {
  const hasAvgHr = activity.avgHr !== undefined
  const hasCadence = activity.cadence !== undefined

  return (
    <div
      data-testid="activity-detail"
      role="region"
      aria-label={`${activity.name} details`}
      style={{
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          {activity.name}
        </h2>
        <button
          type="button"
          aria-label="Close activity details"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: 20,
            padding: 4,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Type
          </span>
          <span style={{ fontSize: 14 }}>{activity.type}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Duration
          </span>
          <span style={{ fontSize: 14 }}>{activity.durationMin}m</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Distance
          </span>
          <span style={{ fontSize: 14 }}>
            {activity.distanceKm.toFixed(1)} km
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Avg HR
          </span>
          <span
            data-testid="activity-avg-hr"
            aria-label={
              hasAvgHr
                ? `Average heart rate: ${activity.avgHr} bpm`
                : 'Average heart rate: not available'
            }
            style={{ fontSize: 14 }}
          >
            {hasAvgHr ? (
              <>
                {activity.avgHr}
                <span
                  style={{
                    fontSize: 12,
                    marginLeft: 4,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  bpm
                </span>
              </>
            ) : (
              EM_DASH
            )}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Cadence
          </span>
          <span
            data-testid="activity-cadence"
            aria-label={
              hasCadence
                ? `Cadence: ${activity.cadence} spm`
                : 'Cadence: not available'
            }
            style={{ fontSize: 14 }}
          >
            {hasCadence ? (
              <>
                {activity.cadence}
                <span
                  style={{
                    fontSize: 12,
                    marginLeft: 4,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  spm
                </span>
              </>
            ) : (
              EM_DASH
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

interface WeeklyDashboardProps {
  extraActivities?: DashboardActivity[]
  overrideDataset?: WeekData[]
}

export function WeeklyDashboard({
  extraActivities,
  overrideDataset,
}: WeeklyDashboardProps) {
  const baseDataset = overrideDataset ?? weeklyDashboardDataset

  // Sort descending to default to most recent
  const sorted = [...baseDataset].sort((a, b) =>
    b.weekId.localeCompare(a.weekId)
  )
  const [selectedWeekId, setSelectedWeekId] = useState<string>(
    sorted[0]?.weekId ?? ''
  )
  const [selectedActivity, setSelectedActivity] =
    useState<DashboardActivity | null>(null)

  const currentWeek = getWeekById(selectedWeekId, baseDataset)
  const previousWeek = getPreviousWeek(selectedWeekId, baseDataset)

  const activities = currentWeek
    ? [...currentWeek.activities, ...(extraActivities ?? [])]
    : extraActivities ?? []

  function handleWeekChange(weekId: string) {
    setSelectedWeekId(weekId)
    setSelectedActivity(null)
  }

  function handleActivitySelect(activity: DashboardActivity) {
    setSelectedActivity((prev) =>
      prev?.id === activity.id ? null : activity
    )
  }

  function handleDetailClose() {
    setSelectedActivity(null)
  }

  return (
    <div
      style={{
        padding: '16px',
        maxWidth: 900,
        margin: '0 auto',
        color: 'rgb(255,255,255)',
      }}
    >
      <h1 style={{ fontSize: 24, margin: '0 0 16px 0' }}>
        Weekly Training Dashboard
      </h1>

      <div style={{ marginBottom: 16 }}>
        <WeekSelector
          weeks={baseDataset}
          selectedWeekId={selectedWeekId}
          onChange={handleWeekChange}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 16,
        }}
      >
        {currentWeek && (
          <WeeklySummaryCard
            week={currentWeek}
            previousWeek={previousWeek}
          />
        )}

        <div>
          <ActivityList
            activities={activities}
            selectedId={selectedActivity?.id ?? null}
            onSelect={handleActivitySelect}
          />
        </div>
      </div>

      {selectedActivity && (
        <div style={{ marginTop: 16 }}>
          <ActivityDetail
            activity={selectedActivity}
            onClose={handleDetailClose}
          />
        </div>
      )}
    </div>
  )
}

export default WeeklyDashboard