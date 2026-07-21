import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { GetMosaicBoundsService } from './get-mosaic-bounds'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'

describe('GetMosaicBoundsService signal forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(
      setAppConfig({
        FETCH_CREDENTIALS: 'same-origin'
      })
    )
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bounds: [0, 1, 2, 3] })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards AbortController signal to fetch', async () => {
    const controller = new AbortController()

    await GetMosaicBoundsService(
      'https://example.com/mosaic.json',
      controller.signal
    )

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/mosaic.json',
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })

  it('resolves bounds array on successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bounds: [-10, -5, 10, 5] })
    })

    const result = await GetMosaicBoundsService(
      'https://example.com/mosaic.json'
    )

    expect(result).toEqual([-10, -5, 10, 5])
  })

  it('rejects with normalized error object for non-OK responses', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Mosaic endpoint failed'
    })

    await expect(
      GetMosaicBoundsService('https://example.com/mosaic.json')
    ).rejects.toEqual(
      expect.objectContaining({
        error: true,
        summary: 'Error Fetching Mosaicjson Tile Results'
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
