import { describe, it, expect, vi, beforeEach } from 'vitest'
import { store } from '../redux/store'
import {
  setSelectedCollectionData,
  setSearchDateRangeValue,
  setQueryableFilters,
  setMosaicCache,
  setappConfig
} from '../redux/slices/mainSlice'
import {
  DEFAULT_DATE_RANGE,
  DEFAULT_MOSAIC_TOP_COMPARE_ITEMS
} from '../components/defaults'
import {
  newSearch,
  validateUploadedGeometry,
  buildUrlParamFromBBOX,
  buildSearchScenesParams,
  buildSearchAggregateParams
} from './searchHelper'
import * as mapHelper from './mapHelper'
import { AddMosaicService } from '../services/post-mosaic-service'
import * as getSearchService from '../services/get-search-service'
import { AggregateSearchService } from '../services/get-aggregate-service'
import { STAC_UPLOAD_ERROR_CONTEXT_LABEL } from './stacErrorHelper'

const DEFAULT_SEARCH_ERROR_SUMMARY = 'Error Fetching Search Results'
const DEFAULT_AGGREGATE_ERROR_SUMMARY =
  'Error Fetching Aggregate Search Results'

vi.mock('../services/post-mosaic-service', () => ({
  AddMosaicService: vi.fn()
}))

vi.mock('../services/get-aggregate-service', () => ({
  AggregateSearchService: vi.fn()
}))

vi.mock('./mapHelper', async () => {
  const actual = await vi.importActual('./mapHelper')
  return {
    ...actual,
    hasMosaicImageLayer: vi.fn(() => true)
  }
})

const mockCollection = {
  id: 'test-collection',
  aggregations: [],
  mosaicTilerParams: {
    assets: ['test-asset']
  }
}

function mockMapBounds(bbox) {
  const [minLng, minLat, maxLng, maxLat] = bbox
  return {
    _southWest: { lng: minLng, lat: minLat },
    _northEast: { lng: maxLng, lat: maxLat }
  }
}

