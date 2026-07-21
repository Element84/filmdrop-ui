import React, { memo, useRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  EnhancedDetailsProvider,
  useEnhancedDetails
} from './EnhancedDetailsContext'

describe('EnhancedDetailsContext memoization', () => {
  it('does not re-render memoized consumers when provider re-renders with no state change', () => {
    let consumerRenders = 0

    const Probe = memo(function Probe() {
      // Read context so React subscribes Probe to provider value identity.
      useEnhancedDetails()
      const renderCount = useRef(0)
      renderCount.current += 1
      consumerRenders = renderCount.current
      return null
    })

    const item = { id: 'item-1' }
    const enhancedColumns = { foo: 'bar' }
    const appConfig = { APP_NAME: 'test' }

    // eslint-disable-next-line react/prop-types -- inline test-only wrapper
    function Wrapper({ unrelated }) {
      return (
        <EnhancedDetailsProvider
          item={item}
          enhancedColumns={enhancedColumns}
          appConfig={appConfig}
        >
          <Probe />
          <span data-testid="unrelated">{unrelated}</span>
        </EnhancedDetailsProvider>
      )
    }

    const { rerender } = render(<Wrapper unrelated="a" />)
    expect(consumerRenders).toBe(1)

    // Re-render with an unrelated prop change. Provider re-runs, but its
    // memoized `value` is referentially stable, so the memoized consumer
    // should not re-render.
    rerender(<Wrapper unrelated="b" />)
    expect(consumerRenders).toBe(1)

    rerender(<Wrapper unrelated="c" />)
    expect(consumerRenders).toBe(1)
  })
})
