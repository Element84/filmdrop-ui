import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import FilmDropRoot from './FilmDropRoot'
import { useRuntime, getActiveRuntimeOrNull } from './runtime'
import { resetRuntimeForTests } from './testing/runtime-test-hooks'

vi.mock('./services/get-collections-service.js')
vi.mock('./services/get-config-service.js')
vi.mock('./services/get-local-grid-data-json-service.js')

describe('FilmDropRoot runtime provisioning', () => {
  it('provides runtime context to descendants', () => {
    resetRuntimeForTests()
    let capturedRuntime = null

    function RuntimeReader() {
      capturedRuntime = useRuntime()
      return <div data-testid="runtime-reader">ready</div>
    }

    const { unmount, getByTestId } = render(
      <FilmDropRoot>
        <RuntimeReader />
      </FilmDropRoot>
    )

    expect(getByTestId('runtime-reader').textContent).toBe('ready')
    expect(capturedRuntime).not.toBeNull()
    expect(capturedRuntime.store).toBeTruthy()
    expect(capturedRuntime.router).toBeTruthy()
    expect(capturedRuntime.accessors).toBeTruthy()
    expect(capturedRuntime.accessors.store).toBeTruthy()
    expect(capturedRuntime.accessors.router).toBeTruthy()
    expect(getActiveRuntimeOrNull()).toBe(capturedRuntime)

    unmount()
  })

  it('keeps runtime containers isolated across two mounted roots', () => {
    resetRuntimeForTests()
    const seen = []

    function createRuntimeReader(label) {
      return function RuntimeReader() {
        const runtime = useRuntime()
        seen.push({ label, runtime })
        return <div>{label}</div>
      }
    }

    const FirstRuntimeReader = createRuntimeReader('first')
    const SecondRuntimeReader = createRuntimeReader('second')

    const first = render(
      <FilmDropRoot>
        <FirstRuntimeReader />
      </FilmDropRoot>
    )
    const firstRuntime = seen.find((x) => x.label === 'first')?.runtime

    const second = render(
      <FilmDropRoot>
        <SecondRuntimeReader />
      </FilmDropRoot>
    )
    const secondRuntime = seen.find((x) => x.label === 'second')?.runtime

    expect(firstRuntime).toBeTruthy()
    expect(secondRuntime).toBeTruthy()
    expect(firstRuntime).not.toBe(secondRuntime)
    expect(firstRuntime.store).not.toBe(secondRuntime.store)
    expect(firstRuntime.router).not.toBe(secondRuntime.router)

    second.unmount()
    expect(getActiveRuntimeOrNull()).toBe(firstRuntime)

    first.unmount()
    expect(getActiveRuntimeOrNull()).toBeNull()
  })
})
