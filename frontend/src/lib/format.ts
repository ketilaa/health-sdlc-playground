export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function totalDistance(distances: number[]): number {
  return distances.reduce((a, b) => a + b, 0)
}

export function totalDuration(durations: number[]): number {
  return durations.reduce((a, b) => a + b, 0)
}