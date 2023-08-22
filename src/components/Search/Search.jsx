import { React, useEffect } from 'react'
import './Search.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  setIsAutoSearchSet,
  setshowAdvancedSearchOptions,
  setisDrawingEnabled,
  setsearchGeojsonBoundary,
  setshowUploadGeojsonModal,
  setshowCartModal
} from '../../redux/slices/mainSlice'
import 'react-tooltip/dist/react-tooltip.css'
import Switch from '@mui/material/Switch'
import DateTimeRangeSelector from '../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import ViewSelector from '../ViewSelector/ViewSelector'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { newSearch, debounceNewSearch } from '../../utils/searchHelper'
import { Box } from '@mui/material'
import { enableMapPolyDrawing, clearLayer } from '../../utils/mapHelper'

const Search = () => {
  const dispatch = useDispatch()
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const _searchDateRangeValue = useSelector(
    (state) => state.mainSlice.searchDateRangeValue
  )
  const _cloudCover = useSelector((state) => state.mainSlice.cloudCover)
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)
  const _isAutoSearchSet = useSelector(
    (state) => state.mainSlice.isAutoSearchSet
  )
  const _showAdvancedSearchOptions = useSelector(
    (state) => state.mainSlice.showAdvancedSearchOptions
  )
  const _isDrawingEnabled = useSelector(
    (state) => state.mainSlice.isDrawingEnabled
  )
  const _searchGeojsonBoundary = useSelector(
    (state) => state.mainSlice.searchGeojsonBoundary
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading)
  const mosaicTilerURL = _appConfig.MOSAIC_TILER_URL || ''

  useEffect(() => {
    dispatch(setshowAdvancedSearchOptions(false))
    if (_isAutoSearchSet) {
      debounceNewSearch()
    }
  }, [_selectedCollectionData, _searchDateRangeValue, _cloudCover, _viewMode])

  const handleSwitchChange = (event) => {
    dispatch(setIsAutoSearchSet(event.target.checked))
    if (event.target.checked) {
      debounceNewSearch()
    }
  }

  function processSearchBtn() {
    newSearch()
    dispatch(setshowAdvancedSearchOptions(false))
  }

  function onAdvancedOptionsClicked() {
    dispatch(setshowAdvancedSearchOptions(!_showAdvancedSearchOptions))
  }

  function onDrawBoundaryClicked() {
    if (_searchGeojsonBoundary) {
      return
    }
    dispatch(setshowAdvancedSearchOptions(!_showAdvancedSearchOptions))
    dispatch(setisDrawingEnabled(true))
    enableMapPolyDrawing()
  }

  function onUploadGeojsonButtonClicked() {
    if (_searchGeojsonBoundary) {
      return
    }
    dispatch(setshowAdvancedSearchOptions(false))
    dispatch(setshowUploadGeojsonModal(true))
  }

  function onClearButtonClicked() {
    if (!_searchGeojsonBoundary) {
      return
    }
    dispatch(setsearchGeojsonBoundary(null))
    dispatch(setshowAdvancedSearchOptions(false))
    clearLayer('drawBoundsLayer')
  }

  function onAdvancedSearchBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      dispatch(setshowAdvancedSearchOptions(false))
    }
  }

  function onCartButtonClick() {
    if (_cartItems.length === 0) {
      return
    }
    dispatch(setshowCartModal(true))
  }

  return (
    <div className="Search" data-testid="Search">
      <div className="firstSearchItemsGroup">
        <div className={`searchContainer collectionDropdown`}>
          <div className="collectionDropdownComponent">
            <CollectionDropdown></CollectionDropdown>
          </div>
        </div>
        <div className="searchContainer datePicker">
          <div className="dateTimeRangeComponent">
            <DateTimeRangeSelector></DateTimeRangeSelector>
          </div>
        </div>
        <div className="searchContainer cloudSlider">
          <div className="cloudSliderComponent">
            <CloudSlider></CloudSlider>
          </div>
        </div>
      </div>
      <div className="secondSearchItemsGroup">
        {mosaicTilerURL && (
          <div className="searchContainer">
            <div className="viewSelectorComponent">
              <ViewSelector></ViewSelector>
            </div>
          </div>
        )}
        {_appConfig.ADVANCED_SEARCH_ENABLED ? (
          <Box
            className={
              _showAdvancedSearchOptions
                ? 'searchContainer searchButtonAdvanced ' + 'active'
                : 'searchContainer searchButtonAdvanced'
            }
            onBlur={onAdvancedSearchBlur}
            tabIndex={0}
          >
            <div className="advancedSearchContent">
              <button
                className={`actionButton`}
                onClick={() => processSearchBtn()}
              >
                Search
              </button>
              <Box
                className="advancedSearchOptions"
                onClick={onAdvancedOptionsClicked}
              >
                Advanced
                {_showAdvancedSearchOptions ? (
                  <KeyboardArrowUpIcon></KeyboardArrowUpIcon>
                ) : (
                  <KeyboardArrowDownIcon></KeyboardArrowDownIcon>
                )}
              </Box>
            </div>
            {_showAdvancedSearchOptions ? (
              <Box className="advancedSearchOptionsContainer">
                <span className="advancedSearchOptionsText">
                  Limit search to boundary
                </span>
                <div className="advancedSearchOptionsButtons">
                  <button
                    className={
                      !_searchGeojsonBoundary
                        ? 'advancedSearchOptionsButton'
                        : 'advancedSearchOptionsButton ' +
                          'advancedSearchOptionsButtonDisabled'
                    }
                    onClick={onDrawBoundaryClicked}
                  >
                    Draw boundary
                  </button>
                  <button
                    className={
                      !_searchGeojsonBoundary
                        ? 'advancedSearchOptionsButton'
                        : 'advancedSearchOptionsButton ' +
                          'advancedSearchOptionsButtonDisabled'
                    }
                    onClick={onUploadGeojsonButtonClicked}
                  >
                    Upload GeoJSON
                  </button>
                  <button
                    className={
                      _searchGeojsonBoundary
                        ? 'advancedSearchOptionsButton'
                        : 'advancedSearchOptionsButton ' +
                          'advancedSearchOptionsButtonDisabled'
                    }
                    onClick={onClearButtonClicked}
                  >
                    Clear
                  </button>
                </div>
              </Box>
            ) : null}
          </Box>
        ) : (
          <div className="searchContainer searchButton defaultSearchContainer">
            <div>
              <button
                className={`actionButton disabled-${_isAutoSearchSet}`}
                onClick={() => processSearchBtn()}
                disabled={_isAutoSearchSet}
              >
                Search
              </button>
            </div>

            <div
              className="autoSearchContainer"
              data-testid="test_autoSearchContainer"
            >
              <label htmlFor="autoSearchSwtich">Auto Search</label>
              <Switch
                checked={_isAutoSearchSet}
                onChange={handleSwitchChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </div>
          </div>
        )}
        {_appConfig.CART_ENABLED ? (
          <div className="searchContainer cartButtonContainer">
            <div className="cartComponent"></div>
            <Box
              className={
                _cartItems.length > 0
                  ? 'cartButton cartButtonEnabled'
                  : 'cartButton'
              }
              data-testid="testCartButton"
              onClick={onCartButtonClick}
            >
              <span>Cart</span>
              <div
                className={
                  _cartItems.length > 0
                    ? 'cartCountContainer carCountContainerEnabled'
                    : 'cartCountContainer'
                }
                data-testid="testCartCount"
              >
                {_cartItems.length}
              </div>
            </Box>
          </div>
        ) : null}
      </div>
      {_isDrawingEnabled ? (
        <div
          className="disableSearchOverlay"
          data-testid="test_disableSearchOverlay"
        ></div>
      ) : null}
      {_searchLoading ? (
        <div
          className="disableSearchOverlay"
          data-testid="test_disableSearchOverlay"
        ></div>
      ) : null}
    </div>
  )
}

export default Search
