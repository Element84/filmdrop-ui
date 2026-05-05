import { beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'
import { getCollections } from './stac-api'

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
})
