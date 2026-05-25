'use client'

import React, { useEffect, useState } from 'react'
import { getDefaultDataset, getSelectableDatasets, Dataset, Week, Activity } from '../data/datasets'
import { formatDistance, formatDuration } from '../lib/format'
import { themeTokens, activityTokenFor } from '../theme/tokens'
import ColorProbe from './ColorProbe'

type ActivityTypeKey = 'long-run' | 'restorative-run' | 'intervals'

function typeKey(type: Activity['type']): ActivityTypeKey {
  switch (type) {
    case 'Long run':
      return 'long-run'
    case 'Restorative run':
      return 'restorative-run'
    case 'Intervals':
      return 'intervals'
  }
}

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
          background: 'rgba(255,255,255,0.06)',
          color: 'rgb(255,255,255)',
          border: '1px solid rgba(255,255,255,0.2)',
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
            background: 'rgb(30, 32, 38)',
            color: 'rgb(255,255,255)',
            border: '1px solid rgba(255,255,255,0.2)',
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

function ActivityRow({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false)
  const kind = typeKey(activity.type)
  const bg = activityTokenFor(kind)
  const fg =
    kind === 'restorative-run' ? 'rgb(18, 20, 24)' : 'rgb(255, 255, 255)'
  const fgMuted =
    kind === 'restorative-run' ? 'rgba(18, 20, 24, 0.7)' : 'rgba(255, 255, 255, 0.75)'
  const panelId = `activity-${activity.id}-panel`

  return (
    <div
      data-testid="activity-row"
      data-activity-type={kind}
      style={{
        backgroundColor: bg,
        color: fg,
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 16px',
          height: 64,
        }}
      >
        <span data-testid="activity-date" style={{ minWidth: 110, color: fgMuted }}>
          {activity.displayDate}
        </span>
        <span
          data-testid="activity-type"
          style={{ fontWeight: 600, minWidth: 140 }}
        >
          {activity.type}
        </span>
        <span
          data-testid="activity-distance"
          style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}
        >
          {formatDistance(activity.distanceKm)}
        </span>
        <span
          data-testid="activity-duration"
          style={{ fontVariantNumeric: 'tabular-nums', color: fgMuted }}
        >
          {formatDuration(activity.durationMinutes)}
        </span>
        <button
          type="button"
          data-testid="activity-row-toggle"
          aria-label={`Toggle details for ${activity.type} on ${activity.displayDate}`}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((e) => !e)}
          style={{
            background: 'transparent',
            border: 'none',
            color: fg,
            cursor: 'pointer',
            fontSize: 18,
            padding: 4,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </button>
      </div>
      {expanded && (
        <div
          id={panelId}
          data-testid="activity-row-expanded"
          data-activity-type={kind}
          role="region"
          style={{
            backgroundColor: bg,
            color: fg,
            padding: '12px 16px 16px 16px',
            borderTop: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div>
            <strong>Distance:</strong> {formatDistance(activity.distanceKm)}
          </div>
          <div>
            <strong>Duration:</strong> {formatDuration(activity.durationMinutes)}
          </div>
          <div>
            <strong>Type:</strong> {activity.type}
          </div>
        </div>
      )}
    </div>
  )
}

function SkippedMarker({ reason }: { reason: string }) {
  return (
    <div
      data-testid="skipped-activity-marker"
      role="note"
      style={{
        backgroundColor: themeTokens['--color-activity-skipped'],
        color: 'rgb(255, 255, 255)',
        width: '100%',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontStyle: 'italic',
      }}
    >
      <span aria-hidden="true" style={{ marginRight: 8 }}>~</span>
      {reason}
    </div>
  )
}

function WeekSection({ week }: { week: Week }) {
  return (
    <section
      data-testid="week-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '96px 1fr',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          position: 'sticky',
          top: 16,
          alignSelf: 'start',
        }}
      >
        Week {week.weekNumber}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {week.activities.map((a) => (
          <ActivityRow key={a.id} activity={a} />
        ))}
        {week.skipped && <SkippedMarker reason={week.skipped.reason} />}
      </div>
    </section>
  )
}

export function TrainingOverview() {
  const [loaded, setLoaded] = useState(false)
  const [dataset, setDataset] = useState<Dataset | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDataset(getDefaultDataset())
      setLoaded(true)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const sortedWeeks: Week[] = dataset
    ? [...dataset.weeks].sort((a, b) => b.weekNumber - a.weekNumber)
    : []

  return (
    <div>
      <ColorProbe />
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ fontWeight: 600, color: 'rgb(255,255,255)' }}>
          Health Playground
        </div>
        {dataset && <DatasetSelector current={dataset} />}
      </header>

      <main
        style={{
          padding: '24px',
          maxWidth: 900,
          margin: '0 auto',
          color: 'rgb(255,255,255)',
        }}
        aria-busy={!loaded}
      >
        <h1 style={{ fontSize: 32, margin: '0 0 32px 0' }}>Training Overview</h1>

        {!loaded && (
          <div
            data-testid="dataset-loading"
            role="status"
            aria-live="polite"
            style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}
          >
            <span style={{ position: 'absolute', left: -9999 }}>
              Loading training data
            </span>
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    height: 44,
                    background: 'rgba(255,255,255,0.05)',
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
              <WeekSection key={w.weekNumber} week={w} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default TrainingOverview