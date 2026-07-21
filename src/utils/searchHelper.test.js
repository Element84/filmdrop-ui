import { describe, it, expect, vi, beforeEach } from 'vitest'
import { store } from '../redux/store'
import {
  setSelectedCollectionData,
  setSelectedVisualization,
  setSearchDateRangeValue,
  setQueryableFilters,
  setMosaicCache,
  setAppConfig
} from '../redux/slices/mainSlice'
import {
  DEFAULT_DATE_RANGE,
  DEFAULT_MOSAIC_TOP_COMPARE_ITEMS
} from '../constants/defaults'
import {
  newSearch,
  clearSearch,
  validateUploadedGeometry,
  buildUrlParamFromBBOX,
  buildSearchScenesParams,
  buildSearchAggregateParams
} from './searchHelper'
import * as mapLayers from './mapLayers'
import { AddMosaicService } from '../services/post-mosaic-service'
import * as getSearchService from '../services/get-search-service'
import { AggregateSearchService } from '../services/get-aggregate-service'
import { STAC_UPLOAD_ERROR_CONTEXT_LABEL } from './stacErrorHelper'
import { __resetActiveUrlControllerForTests } from '../url-controller'

const DEFAULT_SEARCH_ERROR_SUMMARY = 'Error Fetching Search Results'
const DEFAULT_AGGREGATE_ERROR_SUMMARY =
  'Error Fetching Aggregate Search Results'

vi.mock('../services/post-mosaic-service', () => ({
  AddMosaicService: vi.fn()
}))

vi.mock('../services/get-aggregate-service', () => ({
  AggregateSearchService: vi.fn()
}))

