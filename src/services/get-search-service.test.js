import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SearchService, fetchTopItemsForMosaic } from './get-search-service'
import { store } from '../redux/store'
import { setappConfig } from '../redux/slices/mainSlice'

const DEFAULT_SEARCH_ERROR_SUMMARY = 'Error Fetching Search Results'
const DEFAULT_MOSAIC_TOP_ITEMS_ERROR_SUMMARY =
  'Error fetching top items for mosaic'

global.fetch = vi.fn()

const mockStacApiUrl = 'https://stac-api.example.com'

beforeEach(() => {
  vi.clearAllMocks()
  store.dispatch(
    setappConfig({
      STAC_API_URL: mockStacApiUrl,
      APP_TOKEN_AUTH_ENABLED: false,
      FETCH_CREDENTIALS: 'same-origin'
    })
  )
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SearchService error handling', () => {
  it('returns normalized error object for non-OK JSON error response', async () => {
    const searchParams = 'collections=demo&limit=10'
    const errorBody = {
      code: 'InvalidQuery',
      message: 'Invalid geometry',
      detail: 'Geometry must be within valid bounds'
    }

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify(errorBody)
    })

    const result = await SearchService(searchParams, 'scene')

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        code: errorBody.code,
        summary: DEFAULT_SEARCH_ERROR_SUMMARY,
        details: errorBody.message
      })
    )
  })

  it('returns normalized error object for non-OK plain text error response', async () => {
    const searchParams = 'collections=demo&limit=10'
    const bodyText = 'Bad Request'

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => bodyText
    })

    const result = await SearchService(searchParams, 'scene')

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        summary: DEFAULT_SEARCH_ERROR_SUMMARY,
        code: null,
        details: bodyText
      })
    )
  })

  it('returns normalized network error when fetch rejects', async () => {
    const searchParams = 'collections=demo&limit=10'

    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await SearchService(searchParams, 'scene')

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: null,
        summary: DEFAULT_SEARCH_ERROR_SUMMARY,
        code: null,
        details: 'Network error'
      })
    )
  })

  it('returns undefined on fetch abort without logging normalized error', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const searchParams = 'collections=demo&limit=10'
    const abortError = Object.assign(new Error('Aborted'), {
      name: 'AbortError'
    })

    global.fetch.mockRejectedValueOnce(abortError)

    const controller = new AbortController()
    const result = await SearchService(
      searchParams,
      'scene',
      DEFAULT_SEARCH_ERROR_SUMMARY,
      controller.signal
    )

    expect(result).toBeUndefined()
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      DEFAULT_SEARCH_ERROR_SUMMARY,
      expect.objectContaining({ error: true })
    )
  })
})

describe('fetchTopItemsForMosaic error handling', () => {
  it('throws normalized error object for non-OK JSON error response', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const searchParams = 'collections=demo&limit=10'
    const errorBody = {
      code: 'InvalidAggregate',
      message: 'Invalid aggregate request'
    }

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify(errorBody)
    })

    await expect(fetchTopItemsForMosaic(searchParams, 5)).rejects.toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        code: errorBody.code,
        summary: DEFAULT_MOSAIC_TOP_ITEMS_ERROR_SUMMARY,
        details: errorBody.message
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching top items for mosaic',
      expect.objectContaining({
        error: true,
        status: 400
      })
    )
  })

  it('throws normalized network error when fetch rejects', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const searchParams = 'collections=demo&limit=10'

    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchTopItemsForMosaic(searchParams, 5)).rejects.toEqual(
      expect.objectContaining({
        error: true,
        status: null,
        summary: DEFAULT_MOSAIC_TOP_ITEMS_ERROR_SUMMARY,
        details: 'Network error'
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching top items for mosaic',
      expect.objectContaining({
        error: true,
        status: null
      })
    )
  })

  it('rethrows AbortError without normalizing', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const searchParams = 'collections=demo&limit=10'
    const abortError = Object.assign(new Error('Aborted'), {
      name: 'AbortError'
    })

    global.fetch.mockRejectedValueOnce(abortError)

    const controller = new AbortController()
    await expect(
      fetchTopItemsForMosaic(
        searchParams,
        5,
        DEFAULT_MOSAIC_TOP_ITEMS_ERROR_SUMMARY,
        controller.signal
      )
    ).rejects.toBe(abortError)
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
