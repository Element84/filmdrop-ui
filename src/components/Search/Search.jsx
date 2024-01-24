import { React, useEffect } from 'react'
import './Search.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  setshowSearchByGeom,
  setisDrawingEnabled,
  setsearchGeojsonBoundary,
  setshowUploadGeojsonModal
} from '../../redux/slices/mainSlice'
import 'react-tooltip/dist/react-tooltip.css'
import DateTimeRangeSelector from '../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import ViewSelector from '../ViewSelector/ViewSelector'
import { newSearch, debounceNewSearch } from '../../utils/searchHelper'
import { enableMapPolyDrawing, clearLayer } from '../../utils/mapHelper'
import { Box } from '@mui/material'

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
  const _showSearchByGeom = useSelector(
    (state) => state.mainSlice.showSearchByGeom
  )
  const _isDrawingEnabled = useSelector(
    (state) => state.mainSlice.isDrawingEnabled
  )
  const _searchGeojsonBoundary = useSelector(
    (state) => state.mainSlice.searchGeojsonBoundary
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading)
  const mosaicTilerURL = _appConfig.MOSAIC_TILER_URL || ''

  useEffect(() => {
    dispatch(setshowSearchByGeom(false))
  }, [_selectedCollectionData, _searchDateRangeValue, _cloudCover, _viewMode])

  function processSearchBtn() {
    newSearch()
    dispatch(setshowSearchByGeom(false))
  }

  function onDrawBoundaryClicked() {
    if (_searchGeojsonBoundary) {
      return
    }
    dispatch(setshowSearchByGeom(!_showSearchByGeom))
    dispatch(setisDrawingEnabled(true))
    enableMapPolyDrawing()
  }

  function onUploadGeojsonButtonClicked() {
    if (_searchGeojsonBoundary) {
      return
    }
    dispatch(setshowSearchByGeom(false))
    dispatch(setshowUploadGeojsonModal(true))
  }

  function onClearButtonClicked() {
    if (!_searchGeojsonBoundary) {
      return
    }
    dispatch(setsearchGeojsonBoundary(null))
    dispatch(setshowSearchByGeom(false))
    clearLayer('drawBoundsLayer')
  }

  const handleKeyPress = (event) => {
    if (event.key === ' ') {
      debounceNewSearch()
    }
  }

  // Adding event listener when the component mounts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <div className="Search" data-testid="Search">
      <div className="searchFilters">
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
          <div className="searchContainer viewSelectorComponent">
            <ViewSelector></ViewSelector>
          </div>
        )}
        {_appConfig.SEARCH_BY_GEOM_ENABLED && (
          <div className="searchContainer searchBoundary">
            <Box className="searchByGeomOptionsContainer">
              <label
                htmlFor="searchByGeomOptionsContainer"
                className="searchByGeomOptionsText"
              >
                Area of Interest
              </label>
              <div className="searchByGeomOptionsButtons">
                <button
                  className={
                    !_searchGeojsonBoundary
                      ? 'searchByGeomOptionsButton'
                      : 'searchByGeomOptionsButton ' +
                        'searchByGeomOptionsButtonDisabled'
                  }
                  onClick={onDrawBoundaryClicked}
                >
                  Draw
                </button>
                <button
                  className={
                    !_searchGeojsonBoundary
                      ? 'searchByGeomOptionsButton'
                      : 'searchByGeomOptionsButton ' +
                        'searchByGeomOptionsButtonDisabled'
                  }
                  onClick={onUploadGeojsonButtonClicked}
                >
                  Upload
                </button>
                <button
                  className={
                    _searchGeojsonBoundary
                      ? 'searchByGeomOptionsButton'
                      : 'searchByGeomOptionsButton ' +
                        'searchByGeomOptionsButtonDisabled'
                  }
                  onClick={onClearButtonClicked}
                >
                  Clear
                </button>
              </div>
            </Box>
          </div>
        )}
      </div>

      <div className="searchButtonContainer">
        <button
          className={`actionButton searchButton`}
          onClick={() => processSearchBtn()}
        >
          Search
        </button>
      </div>
      {_isDrawingEnabled || _searchLoading ? (
        <div
          className="disableSearchOverlay"
          data-testid="test_disableSearchOverlay"
        ></div>
      ) : null}
    </div>
  )
}

export default Search