vi.mock('./mapLayers', async () => {
  const actual = await vi.importActual('./mapLayers')
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
      setAppConfig({
        STAC_API_URL: 'https://example.com/stac',
        MOSAIC_MAX_ITEMS: DEFAULT_MOSAIC_TOP_COMPARE_ITEMS,
        FETCH_CREDENTIALS: 'same-origin',
        APP_TOKEN_AUTH_ENABLED: false,
        COLLECTIONS_CONFIG: {
          'test-collection': {
            mosaicTilerParams: {
              assets: ['test-asset']
            }
          }
        }
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
    mapLayers.hasMosaicImageLayer.mockReset()
    mapLayers.hasMosaicImageLayer.mockReturnValue(true)
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
    mapLayers.hasMosaicImageLayer.mockReturnValue(true)

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
    mapLayers.hasMosaicImageLayer.mockReturnValue(false)

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

  it('derives mosaic asset_name from selected visualization when mosaicTilerParams are missing', async () => {
    store.dispatch(
      setAppConfig({
        STAC_API_URL: 'https://example.com/stac',
        MOSAIC_MAX_ITEMS: DEFAULT_MOSAIC_TOP_COMPARE_ITEMS,
        FETCH_CREDENTIALS: 'same-origin',
        APP_TOKEN_AUTH_ENABLED: false,
        COLLECTIONS_CONFIG: {
          'test-collection': {
            visualizations: {
              'true-color': { assets: ['visual'] },
              vegetation: { assets: ['nir', 'red', 'green'] }
            }
          }
        }
      })
    )
    store.dispatch(setSelectedVisualization('vegetation'))

    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds: null,
      effectiveLimit: 0
    })

    await newSearch({ viewMode: 'mosaic' })

    const [requestOptions] = AddMosaicService.mock.calls[0]
    const body = JSON.parse(requestOptions.body)
    expect(body.asset_name).toBe('green')
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

  it('returns early when no collection is selected', async () => {
    store.dispatch(setSelectedCollectionData(null))
    const searchServiceSpy = vi.spyOn(getSearchService, 'SearchService')

    const result = await newSearch({ viewMode: 'scene' })

    expect(result).toBeUndefined()
    expect(searchServiceSpy).not.toHaveBeenCalled()
    expect(AggregateSearchService).not.toHaveBeenCalled()
    expect(AddMosaicService).not.toHaveBeenCalled()
  })

  it('falls back to scene search when selected view mode is unsupported by collection aggregations', async () => {
    store.dispatch(
      setSelectedCollectionData({
        ...mockCollection,
        aggregations: []
      })
    )

    const searchServiceSpy = vi
      .spyOn(getSearchService, 'SearchService')
      .mockResolvedValueOnce(undefined)

    const result = await newSearch({ viewMode: 'hex' })

    expect(result).toBeUndefined()
    expect(AggregateSearchService).not.toHaveBeenCalled()
    expect(searchServiceSpy).toHaveBeenCalledTimes(1)
    expect(searchServiceSpy).toHaveBeenCalledWith(
      expect.any(String),
      'scene',
      undefined,
      undefined
    )
  })

  it('shows zoom notice and skips scene search when below sceneMinZoom', async () => {
    store.dispatch(
      setAppConfig({
        STAC_API_URL: 'https://example.com/stac',
        MOSAIC_MAX_ITEMS: DEFAULT_MOSAIC_TOP_COMPARE_ITEMS,
        FETCH_CREDENTIALS: 'same-origin',
        APP_TOKEN_AUTH_ENABLED: false,
        COLLECTIONS_CONFIG: {
          'test-collection': {
            sceneMinZoom: 9,
            mosaicTilerParams: {
              assets: ['test-asset']
            }
          }
        }
      })
    )

    vi.spyOn(mapLayers, 'getCurrentMapZoomLevel').mockReturnValue(3)
    const searchServiceSpy = vi.spyOn(getSearchService, 'SearchService')

    const result = await newSearch({ viewMode: 'scene' })

    expect(result).toBeUndefined()
    expect(searchServiceSpy).not.toHaveBeenCalled()
    expect(store.getState().mainSlice.showZoomNotice).toBe(true)
    expect(store.getState().mainSlice.zoomLevelNeeded).toBe(9)
  })

  it('runs scene search when at or above sceneMinZoom', async () => {
    store.dispatch(
      setAppConfig({
        STAC_API_URL: 'https://example.com/stac',
        MOSAIC_MAX_ITEMS: DEFAULT_MOSAIC_TOP_COMPARE_ITEMS,
        FETCH_CREDENTIALS: 'same-origin',
        APP_TOKEN_AUTH_ENABLED: false,
        COLLECTIONS_CONFIG: {
          'test-collection': {
            sceneMinZoom: 9,
            mosaicTilerParams: {
              assets: ['test-asset']
            }
          }
        }
      })
    )

    vi.spyOn(mapLayers, 'getCurrentMapZoomLevel').mockReturnValue(10)
    const searchServiceSpy = vi
      .spyOn(getSearchService, 'SearchService')
      .mockResolvedValueOnce(undefined)

    const result = await newSearch({ viewMode: 'scene' })

    expect(result).toBeUndefined()
    expect(searchServiceSpy).toHaveBeenCalledTimes(1)
    expect(searchServiceSpy).toHaveBeenCalledWith(
      expect.any(String),
      'scene',
      undefined,
      undefined
    )
  })

  it('does not throw when syncing search state after FilmDropRoot has unmounted', async () => {
    // newSearch runs via debounceNewSearch, so it can resolve after
    // FilmDropRoot has already unmounted and torn down the URL controller.
    __resetActiveUrlControllerForTests()
    vi.spyOn(getSearchService, 'fetchTopItemsForMosaic').mockResolvedValue({
      itemIds: null,
      effectiveLimit: 0
    })

    await newSearch({ viewMode: 'mosaic' })

    expect(AddMosaicService).toHaveBeenCalledTimes(1)
  })

  it('clearSearch does not throw without a mounted URL controller', () => {
    __resetActiveUrlControllerForTests()

    expect(() => clearSearch()).not.toThrow()
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
      setAppConfig({
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
