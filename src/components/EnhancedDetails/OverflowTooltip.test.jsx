import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import OverflowTooltip from './OverflowTooltip.jsx'

const { tooltipPropsSpy } = vi.hoisted(() => ({
  tooltipPropsSpy: vi.fn()
}))

let resizeObserverCallback
let disconnectSpy
let originalResizeObserver
let originalRequestAnimationFrame

vi.mock('@mui/material/Tooltip', () => ({
  default: ({ title, disableHoverListener, children }) => {
    tooltipPropsSpy({ title, disableHoverListener })
    return (
      <div
        data-testid="tooltip"
        data-title={title}
        data-disabled={disableHoverListener ? 'true' : 'false'}
      >
        {children}
      </div>
    )
  }
}))

describe('OverflowTooltip', () => {
  beforeEach(() => {
    tooltipPropsSpy.mockClear()
    disconnectSpy = vi.fn()
    originalResizeObserver = global.ResizeObserver
    originalRequestAnimationFrame = global.requestAnimationFrame

    global.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        resizeObserverCallback = callback
      }

      observe() {}

      disconnect() {
        disconnectSpy()
      }
    }

    global.requestAnimationFrame = vi.fn((callback) => {
      callback()
      return 0
    })
  })

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver
    global.requestAnimationFrame = originalRequestAnimationFrame
    vi.restoreAllMocks()
  })

  it('enables the tooltip when the content overflows', () => {
    render(
      <OverflowTooltip className="truncate-value">
        Very long overflowing content
      </OverflowTooltip>
    )

    const content = screen.getByText('Very long overflowing content')
    Object.defineProperty(content, 'clientWidth', {
      configurable: true,
      value: 80
    })
    Object.defineProperty(content, 'scrollWidth', {
      configurable: true,
      value: 160
    })

    act(() => {
      resizeObserverCallback()
    })

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-disabled', 'false')
    expect(tooltip).toHaveAttribute(
      'data-title',
      'Very long overflowing content'
    )
  })

  it('clears overflow state when children become empty', () => {
    const { rerender, unmount } = render(
      <OverflowTooltip className="truncate-value">
        Very long overflowing content
      </OverflowTooltip>
    )

    const content = screen.getByText('Very long overflowing content')
    Object.defineProperty(content, 'clientWidth', {
      configurable: true,
      value: 80
    })
    Object.defineProperty(content, 'scrollWidth', {
      configurable: true,
      value: 160
    })

    act(() => {
      resizeObserverCallback()
    })

    rerender(<OverflowTooltip className="truncate-value">{''}</OverflowTooltip>)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-disabled', 'true')
    expect(tooltip).toHaveAttribute('data-title', '')

    unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })
})
