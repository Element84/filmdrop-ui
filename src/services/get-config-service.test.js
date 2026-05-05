import { beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'

describe('get-config-service signal forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(
      setAppConfig({
        APP_FAVICON: '/favicon.ico'
      })
    )
  })

  it('forwards AbortController signal in LoadConfigIntoStateService fetch options', async () => {
    const controller = new AbortController()
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network down'))
    const { LoadConfigIntoStateService } = await vi.importActual(
      './get-config-service'
    )

    await LoadConfigIntoStateService(controller.signal)

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
})
