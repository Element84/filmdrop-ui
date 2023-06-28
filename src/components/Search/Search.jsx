import { React, useEffect } from 'react'
import './Search.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  setIsAutoSearchSet,
  setshowAdvancedSearchOptions,
  setisDrawingEnabled,
  setsearchGeojsonBoundary
} from '../../redux/slices/mainSlice'
import 'react-tooltip/dist/react-tooltip.css'
import Switch from '@mui/material/Switch'
import DateTimeRangeSelector from '../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import ViewSelector from '../ViewSelector/ViewSelector'
import {
  VITE_MOSAIC_TILER_URL,
  VITE_ADVANCED_SEARCH_ENABLED
} from '../../assets/config'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import { newSearch, debounceNewSearch } from '../../utils/searchHelper'
import { Box } from '@mui/material'
import { enableMapPolyDrawing, clearLayer } from '../../utils/mapHelper'

const Search = () => {
  const dispatch = useDispatch()
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice._selectedCollectionData
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
  const mosaicTilerURL = VITE_MOSAIC_TILER_URL || ''

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
    // disable search buttons
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

  return (
    <div className="Search" data-testid="Search">
      <div className={`searchContainer collectionDropdown`}>
        <CollectionDropdown></CollectionDropdown>
      </div>
      <div className="searchContainer datePicker">
        <DateTimeRangeSelector></DateTimeRangeSelector>
      </div>
      <div className="searchContainer cloudSlider">
        <CloudSlider></CloudSlider>
      </div>
      {mosaicTilerURL && (
        <div className="searchContainer">
          <ViewSelector></ViewSelector>
        </div>
      )}

      {VITE_ADVANCED_SEARCH_ENABLED ? (
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
        <div className="searchContainer searchButton">
          <button
            className={`actionButton disabled-${_isAutoSearchSet}`}
            onClick={() => processSearchBtn()}
            disabled={_isAutoSearchSet}
          >
            Search
          </button>

          <div className="autoSearchContainer">
            <label htmlFor="autoSearchSwtich">Auto Search</label>
            <Switch
              checked={_isAutoSearchSet}
              onChange={handleSwitchChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </div>
        </div>
      )}
      {_isDrawingEnabled ? <div className="disableSearchOverlay"></div> : null}
    </div>
  )
}

export default Search
