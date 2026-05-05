import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import './PopupResult.css'
import { useSelector } from 'react-redux'
import { zoomToItemExtent } from '../../utils/mapLayers'
import ItemHeader from '../EnhancedDetails/ItemHeader.jsx'
import VisualizationDropdown from '../VisualizationDropdown/VisualizationDropdown'

const PopupResult = (props) => {
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _autoCenterOnItemChanged = useSelector(
    (state) => state.mainSlice.autoCenterOnItemChanged
  )
  const [thumbnailInfo, setThumbnailInfo] = useState(null)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Reset failure state whenever the item changes.
    setThumbnailFailed(false)
    if (props.result) {
      if (_autoCenterOnItemChanged) {
        zoomToItemExtent(props.result)
      }
      const thumbnailURLForSelection = props.result?.links?.find(
        ({ rel }) => rel === 'thumbnail'
      )?.href

      // If no thumbnail available, clear immediately
      if (!thumbnailURLForSelection) {
        setThumbnailInfo(null)
        return
      }

      // Preload the new image, keeping the previous one visible until ready
      const image = new Image()
      image.onload = function () {
        if (!isMountedRef.current) return
        if (this.width > 0) {
          setThumbnailInfo({
            url: thumbnailURLForSelection,
            width: this.width,
            height: this.height
          })
        }
      }
      image.src = thumbnailURLForSelection
    }
    // We intentionally do not list `_autoCenterOnItemChanged` so that toggling
    // auto-center mid-view does not re-zoom or re-trigger the thumbnail load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.result])

  return (
    <div
      data-testid="testPopupResult"
      className={
        _appConfig.CART_ENABLED
          ? 'popupResult popupResultCartEnabled'
          : 'popupResult'
      }
    >
      {props.result ? (
        <div className="popupResultHero">
          {thumbnailInfo && !thumbnailFailed && (
            <div
              className="popupResultThumbnailContainer"
              style={{
                aspectRatio: `${thumbnailInfo.width} / ${thumbnailInfo.height}`
              }}
            >
              <picture>
                <img
                  src={thumbnailInfo.url}
                  alt="thumbnail"
                  className="popupResultThumbnail"
                  onError={() => setThumbnailFailed(true)}
                />
              </picture>
            </div>
          )}
          <ItemHeader id={props.result.id} collection={props.result.collection}>
            <VisualizationDropdown />
          </ItemHeader>
        </div>
      ) : null}
    </div>
  )
}

PopupResult.propTypes = {
  result: PropTypes.object
}

export default PopupResult
