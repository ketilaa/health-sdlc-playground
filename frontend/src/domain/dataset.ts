export type ActivityType = "Long run" | "Restorative run" | "Intervals";

export interface Activity {
  date: string; // formatted e.g. "Mon, Oct 14"
  type: ActivityType;
  distanceKm: number;
  durationMinutes: number;
}

export interface WeekAggregate {
  weekNumber: number; // 1..8
  activities: Activity[];
  hasSkipped: boolean;
  skippedReason?: string;
}

export interface Dataset {
  id: string;
  name: string;
  isTestFixture: boolean;
  weeks: WeekAggregate[]; // unordered; UI sorts
}

export function totalDistanceKm(week: WeekAggregate): number {
  return week.activities.reduce((sum, a) => sum + a.distanceKm, 0);
}

export function totalDurationMinutes(week: WeekAggregate): number {
  return week.activities.reduce((sum, a) => sum + a.durationMinutes, 0);
}

export function activityCount(week: WeekAggregate): number {
  return week.activities.length;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function sortedWeeksNewestFirst(weeks: WeekAggregate[]): WeekAggregate[] {
  return [...weeks].sort((a, b) => b.weekNumber - a.weekNumber);
}