import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAssetClipboard } from './useAssetClipboard'
import { copyToClipboard } from '../utils/clipboardHelper'

vi.mock('../utils/clipboardHelper', () => ({
  copyToClipboard: vi.fn()
}))

describe('useAssetClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delegates copy requests and tracks returned timeout id', async () => {
    const timeoutId = setTimeout(() => {}, 0)
    clearTimeout(timeoutId)
    copyToClipboard.mockResolvedValue({ success: true, timeoutId })

    const { result } = renderHook(() => useAssetClipboard())

    await act(async () => {
      await result.current.handleCopyToClipboard('https://asset/url', 'asset-1')
    })

    expect(copyToClipboard).toHaveBeenCalledWith(
      'https://asset/url',
      expect.any(Function),
      'asset-1'
    )
  })

  it('clears previous timeout before scheduling a new one', async () => {
    const firstTimeoutId = setTimeout(() => {}, 0)
    clearTimeout(firstTimeoutId)
    const secondTimeoutId = setTimeout(() => {}, 0)
    clearTimeout(secondTimeoutId)

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    copyToClipboard
      .mockResolvedValueOnce({ success: true, timeoutId: firstTimeoutId })
      .mockResolvedValueOnce({ success: true, timeoutId: secondTimeoutId })

    const { result } = renderHook(() => useAssetClipboard())

    await act(async () => {
      await result.current.handleCopyToClipboard('https://asset/one', 'asset-1')
    })

    await act(async () => {
      await result.current.handleCopyToClipboard('https://asset/two', 'asset-2')
    })

    expect(clearTimeoutSpy).toHaveBeenCalledWith(firstTimeoutId)
  })

  it('clears active timeout on unmount', async () => {
    const timeoutId = setTimeout(() => {}, 0)
    clearTimeout(timeoutId)

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    copyToClipboard.mockResolvedValue({ success: true, timeoutId })

    const { result, unmount } = renderHook(() => useAssetClipboard())

    await act(async () => {
      await result.current.handleCopyToClipboard('https://asset/url', 'asset-1')
    })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId)
  })
})
