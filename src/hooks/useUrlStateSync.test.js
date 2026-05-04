import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUrlStateSync } from './useUrlStateSync'

import { deserializeQueryableFiltersFromURL } from '../utils/urlParamHelper'

import { showApplicationAlert } from '../utils/alertHelper'

// Import action types for assertion matching
import {
  setSelectedCollection,
  setSelectedVisualization,
  settabSelected,
  setSearchDateRangeValue,
  setViewMode,
  setQueryableFilters
} from '../redux/slices/mainSlice'

// Mock TanStack Router — search params no longer include col/item
let mockSearch = {}
let mockParams = {}
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mockSearch,
  useParams: () => mockParams,
  createRootRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
  createRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
  createRouter: vi.fn(() => ({}))
}))

vi.mock('../utils/alertHelper', () => ({
  showApplicationAlert: vi.fn()
}))

// Mock Redux
const mockDispatch = vi.fn()
const mockCollectionData = {
  queryables: {
    'eo:cloud_cover': { type: 'number', minimum: 0, maximum: 100 }
  }
}
const mockCollectionsData = [
  { id: 'sentinel-2', title: 'Sentinel-2' },
  { id: 'landsat-8', title: 'Landsat 8' }
]
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      mainSlice: {
        selectedCollectionData: mockCollectionData,
        collectionsData: mockCollectionsData
      }
    })
}))

// Mock useUrlInitialize to control initialization refs
const mockIsInitialized = { current: true }
const mockPrevSearch = { current: null }
const mockFetchAndDisplayItem = vi.fn()
const mockClearItemSelection = vi.fn()

vi.mock('./useUrlInitialize', () => ({
  useUrlInitialize: () => ({
    isInitializedRef: mockIsInitialized,
    prevSearchRef: mockPrevSearch,
    fetchAndDisplayItem: mockFetchAndDisplayItem,
    clearItemSelection: mockClearItemSelection
  })
}))

vi.mock('../utils/urlParamHelper', () => ({
  deserializeQueryableFiltersFromURL: vi.fn(() => ({
    'eo:cloud_cover': { min: 0, max: 50 }
  }))
}))

// Base search params (no col/item — those come from path params)
const baseSearchParams = {
  dt: '2024-01-01/2024-06-30',
  view: 'scene',
  viz: 'true-color',
  tab: 'search',
  z: 10,
  c: '40,-100'
}

// Base combined state (as seen by prevSearch after combining search + path params)
const baseState = {
  ...baseSearchParams,
  col: 'sentinel-2',
  item: ''
}

