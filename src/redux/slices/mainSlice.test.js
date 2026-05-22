import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import mainSlice, {
  mainSliceReset,
  setMap,
  setSelectedCollection,
  setSelectedVisualization,
  setSearchResults,
  setClickResults,
  setSearchLoading,
  setCurrentPopupResult,
  setShowZoomNotice,
  setZoomLevelNeeded,
  setViewMode,
  setShowAppLoading,
  setSearchType,
  setCollectionsData,
  setCollectionsLoadError,
  setSelectedCollectionData,
  setSearchDateRangeValue,
  setLocalGridData,
  setIsDrawingEnabled,
  setMapDrawPolygonHandler,
  setSearchGeojsonBoundary,
  setShowUploadGeojsonModal,
  setShowApplicationAlert,
  setApplicationAlertMessage,
  setApplicationAlertSeverity,
  setIsAuthErrorAlert,
  clearApplicationAlert,
  setAppConfig,
  setCartItems,
  setShowCartModal,
  setMappedScenes,
  setImageOverlayLoading,
  setShowMapAttribution,
  setAppName,
  setShowLayerList,
  setReferenceLayers,
  setTabSelected,
  setSelectedPopupResultIndex,
  setAutoCenterOnItemChanged,
  setAuthTokenExists,
  setCurrentTheme,
  setPaginationNextLink,
  setPaginationPrevLink,
  setCurrentPage,
  setTotalPages,
  setPaginationHistory,
  addToPaginationHistory,
  setQueryableFilters,
  setMosaicCache,
  incrementDetailsResetKey,
  resetSearchState,
  setShowSceneOverlay
} from './mainSlice'
import { DEFAULT_DATE_RANGE } from '../../constants/defaults'

