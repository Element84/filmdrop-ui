import { describe, it, expect } from 'vitest'
import {
  selectMapUiState,
  selectSearchState,
  selectRightContentLayerState
} from './mainSelectors'

function createState(overrides = {}) {
  return {
    mainSlice: {
      showMapAttribution: true,
      showAppLoading: false,
      showZoomNotice: false,
      zoomLevelNeeded: null,
      isDrawingEnabled: false,
      imageOverlayLoading: false,
      showLayerList: false,
      currentTheme: 'light',
      map: {},
      appName: 'FilmDrop',
      searchResults: null,
      searchLoading: false,
      searchType: null,
      viewMode: 'scene',
      searchGeojsonBoundary: null,
      mappedScenes: [],
      selectedCollectionData: null,
      currentPage: 1,
      totalPages: null,
      paginationNextLink: null,
      paginationPrevLink: null,
      paginationHistory: [],
      appConfig: { CART_ENABLED: true },
      cartItems: [],
      referenceLayers: [],
      ...overrides
    }
  }
}

describe('mainSelectors', () => {
  it('returns expected grouped map UI values', () => {
    const state = createState({
      showAppLoading: true,
      showZoomNotice: true,
      appName: 'Demo App'
    })

    const result = selectMapUiState(state)

    expect(result.showAppLoading).toBe(true)
    expect(result.showZoomNotice).toBe(true)
    expect(result.appName).toBe('Demo App')
  })

  it('returns expected grouped search values', () => {
    const searchResults = { features: [{ id: 'scene-1' }] }
    const selectedCollectionData = { id: 'collection-1' }
    const state = createState({
      searchResults,
      searchType: 'scene',
      selectedCollectionData
    })

    const result = selectSearchState(state)

    expect(result.searchResults).toBe(searchResults)
    expect(result.searchType).toBe('scene')
    expect(result.selectedCollectionData).toBe(selectedCollectionData)
  })

  it('returns expected grouped RightContent layer values', () => {
    const appConfig = { CART_ENABLED: false }
    const cartItems = [{ id: 'scene-1' }]
    const state = createState({ appConfig, cartItems })

    const result = selectRightContentLayerState(state)

    expect(result.appConfig).toBe(appConfig)
    expect(result.cartItems).toBe(cartItems)
  })

  it('keeps memoized result when unrelated slice values change', () => {
    const base = createState()
    const second = {
      mainSlice: {
        ...base.mainSlice,
        detailsResetKey: 1
      }
    }

    const result1 = selectMapUiState(base)
    const result2 = selectMapUiState(second)

    expect(result2).toBe(result1)
  })
})
