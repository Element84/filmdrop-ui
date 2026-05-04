import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../redux/store'
import {
  setappConfig,
  setCollectionsData,
  setMap,
  setSearchResults
} from '../redux/slices/mainSlice'
import { useUrlInitialize } from './useUrlInitialize'

import { GetItemService } from '../services/get-item-service'
import { getCollectionVisualizations } from '../utils/configHelper'
import { showApplicationAlert } from '../utils/alertHelper'
import { newSearch } from '../utils/searchHelper'

// Mock external dependencies
vi.mock('@tanstack/react-router', () => ({
  useSearch: vi.fn(),
  createRootRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
  createRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
  createRouter: vi.fn(() => ({}))
}))

vi.mock('../services/get-item-service', () => ({
  GetItemService: vi.fn()
}))

vi.mock('../utils/selectionSync', () => ({
  syncSelectionWithFetchedItem: vi.fn(() => ({
    clickResults: [],
    selectedIndex: 0,
    currentResult: null
  }))
}))

vi.mock('../utils/mapHelper', () => ({
  addDataToLayer: vi.fn(),
  footprintLayerStyle: vi.fn(),
  clearMapSelection: vi.fn()
}))

vi.mock('../utils/configHelper', () => ({
  getCollectionVisualizations: vi.fn(() => ({
    visualizationKeys: [],
    hasVisualizations: false
  }))
}))

vi.mock('../utils/alertHelper', () => ({
  showApplicationAlert: vi.fn()
}))

vi.mock('../utils/searchHelper', () => ({
  newSearch: vi.fn()
}))

vi.mock('../utils/urlParamHelper', () => ({
  deserializeQueryableFiltersFromURL: vi.fn(() => ({}))
}))

const mockAppConfig = { STAC_API_URL: 'https://stac.example.com' }
const mockCollection = {
  id: 'sentinel-2',
  title: 'Sentinel-2',
  queryables: { 'eo:cloud_cover': { type: 'number', minimum: 0, maximum: 100 } }
}

function wrapper({ children }) {
  return <Provider store={store}>{children}</Provider>
}

