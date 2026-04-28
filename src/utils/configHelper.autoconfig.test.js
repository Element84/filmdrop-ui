import { describe, it, expect, vi, beforeEach } from 'vitest'
import { autoConfigureCollections } from './configHelper'

// Mock the stac-api module
vi.mock('../services/stac-api', () => ({
  getCollections: vi.fn()
}))

describe('autoConfigureCollections', () => {
  let mockGetCollections

  beforeEach(async () => {
    const stacApi = await import('../services/stac-api')
    mockGetCollections = stacApi.getCollections
    mockGetCollections.mockReset()
  })

  it('should fetch and configure all collections when no filter is provided', async () => {
    const mockResponse = {
      collections: [
        { id: 'collection-1', title: 'Collection 1' },
        { id: 'collection-2', title: 'Collection 2' },
        { id: 'collection-3', title: 'Collection 3' }
      ]
    }
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac'
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    expect(mockGetCollections).toHaveBeenCalledWith('https://example.com/stac')
    // COLLECTIONS should be an object with _ids array
    expect(result.COLLECTIONS).toEqual({
      _ids: ['collection-1', 'collection-2', 'collection-3']
    })
    expect(result._STAC_COLLECTIONS).toHaveLength(3)
  })

  it('should filter collections using include list (whitelist)', async () => {
    const mockResponse = {
      collections: [
        { id: 'collection-1', title: 'Collection 1' },
        { id: 'collection-2', title: 'Collection 2' },
        { id: 'collection-3', title: 'Collection 3' }
      ]
    }
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac',
      COLLECTIONS: {
        include: ['collection-1', 'collection-3']
      }
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    // COLLECTIONS should preserve the include filter and add _ids
    expect(result.COLLECTIONS).toEqual({
      include: ['collection-1', 'collection-3'],
      _ids: ['collection-1', 'collection-3']
    })
    expect(result._STAC_COLLECTIONS).toHaveLength(2)
  })

  it('should filter collections using exclude list (blacklist)', async () => {
    const mockResponse = {
      collections: [
        { id: 'collection-1', title: 'Collection 1' },
        { id: 'collection-2', title: 'Collection 2' },
        { id: 'collection-3', title: 'Collection 3' }
      ]
    }
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac',
      COLLECTIONS: {
        exclude: ['collection-2']
      }
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    // COLLECTIONS should preserve the exclude filter and add _ids
    expect(result.COLLECTIONS).toEqual({
      exclude: ['collection-2'],
      _ids: ['collection-1', 'collection-3']
    })
    expect(result._STAC_COLLECTIONS).toHaveLength(2)
  })

  it('should apply both include and exclude filters', async () => {
    const mockResponse = {
      collections: [
        { id: 'collection-1', title: 'Collection 1' },
        { id: 'collection-2', title: 'Collection 2' },
        { id: 'collection-3', title: 'Collection 3' },
        { id: 'collection-4', title: 'Collection 4' }
      ]
    }
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac',
      COLLECTIONS: {
        include: ['collection-1', 'collection-2', 'collection-3'],
        exclude: ['collection-2']
      }
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    // COLLECTIONS should preserve both filters and add _ids
    expect(result.COLLECTIONS).toEqual({
      include: ['collection-1', 'collection-2', 'collection-3'],
      exclude: ['collection-2'],
      _ids: ['collection-1', 'collection-3']
    })
    expect(result._STAC_COLLECTIONS).toHaveLength(2)
  })

  it('should filter COLLECTIONS_CONFIG to only include active collections', async () => {
    const mockResponse = {
      collections: [
        { id: 'collection-1', title: 'Collection 1' },
        { id: 'collection-2', title: 'Collection 2' }
      ]
    }
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac',
      COLLECTIONS: {
        include: ['collection-1', 'collection-2']
      },
      COLLECTIONS_CONFIG: {
        'collection-1': { sceneMinZoom: 8 },
        'collection-2': { sceneMinZoom: 7 },
        'collection-3': { sceneMinZoom: 6 } // Should be filtered out
      }
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    expect(result.COLLECTIONS_CONFIG).toEqual({
      'collection-1': { sceneMinZoom: 8 },
      'collection-2': { sceneMinZoom: 7 }
    })
    expect(result.COLLECTIONS_CONFIG['collection-3']).toBeUndefined()
  })

  it('should return original config if API URL is not provided', async () => {
    const config = {
      COLLECTIONS: { include: ['collection-1'] }
    }

    const result = await autoConfigureCollections(null, config)

    expect(mockGetCollections).not.toHaveBeenCalled()
    expect(result).toEqual(config)
  })

  it('should return original config if API call fails', async () => {
    mockGetCollections.mockRejectedValueOnce(new Error('API Error'))

    const config = {
      STAC_API_URL: 'https://example.com/stac',
      COLLECTIONS: { include: ['collection-1'] }
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    expect(result).toEqual(config)
  })

  it('should handle empty collections response', async () => {
    const mockResponse = {
      collections: []
    }
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac'
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    expect(result).toEqual(config)
  })

  it('should handle missing collections array in response', async () => {
    const mockResponse = {}
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac'
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    expect(result).toEqual(config)
  })

  it('should preserve other config properties', async () => {
    const mockResponse = {
      collections: [{ id: 'collection-1', title: 'Collection 1' }]
    }
    mockGetCollections.mockResolvedValueOnce(mockResponse)

    const config = {
      STAC_API_URL: 'https://example.com/stac',
      APP_NAME: 'My App',
      BASEMAP: { provider: 'osm' },
      CUSTOM_PARAM: 'value'
    }

    const result = await autoConfigureCollections(config.STAC_API_URL, config)

    expect(result.APP_NAME).toBe('My App')
    expect(result.BASEMAP).toEqual({ provider: 'osm' })
    expect(result.CUSTOM_PARAM).toBe('value')
    // COLLECTIONS should be an object with _ids
    expect(result.COLLECTIONS).toEqual({ _ids: ['collection-1'] })
  })
})
