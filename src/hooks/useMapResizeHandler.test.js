import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMapResizeHandler } from './useMapResizeHandler'

describe('useMapResizeHandler', () => {
  let resizeObserverInstance
  let resizeObserverCallback
  let observeMock
  let disconnectMock

  beforeEach(() => {
    vi.useFakeTimers()

    observeMock = vi.fn()
    disconnectMock = vi.fn()

    global.ResizeObserver = class {
      constructor(callback) {
        resizeObserverCallback = callback
        resizeObserverInstance = {
          observe: observeMock,
          disconnect: disconnectMock
        }
      }

      observe(target) {
        resizeObserverInstance.observe(target)
      }

      disconnect() {
        resizeObserverInstance.disconnect()
      }
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('invalidates map size only when dimensions change after debounce', () => {
    const map = { invalidateSize: vi.fn() }
    const container = document.createElement('div')
    const containerRef = { current: container }

    const { unmount } = renderHook(() =>
      useMapResizeHandler(map, containerRef, 100)
    )

    expect(observeMock).toHaveBeenCalledWith(container)

    act(() => {
      resizeObserverCallback([{ contentRect: { width: 500, height: 400 } }])
      vi.advanceTimersByTime(100)
    })

    expect(map.invalidateSize).toHaveBeenCalledTimes(1)

    act(() => {
      resizeObserverCallback([{ contentRect: { width: 500, height: 400 } }])
      vi.advanceTimersByTime(100)
    })

    expect(map.invalidateSize).toHaveBeenCalledTimes(1)

    act(() => {
      resizeObserverCallback([{ contentRect: { width: 600, height: 400 } }])
      vi.advanceTimersByTime(100)
    })

    expect(map.invalidateSize).toHaveBeenCalledTimes(2)

    unmount()
    expect(disconnectMock).toHaveBeenCalledTimes(1)
  })

  it('cleans up pending timeout on unmount', () => {
    const map = { invalidateSize: vi.fn() }
    const containerRef = { current: document.createElement('div') }
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(() =>
      useMapResizeHandler(map, containerRef, 100)
    )

    act(() => {
      resizeObserverCallback([{ contentRect: { width: 320, height: 200 } }])
    })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(disconnectMock).toHaveBeenCalledTimes(1)
  })
})
