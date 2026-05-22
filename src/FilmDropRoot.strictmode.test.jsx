import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import FilmDropRoot from './FilmDropRoot'
import { getActiveStore } from './redux/store'
import { getActiveRouter } from './router'
import { getActiveRouterOrNull } from './router-test-hooks'
import {
  __resetActiveStoreForTests,
  __resetActiveRouterForTests
} from './testing/runtime-test-hooks'
import { getConfigBaseUrl, setConfigBaseUrl } from './utils/configBase'

// Ensure services LoadConfigIntoStateService etc. are mocked for this file;
// setupTests.js already mocks them globally, but this file runs in isolation.
vi.mock('./services/get-collections-service.js')
vi.mock('./services/get-config-service.js')
vi.mock('./services/get-local-grid-data-json-service.js')

describe('FilmDropRoot lifecycle', () => {
  afterEach(() => {
    __resetActiveStoreForTests()
    __resetActiveRouterForTests()
  })

  it('keeps getActiveStore / getActiveRouter live through mount → unmount → remount', () => {
    __resetActiveStoreForTests()
    __resetActiveRouterForTests()

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // First mount (StrictMode double-invokes effects in dev)
    const { unmount: unmount1 } = render(
      <React.StrictMode>
        <FilmDropRoot />
      </React.StrictMode>
    )

    expect(getActiveStore()).not.toBeNull()
    expect(getActiveRouter()).not.toBeNull()

    unmount1()

    expect(getActiveStore()).toBeNull()
    expect(getActiveRouterOrNull()).toBeNull()
    expect(getActiveRouter()).not.toBeNull()

    __resetActiveStoreForTests()
    __resetActiveRouterForTests()

    const { unmount: unmount2 } = render(
      <React.StrictMode>
        <FilmDropRoot />
      </React.StrictMode>
    )

    expect(getActiveStore()).not.toBeNull()
    expect(getActiveRouter()).not.toBeNull()

    unmount2()

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('clears configBaseUrl on unmount so subsequent mounts do not inherit a stale base', () => {
    __resetActiveStoreForTests()
    __resetActiveRouterForTests()
    setConfigBaseUrl(null)

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { unmount: unmount1 } = render(<FilmDropRoot configUrl="/host-a/" />)
    expect(getConfigBaseUrl()).toBe('/host-a/')
    unmount1()

    __resetActiveStoreForTests()
    __resetActiveRouterForTests()

    // Second mount without configUrl must NOT inherit /host-a/
    const { unmount: unmount2 } = render(<FilmDropRoot />)
    expect(getConfigBaseUrl()).not.toBe('/host-a/')
    unmount2()

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
