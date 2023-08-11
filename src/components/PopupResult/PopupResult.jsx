import { React, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './PopupResult.css'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentPopupResult } from '../../redux/slices/mainSlice'
import { processDisplayFieldValues } from '../../utils/dataHelper'

const PopupResult = (props) => {
  const dispatch = useDispatch()
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const [thumbnailURL, setthumbnailURL] = useState(null)

  useEffect(() => {
    if (props.result) {
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
              <span
                className="popupResultDetailsRowKey"
                id="popupResultDetailsTitle"
              >
                Title:
              </span>
              <span
                className="popupResultDetailsRowValue"
                aria-labelledby="popupResultDetailsTitle"
              >
                {props.result.id}
              </span>
            </div>
            {_appConfig.POPUP_DISPLAY_FIELDS &&
              _selectedCollectionData.id in _appConfig.POPUP_DISPLAY_FIELDS &&
              _appConfig.POPUP_DISPLAY_FIELDS[_selectedCollectionData.id].map(
                (field) => (
                  <div className="detailRow" key={field + '1'}>
                    <span
                      className="popupResultDetailsRowKey"
                      key={field + '2'}
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                    <span
                      className="popupResultDetailsRowValue"
                      key={field + '3'}
                    >
                      {field === 'eo:cloud_cover'
                        ? Math.round(props.result?.properties[field] * 100) /
                            100 +
                          ' %'
                        : processDisplayFieldValues(
                            props.result?.properties[field]
                          )}
                    </span>
                  </div>
                )
              )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

PopupResult.propTypes = {
  result: PropTypes.object
}

export default PopupResult
