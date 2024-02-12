import { React, useEffect } from 'react'
import './LeftContent.css'
import Search from '../../../Search/Search'
import PopupResults from '../../../PopupResults/PopupResults'
import { useSelector, useDispatch } from 'react-redux'
import { debounceNewSearch } from '../../../../utils/searchHelper'
import { settabSelected } from '../../../../redux/slices/mainSlice'

const LeftContent = () => {
  const dispatch = useDispatch()

  const _clickResults = useSelector((state) => state.mainSlice.clickResults)
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading)
  const _isDrawingEnabled = useSelector(
    (state) => state.mainSlice.isDrawingEnabled
  )
  const _tabSelected = useSelector((state) => state.mainSlice.tabSelected)

  function setFiltersTab() {
    dispatch(settabSelected('filters'))
  }
  function setDetailsTab() {
    dispatch(settabSelected('details'))
  }

  const handleKeyPress = (event) => {
    if (event.ctrlKey && event.key === ' ') {
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
    <div className="LeftContent">
      <div className="LeftContentHolder">
        {_isDrawingEnabled || _searchLoading ? (
          <div
            className="disableSearchOverlay"
            data-testid="test_disableSearchOverlay"
          ></div>
        ) : null}
        <div className="LeftContentTabs">
          <button
            className={
              _tabSelected === 'filters'
                ? 'LeftContentTab LeftContentTabSelected'
                : 'LeftContentTab'
            }
            onClick={setFiltersTab}
          >
            Filters
          </button>
          <button
            className={
              _tabSelected === 'details'
                ? 'LeftContentTab LeftContentTabSelected'
                : 'LeftContentTab'
            }
            onClick={setDetailsTab}
          >
            Item Details
          </button>
        </div>
        <div className="LeftContentSelectedTab">
          {_tabSelected === 'filters' ? (
            <Search></Search>
          ) : (
            <div className="ItemDetails">
              <PopupResults results={_clickResults}></PopupResults>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeftContent
