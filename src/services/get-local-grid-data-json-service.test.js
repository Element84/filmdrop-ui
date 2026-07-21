import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { store } from '../redux/store'
import { mainSliceReset, setLocalGridData } from '../redux/slices/mainSlice'

describe('LoadLocalGridDataService signal forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(mainSliceReset())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards AbortController signal in local grid fetch options', async () => {
    const controller = new AbortController()
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network down'))
    const { LoadLocalGridDataService } = await vi.importActual(
      './get-local-grid-data-json-service'
    )

    await LoadLocalGridDataService('mgrs', controller.signal)

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })

  it('stores fetched local grid data under uppercase key', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ type: 'FeatureCollection', features: [] })
    })
    const { LoadLocalGridDataService } = await vi.importActual(
      './get-local-grid-data-json-service'
    )

    await LoadLocalGridDataService('mgrs')

    expect(store.getState().mainSlice.localGridData).toEqual(
      expect.objectContaining({
        MGRS: { type: 'FeatureCollection', features: [] }
      })
    )
  })

  it('logs normalized errors when local grid fetch fails', async () => {
    store.dispatch(setLocalGridData({}))
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'grid not found'
    })
    const { LoadLocalGridDataService } = await vi.importActual(
      './get-local-grid-data-json-service'
    )

    await LoadLocalGridDataService('mgrs')

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error Fetching Local Grid Data',
      expect.objectContaining({
        error: true,
        summary: 'Error Fetching Local Grid Data'
      })
    )
  })
})
