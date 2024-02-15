import { React, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './PopupResult.css'
import { useSelector } from 'react-redux'
import { processDisplayFieldValues } from '../../utils/dataHelper'
import { debounceTitilerOverlay, zoomToItemExtent } from '../../utils/mapHelper'

const PopupResult = (props) => {
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const _autoCenterOnItemChanged = useSelector(
    (state) => state.mainSlice.autoCenterOnItemChanged
  )
  const [thumbnailURL, setthumbnailURL] = useState(null)

  useEffect(() => {
    if (props.result) {
      if (_autoCenterOnItemChanged) {
        zoomToItemExtent(props.result)
      }
      debounceTitilerOverlay(props.result)
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
            {_appConfig.STAC_LINK_ENABLED && (
              <div className="detailRow">
                <a
                  href={props.result.links[0].href.toString()}
                  target="_blank"
                  rel="noreferrer"
                  className="popupResultDetailsRowValue popupResultDetailsHrefLink"
                  aria-labelledby="popupResultDetailsTitle"
                >
                  STAC API Item
                </a>
              </div>
            )}
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
                      {field.charAt(0).toUpperCase() + field.slice(1) + ':'}
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