describe('searchHelper newSearch', () => {
  beforeEach(() => {
    store.dispatch(
      setappConfig({
        STAC_API_URL: 'https://example.com/stac',
        MOSAIC_MAX_ITEMS: DEFAULT_MOSAIC_TOP_COMPARE_ITEMS,
        FETCH_CREDENTIALS: 'same-origin',
        APP_TOKEN_AUTH_ENABLED: false
      })
    )
    store.dispatch(
      setSelectedCollectionData({
        ...mockCollection
      })
    )
    store.dispatch(setSearchDateRangeValue(DEFAULT_DATE_RANGE))
    store.dispatch(setQueryableFilters({}))
    store.dispatch(
      setMosaicCache({
        lastMosaicRequestSignature: null,
        lastMosaicTopItemIds: null,
        lastMosaicCompareCount: null
      })
    )
    AddMosaicService.mockReset()
    AggregateSearchService.mockReset()
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockReset()
    mapHelper.hasMosaicImageLayer.mockReset()
    mapHelper.hasMosaicImageLayer.mockReturnValue(true)
  })

  it('creates a mosaic when there is no cache (mosaic view)', async () => {
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds: null,
      effectiveLimit: 0
    })

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(1)
  })

  it('reuses mosaic when signature + compare count + layer all match (first gate)', async () => {
    const itemIds = ['a', 'b', 'c']
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds,
      effectiveLimit: itemIds.length
    })

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(1)

    const [, firstCacheMetadata] = AddMosaicService.mock.calls[0]

    store.dispatch(
      setMosaicCache({
        lastMosaicRequestSignature: firstCacheMetadata.signature,
        lastMosaicTopItemIds: itemIds,
        lastMosaicCompareCount: DEFAULT_MOSAIC_TOP_COMPARE_ITEMS
      })
    )

    AddMosaicService.mockClear()

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(0)
  })

  it('reuses mosaic when top items match cache even though first gate misses due to compare count (second gate)', async () => {
    // Only 3 items returned — compareWindow=3, but compareCount (configured max) = 100.
    // First gate: lastMosaicCompareCount(3) !== compareCount(100) → fails → fetches items.
    // Second gate: lastMosaicCompareCount(3) === compareWindow(3), layer exists, items match → skips.
    const itemIds = ['a', 'b', 'c']
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds,
      effectiveLimit: itemIds.length
    })

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(1)

    const [, firstCacheMetadata] = AddMosaicService.mock.calls[0]
    // compareCount stored by AddMosaicService is compareWindow (3), not the configured max (100)
    expect(firstCacheMetadata.compareCount).toBe(itemIds.length)

    store.dispatch(
      setMosaicCache({
        lastMosaicRequestSignature: firstCacheMetadata.signature,
        lastMosaicTopItemIds: itemIds,
        lastMosaicCompareCount: firstCacheMetadata.compareCount
      })
    )

    AddMosaicService.mockClear()
    // Layer still present; first gate will miss (compareCount 100 ≠ cached 3),
    // second gate must carry the load.
    mapHelper.hasMosaicImageLayer.mockReturnValue(true)

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(0)
  })

  it('rebuilds mosaic when signature matches but mosaic layer is missing', async () => {
    const itemIds = ['a', 'b', 'c']
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds,
      effectiveLimit: itemIds.length
    })

    await newSearch({ viewMode: 'mosaic' })

    const [, firstCacheMetadata] = AddMosaicService.mock.calls[0]

    store.dispatch(
      setMosaicCache({
        lastMosaicRequestSignature: firstCacheMetadata.signature,
        lastMosaicTopItemIds: itemIds,
        lastMosaicCompareCount: itemIds.length
      })
    )

    AddMosaicService.mockClear()
    mapHelper.hasMosaicImageLayer.mockReturnValue(false)

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(1)
  })

  it('rebuilds mosaic when compare count changes even if top items match', async () => {
    const itemIds = ['a', 'b', 'c']
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds,
      effectiveLimit: itemIds.length
    })

    await newSearch({ viewMode: 'mosaic' })

    const [, firstCacheMetadata] = AddMosaicService.mock.calls[0]

    store.dispatch(
      setMosaicCache({
        lastMosaicRequestSignature: firstCacheMetadata.signature,
        lastMosaicTopItemIds: itemIds,
        lastMosaicCompareCount: itemIds.length - 1
      })
    )

    AddMosaicService.mockClear()

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(1)
  })

  it('caps compare count using DEFAULT_MOSAIC_TOP_COMPARE_ITEMS', async () => {
    const longList = Array.from(
      { length: DEFAULT_MOSAIC_TOP_COMPARE_ITEMS + 10 },
      (_, index) => `id-${index}`
    )

    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds: longList,
      effectiveLimit: longList.length
    })

    await newSearch({ viewMode: 'mosaic' })

    const [, cacheMetadata] = AddMosaicService.mock.calls[0]
    expect(cacheMetadata.compareCount).toBe(DEFAULT_MOSAIC_TOP_COMPARE_ITEMS)
  })

  it('returns inline error when fetchTopItemsForMosaic rejects', async () => {
    const normalizedError = {
      error: true,
      status: null,
      code: null,
      summary: DEFAULT_SEARCH_ERROR_SUMMARY,
      details: 'Network error'
    }

    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockRejectedValue(
      normalizedError
    )
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const result = await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(0)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching top items for mosaic comparison',
      normalizedError
    )
    expect(result).toBe(normalizedError)
  })

  it('returns undefined when fetchTopItemsForMosaic aborts', async () => {
    const abortError = Object.assign(new Error('Aborted'), {
      name: 'AbortError'
    })
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockRejectedValue(
      abortError
    )

    const result = await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(0)
    expect(result).toBeUndefined()
  })

  it('propagates inline error for hex view from AggregateSearchService', async () => {
    store.dispatch(
      setSelectedCollectionData({
        ...mockCollection,
        aggregations: [{ name: 'centroid_geohex_grid_frequency' }]
      })
    )

    const normalizedError = {
      error: true,
      status: 400,
      code: 'BadRequest',
      summary: DEFAULT_AGGREGATE_ERROR_SUMMARY,
      details: 'geo coordinates must be numbers'
    }

    AggregateSearchService.mockResolvedValueOnce(normalizedError)

    const result = await newSearch({ viewMode: 'hex' })

    expect(AggregateSearchService).toHaveBeenCalledTimes(1)
    expect(AddMosaicService).toHaveBeenCalledTimes(0)
    expect(result).toBe(normalizedError)
  })

  it('propagates inline error for grid-code view from AggregateSearchService', async () => {
    store.dispatch(
      setSelectedCollectionData({
        ...mockCollection,
        aggregations: [{ name: 'grid_code_frequency' }]
      })
    )

    const normalizedError = {
      error: true,
      status: 400,
      code: 'BadRequest',
      summary: DEFAULT_AGGREGATE_ERROR_SUMMARY,
      details: 'geo coordinates must be numbers'
    }

    AggregateSearchService.mockResolvedValueOnce(normalizedError)

    const result = await newSearch({ viewMode: 'grid-code' })

    expect(AggregateSearchService).toHaveBeenCalledTimes(1)
    expect(AddMosaicService).toHaveBeenCalledTimes(0)
    expect(result).toBe(normalizedError)
  })
})

