import React from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import {
  RuntimeContext,
  useRuntime,
  setActiveRuntime,
  getActiveRuntimeOrNull
} from './runtime'
import { __resetActiveRuntimeForTests } from './testing/runtime-test-hooks'

describe('runtime container', () => {
  it('throws if useRuntime is called outside RuntimeContext', () => {
    __resetActiveRuntimeForTests()

    function Reader() {
      useRuntime()
      return null
    }

    expect(() => render(React.createElement(Reader))).toThrow(
      /useRuntime must be used within FilmDropRoot/
    )
  })

  it('returns context value when RuntimeContext is provided', () => {
    __resetActiveRuntimeForTests()
    const runtime = { store: {}, router: {}, accessors: {} }

    function Reader() {
      const current = useRuntime()
      return React.createElement(
        'div',
        { 'data-testid': 'runtime-ok' },
        String(current === runtime)
      )
    }

    const result = render(
      React.createElement(
        RuntimeContext.Provider,
        { value: runtime },
        React.createElement(Reader)
      )
    )

    expect(result.getByTestId('runtime-ok').textContent).toBe('true')
  })

  it('tracks active runtime with mount/unmount refcount semantics', () => {
    __resetActiveRuntimeForTests()
    const runtimeA = { id: 'A' }
    const runtimeB = { id: 'B' }

    setActiveRuntime(runtimeA, { action: 'mount' })
    expect(getActiveRuntimeOrNull()).toBe(runtimeA)

    setActiveRuntime(runtimeB, { action: 'mount' })
    expect(getActiveRuntimeOrNull()).toBe(runtimeB)

    setActiveRuntime(runtimeB, { action: 'unmount' })
    expect(getActiveRuntimeOrNull()).toBe(runtimeA)

    setActiveRuntime(runtimeA, { action: 'unmount' })
    expect(getActiveRuntimeOrNull()).toBeNull()
  })
})
