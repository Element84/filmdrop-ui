import React, { memo, useRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LayoutProvider, useLayout } from './LayoutContext'

describe('LayoutContext memoization', () => {
  it('does not re-render memoized consumers when provider re-renders with no state change', () => {
    let consumerRenders = 0

    const Probe = memo(function Probe() {
      // Read context so React subscribes Probe to provider value identity.
      useLayout()
      const renderCount = useRef(0)
      renderCount.current += 1
      consumerRenders = renderCount.current
      return null
    })

    // eslint-disable-next-line react/prop-types -- inline test-only wrapper
    function Wrapper({ unrelated }) {
      return (
        <LayoutProvider>
          <Probe />
          <span data-testid="unrelated">{unrelated}</span>
        </LayoutProvider>
      )
    }

    const { rerender } = render(<Wrapper unrelated="a" />)
    expect(consumerRenders).toBe(1)

    // Re-render the wrapper with unrelated prop change. Provider re-runs, but
    // its memoized `value` is referentially stable, so memoized consumer
    // should not re-render.
    rerender(<Wrapper unrelated="b" />)
    expect(consumerRenders).toBe(1)

    rerender(<Wrapper unrelated="c" />)
    expect(consumerRenders).toBe(1)
  })
})
