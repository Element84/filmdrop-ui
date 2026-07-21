import { describe, it, expect } from 'vitest'
import {
  convertDate,
  convertDateForURL,
  convertToUTC,
  formatStacDatetime
} from './datetime'

describe('datetime utilities', () => {
  it('converts date range arrays for STAC requests', () => {
    expect(convertDate(['2024-01-01', '2024-01-31'])).toBe(
      '2024-01-01/2024-01-31'
    )
    expect(convertDateForURL(['2024-01-01', '2024-01-31'])).toBe(
      '2024-01-01%2F2024-01-31'
    )
  })

  it('returns a Date object from UTC-like string input', () => {
    const result = convertToUTC('2024-02-15T12:34:56Z')

    expect(result).toBeInstanceOf(Date)
    expect(result.toISOString()).toContain('2024-02-15T')
  })

  it('formats STAC datetime strings for display', () => {
    expect(formatStacDatetime('2025-11-28T16:14:09.311000Z')).toBe(
      '2025-11-28 16:14:09.311000'
    )
    expect(formatStacDatetime('2025-11-28T16:14:09')).toBe(
      '2025-11-28 16:14:09'
    )
    expect(formatStacDatetime('')).toBe('')
  })
})