describe('mainSlice reducer', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: { main: mainSlice },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const getState = () => store.getState().main

  describe('mainSliceReset action', () => {
    it('should reset entire state to initial values', () => {
      // Mutate state
      store.dispatch(setSearchLoading(true))
      store.dispatch(setShowAppLoading(false))
      store.dispatch(setViewMode('analysis'))

      expect(getState().searchLoading).toBe(true)
      expect(getState().showAppLoading).toBe(false)
      expect(getState().viewMode).toBe('analysis')

      // Reset
      store.dispatch(mainSliceReset())

      const initialState = store.getState().main
      expect(initialState.searchLoading).toBe(false)
      expect(initialState.showAppLoading).toBe(true)
      expect(initialState.viewMode).toBe('scene')
      expect(initialState.cartItems).toEqual([])
      expect(initialState.paginationHistory).toEqual([])
      expect(initialState.detailsResetKey).toBe(0)
    })
  })

  describe.each([
    ['setSearchLoading', setSearchLoading, 'searchLoading', false, true],
    ['setShowAppLoading', setShowAppLoading, 'showAppLoading', true, false],
    ['setViewMode', setViewMode, 'viewMode', 'scene', 'analysis'],
    [
      'setSelectedCollection',
      setSelectedCollection,
      'selectedCollection',
      '',
      'sentinel-2'
    ],
    [
      'setSelectedVisualization',
      setSelectedVisualization,
      'selectedVisualization',
      null,
      { id: 'viz-1', name: 'Natural Color' }
    ],
    [
      'setSearchResults',
      setSearchResults,
      'searchResults',
      null,
      { type: 'FeatureCollection', features: [] }
    ],
    [
      'setClickResults',
      setClickResults,
      'clickResults',
      [],
      [{ id: '1', geometry: {} }]
    ],
    [
      'setCurrentPopupResult',
      setCurrentPopupResult,
      'currentPopupResult',
      null,
      { type: 'Feature', properties: {} }
    ],
    ['setShowZoomNotice', setShowZoomNotice, 'showZoomNotice', false, true],
    ['setZoomLevelNeeded', setZoomLevelNeeded, 'zoomLevelNeeded', null, 10],
    ['setSearchType', setSearchType, 'searchType', null, 'spatial'],
    [
      'setCollectionsData',
      setCollectionsData,
      'collectionsData',
      [],
      [{ id: '1', title: 'Collection 1' }]
    ],
    [
      'setCollectionsLoadError',
      setCollectionsLoadError,
      'collectionsLoadError',
      false,
      true
    ],
    [
      'setSelectedCollectionData',
      setSelectedCollectionData,
      'selectedCollectionData',
      null,
      { id: '1', links: [] }
    ],
    [
      'setSearchDateRangeValue',
      setSearchDateRangeValue,
      'searchDateRangeValue',
      DEFAULT_DATE_RANGE,
      ['2020-01-01', '2020-12-31']
    ],
    ['setLocalGridData', setLocalGridData, 'localGridData', {}, { tiles: [] }],
    [
      'setIsDrawingEnabled',
      setIsDrawingEnabled,
      'isDrawingEnabled',
      false,
      true
    ],
    [
      'setSearchGeojsonBoundary',
      setSearchGeojsonBoundary,
      'searchGeojsonBoundary',
      null,
      { type: 'Feature', geometry: {} }
    ],
    [
      'setShowUploadGeojsonModal',
      setShowUploadGeojsonModal,
      'showUploadGeojsonModal',
      false,
      true
    ],
    [
      'setAppConfig',
      setAppConfig,
      'appConfig',
      null,
      { name: 'FilmDrop', version: '1.0.0' }
    ],
    [
      'setCartItems',
      setCartItems,
      'cartItems',
      [],
      [{ id: '1', name: 'Item 1' }]
    ],
    ['setShowCartModal', setShowCartModal, 'showCartModal', false, true],
    [
      'setMappedScenes',
      setMappedScenes,
      'mappedScenes',
      [],
      [{ id: 'scene-1' }]
    ],
    [
      'setImageOverlayLoading',
      setImageOverlayLoading,
      'imageOverlayLoading',
      false,
      true
    ],
    [
      'setShowMapAttribution',
      setShowMapAttribution,
      'showMapAttribution',
      true,
      false
    ],
    ['setAppName', setAppName, 'appName', '', 'My FilmDrop'],
    ['setShowLayerList', setShowLayerList, 'showLayerList', false, true],
    [
      'setReferenceLayers',
      setReferenceLayers,
      'referenceLayers',
      [],
      [{ id: 'layer-1', name: 'Reference' }]
    ],
    ['setTabSelected', setTabSelected, 'tabSelected', 'search', 'details'],
    [
      'setSelectedPopupResultIndex',
      setSelectedPopupResultIndex,
      'selectedPopupResultIndex',
      0,
      5
    ],
    [
      'setAutoCenterOnItemChanged',
      setAutoCenterOnItemChanged,
      'autoCenterOnItemChanged',
      false,
      true
    ],
    ['setAuthTokenExists', setAuthTokenExists, 'authTokenExists', false, true],
    ['setCurrentTheme', setCurrentTheme, 'currentTheme', null, 'dark'],
    [
      'setShowApplicationAlert',
      setShowApplicationAlert,
      'showApplicationAlert',
      false,
      true
    ],
    [
      'setApplicationAlertMessage',
      setApplicationAlertMessage,
      'applicationAlertMessage',
      'System Error',
      'Custom message'
    ],
    [
      'setApplicationAlertSeverity',
      setApplicationAlertSeverity,
      'applicationAlertSeverity',
      'error',
      'warning'
    ],
    [
      'setIsAuthErrorAlert',
      setIsAuthErrorAlert,
      'isAuthErrorAlert',
      false,
      true
    ],
    [
      'setShowSceneOverlay',
      setShowSceneOverlay,
      'showSceneOverlay',
      true,
      false
    ]
  ])('%s', (_name, action, field, initial, updated) => {
    it(`updates ${field} state`, () => {
      expect(getState()[field]).toEqual(initial)
      store.dispatch(action(updated))
      expect(getState()[field]).toEqual(updated)
    })
  })

  it('setMapDrawPolygonHandler stores function reference by identity', () => {
    const handler = () => {}
    expect(getState().mapDrawPolygonHandler).toBeNull()
    store.dispatch(setMapDrawPolygonHandler(handler))
    expect(getState().mapDrawPolygonHandler).toBe(handler)
  })

  describe('pagination actions', () => {
    it('setPaginationNextLink should update paginationNextLink state', () => {
      const link = 'https://example.com?page=2'
      expect(getState().paginationNextLink).toBeNull()
      store.dispatch(setPaginationNextLink(link))
      expect(getState().paginationNextLink).toBe(link)
    })

    it('setPaginationPrevLink should update paginationPrevLink state', () => {
      const link = 'https://example.com?page=1'
      expect(getState().paginationPrevLink).toBeNull()
      store.dispatch(setPaginationPrevLink(link))
      expect(getState().paginationPrevLink).toBe(link)
    })

    it('setCurrentPage should update currentPage state', () => {
      expect(getState().currentPage).toBe(1)
      store.dispatch(setCurrentPage(3))
      expect(getState().currentPage).toBe(3)
    })

    it('setTotalPages should update totalPages state', () => {
      expect(getState().totalPages).toBeNull()
      store.dispatch(setTotalPages(10))
      expect(getState().totalPages).toBe(10)
    })

    it('setPaginationHistory should replace paginationHistory state', () => {
      const history = ['page1', 'page2', 'page3']
      expect(getState().paginationHistory).toEqual([])
      store.dispatch(setPaginationHistory(history))
      expect(getState().paginationHistory).toEqual(history)
    })

    it('addToPaginationHistory should append to paginationHistory state', () => {
      store.dispatch(addToPaginationHistory('page1'))
      expect(getState().paginationHistory).toEqual(['page1'])
      store.dispatch(addToPaginationHistory('page2'))
      expect(getState().paginationHistory).toEqual(['page1', 'page2'])
    })
  })

  describe('compound actions', () => {
    it('clearApplicationAlert should reset alert state to defaults', () => {
      // Set up alert state
      store.dispatch(setShowApplicationAlert(true))
      store.dispatch(setApplicationAlertMessage('Network error'))
      store.dispatch(setApplicationAlertSeverity('critical'))
      store.dispatch(setIsAuthErrorAlert(true))

      const beforeState = getState()
      expect(beforeState.showApplicationAlert).toBe(true)
      expect(beforeState.applicationAlertMessage).toBe('Network error')
      expect(beforeState.applicationAlertSeverity).toBe('critical')
      expect(beforeState.isAuthErrorAlert).toBe(true)

      // Clear alert
      store.dispatch(clearApplicationAlert())

      const afterState = getState()
      expect(afterState.showApplicationAlert).toBe(false)
      expect(afterState.applicationAlertMessage).toBe('System Error')
      expect(afterState.applicationAlertSeverity).toBe('error')
      expect(afterState.isAuthErrorAlert).toBe(false)
    })

    it('resetSearchState should zero all search-derived state', () => {
      // Set up search state
      store.dispatch(setSearchResults({ features: [] }))
      store.dispatch(setSearchLoading(true))
      store.dispatch(setSearchType('spatial'))
      store.dispatch(setShowZoomNotice(true))
      store.dispatch(setClickResults([{ id: '1' }]))
      store.dispatch(setMappedScenes([{ id: 'scene-1' }]))
      store.dispatch(setSelectedPopupResultIndex(5))
      store.dispatch(setPaginationNextLink('https://example.com?page=2'))
      store.dispatch(setPaginationPrevLink('https://example.com?page=1'))
      store.dispatch(setCurrentPage(2))
      store.dispatch(setTotalPages(10))
      store.dispatch(setPaginationHistory(['page1', 'page2']))
      store.dispatch(setSearchGeojsonBoundary({ type: 'Feature' }))
      store.dispatch(setIsDrawingEnabled(true))
      store.dispatch(setSearchDateRangeValue(['2020-01-01', '2020-12-31']))
      store.dispatch(setQueryableFilters({ property: 'value' }))

      expect(getState().searchResults).not.toBeNull()
      expect(getState().searchLoading).toBe(true)

      // Reset search state
      store.dispatch(resetSearchState())

      const state = getState()
      expect(state.searchGeojsonBoundary).toBeNull()
      expect(state.isDrawingEnabled).toBe(false)
      expect(state.searchResults).toBeNull()
      expect(state.searchLoading).toBe(false)
      expect(state.searchType).toBeNull()
      expect(state.showZoomNotice).toBe(false)
      expect(state.mappedScenes).toEqual([])
      expect(state.selectedPopupResultIndex).toBe(0)
      expect(state.paginationNextLink).toBeNull()
      expect(state.paginationPrevLink).toBeNull()
      expect(state.currentPage).toBe(1)
      expect(state.totalPages).toBeNull()
      expect(state.paginationHistory).toEqual([])
      expect(state.searchDateRangeValue).toEqual(DEFAULT_DATE_RANGE)
      expect(state.queryableFilters).toEqual({})
      // detailsResetKey should be incremented
      expect(state.detailsResetKey).toBe(1)
    })

    it('resetSearchState should preserve persistent UI choices', () => {
      // Set persistent state (should survive resetSearchState)
      store.dispatch(setSelectedCollection('sentinel-2'))
      store.dispatch(setSelectedVisualization({ id: 'viz-1' }))
      store.dispatch(setCurrentTheme('dark'))
      store.dispatch(setViewMode('analysis'))

      // Set search state
      store.dispatch(setSearchResults({ features: [] }))
      store.dispatch(setSearchLoading(true))

      // Reset search state
      store.dispatch(resetSearchState())

      const state = getState()
      // Persistent state should survive
      expect(state.selectedCollection).toBe('sentinel-2')
      expect(state.selectedVisualization).toEqual({ id: 'viz-1' })
      expect(state.currentTheme).toBe('dark')
      expect(state.viewMode).toBe('analysis')
      // Search state should be reset
      expect(state.searchResults).toBeNull()
      expect(state.searchLoading).toBe(false)
    })

    it('resetSearchState should increment detailsResetKey', () => {
      expect(getState().detailsResetKey).toBe(0)
      store.dispatch(resetSearchState())
      expect(getState().detailsResetKey).toBe(1)
      store.dispatch(resetSearchState())
      expect(getState().detailsResetKey).toBe(2)
    })

    it('resetSearchState should only mutate search-derived fields', () => {
      store.dispatch(setSearchResults({ features: [] }))
      store.dispatch(setSearchLoading(true))
      store.dispatch(setSearchType('spatial'))
      store.dispatch(setShowZoomNotice(true))
      store.dispatch(setMappedScenes([{ id: 'scene-1' }]))
      store.dispatch(setSelectedPopupResultIndex(5))
      store.dispatch(setPaginationNextLink('https://example.com?page=2'))
      store.dispatch(setPaginationPrevLink('https://example.com?page=1'))
      store.dispatch(setCurrentPage(2))
      store.dispatch(setTotalPages(10))
      store.dispatch(setPaginationHistory(['page1', 'page2']))
      store.dispatch(setSearchGeojsonBoundary({ type: 'Feature' }))
      store.dispatch(setIsDrawingEnabled(true))
      store.dispatch(setSearchDateRangeValue(['2020-01-01', '2020-12-31']))
      store.dispatch(setQueryableFilters({ property: 'value' }))
      store.dispatch(setSelectedCollection('sentinel-2'))

      const before = getState()
      store.dispatch(resetSearchState())
      const after = getState()

      const changedKeys = Object.keys(after)
        .filter(
          (key) => JSON.stringify(after[key]) !== JSON.stringify(before[key])
        )
        .sort()

      expect(changedKeys).toEqual(
        [
          'currentPage',
          'detailsResetKey',
          'isDrawingEnabled',
          'mappedScenes',
          'paginationHistory',
          'paginationNextLink',
          'paginationPrevLink',
          'queryableFilters',
          'searchDateRangeValue',
          'searchGeojsonBoundary',
          'searchLoading',
          'searchResults',
          'searchType',
          'selectedPopupResultIndex',
          'showZoomNotice',
          'totalPages'
        ].sort()
      )
      expect(after.selectedCollection).toBe('sentinel-2')
    })

    it('incrementDetailsResetKey should increment the key', () => {
      expect(getState().detailsResetKey).toBe(0)
      store.dispatch(incrementDetailsResetKey())
      expect(getState().detailsResetKey).toBe(1)
      store.dispatch(incrementDetailsResetKey())
      expect(getState().detailsResetKey).toBe(2)
    })
  })

  describe('mosaic cache actions', () => {
    it('setMosaicCache should merge cache properties', () => {
      const initialCache = getState().mosaicCache
      expect(initialCache).toEqual({
        lastMosaicRequestSignature: null,
        lastMosaicTopItemIds: null,
        lastMosaicCompareCount: null
      })

      // Partial update
      store.dispatch(
        setMosaicCache({
          lastMosaicRequestSignature: 'sig-123',
          lastMosaicTopItemIds: ['id-1', 'id-2']
        })
      )

      const state = getState()
      expect(state.mosaicCache.lastMosaicRequestSignature).toBe('sig-123')
      expect(state.mosaicCache.lastMosaicTopItemIds).toEqual(['id-1', 'id-2'])
      expect(state.mosaicCache.lastMosaicCompareCount).toBeNull()
    })

    it('setMosaicCache should preserve unmentioned cache properties', () => {
      store.dispatch(
        setMosaicCache({
          lastMosaicRequestSignature: 'sig-123'
        })
      )

      store.dispatch(
        setMosaicCache({
          lastMosaicTopItemIds: ['id-1', 'id-2']
        })
      )

      const state = getState()
      expect(state.mosaicCache.lastMosaicRequestSignature).toBe('sig-123')
      expect(state.mosaicCache.lastMosaicTopItemIds).toEqual(['id-1', 'id-2'])
    })
  })

  describe('queryable filters actions', () => {
    it('setQueryableFilters should update queryableFilters state', () => {
      const filters = {
        property1: { min: 10, max: 50 },
        property2: ['value1', 'value2']
      }
      expect(getState().queryableFilters).toEqual({})
      store.dispatch(setQueryableFilters(filters))
      expect(getState().queryableFilters).toEqual(filters)
    })

    it('setQueryableFilters should replace entire filter object', () => {
      store.dispatch(setQueryableFilters({ old: 'value' }))
      expect(getState().queryableFilters).toEqual({ old: 'value' })

      store.dispatch(setQueryableFilters({ new: 'value' }))
      expect(getState().queryableFilters).toEqual({ new: 'value' })
    })
  })

  describe('map action', () => {
    it('setMap should update map state (non-serializable)', () => {
      const mockMap = {
        setView: () => {},
        getZoom: () => 10,
        _leaflet_id: '123'
      }
      expect(getState().map).toEqual({})
      store.dispatch(setMap(mockMap))
      expect(getState().map).toBe(mockMap)
    })
  })

  describe('state isolation', () => {
    it('should not mutate state when dispatching multiple actions', () => {
      const initialState = { ...getState() }

      store.dispatch(setSearchLoading(true))
      store.dispatch(setShowAppLoading(false))
      store.dispatch(setViewMode('analysis'))

      // Initial state should not have changed (state management is immutable)
      expect(initialState.searchLoading).toBe(false)
      expect(initialState.showAppLoading).toBe(true)
      expect(initialState.viewMode).toBe('scene')

      // Current state should have changed
      const currentState = getState()
      expect(currentState.searchLoading).toBe(true)
      expect(currentState.showAppLoading).toBe(false)
      expect(currentState.viewMode).toBe('analysis')
    })
  })
})
