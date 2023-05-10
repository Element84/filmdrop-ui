import { createSlice } from '@reduxjs/toolkit'
import { VITE_DEFAULT_COLLECTION } from '../../assets/config.js'

// this is the initial state values for the redux store
// add to this for new state and set whatever default you want
const initialState = {
  map: {},
  dateTime: [],
  cloudCover: 0,
  showCloudSlider: true,
  selectedCollection: VITE_DEFAULT_COLLECTION || null,
  collectionError: false,
  searchResults: null,
  clickResults: [],
  searchLoading: false,
  currentPopupResult: null,
  showPopupModal: false,
  showPublishModal: false,
  searchParameters: 'need to run search',
  showZoomNotice: false,
  zoomLevelNeeded: null,
  typeOfSearch: null,
  showLaunchModal: false,
  showLaunchImageModal: false,
  viewMode: 'scene',
  sarPolarizations: false,
  collectionTemporalData: null,
  collectionSpatialData: null,
  fullCollectionData: null,
  mapAttribution: null,
  showAppLoading: true
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
    setCloudCover: (state, action) => {
      state.cloudCover = action.payload
    },
    setShowCloudSlider: (state, action) => {
      state.showCloudSlider = action.payload
    },
    setSelectedCollection: (state, action) => {
      state.selectedCollection = action.payload
    },
    setCollectionError: (state, action) => {
      state.collectionError = action.payload
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
    setShowPublishModal: (state, action) => {
      state.showPublishModal = action.payload
    },
    setSearchParameters: (state, action) => {
      state.searchParameters = action.payload
    },
    setShowZoomNotice: (state, action) => {
      state.showZoomNotice = action.payload
    },
    setZoomLevelNeeded: (state, action) => {
      state.zoomLevelNeeded = action.payload
    },
    setTypeOfSearch: (state, action) => {
      state.typeOfSearch = action.payload
    },
    setShowLaunchModal: (state, action) => {
      state.showLaunchModal = action.payload
    },
    setShowLaunchImageModal: (state, action) => {
      state.showLaunchImageModal = action.payload
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    setSarPolarizations: (state, action) => {
      state.sarPolarizations = action.payload
    },
    setCollectionTemporalData: (state, action) => {
      state.collectionTemporalData = action.payload
    },
    setCollectionSpatialData: (state, action) => {
      state.collectionSpatialData = action.payload
    },
    setFullCollectionData: (state, action) => {
      state.fullCollectionData = action.payload
    },
    setMapAttribution: (state, action) => {
      state.mapAttribution = action.payload
    },
    setShowAppLoading: (state, action) => {
      state.showAppLoading = action.payload
    }
  }
})

// finally, add a new export for the
// reducer/action info that you added above
export const { mainSliceReset } = mainSlice.actions
export const { setMap } = mainSlice.actions
export const { setCloudCover } = mainSlice.actions
export const { setShowCloudSlider } = mainSlice.actions
export const { setSelectedCollection } = mainSlice.actions
export const { setCollectionError } = mainSlice.actions
export const { setSearchResults } = mainSlice.actions
export const { setClickResults } = mainSlice.actions
export const { setSearchLoading } = mainSlice.actions
export const { setCurrentPopupResult } = mainSlice.actions
export const { setShowPopupModal } = mainSlice.actions
export const { setShowPublishModal } = mainSlice.actions
export const { setSearchParameters } = mainSlice.actions
export const { setShowZoomNotice } = mainSlice.actions
export const { setZoomLevelNeeded } = mainSlice.actions
export const { setTypeOfSearch } = mainSlice.actions
export const { setShowLaunchModal } = mainSlice.actions
export const { setShowLaunchImageModal } = mainSlice.actions
export const { setViewMode } = mainSlice.actions
export const { setSarPolarizations } = mainSlice.actions
export const { setCollectionTemporalData } = mainSlice.actions
export const { setCollectionSpatialData } = mainSlice.actions
export const { setFullCollectionData } = mainSlice.actions
export const { setMapAttribution } = mainSlice.actions
export const { setShowAppLoading } = mainSlice.actions

export default mainSlice.reducer
