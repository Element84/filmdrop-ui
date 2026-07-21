import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_DATE_RANGE } from '../../constants/defaults'

// this is the initial state values for the redux store
// add to this for new state and set whatever default you want
//
// NOTE: `state.map` holds a live Leaflet map instance (non-serializable).
// `createFilmDropStore()` disables Redux Toolkit's serializableCheck to allow
// this. Consequence: Redux DevTools time-travel won't work for map state.
const initialState = {
  map: {},
  searchResults: null,
  clickResults: [],
  searchLoading: false,
  currentPopupResult: null,
  showZoomNotice: false,
  zoomLevelNeeded: null,
  viewMode: 'scene',
  showAppLoading: true,
  searchType: null,
  collectionsData: [],
  collectionsLoadError: false,
  selectedCollectionData: null,
  searchDateRangeValue: DEFAULT_DATE_RANGE,
  localGridData: {},
  isDrawingEnabled: false,
  mapDrawPolygonHandler: null,
  searchGeojsonBoundary: null,
  showUploadGeojsonModal: false,
  showApplicationAlert: false,
  applicationAlertMessage: 'System Error',
  applicationAlertSeverity: 'error',
  isAuthErrorAlert: false,
  appConfig: null,
  cartItems: [],
  showCartModal: false,
  mappedScenes: [],
  imageOverlayLoading: false,
  showMapAttribution: true,
  appName: '',
  showLayerList: false,
  referenceLayers: [],
  selectedCollection: '',
  selectedVisualization: null,
  tabSelected: 'search',
  selectedPopupResultIndex: 0,
  autoCenterOnItemChanged: false,
  authTokenExists: false,
  currentTheme: null,
  paginationNextLink: null,
  paginationPrevLink: null,
  currentPage: 1,
  totalPages: null,
  paginationHistory: [],
  queryableFilters: {},
  detailsResetKey: 0,
  showSceneOverlay: true,
  // Per-store mosaic request cache. Lifetime matches the owning
  // FilmDropRoot — reset via mainSliceReset on unmount.
  mosaicCache: {
    lastMosaicRequestSignature: null,
    lastMosaicTopItemIds: null,
    lastMosaicCompareCount: null
  }
}

