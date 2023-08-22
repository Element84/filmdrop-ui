import React, { useState, useRef } from 'react'
import './BottomContent.css'
import {
  DEFAULT_MOSAIC_MIN_ZOOM,
  DEFAULT_APP_NAME,
  DEFAULT_MAX_SCENES_RENDERED
} from '../../../defaults'
import LeafMap from '../../../LeafMap/LeafMap'
import PopupResults from '../../../PopupResults/PopupResults'
import LoadingAnimation from '../../../LoadingAnimation/LoadingAnimation'
import { useSelector, useDispatch } from 'react-redux'
import {
  setShowPublishModal,
  setShowZoomNotice,
  setisDrawingEnabled,
  setmappedScenes,
  setSearchLoading
} from '../../../../redux/slices/mainSlice'
import {
  setMapZoomLevel,
  disableMapPolyDrawing,
  clearLayer,
  clearMapSelection,
  selectMappedScenes
} from '../../../../utils/mapHelper'
import Box from '@mui/material/Box'
import LayerLegend from '../../../Legend/LayerLegend/LayerLegend'
import { fetchAllFeatures } from '../../../../services/get-all-scenes-service'
import { CircularProgress } from '@mui/material'

const BottomContent = () => {
  const [allScenesLoading, setallScenesLoading] = useState(false)
  const _showAppLoading = useSelector((state) => state.mainSlice.showAppLoading)
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  const _clickResults = useSelector((state) => state.mainSlice.clickResults)
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading)
  const _showZoomNotice = useSelector((state) => state.mainSlice.showZoomNotice)
  const _zoomLevelNeeded = useSelector(
    (state) => state.mainSlice.zoomLevelNeeded
  )
  const _searchType = useSelector((state) => state.mainSlice.searchType)
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)
  const _showPopupModal = useSelector((state) => state.mainSlice.showPopupModal)
  const _isDrawingEnabled = useSelector(
    (state) => state.mainSlice.isDrawingEnabled
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _searchGeojsonBoundary = useSelector(
    (state) => state.mainSlice.searchGeojsonBoundary
  )
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  const _mappedScenes = useSelector((state) => state.mainSlice.mappedScenes)
  const _isAutoSearchSet = useSelector(
    (state) => state.mainSlice.isAutoSearchSet
  )
  const _imageOverlayLoading = useSelector(
    (state) => state.mainSlice.imageOverlayLoading
  )

  const dispatch = useDispatch()

  const abortControllerRef = useRef(null)

  const VIEWER_BTN_TEXT = `Launch Your Own ${DEFAULT_APP_NAME}`

  const resultType = _searchType === 'hex' ? 'hex cells' : 'grid cells'

  function onAnalyzeClick() {
    window.open(_appConfig.ANALYZE_BTN_URL, '_blank')
  }

  function onPublishClick() {
    dispatch(setShowPublishModal(true))
  }

  function onLaunchClick() {
    window.open(_appConfig.LAUNCH_URL, '_blank')
  }

  function onZoomClick() {
    if (_viewMode === 'mosaic') {
      const MOSAIC_MIN_ZOOM =
        _appConfig.MOSAIC_MIN_ZOOM_LEVEL || DEFAULT_MOSAIC_MIN_ZOOM
      setMapZoomLevel(MOSAIC_MIN_ZOOM)
      dispatch(setShowZoomNotice(false))
    } else if (_zoomLevelNeeded) {
      setMapZoomLevel(_zoomLevelNeeded)
    }
  }

  function onCancelDrawGeomClicked() {
    dispatch(setisDrawingEnabled(false))
    disableMapPolyDrawing()
  }

  function onLoadAllScenesClicked() {
    dispatch(setmappedScenes([]))
    clearMapSelection()
    clearLayer('searchResultsLayer')
    clearLayer('clickedSceneImageLayer')
    setallScenesLoading(true)
    dispatch(setSearchLoading(true))

    const nextLinkObj = _searchResults.links.find((link) => link.rel === 'next')

    const urlObj = new URL(nextLinkObj.href)
    urlObj.searchParams.delete('next')
    const baseURL = urlObj.toString()

    abortControllerRef.current = new AbortController()
    const featuresPromise = fetchAllFeatures(
      baseURL,
      abortControllerRef.current.signal
    )

    featuresPromise
      .then(() => {
        setallScenesLoading(false)
        dispatch(setSearchLoading(false))
        clearLayer('clickedSceneImageLayer')
      })
      .catch((error) => {
        if (abortControllerRef.current.signal.aborted) {
          setallScenesLoading(false)
          dispatch(setSearchLoading(false))
        } else {
          setallScenesLoading(false)
          dispatch(setSearchLoading(false))
          console.error('An error occurred:', error)
        }
      })
  }

  function onCancelLoadAllScenesClicked() {
    abortControllerRef.current.abort()
  }

  function onSelectAllScenesClicked() {
    selectMappedScenes()
  }

  return (
    <div className="BottomContent">
      <LeafMap></LeafMap>
      {_showZoomNotice && (
        <div className="ZoomNotice">
          Images are not visible at this zoom level.
          <Box className="zoomInText" onClick={onZoomClick}>
            <strong>Zoom in</strong>
          </Box>
        </div>
      )}
      <div className="actionButtons">
        {_appConfig.ANALYZE_BTN_URL && (
          <button className="actionButton" onClick={() => onAnalyzeClick()}>
            Analyze
          </button>
        )}
        {_appConfig.SHOW_PUBLISH_BTN && (
          <button className="actionButton" onClick={() => onPublishClick()}>
            Publish
          </button>
        )}
        {_appConfig.LAUNCH_URL && (
          <button className="actionButton" onClick={() => onLaunchClick()}>
            {VIEWER_BTN_TEXT}
          </button>
        )}
      </div>
      {_searchResults?.numberMatched &&
      _searchResults?.searchType !== 'AggregatedResults' &&
      !_isDrawingEnabled ? (
        <div className="resultCount" data-testid="testShowingScenesMessage">
          <div
            className={
              _appConfig.CART_ENABLED
                ? 'resultCountCartText'
                : 'resultCountText'
            }
          >
            Showing {_mappedScenes.length} of {_searchResults.numberMatched}{' '}
            scenes
          </div>
          {!_isAutoSearchSet ? (
            <div className="resultCountButtons">
              {_searchResults.numberReturned < _searchResults.numberMatched ? (
                <div>
                  {allScenesLoading ? (
                    <button
                      onClick={onCancelLoadAllScenesClicked}
                      className="countButton"
                    >
                      <span>
                        <span className="countButtonCancelText">Cancel</span>
                        <CircularProgress
                          size={14}
                          color="inherit"
                        ></CircularProgress>
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={
                        _mappedScenes.length === _searchResults.numberMatched ||
                        _mappedScenes.length >= DEFAULT_MAX_SCENES_RENDERED
                          ? null
                          : onLoadAllScenesClicked
                      }
                      className={
                        _mappedScenes.length === _searchResults.numberMatched ||
                        _mappedScenes.length >= DEFAULT_MAX_SCENES_RENDERED
                          ? 'countButton disabledCountButton'
                          : 'countButton'
                      }
                    >
                      {_mappedScenes.length === _searchResults.numberMatched ||
                      _mappedScenes.length >= DEFAULT_MAX_SCENES_RENDERED
                        ? 'Max scenes loaded'
                        : 'Load all scenes'}
                    </button>
                  )}
                </div>
              ) : null}
              <button
                onClick={
                  allScenesLoading ||
                  _mappedScenes.length === _clickResults.length
                    ? null
                    : onSelectAllScenesClicked
                }
                className={
                  allScenesLoading ||
                  _mappedScenes.length === _clickResults.length
                    ? 'countButton disabledCountButton'
                    : 'countButton'
                }
              >
                Select scenes
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {_searchResults?.searchType === 'AggregatedResults' &&
      !_isDrawingEnabled ? (
        <div className="resultCount" data-testid="testShowingAggregatedMessage">
          <div className="resultCountText">
            <strong>Showing Aggregated Results</strong>
            {_searchResults.features.length} {resultType},{' '}
            {_searchResults.numberMatched} total scenes
            {_searchResults.properties.overflow > 0 &&
              `, ${_searchResults.properties.overflow} scenes not represented`}
          </div>
        </div>
      ) : null}
      {_showPopupModal && _clickResults.length > 0 ? (
        <PopupResults results={_clickResults}></PopupResults>
      ) : null}
      {_searchLoading ? (
        <div
          className="loadingSpinnerContainer"
          data-testid="testsearchLoadingAnimation"
        >
          <LoadingAnimation></LoadingAnimation>
        </div>
      ) : null}
      {_imageOverlayLoading ? (
        <div
          className="loadingSpinnerContainer"
          data-testid="test_imageOverlayLoadingAnimation"
        >
          <LoadingAnimation></LoadingAnimation>
        </div>
      ) : null}
      {_showAppLoading && (
        <div
          className="appLoadingContainer"
          data-testid="test_applicationLoadingAnimation"
        >
          <LoadingAnimation></LoadingAnimation>
          <span>Loading {DEFAULT_APP_NAME}</span>
        </div>
      )}
      {_isDrawingEnabled ? (
        <div className="drawGeomMessage">
          <div className="drawGeomMessageText">
            <span className="drawGeomMessageTextTitle">
              Draw Search Boundary
            </span>
            <span>
              Click the map to add points. Click the first point to finish.
            </span>
          </div>
          <div className="drawGeomMessageButtons">
            <button
              className="drawGeomMessageCancelButton"
              onClick={onCancelDrawGeomClicked}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {_searchGeojsonBoundary ||
      (_searchType && _searchResults) ||
      _cartItems.length > 0 ? (
        <LayerLegend></LayerLegend>
      ) : null}
    </div>
  )
}

export default BottomContent
