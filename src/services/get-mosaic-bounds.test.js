import { describe, it, expect, vi, beforeEach } from 'vitest'
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
})
