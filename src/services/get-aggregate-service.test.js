import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AggregateSearchService } from './get-aggregate-service'
import { store } from '../redux/store'
import { setappConfig } from '../redux/slices/mainSlice'
import * as searchHelper from '../utils/searchHelper'
import * as mapHelper from '../utils/mapHelper'

const DEFAULT_AGGREGATE_ERROR_SUMMARY =
  'Error Fetching Aggregate Search Results'

global.fetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  store.dispatch(
    setappConfig({
      STAC_API_URL: 'https://stac-api.example.com',
      APP_TOKEN_AUTH_ENABLED: false,
      FETCH_CREDENTIALS: 'same-origin'
    })
  )
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AggregateSearchService error handling', () => {
  it('returns undefined on successful hex aggregate and still updates map layer', async () => {
    const searchParams = 'collections=demo&limit=10'
    const responseJson = { aggregations: [] }
    const mappedGrid = {
      type: 'FeatureCollection',
      features: [],
      properties: { largestRatio: 1 }
    }
    const layerOptions = { style: {} }

    vi.spyOn(searchHelper, 'mapHexGridFromJson').mockReturnValue(mappedGrid)
    vi.spyOn(mapHelper, 'buildHexGridLayerOptions').mockReturnValue(
      layerOptions
    )
    const addDataSpy = vi
      .spyOn(mapHelper, 'addDataToLayer')
      .mockImplementation(() => {})

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseJson
    })

    const result = await AggregateSearchService(searchParams, 'hex')

    expect(result).toBeUndefined()
    expect(addDataSpy).toHaveBeenCalledWith(
      mappedGrid,
      'searchResultsLayer',
      layerOptions,
      true
    )
  })

  it('returns normalized error for non-OK JSON and unquotes description', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const searchParams = 'collections=demo&limit=10'
    const errorBody = {
      code: 'BadRequest',
      description: '"geo coordinates must be numbers"'
    }

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify(errorBody)
    })

    const result = await AggregateSearchService(searchParams, 'hex')

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        code: errorBody.code,
        summary: DEFAULT_AGGREGATE_ERROR_SUMMARY,
        details: 'geo coordinates must be numbers'
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error Fetching Aggregate Search Results',
      expect.objectContaining({
        error: true,
        status: 400
      })
    )
  })

  it('returns normalized network error when fetch rejects', async () => {
    const searchParams = 'collections=demo&limit=10'

    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const result = await AggregateSearchService(searchParams, 'hex')

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: null,
        code: null,
        summary: DEFAULT_AGGREGATE_ERROR_SUMMARY,
        details: 'Network error'
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error Fetching Aggregate Search Results',
      expect.objectContaining({
        error: true,
        status: null
      })
    )
  })

  it('returns undefined on fetch abort without normalizing', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const searchParams = 'collections=demo&limit=10'
    const abortError = Object.assign(new Error('Aborted'), {
      name: 'AbortError'
    })

    global.fetch.mockRejectedValueOnce(abortError)

    const controller = new AbortController()
    const result = await AggregateSearchService(
      searchParams,
      'hex',
      DEFAULT_AGGREGATE_ERROR_SUMMARY,
      controller.signal
    )

    expect(result).toBeUndefined()
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
