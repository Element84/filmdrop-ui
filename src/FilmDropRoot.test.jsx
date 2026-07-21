import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import FilmDropRoot from './FilmDropRoot'
import {
  __resetActiveStoreForTests,
  __resetActiveRouterForTests,
  __resetActiveUrlControllerForTests
} from './testing/runtime-test-hooks'
import {
  getConfigBaseUrl,
  getCacheBusterSuffix,
  setConfigBaseUrl,
  setConfigCacheBuster
} from './utils/configBase'

vi.mock('./services/get-collections-service.js')
vi.mock('./services/get-config-service.js')
vi.mock('./services/get-local-grid-data-json-service.js')

describe('FilmDropRoot public contract', () => {
  beforeEach(() => {
    __resetActiveStoreForTests()
    __resetActiveRouterForTests()
    __resetActiveUrlControllerForTests()
    setConfigBaseUrl(null)
    setConfigCacheBuster('timestamp')
    delete window.__filmdropApplyBranding
    delete window.__filmdropPersistThemePreference
    delete window.__filmdropOnOpenExternal
  })

  afterEach(() => {
    __resetActiveStoreForTests()
    __resetActiveRouterForTests()
    __resetActiveUrlControllerForTests()
  })

  it('renders without crashing with no props', () => {
    const { unmount } = render(<FilmDropRoot />)
    unmount()
  })

  it('throws when urlState is provided without onUrlStateChange', () => {
    expect(() =>
      render(
        <FilmDropRoot
          urlState={{
            collectionId: 'sentinel-2',
            itemId: 'S2-ITEM',
            search: { tab: 'details' }
          }}
        />
      )
    ).toThrow(/urlState requires onUrlStateChange/i)
  })

  it('throws when urlState controlled mode changes after mount in dev/test', () => {
    // import.meta.env.DEV is true under the default Vitest config, so this
    // exercises the dev/test fail-fast branch.
    const onUrlStateChange = vi.fn()
    const { rerender } = render(
      <FilmDropRoot
        urlState={{ collectionId: '', itemId: '', search: {} }}
        onUrlStateChange={onUrlStateChange}
      />
    )

    expect(() => rerender(<FilmDropRoot />)).toThrow(
      /urlState controlled mode changed after mount/i
    )
  })

  it('logs (but does not throw) when urlState controlled mode changes after mount in production', () => {
    vi.stubEnv('DEV', false)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onUrlStateChange = vi.fn()
    const { rerender, unmount } = render(
      <FilmDropRoot
        urlState={{ collectionId: '', itemId: '', search: {} }}
        onUrlStateChange={onUrlStateChange}
      />
    )

    expect(() => rerender(<FilmDropRoot />)).not.toThrow()
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/urlState controlled mode changed after mount/i)
    )

    unmount()
    vi.unstubAllEnvs()
  })

  it('applies configUrl prop to the configBase module', () => {
    const { unmount } = render(<FilmDropRoot configUrl="/embed/" />)
    expect(getConfigBaseUrl()).toBe('/embed/')
    unmount()
  })

  it('clears configBaseUrl on unmount to prevent stale-base inheritance', () => {
    const { unmount } = render(<FilmDropRoot configUrl="/embed/" />)
    unmount()
    expect(getConfigBaseUrl()).toBe(import.meta.env?.BASE_URL || '/')
  })

  it('honours configCacheBuster="none"', () => {
    const { unmount } = render(<FilmDropRoot configCacheBuster="none" />)
    expect(getCacheBusterSuffix()).toBe('')
    unmount()
  })

  it('honours configCacheBuster=<literal revision>', () => {
    const { unmount } = render(<FilmDropRoot configCacheBuster="rev-abc123" />)
    expect(getCacheBusterSuffix()).toBe('?_cb=rev-abc123')
    unmount()
  })

  it('default applyDocumentBranding is true; explicit false flips the flag', () => {
    const { unmount: u1 } = render(<FilmDropRoot />)
    expect(window.__filmdropApplyBranding).toBe(true)
    u1()

    const { unmount: u2 } = render(
      <FilmDropRoot applyDocumentBranding={false} />
    )
    expect(window.__filmdropApplyBranding).toBe(false)
    u2()
  })

  it('default persistThemePreference is true; explicit false flips the flag', () => {
    const { unmount: u1 } = render(<FilmDropRoot />)
    expect(window.__filmdropPersistThemePreference).toBe(true)
    u1()

    const { unmount: u2 } = render(
      <FilmDropRoot persistThemePreference={false} />
    )
    expect(window.__filmdropPersistThemePreference).toBe(false)
    u2()
  })

  it('registers onOpenExternal on window and removes it on unmount', () => {
    const onOpenExternal = vi.fn()
    const { unmount } = render(<FilmDropRoot onOpenExternal={onOpenExternal} />)
    expect(window.__filmdropOnOpenExternal).toBe(onOpenExternal)
    unmount()
    expect(window.__filmdropOnOpenExternal).toBeUndefined()
  })

  it('invokes onError with phase="render" when a child throws', () => {
    const onError = vi.fn()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function Boom() {
      throw new Error('boom')
    }

    act(() => {
      render(
        <FilmDropRoot onError={onError}>
          <Boom />
        </FilmDropRoot>
      )
    })

    expect(onError).toHaveBeenCalled()
    const [err, info] = onError.mock.calls[0]
    expect(err).toBeInstanceOf(Error)
    expect(info).toEqual(
      expect.objectContaining({
        componentStack: expect.any(String),
        phase: 'render'
      })
    )

    errorSpy.mockRestore()
  })
})
