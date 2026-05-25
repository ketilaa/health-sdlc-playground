import React from "react";
import { Activity, formatDistance, formatDuration } from "../domain/dataset";

interface Props {
  activity: Activity;
}

export function ActivityRow({ activity }: Props) {
  return (
    <div data-testid="activity-row" className="activity-row">
      <span data-testid="activity-date">{activity.date}</span>
      <span data-testid="activity-type">{activity.type}</span>
      <span data-testid="activity-distance">
        {formatDistance(activity.distanceKm)}
      </span>
      <span data-testid="activity-duration">
        {formatDuration(activity.durationMinutes)}
      </span>
    </div>
  );
}