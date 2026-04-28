import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setConfigCacheBuster, getCacheBusterSuffix } from './configBase'

describe('configCacheBuster', () => {
  beforeEach(() => {
    // Reset to default before each test
    setConfigCacheBuster('timestamp')
  })

  afterEach(() => {
    setConfigCacheBuster('timestamp')
    vi.restoreAllMocks()
  })

  it('defaults to timestamp mode with ?_cb=<Date.now()>', () => {
    const fixedNow = 1_700_000_000_000
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow)
    expect(getCacheBusterSuffix()).toBe(`?_cb=${fixedNow}`)
  })

  it('returns empty string for "none" mode', () => {
    setConfigCacheBuster('none')
    expect(getCacheBusterSuffix()).toBe('')
  })

  it('uses a literal revision stamp when a custom string is provided', () => {
    setConfigCacheBuster('abc123')
    expect(getCacheBusterSuffix()).toBe('?_cb=abc123')
  })

  it('URL-encodes special characters in literal stamps', () => {
    setConfigCacheBuster('v1/release?x&y z')
    expect(getCacheBusterSuffix()).toBe(
      `?_cb=${encodeURIComponent('v1/release?x&y z')}`
    )
  })

  it('URL-encodes non-ASCII literal stamps', () => {
    setConfigCacheBuster('版本-α')
    expect(getCacheBusterSuffix()).toBe(`?_cb=${encodeURIComponent('版本-α')}`)
  })

  it('resets to timestamp on falsy input (empty string)', () => {
    setConfigCacheBuster('fixed')
    setConfigCacheBuster('')
    const fixedNow = 42
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow)
    expect(getCacheBusterSuffix()).toBe(`?_cb=${fixedNow}`)
  })

  it('resets to timestamp on falsy input (null/undefined)', () => {
    setConfigCacheBuster('fixed')
    setConfigCacheBuster(null)
    expect(getCacheBusterSuffix().startsWith('?_cb=')).toBe(true)
    setConfigCacheBuster('fixed')
    setConfigCacheBuster(undefined)
    expect(getCacheBusterSuffix().startsWith('?_cb=')).toBe(true)
  })
})
