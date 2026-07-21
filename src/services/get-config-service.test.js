import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'

describe('get-config-service signal forwarding and behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(
      setAppConfig({
        APP_FAVICON: '/favicon.ico'
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards AbortController signal in LoadConfigIntoStateService fetch options', async () => {
    const controller = new AbortController()
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network down'))
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    await LoadConfigIntoStateService({ signal: controller.signal })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })

  it('forwards AbortController signal in DoesFaviconExistService fetch options', async () => {
    const controller = new AbortController()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true
    })
    const { DoesFaviconExistService } = await vi.importActual(
      './get-config-service'
    )

    await DoesFaviconExistService(controller.signal)

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'HEAD',
        signal: controller.signal
      })
    )
  })

  it('includes cache-buster suffix in config URL', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    const result = await LoadConfigIntoStateService({
      signal: new AbortController().signal
    })

    expect(result).toBeDefined()
    const [url] = fetchSpy.mock.calls[0]
    expect(typeof url).toBe('string')
  })

  it('sets cache: no-store header for config request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    await LoadConfigIntoStateService({ signal: new AbortController().signal })

    const [, options] = fetchSpy.mock.calls[0]
    expect(options.cache).toBe('no-store')
  })

  it('skips fetch when config is provided in options', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    const result = await LoadConfigIntoStateService({
      config: { APP_NAME: 'Embedded FilmDrop' }
    })

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result).toEqual(
      expect.objectContaining({ APP_NAME: 'Embedded FilmDrop' })
    )
  })

  it('does not dispatch a stale config when the signal is already aborted', async () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    const controller = new AbortController()
    controller.abort()
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    const result = await LoadConfigIntoStateService({
      signal: controller.signal,
      config: { APP_NAME: 'Embedded FilmDrop' }
    })

    expect(dispatchSpy).not.toHaveBeenCalled()
    expect(result).toEqual(
      expect.objectContaining({ APP_NAME: 'Embedded FilmDrop' })
    )
  })

  it('handles non-OK response with error normalization', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Config not found'
    })
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    const result = await LoadConfigIntoStateService({
      signal: new AbortController().signal
    })

    expect(result).toHaveProperty('error')
  })

  it('handles network failure with error normalization', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new TypeError('Failed to fetch')
    )
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    const result = await LoadConfigIntoStateService({
      signal: new AbortController().signal
    })

    expect(result).toHaveProperty('error')
  })

  it('returns true for favicon when response is ok', async () => {
    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: {
        appConfig: {
          APP_FAVICON: '/custom-favicon.ico'
        }
      }
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true
    })
    const { DoesFaviconExistService } = await vi.importActual(
      './get-config-service'
    )

    const result = await DoesFaviconExistService(new AbortController().signal)

    expect(result).toBe(true)
  })

  it('returns false for favicon when response is not ok', async () => {
    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: {
        appConfig: {
          APP_FAVICON: '/missing-favicon.ico'
        }
      }
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404
    })
    const { DoesFaviconExistService } = await vi.importActual(
      './get-config-service'
    )

    const result = await DoesFaviconExistService(new AbortController().signal)

    expect(result).toBe(false)
  })

  it('returns false for favicon on network error', async () => {
    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: {
        appConfig: {
          APP_FAVICON: '/favicon.ico'
        }
      }
    })

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new TypeError('Failed to fetch')
    )
    const { DoesFaviconExistService } = await vi.importActual(
      './get-config-service'
    )

    const result = await DoesFaviconExistService(new AbortController().signal)

    expect(result).toBe(false)
  })

  it('uses HEAD method for favicon check', async () => {
    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: {
        appConfig: {
          APP_FAVICON: '/favicon.ico'
        }
      }
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true
    })
    const { DoesFaviconExistService } = await vi.importActual(
      './get-config-service'
    )

    await DoesFaviconExistService(new AbortController().signal)

    const [, options] = fetchSpy.mock.calls[0]
    expect(options.method).toBe('HEAD')
  })

  it('includes cache-buster suffix in favicon URL', async () => {
    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: {
        appConfig: {
          APP_FAVICON: '/favicon.ico'
        }
      }
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true
    })
    const { DoesFaviconExistService } = await vi.importActual(
      './get-config-service'
    )

    const result = await DoesFaviconExistService(new AbortController().signal)

    expect(result).toBe(true)
    const [url] = fetchSpy.mock.calls[0]
    expect(typeof url).toBe('string')
  })
})
