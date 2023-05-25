import { React, useEffect, useState, useRef } from 'react'
import './Search.css'
import { envMosaicTilerURL } from './envVarSetup'
import { debounce } from '../../utils'
// import { MOSAIC_MIN_ZOOM, MOSAIC_MAX_ITEMS, SearchTypes } from '../defaults'
// import {
//   fetchAPIitems,
//   fetchGridCodeItems,
//   fetchGeoHexItems
// } from './SearchAPI'
// import { getSearchParams, getCloudCoverQueryVal } from './SearchParameters'
// import { setSearchType } from './SearchTypeSetup'

import { useSelector } from 'react-redux'
// import {
//   setSearchResults,
//   setClickResults,
//   setSearchLoading,
//   setShowZoomNotice,
//   setZoomLevelNeeded,
//   setTypeOfSearch,
//   setSearchParameters,
//   setShowPopupModal
// } from '../../redux/slices/mainSlice'

import 'react-tooltip/dist/react-tooltip.css'
import Switch from '@mui/material/Switch'

import DateTimeRangeSelector from '../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import ViewSelector from '../ViewSelector/ViewSelector'

import { newSearch } from '../../utils/searchHelper'

const Search = () => {
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice._selectedCollectionData
  )
  const _searchDateRangeValue = useSelector(
    (state) => state.mainSlice.searchDateRangeValue
  )
  const _cloudCover = useSelector((state) => state.mainSlice.cloudCover)
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)

  const [autoSearchSwitch, setAutoSearchSwitch] = useState(false)
  const [collectionError, setCollectionError] = useState(false)

  const autoSearchSwitchRef = useRef(false)

  // when there are changes, update store and perform new search
  useEffect(() => {
    // TODO: clearAllLayers() from mapHelper.js
    // if autoSearchChecked True
    // then call PerformSearch from searchHelper.js
  }, [_selectedCollectionData, _searchDateRangeValue, _cloudCover, _viewMode])

  const handleSwitchChange = (event) => {
    setAutoSearchSwitch(event.target.checked)
    autoSearchSwitchRef.current = event.target.checked
    if (event.target.checked) {
      processSearch()
    }
  }

  // search throttle set to 1500ms
  const processSearch = debounce(function () {
    if (autoSearchSwitchRef.current) {
      // TODO call search() or searchAPI() from search.js
    }
  }, 800)

  function processSearchBtn() {
    // TODO call search() or searchAPI() from search.js
    // disapatch(setSearchType())
    newSearch()
  }

  return (
    <div className="Search" data-testid="Search">
      <div
        className={`searchContainer collectionDropdown error-${collectionError}`}
      >
        <CollectionDropdown error={collectionError}></CollectionDropdown>
      </div>
      <div className="searchContainer datePicker">
        <DateTimeRangeSelector></DateTimeRangeSelector>
      </div>
      <div className="searchContainer cloudSlider">
        <CloudSlider></CloudSlider>
      </div>
      {envMosaicTilerURL && (
        <div className="searchContainer">
          <ViewSelector></ViewSelector>
        </div>
      )}
      <div className="searchContainer searchButton">
        <button
          className={`actionButton disabled-${autoSearchSwitch}`}
          onClick={() => processSearchBtn()}
          disabled={autoSearchSwitch}
        >
          Search
        </button>

        <div className="autoSearchContainer">
          <label>Auto Search</label>
          <Switch
            checked={autoSearchSwitch}
            onChange={handleSwitchChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </div>
      </div>
    </div>
  )
}

export default Search
