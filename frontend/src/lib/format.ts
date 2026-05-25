export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`
}

export function formatDuration(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes)
  const hours = Math.floor(minutes / 60)
  const mins = minutes - hours * 60
  if (hours === 0) {
    return `${mins}m`
  }
  return `${hours}h ${mins}m`
}

export function totalDistance(distances: number[]): number {
  return distances.reduce((acc, d) => acc + d, 0)
}

export function totalDuration(durations: number[]): number {
  return durations.reduce((acc, d) => acc + d, 0)
}