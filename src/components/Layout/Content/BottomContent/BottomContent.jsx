import React from 'react'
import './BottomContent.css'
import { MOSAIC_MIN_ZOOM, APP_NAME } from '../../../defaults'
import LeafMap from '../../../LeafMap/LeafMap'

import PopupResults from '../../../PopupResults/PopupResults'

import LoadingAnimation from '../../../LoadingAnimation/LoadingAnimation'
import Legend from '../../../Legend/Legend'
import {
  VITE_CF_TEMPLATE_URL,
  VITE_SHOW_PUBLISH_BTN,
  VITE_ANALYZE_BTN_URL
} from '../../../../assets/config.js'

// redux imports
import { useSelector, useDispatch } from 'react-redux'
// you need to import each action you need to use
import {
  setShowPublishModal,
  setShowLaunchModal,
  setShowZoomNotice,
  setisDrawingEnabled
} from '../../../../redux/slices/mainSlice'

import {
  setMapZoomLevel,
  disableMapPolyDrawing
} from '../../../../utils/mapHelper'

const BottomContent = () => {
  // set up useSelector to get value from store
  const _map = useSelector((state) => state.mainSlice.map)
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

  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()

  const ANALYZE_LINK = VITE_ANALYZE_BTN_URL
  const SHOW_PUBLISH_BTN = VITE_SHOW_PUBLISH_BTN
  const CF_TEMPLATE_URL = VITE_CF_TEMPLATE_URL
  const VIEWER_BTN_TEXT = `Launch Your Own ${APP_NAME}`

  const resultType = _searchType === 'hex' ? 'hex cells' : 'grid cells'

  function onAnalyzeClick() {
    window.open(ANALYZE_LINK, '_blank')
  }

  function onPublishClick() {
    dispatch(setShowPublishModal(true))
  }

  function onLaunchClick() {
    dispatch(setShowLaunchModal(true))
  }

  function onZoomClick() {
    if (_viewMode === 'mosaic') {
      _map.setZoom(MOSAIC_MIN_ZOOM)
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

  return (
    <div className="BottomContent">
      <LeafMap></LeafMap>
      {_showZoomNotice && (
        <div className="ZoomNotice">
          Images are not visible at this zoom level.
          <a onClick={onZoomClick}>
            <strong>Zoom in</strong>
          </a>
        </div>
      )}
      <div className="actionButtons">
        {ANALYZE_LINK && (
          <button className="actionButton" onClick={() => onAnalyzeClick()}>
            Analyze
          </button>
        )}
        {SHOW_PUBLISH_BTN === true && (
          <button className="actionButton" onClick={() => onPublishClick()}>
            Publish
          </button>
        )}
        {CF_TEMPLATE_URL && (
          <button className="actionButton" onClick={() => onLaunchClick()}>
            {VIEWER_BTN_TEXT}
          </button>
        )}
      </div>
      {_searchResults?.numberMatched &&
      _searchResults?.searchType !== 'AggregatedResults' &&
      !_isDrawingEnabled ? (
        <div className="resultCount">
          Showing {_searchResults.numberReturned} of{' '}
          {_searchResults.numberMatched} scenes
        </div>
      ) : null}
      {_searchResults?.searchType === 'AggregatedResults' &&
      !_isDrawingEnabled ? (
        <div className="resultCount">
          <strong>Showing Aggregated Results</strong>
          {_searchResults.features.length} {resultType},{' '}
          {_searchResults.numberMatched} total scenes
          {_searchResults.properties.overflow > 0 &&
            `, ${_searchResults.properties.overflow} scenes not represented`}
        </div>
      ) : null}
      {_showPopupModal && _clickResults.length > 0 ? (
        <PopupResults results={_clickResults}></PopupResults>
      ) : null}
      {_searchLoading ? (
        <div className="loadingSpinnerContainer">
          <LoadingAnimation></LoadingAnimation>
        </div>
      ) : null}
      {_showAppLoading && (
        <div className="appLoadingContainer">
          <LoadingAnimation></LoadingAnimation>
          <span>Loading {APP_NAME}</span>
        </div>
      )}
      {_searchType === 'hex' &&
        _searchResults?.searchType === 'AggregatedResults' && (
          <Legend results={_searchResults}></Legend>
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
    </div>
  )
}

export default BottomContent
