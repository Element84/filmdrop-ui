import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResizablePanel } from './useResizablePanel'

const {
  useLayoutMock,
  useSelectorMock,
  useDebouncedCallbackMock,
  updateLeftPanelWidthMock,
  updateEnhancedColumnsMock
} = vi.hoisted(() => ({
  useLayoutMock: vi.fn(),
  useSelectorMock: vi.fn(),
  useDebouncedCallbackMock: vi.fn(),
  updateLeftPanelWidthMock: vi.fn(),
  updateEnhancedColumnsMock: vi.fn()
}))

vi.mock('../contexts/LayoutContext', () => ({
  useLayout: useLayoutMock
}))

vi.mock('react-redux', () => ({
  useSelector: useSelectorMock
}))

vi.mock('./useDebouncedCallback', () => ({
  useDebouncedCallback: useDebouncedCallbackMock
}))

describe('useResizablePanel', () => {
  let resizeObserverCallback
  let observeMock
  let disconnectMock

  beforeEach(() => {
    vi.clearAllMocks()

    useLayoutMock.mockReturnValue({
      leftPanelWidth: 340,
      updateLeftPanelWidth: updateLeftPanelWidthMock,
      updateEnhancedColumns: updateEnhancedColumnsMock
    })
    useSelectorMock.mockImplementation((selector) =>
      selector({ mainSlice: { appConfig: { RIGHT_SIDEBAR_ENABLED: false } } })
    )
    useDebouncedCallbackMock.mockImplementation((callback) => callback)

    observeMock = vi.fn()
    disconnectMock = vi.fn()
    global.ResizeObserver = class {
      constructor(callback) {
        resizeObserverCallback = callback
      }

      observe(target) {
        observeMock(target)
      }

      disconnect() {
        disconnectMock()
      }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('observes panel size and updates initial/enqueued column calculations', () => {
    const panelRef = { current: { offsetWidth: 500 } }

    const { unmount, result } = renderHook(() => useResizablePanel(panelRef))

    expect(result.current.currentWidth).toBe(340)
    expect(observeMock).toHaveBeenCalledWith(panelRef.current)
    expect(updateEnhancedColumnsMock).toHaveBeenCalledWith(2)

    act(() => {
      resizeObserverCallback([{ contentRect: { width: 750 } }])
    })

    expect(updateEnhancedColumnsMock).toHaveBeenCalledWith(3)

    unmount()
    expect(disconnectMock).toHaveBeenCalledTimes(1)
  })

  it('resizes from mouse drag and restores body styles on mouseup', () => {
    const panelRef = { current: { offsetWidth: 400 } }
    const { result } = renderHook(() => useResizablePanel(panelRef))

    const downEvent = {
      preventDefault: vi.fn(),
      clientX: 100
    }

    act(() => {
      result.current.handleMouseDown(downEvent)
    })

    expect(downEvent.preventDefault).toHaveBeenCalled()
    expect(document.body.style.cursor).toBe('ew-resize')
    expect(document.body.style.userSelect).toBe('none')

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200 }))
    })

    expect(updateLeftPanelWidthMock).toHaveBeenCalledWith(440)

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    })

    expect(document.body.style.cursor).toBe('')
    expect(document.body.style.userSelect).toBe('')
  })

  it('applies inverse drag direction when right sidebar is enabled', () => {
    useSelectorMock.mockImplementation((selector) =>
      selector({ mainSlice: { appConfig: { RIGHT_SIDEBAR_ENABLED: true } } })
    )

    const panelRef = { current: { offsetWidth: 400 } }
    const { result } = renderHook(() => useResizablePanel(panelRef))

    act(() => {
      result.current.handleMouseDown({ preventDefault: vi.fn(), clientX: 300 })
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 360 }))
      document.dispatchEvent(new MouseEvent('mouseup'))
    })

    expect(updateLeftPanelWidthMock).toHaveBeenCalledWith(280)
  })

  it('clamps width between minimum and maximum bounds', () => {
    const panelRef = { current: { offsetWidth: 400 } }
    const { result } = renderHook(() => useResizablePanel(panelRef))

    act(() => {
      result.current.handleMouseDown({ preventDefault: vi.fn(), clientX: 0 })
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -1000 }))
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 2000 }))
      document.dispatchEvent(new MouseEvent('mouseup'))
    })

    expect(updateLeftPanelWidthMock).toHaveBeenCalledWith(280)
    expect(updateLeftPanelWidthMock).toHaveBeenCalledWith(1200)
  })
})
