import { React, useEffect } from 'react'
import './Search.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  setshowSearchByGeom,
  setisDrawingEnabled,
  setsearchGeojsonBoundary,
  setshowUploadGeojsonModal,
  setautoCenterOnItemChanged
} from '../../redux/slices/mainSlice'
import 'react-tooltip/dist/react-tooltip.css'
import DateTimeRangeSelector from '../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import ViewSelector from '../ViewSelector/ViewSelector'
import { newSearch } from '../../utils/searchHelper'
import { enableMapPolyDrawing, clearLayer } from '../../utils/mapHelper'
import { Box, Switch } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

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
  const _searchGeojsonBoundary = useSelector(
    (state) => state.mainSlice.searchGeojsonBoundary
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _autoCenterOnItemChanged = useSelector(
    (state) => state.mainSlice.autoCenterOnItemChanged
  )
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

  function updateAutoCenterState() {
    dispatch(setautoCenterOnItemChanged(!_autoCenterOnItemChanged))
  }

  const theme = createTheme({
    components: {
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: '#fff'
          },
          colorPrimary: {
            '&.Mui-checked': {
              color: '#fff'
            }
          },
          track: {
            backgroundColor: '#dedede',
            '.Mui-checked.Mui-checked + &': {
              backgroundColor: '#6cc24a'
            }
          }
        }
      }
    }
  })

  return (
    <div className="Search" data-testid="Search">
      <div className="searchFilters">
        <div className={`searchContainer collectionDropdown`}>
          <CollectionDropdown></CollectionDropdown>
        </div>
        <div className="searchContainer datePickerComponent">
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
            <Box className="searchFilterContainer">
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
        {_appConfig.SHOW_ITEM_AUTO_ZOOM && (
          <div className="searchContainer viewSelectorComponent">
            <Box className="searchFilterContainer">
              <label htmlFor="ItemAutoSearch">Item Auto-Zoom</label>
              <ThemeProvider theme={theme}>
                <Switch
                  checked={_autoCenterOnItemChanged}
                  onChange={() => updateAutoCenterState()}
                ></Switch>
              </ThemeProvider>
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
    </div>
  )
}

export default Search
