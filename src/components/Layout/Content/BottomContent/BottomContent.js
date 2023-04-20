import React from 'react'
import './BottomContent.css'
import { MIN_ZOOM, APP_NAME } from '../../../defaults'
import LeafMap from '../../../LeafMap/LeafMap.js'

import PopupResults from '../../../PopupResults/PopupResults'

import LoadingAnimation from '../../../LoadingAnimation/LoadingAnimation'

// redux imports
import { useSelector, useDispatch } from 'react-redux'
// you need to import each action you need to use
import {
  setShowPublishModal,
  setShowLaunchModal
} from '../../../../redux/slices/mainSlice'

const BottomContent = () => {
  // set up useSelector to get value from store
  const _map = useSelector((state) => state.mainSlice.map)
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  const _clickResults = useSelector((state) => state.mainSlice.clickResults)
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading)
  const _showZoomNotice = useSelector((state) => state.mainSlice.showZoomNotice)
  const _showPopupModal = useSelector((state) => state.mainSlice.showPopupModal)

  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()

  const ANALYZE_LINK = process.env.REACT_APP_ANALYZE_BTN_URL
  const SHOW_PUBLISH_BTN = process.env.REACT_APP_SHOW_PUBLISH_BTN
  const CF_TEMPLATE_URL = process.env.REACT_APP_CF_TEMPLATE_URL
  const VIEWER_BTN_TEXT = `Launch Your Own ${APP_NAME}`

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
    _map.setZoom(MIN_ZOOM)
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
        {SHOW_PUBLISH_BTN === 'true' && (
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
      _searchResults?.searchType !== 'AggregatedResults' ? (
        <div className="resultCount">
          Showing {_searchResults.numberReturned} of{' '}
          {_searchResults.numberMatched} Scenes
        </div>
      ) : null}
      {_searchResults?.searchType === 'AggregatedResults' ? (
        <div className="resultCount">
          Showing {_searchResults.features.length} Cells,{' '}
          {_searchResults.numberMatched} Total Scenes
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
    </div>
  )
}

export default BottomContent
