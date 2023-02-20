import React from 'react'
import './BottomContent.css'
import { MIN_ZOOM } from '../../../defaults'
import LeafMap from '../../../LeafMap/LeafMap.js'

import PopupResults from '../../../PopupResults/PopupResults'

import LoadingAnimation from '../../../LoadingAnimation/LoadingAnimation'

// redux imports
import { useSelector, useDispatch } from 'react-redux'
// you need to import each action you need to use
import { setShowPublishModal } from '../../../../redux/slices/mainSlice'

const BottomContent = () => {
  // set up useSelector to get value from store
  const _map = useSelector((state) => state.mainSlice.map)
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  const _clickResults = useSelector((state) => state.mainSlice.clickResults)
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading)
  const _showPublishModal = useSelector(
    (state) => state.mainSlice.showPublishModal
  )
  const _showZoomNotice = useSelector((state) => state.mainSlice.showZoomNotice)

  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()

  const ANALYZE_LINK = process.env.REACT_APP_ANALYZE_BTN_URL
  const SHOW_PUBLISH_BTN = process.env.REACT_APP_SHOW_PUBLISH_BTN

  function onAnalyzeClick() {
    window.open(ANALYZE_LINK, '_blank')
  }

  function onPublishClick() {
    dispatch(setShowPublishModal(!_showPublishModal))
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
      </div>
      {_searchResults !== null ? (
        <div className="resultCount">
          Showing {_searchResults.features.length} of{' '}
          {_searchResults.context.matched} Scenes
        </div>
      ) : null}
      {_clickResults.length > 0 ? (
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