describe('useUrlStateSync — ongoing sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsInitialized.current = true
    mockPrevSearch.current = { ...baseState }
    mockSearch = { ...baseSearchParams }
    mockParams = { collectionId: 'sentinel-2' }
  })

  it('does not dispatch when not yet initialized', () => {
    mockIsInitialized.current = false
    mockSearch = { ...baseSearchParams, tab: 'details' }

    renderHook(() => useUrlStateSync())

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when prevSearch is null', () => {
    mockPrevSearch.current = null
    mockSearch = { ...baseSearchParams, tab: 'details' }

    renderHook(() => useUrlStateSync())

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when search is unchanged', () => {
    renderHook(() => useUrlStateSync())

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  describe('tab sync', () => {
    it('dispatches settabSelected when tab changes', () => {
      mockSearch = { ...baseSearchParams, tab: 'details' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(settabSelected('details'))
    })

    it('dispatches default "search" when tab is cleared', () => {
      mockPrevSearch.current = { ...baseState, tab: 'details' }
      mockSearch = { ...baseSearchParams, tab: '' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(settabSelected('search'))
    })
  })

  describe('viz sync', () => {
    it('dispatches setSelectedVisualization when viz changes', () => {
      mockSearch = { ...baseSearchParams, viz: 'false-color' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(
        setSelectedVisualization('false-color')
      )
    })

    it('dispatches null when viz is cleared', () => {
      mockSearch = { ...baseSearchParams, viz: '' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(setSelectedVisualization(null))
    })
  })

  describe('view sync', () => {
    it('dispatches setViewMode when view changes', () => {
      mockSearch = { ...baseSearchParams, view: 'hex' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(setViewMode('hex'))
    })

    it('dispatches default "scene" when view is cleared', () => {
      mockSearch = { ...baseSearchParams, view: '' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(setViewMode('scene'))
    })
  })

  describe('col sync (via path params)', () => {
    it('dispatches setSelectedCollection when collectionId path param changes', () => {
      mockParams = { collectionId: 'landsat-8' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(
        setSelectedCollection('landsat-8')
      )
    })

    it('does NOT dispatch when col is cleared (requireTruthy)', () => {
      mockParams = {}

      renderHook(() => useUrlStateSync())

      // Should not have a setSelectedCollection dispatch with empty string
      const colDispatches = mockDispatch.mock.calls.filter(
        (call) => call[0]?.type === setSelectedCollection('').type
      )
      expect(colDispatches).toHaveLength(0)
    })

    it('shows warning alert and skips dispatch for invalid collection', () => {
      mockParams = { collectionId: 'nonexistent-collection' }

      renderHook(() => useUrlStateSync())

      expect(showApplicationAlert).toHaveBeenCalledWith(
        'warning',
        expect.stringContaining('nonexistent-collection')
      )
      // Should not have dispatched setSelectedCollection
      const colDispatches = mockDispatch.mock.calls.filter(
        (call) => call[0]?.type === setSelectedCollection('').type
      )
      expect(colDispatches).toHaveLength(0)
    })
  })

  describe('dt sync', () => {
    it('dispatches setSearchDateRangeValue with parsed parts', () => {
      mockSearch = { ...baseSearchParams, dt: '2025-01-01/2025-12-31' }

      renderHook(() => useUrlStateSync())

      expect(mockDispatch).toHaveBeenCalledWith(
        setSearchDateRangeValue(['2025-01-01', '2025-12-31'])
      )
    })

    it('does NOT dispatch when dt is cleared (requireTruthy)', () => {
      mockSearch = { ...baseSearchParams, dt: '' }

      renderHook(() => useUrlStateSync())

      const dtDispatches = mockDispatch.mock.calls.filter(
        (call) => call[0]?.type === setSearchDateRangeValue([]).type
      )
      expect(dtDispatches).toHaveLength(0)
    })

    it('does NOT dispatch when dt has invalid format', () => {
      mockSearch = { ...baseSearchParams, dt: 'invalid-date' }

      renderHook(() => useUrlStateSync())

      // transform returns null for invalid format, so no dispatch
      const dtDispatches = mockDispatch.mock.calls.filter(
        (call) => call[0]?.type === setSearchDateRangeValue([]).type
      )
      expect(dtDispatches).toHaveLength(0)
    })
  })

  describe('queryable filters sync', () => {
    it('dispatches setQueryableFilters when filter params change', () => {
      mockPrevSearch.current = { ...baseState }
      mockSearch = {
        ...baseSearchParams,
        'eo:cloud_cover_min': '0',
        'eo:cloud_cover_max': '50'
      }

      renderHook(() => useUrlStateSync())

      expect(deserializeQueryableFiltersFromURL).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        setQueryableFilters({ 'eo:cloud_cover': { min: 0, max: 50 } })
      )
    })

    it('does not dispatch when filter params are unchanged', () => {
      // Both prev and current have the same filter params
      mockPrevSearch.current = {
        ...baseState,
        'eo:cloud_cover_min': '0'
      }
      mockSearch = { ...baseSearchParams, 'eo:cloud_cover_min': '0' }

      renderHook(() => useUrlStateSync())

      expect(deserializeQueryableFiltersFromURL).not.toHaveBeenCalled()
    })
  })

  describe('item sync (via path params)', () => {
    it('calls fetchAndDisplayItem when itemId path param is set', () => {
      mockParams = { collectionId: 'sentinel-2', itemId: 'SCENE-123' }

      renderHook(() => useUrlStateSync())

      expect(mockFetchAndDisplayItem).toHaveBeenCalledWith(
        'sentinel-2',
        'SCENE-123'
      )
    })

    it('calls clearItemSelection when itemId is cleared', () => {
      mockPrevSearch.current = { ...baseState, item: 'SCENE-123' }
      mockParams = { collectionId: 'sentinel-2' }

      renderHook(() => useUrlStateSync())

      expect(mockClearItemSelection).toHaveBeenCalled()
    })

    it('does not call either when item is unchanged', () => {
      mockPrevSearch.current = { ...baseState, item: 'SCENE-123' }
      mockParams = { collectionId: 'sentinel-2', itemId: 'SCENE-123' }

      renderHook(() => useUrlStateSync())

      expect(mockFetchAndDisplayItem).not.toHaveBeenCalled()
      expect(mockClearItemSelection).not.toHaveBeenCalled()
    })
  })

  describe('updates prevSearch ref', () => {
    it('sets prevSearch to current combined state after processing', () => {
      mockSearch = { ...baseSearchParams, tab: 'details' }

      renderHook(() => useUrlStateSync())

      expect(mockPrevSearch.current).toEqual({
        ...baseSearchParams,
        tab: 'details',
        col: 'sentinel-2',
        item: ''
      })
    })
  })
})
