import { createSelector } from '@reduxjs/toolkit'

const selectShowMapAttribution = (state) => state.mainSlice.showMapAttribution
const selectShowAppLoading = (state) => state.mainSlice.showAppLoading
const selectShowZoomNotice = (state) => state.mainSlice.showZoomNotice
const selectZoomLevelNeeded = (state) => state.mainSlice.zoomLevelNeeded
const selectIsDrawingEnabled = (state) => state.mainSlice.isDrawingEnabled
const selectImageOverlayLoading = (state) => state.mainSlice.imageOverlayLoading
const selectShowLayerList = (state) => state.mainSlice.showLayerList
const selectCurrentTheme = (state) => state.mainSlice.currentTheme
const selectMap = (state) => state.mainSlice.map
const selectAppName = (state) => state.mainSlice.appName

const selectSearchResults = (state) => state.mainSlice.searchResults
const selectSearchLoading = (state) => state.mainSlice.searchLoading
const selectSearchType = (state) => state.mainSlice.searchType
const selectViewMode = (state) => state.mainSlice.viewMode
const selectSearchGeojsonBoundary = (state) =>
  state.mainSlice.searchGeojsonBoundary
const selectMappedScenes = (state) => state.mainSlice.mappedScenes
const selectSelectedCollectionData = (state) =>
  state.mainSlice.selectedCollectionData

const selectAppConfig = (state) => state.mainSlice.appConfig
const selectCartItems = (state) => state.mainSlice.cartItems

export const selectMapUiState = createSelector(
  [
    selectShowMapAttribution,
    selectShowAppLoading,
    selectShowZoomNotice,
    selectZoomLevelNeeded,
    selectIsDrawingEnabled,
    selectImageOverlayLoading,
    selectShowLayerList,
    selectCurrentTheme,
    selectMap,
    selectAppName
  ],
  (
    showMapAttribution,
    showAppLoading,
    showZoomNotice,
    zoomLevelNeeded,
    isDrawingEnabled,
    imageOverlayLoading,
    showLayerList,
    currentTheme,
    map,
    appName
  ) => ({
    showMapAttribution,
    showAppLoading,
    showZoomNotice,
    zoomLevelNeeded,
    isDrawingEnabled,
    imageOverlayLoading,
    showLayerList,
    currentTheme,
    map,
    appName
  })
)

export const selectSearchState = createSelector(
  [
    selectSearchResults,
    selectSearchLoading,
    selectSearchType,
    selectViewMode,
    selectSearchGeojsonBoundary,
    selectMappedScenes,
    selectSelectedCollectionData
  ],
  (
    searchResults,
    searchLoading,
    searchType,
    viewMode,
    searchGeojsonBoundary,
    mappedScenes,
    selectedCollectionData
  ) => ({
    searchResults,
    searchLoading,
    searchType,
    viewMode,
    searchGeojsonBoundary,
    mappedScenes,
    selectedCollectionData
  })
)

export const selectRightContentLayerState = createSelector(
  [selectAppConfig, selectCartItems],
  (appConfig, cartItems) => ({
    appConfig,
    cartItems
  })
)
