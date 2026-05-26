'use client'

import React, { useState } from 'react'
import { fixtureDataset, Week } from '../data/datasets'

function activityTypeAttr(type: string): string {
  // Normalize display-form types ("Long run") to snake_case attribute values ("long_run")
  return type
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
}

interface WeekRowProps {
  week: Week
  isExpanded: boolean
  onToggle: () => void
}

function WeekRowItem({ week, isExpanded, onToggle }: WeekRowProps) {
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
        {weeks.map((week) => (
          <WeekRowItem
            key={week.weekNumber}
            week={week}
            isExpanded={expandedWeek === week.weekNumber}
            onToggle={() => toggleWeek(week.weekNumber)}
          />
        ))}
      </div>
    </div>
  )
}