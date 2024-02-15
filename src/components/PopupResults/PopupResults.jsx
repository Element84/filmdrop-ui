import { React, useEffect } from 'react'
import PropTypes from 'prop-types'
import './PopupResults.css'
import { useDispatch, useSelector } from 'react-redux'
import PopupResult from '../PopupResult/PopupResult'
import {
  setCurrentPopupResult,
  setcartItems,
  setimageOverlayLoading,
  setselectedPopupResultIndex
} from '../../redux/slices/mainSlice'
import { ChevronRight, ChevronLeft } from '@mui/icons-material'
import {
  isSceneInCart,
  numberOfSelectedInCart,
  areAllScenesSelectedInCart
} from '../../utils/dataHelper'
import { debounceTitilerOverlay } from '../../utils/mapHelper'

const PopupResults = (props) => {
  const dispatch = useDispatch()
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  )
  const _selectedPopupResultIndex = useSelector(
    (state) => state.mainSlice.selectedPopupResultIndex
  )

  useEffect(() => {
    if (props.results.length > 0) {
      if (
        !_currentPopupResult ||
        !props.results.includes(_currentPopupResult)
      ) {
        dispatch(setselectedPopupResultIndex(0))
      }
      debounceTitilerOverlay(props.results[_selectedPopupResultIndex])
      dispatch(setCurrentPopupResult(props.results[_selectedPopupResultIndex]))
    }
    return () => {
      dispatch(setimageOverlayLoading(false))
    }
  }, [props.results])

  useEffect(() => {
    if (props.results.length > 0) {
      dispatch(setCurrentPopupResult(props.results[_selectedPopupResultIndex]))
    }
  }, [_selectedPopupResultIndex])

  function onNextClick() {
    if (_selectedPopupResultIndex < props.results.length - 1) {
      dispatch(setselectedPopupResultIndex(_selectedPopupResultIndex + 1))
    }
  }

  function onPrevClick() {
    if (_selectedPopupResultIndex > 0) {
      dispatch(setselectedPopupResultIndex(_selectedPopupResultIndex - 1))
    }
  }

  function onAddRemoveSceneToCartClicked() {
    if (isSceneInCart(props.results[_selectedPopupResultIndex])) {
      dispatch(
        setcartItems(
          _cartItems.filter(
            (_cartItems) =>
              _cartItems.id !== props.results[_selectedPopupResultIndex].id
          )
        )
      )
      return
    }
    dispatch(
      setcartItems([..._cartItems, props.results[_selectedPopupResultIndex]])
    )
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
    <div data-testid="testPopupResults" className="popupResultsContainer">
      {props.results.length > 0 ? (
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
          <div
            className={
              _appConfig.CART_ENABLED
                ? 'popupResultsContent popupResultsContentCartEnabled'
                : 'popupResultsContent'
            }
          >
            <PopupResult
              result={props.results[_selectedPopupResultIndex]}
            ></PopupResult>
            {_appConfig.CART_ENABLED ? (
              <div className="popupResultsBottom">
                <button
                  className="popupResultsBottomButton"
                  onClick={onAddRemoveSceneToCartClicked}
                >
                  {isSceneInCart(props.results[_selectedPopupResultIndex])
                    ? 'Remove scene from cart'
                    : 'Add scene to cart'}
                </button>
              </div>
            ) : null}
          </div>
          <div className="popupFooter">
            <div className="popupFooterControls">
              <div className="popupFooterControlLeft">
                {_selectedPopupResultIndex + 1 + ' of ' + props.results.length}
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
      ) : (
        <div className="popupResultsEmpty">
          <span className="popupResultsEmptyPrimaryText">Nothing Selected</span>
          <span className="popupResultsEmptySecondaryText">
            search and click footprint on map to view details
          </span>
        </div>
      )}
    </div>
  )
}

PopupResults.propTypes = {
  results: PropTypes.array
}

export default PopupResults
