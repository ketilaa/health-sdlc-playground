import { formatDistance, formatDuration, totalDistance, totalDuration } from './format'

describe('format helpers', () => {
  test('formatDistance formats one decimal km', () => {
    expect(formatDistance(16)).toBe('16.0 km')
    expect(formatDistance(8.25)).toBe('8.3 km')
  })

  test('formatDuration formats hours and minutes', () => {
    expect(formatDuration(75)).toBe('1h 15m')
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(120)).toBe('2h 0m')
  })

  test('totalDistance and totalDuration sum arrays', () => {
    expect(totalDistance([1.5, 2.5, 3.0])).toBeCloseTo(7.0)
    expect(totalDuration([30, 45, 60])).toBe(135)
  })
})