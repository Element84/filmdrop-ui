import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { GetItemService } from './get-item-service'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'
import * as authHelper from '../utils/authHelper'

// Mock modules
vi.mock('../utils/authHelper', async () => {
  const actual = await vi.importActual('../utils/authHelper')
  return {
    ...actual,
    logoutUser: vi.fn()
  }
})

// Mock fetch globally
global.fetch = vi.fn()

const mockStacApiUrl = 'https://stac-api.example.com'
const mockCollectionId = 'sentinel-2-l2a'
const mockItemId = 'S2A_17SNB_20230617_0_L2A'
const mockItemResponse = {
  type: 'Feature',
  id: mockItemId,
  collection: mockCollectionId,
  geometry: { type: 'Polygon', coordinates: [[[]]] },
  properties: { datetime: '2023-06-17T00:00:00Z' }
}

beforeEach(() => {
  vi.clearAllMocks()
  store.dispatch(
    setAppConfig({
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

describe('GetItemService with collectionId', () => {
  describe('URL construction', () => {
    it('constructs correct STAC API endpoint URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      await GetItemService(mockItemId, mockCollectionId)

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockStacApiUrl}/collections/${mockCollectionId}/items/${mockItemId}`,
        expect.any(Object)
      )
    })

    it('handles item IDs with special characters in URL path', async () => {
      const specialItemId = 'S2A:17SNB/20230617'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      await GetItemService(specialItemId, mockCollectionId)

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockStacApiUrl}/collections/${mockCollectionId}/items/${specialItemId}`,
        expect.any(Object)
      )
    })
  })

  describe('authentication headers', () => {
    it('includes Authorization header when auth is enabled and token exists', async () => {
      const mockToken = 'mock-jwt-token'
      localStorage.setItem('APP_AUTH_TOKEN', mockToken)
      store.dispatch(
        setAppConfig({
          STAC_API_URL: mockStacApiUrl,
          APP_TOKEN_AUTH_ENABLED: true,
          FETCH_CREDENTIALS: 'same-origin'
        })
      )

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      await GetItemService(mockItemId, mockCollectionId)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      )

      const callArgs = global.fetch.mock.calls[0][1]
      const authHeader = callArgs.headers.get('Authorization')
      expect(authHeader).toBe(`Bearer ${mockToken}`)
    })

    it('does not include Authorization header when auth is disabled', async () => {
      localStorage.setItem('APP_AUTH_TOKEN', 'mock-token')
      store.dispatch(
        setAppConfig({
          STAC_API_URL: mockStacApiUrl,
          APP_TOKEN_AUTH_ENABLED: false,
          FETCH_CREDENTIALS: 'same-origin'
        })
      )

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      await GetItemService(mockItemId, mockCollectionId)

      const callArgs = global.fetch.mock.calls[0][1]
      const authHeader = callArgs.headers.get('Authorization')
      expect(authHeader).toBeNull()
    })

    it('does not include Authorization header when token does not exist', async () => {
      store.dispatch(
        setAppConfig({
          STAC_API_URL: mockStacApiUrl,
          APP_TOKEN_AUTH_ENABLED: true,
          FETCH_CREDENTIALS: 'same-origin'
        })
      )

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      await GetItemService(mockItemId, mockCollectionId)

      const callArgs = global.fetch.mock.calls[0][1]
      const authHeader = callArgs.headers.get('Authorization')
      expect(authHeader).toBeNull()
    })
  })

  describe('credentials configuration', () => {
    it('uses FETCH_CREDENTIALS from config', async () => {
      store.dispatch(
        setAppConfig({
          STAC_API_URL: mockStacApiUrl,
          APP_TOKEN_AUTH_ENABLED: false,
          FETCH_CREDENTIALS: 'include'
        })
      )

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      await GetItemService(mockItemId, mockCollectionId)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include'
        })
      )
    })

    it('defaults to same-origin when FETCH_CREDENTIALS not configured', async () => {
      store.dispatch(
        setAppConfig({
          STAC_API_URL: mockStacApiUrl,
          APP_TOKEN_AUTH_ENABLED: false
        })
      )

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      await GetItemService(mockItemId, mockCollectionId)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'same-origin'
        })
      )
    })
  })

  describe('success responses', () => {
    it('returns item GeoJSON on successful fetch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemResponse
      })

      const result = await GetItemService(mockItemId, mockCollectionId)

      expect(result).toEqual(mockItemResponse)
      expect(result.error).toBeUndefined()
    })
  })

  describe('error responses', () => {
    it('returns error object with status on 404', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await GetItemService(mockItemId, mockCollectionId)

      expect(result).toEqual({ error: true, status: 404 })
    })

    it('calls logoutUser on 403 response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      })

      const result = await GetItemService(mockItemId, mockCollectionId)

      expect(authHelper.logoutUser).toHaveBeenCalledOnce()
      expect(result).toEqual({ error: true, status: 403 })
    })

    it('returns error object with status on 500', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await GetItemService(mockItemId, mockCollectionId)

      expect(result).toEqual({ error: true, status: 500 })
      expect(authHelper.logoutUser).not.toHaveBeenCalled()
    })

    it('returns error object with null status on network failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await GetItemService(mockItemId, mockCollectionId)

      expect(result).toEqual({ error: true, status: null })
    })

    it('returns error object with null status on JSON parse failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      const result = await GetItemService(mockItemId, mockCollectionId)

      expect(result).toEqual({ error: true, status: null })
    })
  })
})

describe('GetItemService without collectionId', () => {
  it('uses the search endpoint with ids param', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [mockItemResponse]
      })
    })

    await GetItemService(mockItemId)

    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toBe(`${mockStacApiUrl}/search?ids=${mockItemId}`)
  })

  it('returns item when exactly one match found', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [mockItemResponse]
      })
    })

    const result = await GetItemService(mockItemId)

    expect(result).toEqual(mockItemResponse)
    expect(result.error).toBeUndefined()
  })

  it('returns 404 error when no matches found', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: []
      })
    })

    const result = await GetItemService(mockItemId)

    expect(result).toEqual({ error: true, status: 404 })
  })

  it('returns 404 error when multiple matches found (ambiguous)', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          { ...mockItemResponse, collection: 'collection-a' },
          { ...mockItemResponse, collection: 'collection-b' }
        ]
      })
    })

    const result = await GetItemService(mockItemId)

    expect(result).toEqual({ error: true, status: 404 })
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Ambiguous item ID')
    )
    consoleSpy.mockRestore()
  })

  it('calls logoutUser on 403 response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403
    })

    const result = await GetItemService(mockItemId)

    expect(authHelper.logoutUser).toHaveBeenCalledOnce()
    expect(result).toEqual({ error: true, status: 403 })
  })

  it('returns error object with null status on network failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await GetItemService(mockItemId)

    expect(result).toEqual({ error: true, status: null })
  })
})
