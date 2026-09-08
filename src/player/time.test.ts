import { describe, expect, it } from 'vitest'
import { formatClockTime, formatCueTime, formatDurationLabel } from './time'

describe('player time formatting', () => {
  it('formats a two-minute scene without capping at 99 seconds', () => {
    expect(formatClockTime(120)).toBe('02:00')
    expect(formatClockTime(105.9)).toBe('01:45')
  })

  it('formats Chinese duration and cue labels', () => {
    expect(formatDurationLabel(120)).toBe('2 分钟')
    expect(formatDurationLabel(125)).toBe('2 分 5 秒')
    expect(formatCueTime(0.5)).toBe('0.5秒')
    expect(formatCueTime(75)).toBe('01:15')
  })
})
