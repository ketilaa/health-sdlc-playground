'use client'

import React, { useEffect, useState } from 'react'
import { getDefaultDataset, getSelectableDatasets, Dataset, Week } from '../data/datasets'
import { formatDistance, formatDuration, totalDistance, totalDuration } from '../lib/format'

interface DatasetSelectorProps {
  current: Dataset
}

function DatasetSelector({ current }: DatasetSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectable = getSelectableDatasets()

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        data-testid="dataset-selector"
        aria-label="Select dataset"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          padding: '8px 12px',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        {current.name}
        <span aria-hidden="true" style={{ marginLeft: 8 }}>▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Available datasets"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            margin: 0,
            padding: 4,
            listStyle: 'none',
            minWidth: '100%',
            zIndex: 10,
          }}
        >
          {selectable.map((d) => (
            <li
              key={d.id}
              role="option"
              aria-selected={d.id === current.id}
              style={{ padding: '6px 10px', cursor: 'pointer' }}
            >
              {d.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WeekRow({ week, expanded, onToggle }: { week: Week; expanded: boolean; onToggle: () => void }) {
  const distances = week.activities.map((a) => a.distanceKm)
  const durations = week.activities.map((a) => a.durationMinutes)
  const distanceText = formatDistance(totalDistance(distances))
  const durationText = formatDuration(totalDuration(durations))
  const activityCount = week.activities.length
  const countText = `${activityCount} activities`
  const isSickness = Boolean(week.skipped)
  const panelId = `week-activities-${week.weekNumber}`

  return (
    <div
      data-testid="week-row"
      style={{
        borderBottom: '1px solid #eee',
        padding: 0,
      }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          background: isSickness ? '#fafafa' : '#fff',
          border: 'none',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 16, minWidth: 80 }}>
          Week {week.weekNumber}
        </span>
        <span style={{ flex: 1 }} aria-hidden="true">
          <span
            style={{
              display: 'inline-block',
              height: 8,
              width: `${Math.min(100, totalDistance(distances) * 3)}%`,
              background: isSickness ? '#bbb' : '#3b82f6',
              borderRadius: 4,
            }}
          />
        </span>
        <span data-testid="week-total-distance" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {distanceText}
        </span>
        <span data-testid="week-total-duration" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {durationText}
        </span>
        <span data-testid="week-activity-count">{countText}</span>
        <span aria-hidden="true" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▸
        </span>
      </button>
      {expanded && (
        <div
          id={panelId}
          data-testid="week-activities"
          role="region"
          aria-label={`Activities for Week ${week.weekNumber}`}
          style={{ padding: '8px 24px 16px 24px', background: '#fafbfc' }}
        >
          {week.activities.map((a) => (
            <div
              key={a.id}
              data-testid="activity-row"
              style={{
                display: 'flex',
                gap: 16,
                padding: '8px 0',
                borderBottom: '1px dashed #eee',
              }}
            >
              <span data-testid="activity-date" style={{ color: '#666', minWidth: 110 }}>
                {a.displayDate}
              </span>
              <span data-testid="activity-type" style={{ fontWeight: 500, minWidth: 140 }}>
                {a.type}
              </span>
              <span data-testid="activity-distance" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatDistance(a.distanceKm)}
              </span>
              <span data-testid="activity-duration" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatDuration(a.durationMinutes)}
              </span>
            </div>
          ))}
          {week.skipped && (
            <div
              data-testid="skipped-activity"
              role="note"
              style={{
                marginTop: 8,
                padding: '10px 12px',
                border: '1px dashed #aaa',
                color: '#666',
                fontStyle: 'italic',
                background: '#fff',
              }}
            >
              <span aria-hidden="true" style={{ marginRight: 8 }}>⛔</span>
              {week.skipped.reason}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TrainingOverview() {
  const [loaded, setLoaded] = useState(false)
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDataset(getDefaultDataset())
      setLoaded(true)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  // Display dataset (for the selector trigger) — use default even before fully loaded
  // so the top bar shows the preselected name once data arrives. While loading,
  // we render nothing in the trigger position.
  const sortedWeeks: Week[] = dataset
    ? [...dataset.weeks].sort((a, b) => b.weekNumber - a.weekNumber)
    : []

  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid #eee',
          background: '#fff',
        }}
      >
        <div style={{ fontWeight: 600 }}>Health Playground</div>
        {dataset && <DatasetSelector current={dataset} />}
      </header>

      <main style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }} aria-busy={!loaded}>
        <h1 style={{ fontSize: 28, margin: '0 0 4px 0' }}>Training Overview</h1>
        <p style={{ color: '#666', margin: '0 0 24px 0' }}>8 weeks · most recent first</p>

        {!loaded && (
          <div
            data-testid="dataset-loading"
            role="status"
            aria-live="polite"
            style={{ padding: 24, textAlign: 'center', color: '#888' }}
          >
            <span style={{ position: 'absolute', left: -9999 }}>Loading training data</span>
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    height: 44,
                    background: '#f0f0f0',
                    borderRadius: 4,
                    margin: '8px 0',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {loaded && dataset && (
          <div>
            {sortedWeeks.map((w) => (
              <WeekRow
                key={w.weekNumber}
                week={w}
                expanded={expandedWeek === w.weekNumber}
                onToggle={() =>
                  setExpandedWeek((cur) => (cur === w.weekNumber ? null : w.weekNumber))
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default TrainingOverview