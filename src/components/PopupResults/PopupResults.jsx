import React, { useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import './PopupResults.css'
import '../EnhancedDetails/EnhancedDetails.css'
import { useDispatch, useSelector } from 'react-redux'
import PopupResult from '../PopupResult/PopupResult'
import {
  setCurrentPopupResult,
  setcartItems,
  setimageOverlayLoading,
  setselectedPopupResultIndex
} from '../../redux/slices/mainSlice'
import PopupFooter from '../PopupFooter/PopupFooter.jsx'
import { isSceneInCart } from '../../utils/dataHelper'
import { debounceTitilerOverlay } from '../../utils/mapHelper'
import { useLayout } from '../../contexts/LayoutContext'
import { EnhancedDetailsProvider } from '../../contexts/EnhancedDetailsContext'
import EnhancedDetailsDisplay from '../EnhancedDetails/EnhancedDetailsDisplay.jsx'
import { useUrlNavigate } from '../../hooks/useUrlNavigate'

const PopupResults = (props) => {
  const dispatch = useDispatch()
  const { enhancedColumns: _enhancedColumns } = useLayout()
  const { setItem } = useUrlNavigate()
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  )
  const _selectedPopupResultIndex = useSelector(
    (state) => state.mainSlice.selectedPopupResultIndex
  )
  const _selectedVisualization = useSelector(
    (state) => state.mainSlice.selectedVisualization
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
  }, [props.results, _selectedPopupResultIndex, _selectedVisualization])

  useEffect(() => {
    if (props.results.length > 0) {
      dispatch(setCurrentPopupResult(props.results[_selectedPopupResultIndex]))

      // Update URL when navigating between items
      const currentItem = props.results[_selectedPopupResultIndex]
      if (currentItem && currentItem.id) {
        setItem(currentItem.id)
      }
    }
  }, [_selectedPopupResultIndex, props.results])

  const onNextClick = useCallback(() => {
    if (_selectedPopupResultIndex < props.results.length - 1) {
      dispatch(setselectedPopupResultIndex(_selectedPopupResultIndex + 1))
    }
  }, [_selectedPopupResultIndex, props.results.length])

  const onPrevClick = useCallback(() => {
    if (_selectedPopupResultIndex > 0) {
      dispatch(setselectedPopupResultIndex(_selectedPopupResultIndex - 1))
    }
  }, [_selectedPopupResultIndex])

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

  return (
    <div data-testid="testPopupResults" className="popupResultsContainer">
      {props.results.length > 0 ? (
        <div className="popupResults">
          <PopupFooter
            currentIndex={_selectedPopupResultIndex}
            totalCount={props.results.length}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            cartEnabled={_appConfig.CART_ENABLED}
            isInCart={isSceneInCart(props.results[_selectedPopupResultIndex])}
            onCartClick={onAddRemoveSceneToCartClicked}
          />
          <div
            className="popupResultsContent"
            style={{ '--columns': _enhancedColumns }}
          >
            <PopupResult
              result={props.results[_selectedPopupResultIndex]}
            ></PopupResult>

            <EnhancedDetailsProvider
              item={_currentPopupResult}
              enhancedColumns={_enhancedColumns}
              appConfig={_appConfig}
            >
              <EnhancedDetailsDisplay />
            </EnhancedDetailsProvider>
          </div>
        </div>
      ) : (
        <div className="popupResultsEmpty">
          <span className="popupResultsEmptyPrimaryText">Nothing Selected</span>
          <span className="popupResultsEmptySecondaryText">
            Search and click footprint on map to view Item Details.
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
