import { describe, expect, it } from 'vitest'
import { utcDayBounds, DAILY_LIMIT_MESSAGE } from '@/lib/usage'
import { BETA_DAILY_ANALYSIS_LIMIT, scoreBand } from '@/lib/options'

describe('utcDayBounds', () => {
  it('starts at midnight UTC on the same day', () => {
    const { start, end } = utcDayBounds(new Date('2026-08-04T15:42:11.000Z'))
    expect(start.toISOString()).toBe('2026-08-04T00:00:00.000Z')
    expect(end.toISOString()).toBe('2026-08-05T00:00:00.000Z')
  })

  it('does not roll over just before midnight UTC', () => {
    const { start } = utcDayBounds(new Date('2026-08-04T23:59:59.999Z'))
    expect(start.toISOString()).toBe('2026-08-04T00:00:00.000Z')
  })

  it('rolls over exactly at midnight UTC', () => {
    const { start } = utcDayBounds(new Date('2026-08-05T00:00:00.000Z'))
    expect(start.toISOString()).toBe('2026-08-05T00:00:00.000Z')
  })

  it('uses UTC rather than the local timezone', () => {
    // 23:30 in UTC+5:30 is still the previous UTC day.
    const { start } = utcDayBounds(new Date('2026-08-04T18:30:00.000Z'))
    expect(start.toISOString()).toBe('2026-08-04T00:00:00.000Z')
  })
})

describe('beta limits', () => {
  it('allows three analyses a day', () => {
    expect(BETA_DAILY_ANALYSIS_LIMIT).toBe(3)
  })

  it('uses the exact wording from the brief when the limit is hit', () => {
    expect(DAILY_LIMIT_MESSAGE).toBe(
      'You have used today’s three beta reviews. Your limit resets tomorrow.'
    )
  })
})

describe('scoreBand', () => {
  it('describes every band in words, so meaning never depends on colour', () => {
    expect(scoreBand(92)).toBe('Very strong')
    expect(scoreBand(85)).toBe('Very strong')
    expect(scoreBand(71)).toBe('Strong')
    expect(scoreBand(60)).toBe('Workable')
    expect(scoreBand(44)).toBe('Needs work')
    expect(scoreBand(12)).toBe('Weak')
  })
})
