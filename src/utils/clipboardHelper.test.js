import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { copyToClipboard } from './clipboardHelper'

/**
 * Regression tests. Locks in the post-fallback-removal
 * contract: never touches `document.body`, gracefully handles missing
 * Clipboard API and rejected writeText.
 */
describe('copyToClipboard', () => {
  let setCopiedState
  let originalClipboard
  let appendChildSpy

  beforeEach(() => {
    setCopiedState = vi.fn()
    originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()
    appendChildSpy = vi.spyOn(document.body, 'appendChild')
  })

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard)
    } else {
      delete navigator.clipboard
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const stubClipboard = (writeText) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    })
  }

  it('returns failure when navigator.clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined
    })

    const result = await copyToClipboard('hello', setCopiedState, 'k')

    expect(result).toEqual({ success: false, timeoutId: null })
    expect(setCopiedState).not.toHaveBeenCalled()
    expect(appendChildSpy).not.toHaveBeenCalled()
  })

  it('writes via clipboard API and schedules state reset on success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)

    const result = await copyToClipboard(
      'payload',
      setCopiedState,
      'item-1',
      1000
    )

    expect(writeText).toHaveBeenCalledWith('payload')
    expect(setCopiedState).toHaveBeenCalledWith('item-1')
    expect(result.success).toBe(true)
    expect(result.timeoutId).not.toBeNull()
    expect(appendChildSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(setCopiedState).toHaveBeenLastCalledWith(null)
  })

  it('returns failure without throwing when writeText rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    stubClipboard(writeText)

    const result = await copyToClipboard('x', setCopiedState, 'k')

    expect(result).toEqual({ success: false, timeoutId: null })
    expect(setCopiedState).not.toHaveBeenCalled()
    expect(appendChildSpy).not.toHaveBeenCalled()
  })

  it('returns failure when writeText is not a function', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: 'not-a-fn' }
    })

    const result = await copyToClipboard('x', setCopiedState, 'k')

    expect(result).toEqual({ success: false, timeoutId: null })
    expect(appendChildSpy).not.toHaveBeenCalled()
  })
})
