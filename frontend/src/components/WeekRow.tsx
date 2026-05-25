"use client";

import React, { useState } from "react";
import {
  WeekAggregate,
  totalDistanceKm,
  totalDurationMinutes,
  activityCount,
  formatDistance,
  formatDuration,
} from "../domain/dataset";
import { ActivityRow } from "./ActivityRow";

interface Props {
  week: WeekAggregate;
}

export function WeekRow({ week }: Props) {
  const [expanded, setExpanded] = useState(false);
  const count = activityCount(week);
  const distance = formatDistance(totalDistanceKm(week));
  const duration = formatDuration(totalDurationMinutes(week));

  const panelId = `week-${week.weekNumber}-activities`;

  return (
    <div
      data-testid="week-row"
      className={`week-row ${week.hasSkipped ? "sickness" : ""}`}
    >
      <button
        type="button"
        className="week-row-trigger"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="week-label">Week {week.weekNumber}</span>
        <span className="week-bar" aria-hidden="true" />
        <span data-testid="week-total-distance">{distance}</span>
        <span data-testid="week-total-duration">{duration}</span>
        <span data-testid="week-activity-count">{count} activities</span>
        <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && (
        <div
          id={panelId}
          data-testid="week-activities"
          role="region"
          aria-label={`Activities for Week ${week.weekNumber}`}
        >
          {week.activities.map((a, i) => (
            <ActivityRow key={i} activity={a} />
          ))}
          {week.hasSkipped && (
            <div
              data-testid="skipped-activity"
              role="note"
              className="skipped-activity"
            >
              <span aria-hidden="true">⊘ </span>
              {week.skippedReason ?? "Skipped due to sickness"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}