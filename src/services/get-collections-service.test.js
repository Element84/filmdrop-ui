import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'
import { getCollections } from './stac-api'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'

vi.mock('./stac-api', () => ({
  getCollections: vi.fn()
}))

vi.mock('../utils/dataHelper', () => ({
  buildCollectionsData: vi.fn(async () => ({ demo: { id: 'demo' } })),
  loadLocalGridData: vi.fn()
}))

describe('GetCollectionsService signal forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(
      setAppConfig({
        STAC_API_URL: 'https://stac-api.example.com',
        FETCH_CREDENTIALS: 'same-origin',
        COLLECTIONS: {}
      })
    )
    vi.mocked(getCollections).mockResolvedValue({
      collections: [{ id: 'demo' }]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards AbortController signal to getCollections options', async () => {
    const controller = new AbortController()
    const { GetCollectionsService } = await vi.importActual(
      './get-collections-service'
    )

    await GetCollectionsService(undefined, controller.signal)

    expect(getCollections).toHaveBeenCalledWith(
      'https://stac-api.example.com',
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })

  it('stores formatted collections and reports the collection count on success', async () => {
    const { GetCollectionsService } = await vi.importActual(
      './get-collections-service'
    )

    const result = await GetCollectionsService()

    expect(buildCollectionsData).toHaveBeenCalledWith({
      collections: [{ id: 'demo' }]
    })
    expect(loadLocalGridData).toHaveBeenCalled()
    expect(result).toEqual({ error: false, collectionsCount: 1 })
    expect(store.getState().mainSlice.collectionsData).toEqual({
      demo: { id: 'demo' }
    })
    expect(store.getState().mainSlice.collectionsLoadError).toBe(false)
    expect(store.getState().mainSlice.showAppLoading).toBe(false)
  })

  it('filters auto-configured collections using COLLECTIONS._ids before formatting', async () => {
    store.dispatch(
      setAppConfig({
        STAC_API_URL: 'https://stac-api.example.com',
        FETCH_CREDENTIALS: 'same-origin',
        COLLECTIONS: {
          _ids: ['demo']
        }
      })
    )
    vi.mocked(getCollections).mockResolvedValue({
      collections: [{ id: 'demo' }, { id: 'other' }]
    })

    const { GetCollectionsService } = await vi.importActual(
      './get-collections-service'
    )

    await GetCollectionsService()

    expect(buildCollectionsData).toHaveBeenCalledWith({
      collections: [{ id: 'demo' }]
    })
  })

  it('returns a normalized error and sets failure state when fetching collections fails', async () => {
    vi.mocked(getCollections).mockRejectedValueOnce(new Error('network down'))
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const { GetCollectionsService } = await vi.importActual(
      './get-collections-service'
    )

    const result = await GetCollectionsService()

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        summary: 'Error Fetching Collections'
      })
    )
    expect(store.getState().mainSlice.collectionsData).toEqual([])
    expect(store.getState().mainSlice.collectionsLoadError).toBe(true)
    expect(store.getState().mainSlice.showAppLoading).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
