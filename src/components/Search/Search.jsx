import { React, useEffect, useState } from 'react'
import './Search.css'
import { envMosaicTilerURL } from './envVarSetup'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAutoSearchSet } from '../../redux/slices/mainSlice'
import 'react-tooltip/dist/react-tooltip.css'
import Switch from '@mui/material/Switch'
import DateTimeRangeSelector from '../DateTimeRangeSelector/DateTimeRangeSelector'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import ViewSelector from '../ViewSelector/ViewSelector'

import { newSearch, debounceNewSearch } from '../../utils/searchHelper'

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

  const [collectionError, setCollectionError] = useState(false)

  // when there are changes, update store and perform new search
  useEffect(() => {
    // TODO: clearAllLayers() from mapHelper.js
    // if autoSearchChecked True
    // then call PerformSearch from searchHelper.js
    if (_isAutoSearchSet) {
      debounceNewSearch()
    }
  }, [_selectedCollectionData, _searchDateRangeValue, _cloudCover, _viewMode])

  const handleSwitchChange = (event) => {
    dispatch(setIsAutoSearchSet(event.target.checked))
    // set autoSearchChecked in redux state
    if (event.target.checked) {
      debounceNewSearch()
    }
  }

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
          className={`actionButton disabled-${_isAutoSearchSet}`}
          onClick={() => processSearchBtn()}
          disabled={_isAutoSearchSet}
        >
          Search
        </button>

        <div className="autoSearchContainer">
          <label>Auto Search</label>
          <Switch
            checked={_isAutoSearchSet}
            onChange={handleSwitchChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </div>
      </div>
    </div>
  )
}

export default Search
