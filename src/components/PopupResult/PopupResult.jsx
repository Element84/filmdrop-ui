import { React, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './PopupResult.css'

import { useDispatch } from 'react-redux'
import {
  setCurrentPopupResult,
  setShowPopupModal
} from '../../redux/slices/mainSlice'

import {
  clearMapSelection,
  debounceTitilerOverlay
} from '../../utils/mapHelper'

const PopupResult = (props) => {
  const dispatch = useDispatch()
  const [thumbnailURL, setthumbnailURL] = useState(null)

  useEffect(() => {
    if (props.result) {
      dispatch(setCurrentPopupResult(props.result))

      debounceTitilerOverlay()

      const thumbnailURLForSelection = props.result?.links?.find(
        ({ rel }) => rel === 'thumbnail'
      )?.href

      const image = new Image()
      image.onload = function () {
        if (this.width > 0) {
          setthumbnailURL(thumbnailURLForSelection)
        }
      }
      image.onerror = function () {
        setthumbnailURL('/ThumbnailNotAvailable.png')
      }
      image.src = thumbnailURLForSelection
    }
    // eslint-disable-next-line
  }, [props.result])

  useEffect(() => {
    return () => {
      dispatch(setCurrentPopupResult(null))
    }
    // eslint-disable-next-line
  }, [])

  const cloudCover = props.result?.properties['eo:cloud_cover']
  const polarizations = props.result?.properties['sar:polarizations']

  function onCloseClick() {
    clearMapSelection()
    dispatch(setShowPopupModal(false))
  }

  return (
    <div className="popupResult">
      {props.result ? (
        <div>
          <div className="popupResultThumbnailContainer">
            {thumbnailURL ? (
              <picture>
                <img
                  src={thumbnailURL}
                  alt="thumbnail"
                  className="popupResultThumbnail"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null // prevents looping
                    currentTarget.parentElement.remove()
                  }}
                ></img>
              </picture>
            ) : null}
          </div>
          <div className="popupResultDetails">
            <div className="detailRow">
              <label>Title: </label>
              <span>{props.result.id}</span>
            </div>
            <div className="detailRow">
              <label>Collection Date: </label>
              <span>{props.result.properties.datetime}</span>
            </div>
            {cloudCover ? (
              <div className="detailRow">
                <label>Cloud Cover: </label>
                <span>{`${cloudCover?.toFixed(2)}%`}</span>
              </div>
            ) : null}
            {polarizations ? (
              <div className="detailRow">
                <label>Polarizations: </label>
                <span>{`${polarizations}`}</span>
              </div>
            ) : null}
          </div>
          <button className="closePopupModal" onClick={() => onCloseClick()}>
            ✕
          </button>
        </div>
      ) : null}
    </div>
  )
}

PopupResult.propTypes = {
  result: PropTypes.object
}

export default PopupResult
