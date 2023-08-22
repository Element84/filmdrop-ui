import { React, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './PopupResults.css'
import { useDispatch, useSelector } from 'react-redux'
import PopupResult from '../PopupResult/PopupResult'
import {
  clearMapSelection,
  debounceTitilerOverlay
} from '../../utils/mapHelper'
import {
  setShowPopupModal,
  setCurrentPopupResult,
  setcartItems,
  setimageOverlayLoading
} from '../../redux/slices/mainSlice'
import { ChevronRight, ChevronLeft } from '@mui/icons-material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import CloseIcon from '@mui/icons-material/Close'
import {
  isSceneInCart,
  numberOfSelectedInCart,
  areAllScenesSelectedInCart
} from '../../utils/dataHelper'

const PopupResults = (props) => {
  const dispatch = useDispatch()
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [minimizePopup, setminimizePopup] = useState(false)

  useEffect(() => {
    setCurrentResultIndex(0)
  }, [props.results])

  useEffect(() => {
    dispatch(setCurrentPopupResult(props.results[currentResultIndex]))
    debounceTitilerOverlay()
    return () => {
      dispatch(setimageOverlayLoading(false))
    }
  }, [currentResultIndex, props.results])

  function onNextClick() {
    if (currentResultIndex < props.results.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1)
    }
  }

  function onPrevClick() {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1)
    }
  }

  function onMinimizeClicked() {
    setminimizePopup(!minimizePopup)
  }

  function onCloseClick() {
    clearMapSelection()
    dispatch(setimageOverlayLoading(false))
    dispatch(setShowPopupModal(false))
  }

  function onAddRemoveSceneToCartClicked() {
    if (isSceneInCart(props.results[currentResultIndex])) {
      dispatch(
        setcartItems(
          _cartItems.filter(
            (_cartItems) =>
              _cartItems.id !== props.results[currentResultIndex].id
          )
        )
      )
      return
    }
    dispatch(setcartItems([..._cartItems, props.results[currentResultIndex]]))
  }

  function onAddAllToCartClicked() {
    if (areAllScenesSelectedInCart(props.results)) {
      return
    }
    const cartPlusNewScenes = [..._cartItems]
    props.results.forEach((result) => {
      const sceneInCart = isSceneInCart(result)
      if (!sceneInCart) {
        cartPlusNewScenes.push(result)
      }
    })
    dispatch(setcartItems(cartPlusNewScenes))
  }

  return (
    <div
      data-testid="testPopupResults"
      className={
        minimizePopup
          ? 'popupResultsContainer popupResultsContainerMin'
          : 'popupResultsContainer'
      }
    >
      {props.results ? (
        <div className="popupResults">
          <div className="popupHeader">
            <div className="popupHeaderTop">
              <div className="popupResultContentText">
                {props.results.length + ' scenes selected'}{' '}
                {_appConfig.CART_ENABLED &&
                numberOfSelectedInCart(props.results) > 0
                  ? '(' + numberOfSelectedInCart(props.results) + ' in cart)'
                  : null}
              </div>
              <div className="popupHeaderButtonsGroup">
                <button
                  className="popupHeaderButtons"
                  onClick={onMinimizeClicked}
                >
                  {minimizePopup ? (
                    <KeyboardArrowUpIcon
                      sx={{ fontSize: 27, color: '#a9b0c1' }}
                    ></KeyboardArrowUpIcon>
                  ) : (
                    <KeyboardArrowDownIcon
                      sx={{ fontSize: 27, color: '#a9b0c1' }}
                    ></KeyboardArrowDownIcon>
                  )}
                </button>
                <button
                  className="popupHeaderButtons"
                  onClick={() => onCloseClick()}
                >
                  <CloseIcon
                    sx={{ fontSize: 20, color: '#a9b0c1' }}
                  ></CloseIcon>
                </button>
              </div>
            </div>
            {_appConfig.CART_ENABLED ? (
              <div className="popupHeaderBottom">
                <button
                  className={
                    areAllScenesSelectedInCart(props.results)
                      ? 'popupHeaderBottomButton popupHeaderBottomButtonDisabled'
                      : 'popupHeaderBottomButton'
                  }
                  onClick={onAddAllToCartClicked}
                >
                  Add all to cart
                </button>
              </div>
            ) : null}
          </div>

          {minimizePopup ? null : (
            <div
              className={
                _appConfig.CART_ENABLED
                  ? 'popupResultsContent popupResultsContentCartEnabled'
                  : 'popupResultsContent'
              }
            >
              <PopupResult
                result={props.results[currentResultIndex]}
              ></PopupResult>
              {_appConfig.CART_ENABLED ? (
                <div className="popupResultsBottom">
                  <button
                    className="popupResultsBottomButton"
                    onClick={onAddRemoveSceneToCartClicked}
                  >
                    {isSceneInCart(props.results[currentResultIndex])
                      ? 'Remove scene from cart'
                      : 'Add scene to cart'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
          <div className="popupFooter">
            <div className="popupFooterControls">
              <div className="popupFooterControlLeft">
                {currentResultIndex + 1 + ' of ' + props.results.length}
              </div>
              <div className="popupFooterButtonsGroup">
                <div className="popupFooterPrev popupFooterIconContainer">
                  <button
                    onClick={() => onPrevClick()}
                    className="popupFooterButton popupFooterButtonLeft"
                  >
                    <ChevronLeft></ChevronLeft>
                  </button>
                </div>
                <div className="popupFooterNext popupFooterIconContainer ">
                  <button
                    className="popupFooterButton popupFooterButtonRight"
                    onClick={() => onNextClick()}
                  >
                    <ChevronRight></ChevronRight>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

PopupResults.propTypes = {
  results: PropTypes.array
}

export default PopupResults
