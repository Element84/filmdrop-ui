import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_DATE_RANGE } from '../../components/defaults'

// this is the initial state values for the redux store
// add to this for new state and set whatever default you want
const initialState = {
  map: {},
  dateTime: [],
  searchResults: null,
  clickResults: [],
  searchLoading: false,
  currentPopupResult: null,
  showPopupModal: false,
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
  hasCollectionChanged: false,
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
  showVisualizationList: false,
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
    setShowPopupModal: (state, action) => {
      state.showPopupModal = action.payload
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
    sethasCollectionChanged: (state, action) => {
      state.hasCollectionChanged = action.payload
    },
    setisDrawingEnabled: (state, action) => {
      state.isDrawingEnabled = action.payload
    },
    setmapDrawPolygonHandler: (state, action) => {
      state.mapDrawPolygonHandler = action.payload
    },
    setsearchGeojsonBoundary: (state, action) => {
      state.searchGeojsonBoundary = action.payload
    },
    setshowUploadGeojsonModal: (state, action) => {
      state.showUploadGeojsonModal = action.payload
    },
    setshowApplicationAlert: (state, action) => {
      state.showApplicationAlert = action.payload
    },
    setapplicationAlertMessage: (state, action) => {
      state.applicationAlertMessage = action.payload
    },
    setapplicationAlertSeverity: (state, action) => {
      state.applicationAlertSeverity = action.payload
    },
    setisAuthErrorAlert: (state, action) => {
      state.isAuthErrorAlert = action.payload
    },
    clearApplicationAlert: (state) => {
      state.showApplicationAlert = false
      state.applicationAlertMessage = 'System Error'
      state.applicationAlertSeverity = 'error'
      state.isAuthErrorAlert = false
    },
    setappConfig: (state, action) => {
      state.appConfig = action.payload
    },
    setcartItems: (state, action) => {
      state.cartItems = action.payload
    },
    setshowCartModal: (state, action) => {
      state.showCartModal = action.payload
    },
    setmappedScenes: (state, action) => {
      state.mappedScenes = action.payload
    },
    setimageOverlayLoading: (state, action) => {
      state.imageOverlayLoading = action.payload
    },
    setshowMapAttribution: (state, action) => {
      state.showMapAttribution = action.payload
    },
    setappName: (state, action) => {
      state.appName = action.payload
    },
    setshowLayerList: (state, action) => {
      state.showLayerList = action.payload
    },
    setshowVisualizationList: (state, action) => {
      state.showVisualizationList = action.payload
    },
    setreferenceLayers: (state, action) => {
      state.referenceLayers = action.payload
    },
    settabSelected: (state, action) => {
      state.tabSelected = action.payload
    },
    setselectedPopupResultIndex: (state, action) => {
      state.selectedPopupResultIndex = action.payload
    },
    setautoCenterOnItemChanged: (state, action) => {
      state.autoCenterOnItemChanged = action.payload
    },
    setauthTokenExists: (state, action) => {
      state.authTokenExists = action.payload
    },
    setCurrentTheme: (state, action) => {
      state.currentTheme = action.payload
    },
    setpaginationNextLink: (state, action) => {
      state.paginationNextLink = action.payload
    },
    setpaginationPrevLink: (state, action) => {
      state.paginationPrevLink = action.payload
    },
    setcurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    settotalPages: (state, action) => {
      state.totalPages = action.payload
    },
    setpaginationHistory: (state, action) => {
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
export const { setShowPopupModal } = mainSlice.actions
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
export const { sethasCollectionChanged } = mainSlice.actions
export const { setisDrawingEnabled } = mainSlice.actions
export const { setmapDrawPolygonHandler } = mainSlice.actions
export const { setsearchGeojsonBoundary } = mainSlice.actions
export const { setshowUploadGeojsonModal } = mainSlice.actions
export const { setshowApplicationAlert } = mainSlice.actions
export const { setapplicationAlertMessage } = mainSlice.actions
export const { setapplicationAlertSeverity } = mainSlice.actions
export const { setisAuthErrorAlert } = mainSlice.actions
export const { clearApplicationAlert } = mainSlice.actions
export const { setappConfig } = mainSlice.actions
export const { setcartItems } = mainSlice.actions
export const { setshowCartModal } = mainSlice.actions
export const { setmappedScenes } = mainSlice.actions
export const { setimageOverlayLoading } = mainSlice.actions
export const { setshowMapAttribution } = mainSlice.actions
export const { setappName } = mainSlice.actions
export const { setshowLayerList } = mainSlice.actions
export const { setshowVisualizationList } = mainSlice.actions
export const { setreferenceLayers } = mainSlice.actions
export const { settabSelected } = mainSlice.actions
export const { setselectedPopupResultIndex } = mainSlice.actions
export const { setautoCenterOnItemChanged } = mainSlice.actions
export const { setauthTokenExists } = mainSlice.actions
export const { setCurrentTheme } = mainSlice.actions
export const { setpaginationNextLink } = mainSlice.actions
export const { setpaginationPrevLink } = mainSlice.actions
export const { setcurrentPage } = mainSlice.actions
export const { settotalPages } = mainSlice.actions
export const { setpaginationHistory } = mainSlice.actions
export const { setMosaicCache } = mainSlice.actions
export const { addToPaginationHistory } = mainSlice.actions
export const { setQueryableFilters } = mainSlice.actions
export const { incrementDetailsResetKey } = mainSlice.actions
export const { setShowSceneOverlay } = mainSlice.actions

export default mainSlice.reducer