describe('useUrlInitialize', () => {
  let mockDispatch
  let mockSearch

  beforeEach(() => {
    vi.clearAllMocks()
    mockDispatch = vi.fn()
    mockSearch = {
      col: '',
      dt: '',
      view: '',
      viz: '',
      item: '',
      tab: '',
      z: undefined,
      c: ''
    }
  })

  describe('returned interface', () => {
    it('returns refs and callbacks', () => {
      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      expect(result.current.isInitializedRef).toHaveProperty('current')
      expect(result.current.prevSearchRef).toHaveProperty('current')
      expect(typeof result.current.fetchAndDisplayItem).toBe('function')
      expect(typeof result.current.clearItemSelection).toBe('function')
    })

    it('starts with isInitialized false and prevSearch null', () => {
      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      expect(result.current.isInitializedRef.current).toBe(false)
      expect(result.current.prevSearchRef.current).toBeNull()
    })
  })

  describe('initialization gating', () => {
    it('does not initialize when appConfig is missing', () => {
      // Only set collectionsData and map, not appConfig
      store.dispatch(setCollectionsData([mockCollection]))
      store.dispatch(setMap({ _leaflet_id: 1 }))

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      expect(result.current.isInitializedRef.current).toBe(false)
    })

    it('does not initialize when collectionsData is empty', () => {
      store.dispatch(setappConfig(mockAppConfig))
      store.dispatch(setCollectionsData([]))
      store.dispatch(setMap({ _leaflet_id: 1 }))

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      expect(result.current.isInitializedRef.current).toBe(false)
    })

    it('does not initialize when map is empty', () => {
      store.dispatch(setappConfig(mockAppConfig))
      store.dispatch(setCollectionsData([mockCollection]))
      store.dispatch(setMap({}))

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      expect(result.current.isInitializedRef.current).toBe(false)
    })
  })

  describe('initialization with all prerequisites', () => {
    beforeEach(() => {
      store.dispatch(setappConfig(mockAppConfig))
      store.dispatch(setCollectionsData([mockCollection]))
      store.dispatch(setMap({ _leaflet_id: 1 }))
    })

    it('initializes when appConfig, collectionsData, and map are ready', async () => {
      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })
      expect(result.current.prevSearchRef.current).toBe(mockSearch)
    })

    it('sets tab from URL when present', async () => {
      const search = { ...mockSearch, tab: 'details' }

      const { result } = renderHook(
        () => useUrlInitialize(search, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ payload: 'details' })
      )
    })

    it('restores collection and date range from URL and auto-searches', async () => {
      const search = {
        ...mockSearch,
        col: 'sentinel-2',
        dt: '2024-01-01/2024-06-30',
        view: 'scene'
      }

      const { result } = renderHook(
        () => useUrlInitialize(search, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })

      // Should have called newSearch
      expect(newSearch).toHaveBeenCalledWith({
        viewMode: 'scene',
        preserveItem: false
      })
    })

    it('shows warning alert when collection not found', async () => {
      const search = {
        ...mockSearch,
        col: 'nonexistent',
        dt: '2024-01-01/2024-06-30'
      }

      const { result } = renderHook(
        () => useUrlInitialize(search, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })
      expect(showApplicationAlert).toHaveBeenCalledWith(
        'warning',
        expect.stringContaining('nonexistent')
      )
    })

    it('shows warning alert when collection-only URL has invalid collection', async () => {
      const search = {
        ...mockSearch,
        col: 'nonexistent'
      }

      const { result } = renderHook(
        () => useUrlInitialize(search, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })
      expect(showApplicationAlert).toHaveBeenCalledWith(
        'warning',
        expect.stringContaining('nonexistent')
      )
    })

    it('only initializes once (idempotent)', async () => {
      const search = {
        ...mockSearch,
        col: 'sentinel-2',
        dt: '2024-01-01/2024-06-30'
      }

      const { result, rerender } = renderHook(
        () => useUrlInitialize(search, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })

      const callCount = mockDispatch.mock.calls.length
      rerender()
      // No new dispatches after rerender
      expect(mockDispatch.mock.calls.length).toBe(callCount)
    })
  })

  describe('fetchAndDisplayItem', () => {
    it('does nothing when collectionId or itemId is missing', async () => {
      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await act(async () => {
        await result.current.fetchAndDisplayItem('', 'item-1')
      })
      expect(GetItemService).not.toHaveBeenCalled()

      await act(async () => {
        await result.current.fetchAndDisplayItem('col-1', '')
      })
      expect(GetItemService).not.toHaveBeenCalled()
    })

    it('shows warning alert on 404', async () => {
      GetItemService.mockResolvedValue({ error: true, status: 404 })

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await act(async () => {
        await result.current.fetchAndDisplayItem('sentinel-2', 'missing-item')
      })

      expect(showApplicationAlert).toHaveBeenCalledWith(
        'warning',
        expect.stringContaining('missing-item')
      )
    })

    it('shows warning on 403', async () => {
      GetItemService.mockResolvedValue({ error: true, status: 403 })

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await act(async () => {
        await result.current.fetchAndDisplayItem('sentinel-2', 'item-1')
      })

      expect(showApplicationAlert).toHaveBeenCalledWith(
        'warning',
        'Authentication required'
      )
    })

    it('shows generic error for other failures', async () => {
      GetItemService.mockResolvedValue({ error: true, status: 500 })

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await act(async () => {
        await result.current.fetchAndDisplayItem('sentinel-2', 'item-1')
      })

      expect(showApplicationAlert).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('network')
      )
    })

    it('shows alert on thrown exception', async () => {
      GetItemService.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await act(async () => {
        await result.current.fetchAndDisplayItem('sentinel-2', 'item-1')
      })

      expect(showApplicationAlert).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('unexpected')
      )
    })

    it('uses cached item from searchResults instead of calling API', async () => {
      const cachedFeature = {
        id: 'cached-item',
        collection: 'sentinel-2',
        properties: {}
      }
      store.dispatch(
        setSearchResults({
          type: 'FeatureCollection',
          features: [cachedFeature],
          searchType: 'scene'
        })
      )

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await act(async () => {
        await result.current.fetchAndDisplayItem('sentinel-2', 'cached-item')
      })

      expect(GetItemService).not.toHaveBeenCalled()
      // Should still dispatch selection state (3 dispatches: clickResults, index, currentResult)
      expect(mockDispatch).toHaveBeenCalledTimes(3)

      // Clean up
      store.dispatch(setSearchResults(null))
    })

    it('falls through to API when item is not in searchResults', async () => {
      store.dispatch(
        setSearchResults({
          type: 'FeatureCollection',
          features: [{ id: 'other-item', properties: {} }],
          searchType: 'scene'
        })
      )
      GetItemService.mockResolvedValue({ error: true, status: 404 })

      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      await act(async () => {
        await result.current.fetchAndDisplayItem('sentinel-2', 'not-cached')
      })

      expect(GetItemService).toHaveBeenCalledWith('not-cached', 'sentinel-2')

      // Clean up
      store.dispatch(setSearchResults(null))
    })
  })

  describe('clearItemSelection', () => {
    it('dispatches clear actions', () => {
      const { result } = renderHook(
        () => useUrlInitialize(mockSearch, mockDispatch),
        { wrapper }
      )

      act(() => {
        result.current.clearItemSelection()
      })

      // Should dispatch setClickResults, setCurrentPopupResult, setselectedPopupResultIndex
      expect(mockDispatch).toHaveBeenCalledTimes(3)
    })
  })

  describe('visualization restoration', () => {
    beforeEach(() => {
      store.dispatch(setappConfig(mockAppConfig))
      store.dispatch(setCollectionsData([mockCollection]))
      store.dispatch(setMap({ _leaflet_id: 1 }))
    })

    it('restores visualization when valid', async () => {
      getCollectionVisualizations.mockReturnValue({
        visualizationKeys: ['true-color', 'false-color'],
        hasVisualizations: true
      })

      const search = {
        ...mockSearch,
        col: 'sentinel-2',
        dt: '2024-01-01/2024-06-30',
        viz: 'true-color'
      }

      const { result } = renderHook(
        () => useUrlInitialize(search, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })

      // Should have dispatched setSelectedVisualization
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ payload: 'true-color' })
      )
    })

    it('shows warning alert for invalid visualization key', async () => {
      getCollectionVisualizations.mockReturnValue({
        visualizationKeys: ['true-color'],
        hasVisualizations: true
      })

      const search = {
        ...mockSearch,
        col: 'sentinel-2',
        dt: '2024-01-01/2024-06-30',
        viz: 'nonexistent-viz'
      }

      const { result } = renderHook(
        () => useUrlInitialize(search, mockDispatch),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isInitializedRef.current).toBe(true)
      })

      // Should NOT have dispatched setSelectedVisualization with 'nonexistent-viz'
      const vizDispatches = mockDispatch.mock.calls.filter(
        (call) =>
          call[0]?.type?.includes('Visualization') &&
          call[0]?.payload === 'nonexistent-viz'
      )
      expect(vizDispatches).toHaveLength(0)

      // Should show warning alert
      expect(showApplicationAlert).toHaveBeenCalledWith(
        'warning',
        expect.stringContaining('nonexistent-viz')
      )
    })
  })
})