// next, for every key in the initialState
// add a reducer and a basic setter action
// this is the simple way to just set it
// look up redux doc for more advances ways to add/alter actions
export const mainSlice = createSlice({
  name: 'mainSlice',
  initialState,
  reducers: {
    mainSliceReset: () => initialState,
    setMap: (state, action) => {
      state.map = action.payload
    },
    setSelectedCollection: (state, action) => {
      state.selectedCollection = action.payload
    },
    setSelectedVisualization: (state, action) => {
      state.selectedVisualization = action.payload
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    },
    setClickResults: (state, action) => {
      state.clickResults = action.payload
    },
    setSearchLoading: (state, action) => {
      state.searchLoading = action.payload
    },
    setCurrentPopupResult: (state, action) => {
      state.currentPopupResult = action.payload
    },
    setShowZoomNotice: (state, action) => {
      state.showZoomNotice = action.payload
    },
    setZoomLevelNeeded: (state, action) => {
      state.zoomLevelNeeded = action.payload
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    setShowAppLoading: (state, action) => {
      state.showAppLoading = action.payload
    },
    setSearchType: (state, action) => {
      state.searchType = action.payload
    },
    setCollectionsData: (state, action) => {
      state.collectionsData = action.payload
    },
    setCollectionsLoadError: (state, action) => {
      state.collectionsLoadError = action.payload
    },
    setSelectedCollectionData: (state, action) => {
      state.selectedCollectionData = action.payload
    },
    setSearchDateRangeValue: (state, action) => {
      state.searchDateRangeValue = action.payload
    },
    setLocalGridData: (state, action) => {
      state.localGridData = action.payload
    },
    setIsDrawingEnabled: (state, action) => {
      state.isDrawingEnabled = action.payload
    },
    setMapDrawPolygonHandler: (state, action) => {
      state.mapDrawPolygonHandler = action.payload
    },
    setSearchGeojsonBoundary: (state, action) => {
      state.searchGeojsonBoundary = action.payload
    },
    setShowUploadGeojsonModal: (state, action) => {
      state.showUploadGeojsonModal = action.payload
    },
    setShowApplicationAlert: (state, action) => {
      state.showApplicationAlert = action.payload
    },
    setApplicationAlertMessage: (state, action) => {
      state.applicationAlertMessage = action.payload
    },
    setApplicationAlertSeverity: (state, action) => {
      state.applicationAlertSeverity = action.payload
    },
    setIsAuthErrorAlert: (state, action) => {
      state.isAuthErrorAlert = action.payload
    },
    clearApplicationAlert: (state) => {
      state.showApplicationAlert = false
      state.applicationAlertMessage = 'System Error'
      state.applicationAlertSeverity = 'error'
      state.isAuthErrorAlert = false
    },
    setAppConfig: (state, action) => {
      state.appConfig = action.payload
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload
    },
    setShowCartModal: (state, action) => {
      state.showCartModal = action.payload
    },
    setMappedScenes: (state, action) => {
      state.mappedScenes = action.payload
    },
    setImageOverlayLoading: (state, action) => {
      state.imageOverlayLoading = action.payload
    },
    setShowMapAttribution: (state, action) => {
      state.showMapAttribution = action.payload
    },
    setAppName: (state, action) => {
      state.appName = action.payload
    },
    setShowLayerList: (state, action) => {
      state.showLayerList = action.payload
    },
    setReferenceLayers: (state, action) => {
      state.referenceLayers = action.payload
    },
    setTabSelected: (state, action) => {
      state.tabSelected = action.payload
    },
    setSelectedPopupResultIndex: (state, action) => {
      state.selectedPopupResultIndex = action.payload
    },
    setAutoCenterOnItemChanged: (state, action) => {
      state.autoCenterOnItemChanged = action.payload
    },
    setAuthTokenExists: (state, action) => {
      state.authTokenExists = action.payload
    },
    setCurrentTheme: (state, action) => {
      state.currentTheme = action.payload
    },
    setPaginationNextLink: (state, action) => {
      state.paginationNextLink = action.payload
    },
    setPaginationPrevLink: (state, action) => {
      state.paginationPrevLink = action.payload
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload
    },
    setPaginationHistory: (state, action) => {
      state.paginationHistory = action.payload
    },
    addToPaginationHistory: (state, action) => {
      state.paginationHistory = [...state.paginationHistory, action.payload]
    },
    setQueryableFilters: (state, action) => {
      state.queryableFilters = action.payload
    },
    setMosaicCache: (state, action) => {
      state.mosaicCache = {
        ...state.mosaicCache,
        ...action.payload
      }
    },
    incrementDetailsResetKey: (state) => {
      state.detailsResetKey += 1
    },
    // Compound reset for clearSearch: zeroes all search-derived state in a
    // single action so consumers don't pay for ~15 sequential dispatches.
    // Does not touch persistent UI choices (selectedCollection,
    // selectedVisualization, currentTheme, viewMode, etc.) or the URL —
    // the caller still owns the navigation step.
    resetSearchState: (state) => {
      state.searchGeojsonBoundary = null
      state.isDrawingEnabled = false
      state.searchResults = null
      state.searchLoading = false
      state.searchType = null
      state.showZoomNotice = false
      state.mappedScenes = []
      state.selectedPopupResultIndex = 0
      state.paginationNextLink = null
      state.paginationPrevLink = null
      state.currentPage = 1
      state.totalPages = null
      state.paginationHistory = []
      state.searchDateRangeValue = DEFAULT_DATE_RANGE
      state.queryableFilters = {}
      state.detailsResetKey += 1
    },
    setShowSceneOverlay: (state, action) => {
      state.showSceneOverlay = action.payload
    }
  }
})

// finally, add a new export for the
// reducer/action info that you added above
export const { mainSliceReset } = mainSlice.actions
export const { setMap } = mainSlice.actions
export const { setSelectedCollection } = mainSlice.actions
export const { setSelectedVisualization } = mainSlice.actions
export const { setSearchResults } = mainSlice.actions
export const { setClickResults } = mainSlice.actions
export const { setSearchLoading } = mainSlice.actions
export const { setCurrentPopupResult } = mainSlice.actions
export const { setShowZoomNotice } = mainSlice.actions
export const { setZoomLevelNeeded } = mainSlice.actions
export const { setViewMode } = mainSlice.actions
export const { setShowAppLoading } = mainSlice.actions
export const { setSearchType } = mainSlice.actions
export const { setCollectionsData } = mainSlice.actions
export const { setCollectionsLoadError } = mainSlice.actions
export const { setSelectedCollectionData } = mainSlice.actions
export const { setSearchDateRangeValue } = mainSlice.actions
export const { setLocalGridData } = mainSlice.actions
export const { setIsDrawingEnabled } = mainSlice.actions
export const { setMapDrawPolygonHandler } = mainSlice.actions
export const { setSearchGeojsonBoundary } = mainSlice.actions
export const { setShowUploadGeojsonModal } = mainSlice.actions
export const { setShowApplicationAlert } = mainSlice.actions
export const { setApplicationAlertMessage } = mainSlice.actions
export const { setApplicationAlertSeverity } = mainSlice.actions
export const { setIsAuthErrorAlert } = mainSlice.actions
export const { clearApplicationAlert } = mainSlice.actions
export const { setAppConfig } = mainSlice.actions
export const { setCartItems } = mainSlice.actions
export const { setShowCartModal } = mainSlice.actions
export const { setMappedScenes } = mainSlice.actions
export const { setImageOverlayLoading } = mainSlice.actions
export const { setShowMapAttribution } = mainSlice.actions
export const { setAppName } = mainSlice.actions
export const { setShowLayerList } = mainSlice.actions
export const { setReferenceLayers } = mainSlice.actions
export const { setTabSelected } = mainSlice.actions
export const { setSelectedPopupResultIndex } = mainSlice.actions
export const { setAutoCenterOnItemChanged } = mainSlice.actions
export const { setAuthTokenExists } = mainSlice.actions
export const { setCurrentTheme } = mainSlice.actions
export const { setPaginationNextLink } = mainSlice.actions
export const { setPaginationPrevLink } = mainSlice.actions
export const { setCurrentPage } = mainSlice.actions
export const { setTotalPages } = mainSlice.actions
export const { setPaginationHistory } = mainSlice.actions
export const { setMosaicCache } = mainSlice.actions
export const { addToPaginationHistory } = mainSlice.actions
export const { setQueryableFilters } = mainSlice.actions
export const { incrementDetailsResetKey } = mainSlice.actions
export const { resetSearchState } = mainSlice.actions
export const { setShowSceneOverlay } = mainSlice.actions

export default mainSlice.reducer
