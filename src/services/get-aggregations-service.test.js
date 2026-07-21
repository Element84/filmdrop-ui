import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { GetCollectionAggregationsService } from './get-aggregations-service'
import { createHeaderValidationTest } from '../testing/service-headers-factory'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'

const controller = new AbortController()

createHeaderValidationTest(
  'GetCollectionAggregationsService',
  GetCollectionAggregationsService,
  { aggregations: [] },
  ['test-collection', controller.signal],
  { expectedSignal: controller.signal }
)

describe('GetCollectionAggregationsService behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(
      setAppConfig({
        STAC_API_URL: 'https://stac-api.example.com',
        FETCH_CREDENTIALS: 'same-origin'
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns aggregation list on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ aggregations: ['datetime', 'eo:cloud_cover'] })
    })

    const result = await GetCollectionAggregationsService('test-collection')

    expect(result).toEqual(['datetime', 'eo:cloud_cover'])
  })

  it('returns normalized error on non-OK response', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Aggregation lookup failed'
    })

    const result = await GetCollectionAggregationsService('test-collection')

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        summary: 'Error Fetching Aggregations for: test-collection'
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('returns undefined for abort errors', async () => {
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    global.fetch = vi.fn().mockRejectedValue(abortError)

    const result = await GetCollectionAggregationsService('test-collection')

    expect(result).toBeUndefined()
  })
})
