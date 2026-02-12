import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useDebouncedCallback,
  flushAllPendingCallbacks
} from './useDebouncedCallback'

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce the callback', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(fn, 300))

    act(() => {
      result.current('a')
    })
    expect(fn).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('should cancel on unmount', () => {
    const fn = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 300))

    act(() => {
      result.current('a')
    })
    unmount()

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('flushAllPendingCallbacks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should flush all pending debounced callbacks', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const { result: r1 } = renderHook(() => useDebouncedCallback(fn1, 300))
    const { result: r2 } = renderHook(() => useDebouncedCallback(fn2, 300))

    act(() => {
      r1.current('a')
      r2.current('b')
    })
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).not.toHaveBeenCalled()

    act(() => {
      flushAllPendingCallbacks()
    })
    expect(fn1).toHaveBeenCalledWith('a')
    expect(fn2).toHaveBeenCalledWith('b')
  })

  it('should not flush callbacks from unmounted hooks', () => {
    const fn = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 300))

    act(() => {
      result.current('a')
    })
    unmount()

    act(() => {
      flushAllPendingCallbacks()
    })
    expect(fn).not.toHaveBeenCalled()
  })

  it('should be a no-op when no callbacks are pending', () => {
    expect(() => flushAllPendingCallbacks()).not.toThrow()
  })
})