describe('searchHelper bbox precision', () => {
  describe('buildUrlParamFromBBOX', () => {
    it('returns bbox string with coordinates rounded to 6 decimal places', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            getBounds: () =>
              mockMapBounds([
                -122.123456789012, 37.987654321098, -121.111222333444,
                38.555666777888
              ])
          }
        }
      })
      const result = buildUrlParamFromBBOX()
      expect(result).toBe('-122.123457,37.987654,-121.111222,38.555667')
    })

    it('clamps longitude to -180 and 180', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            getBounds: () => mockMapBounds([-190, 40, 200, 45])
          }
        }
      })
      const result = buildUrlParamFromBBOX()
      expect(result).toBe('-180,40,180,45')
    })

    it('returns empty string when viewport bounds are not available', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(buildUrlParamFromBBOX()).toBe('')
    })

    it('keeps in-range longitudes rounded to 6 decimals', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            getBounds: () =>
              mockMapBounds([-122.123456789, 37.5, -121.999999999, 38.1])
          }
        }
      })
      const result = buildUrlParamFromBBOX()
      const parts = result.split(',')
      expect(parts).toHaveLength(4)
      expect(Number(parts[0])).toBe(-122.123457)
      expect(Number(parts[1])).toBe(37.5)
      expect(Number(parts[2])).toBe(-122)
      expect(Number(parts[3])).toBe(38.1)
    })
  })

  describe('search URL builders omit bbox when bounds are missing', () => {
    it('omits bbox in scene search params when viewport bounds are not available', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          selectedCollectionData: { id: 'test-collection' },
          searchDateRangeValue: [
            '2020-01-01T00:00:00Z',
            '2020-01-02T00:00:00Z'
          ],
          appConfig: {},
          searchGeojsonBoundary: null,
          queryableFilters: {},
          map: null
        }
      })

      const result = buildSearchScenesParams()
      expect(result).not.toContain('bbox=')
    })

    it('omits bbox in aggregate search params when viewport bounds are not available', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          selectedCollectionData: {
            id: 'test-collection',
            aggregations: [{ name: 'centroid_geohex_grid_frequency' }]
          },
          searchDateRangeValue: [
            '2020-01-01T00:00:00Z',
            '2020-01-02T00:00:00Z'
          ],
          appConfig: {},
          searchGeojsonBoundary: null,
          queryableFilters: {},
          map: null
        }
      })

      const result = buildSearchAggregateParams('hex')
      expect(result).not.toContain('bbox=')
    })
  })
})

describe('validateUploadedGeometry', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    store.dispatch(
      setappConfig({
        STAC_API_URL: 'https://example.com/stac',
        FETCH_CREDENTIALS: 'same-origin',
        APP_TOKEN_AUTH_ENABLED: false
      })
    )
    store.dispatch(
      setSelectedCollectionData({
        ...mockCollection
      })
    )
  })

  it('calls SearchService with upload-specific error context', async () => {
    const uploadedFeature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {}
    }
    const searchServiceSpy = vi
      .spyOn(getSearchService, 'SearchService')
      .mockResolvedValueOnce(undefined)

    const result = await validateUploadedGeometry(uploadedFeature)

    expect(result).toBeUndefined()
    expect(searchServiceSpy).toHaveBeenCalledWith(
      expect.stringContaining('intersects='),
      'scene',
      STAC_UPLOAD_ERROR_CONTEXT_LABEL,
      undefined
    )
  })

  it('returns normalized error independent of current view mode and zoom', async () => {
    store.dispatch(
      setSelectedCollectionData({
        ...mockCollection,
        aggregations: [{ name: 'grid_code_frequency' }]
      })
    )
    const uploadedFeature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {}
    }
    const normalizedError = {
      error: true,
      status: 400,
      code: 'BadRequest',
      summary: STAC_UPLOAD_ERROR_CONTEXT_LABEL,
      details: 'geo coordinates must be numbers'
    }

    vi.spyOn(getSearchService, 'SearchService').mockResolvedValueOnce(
      normalizedError
    )

    const result = await validateUploadedGeometry(uploadedFeature)

    expect(result).toEqual(normalizedError)
  })
})
