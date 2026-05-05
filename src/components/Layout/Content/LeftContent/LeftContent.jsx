import { React, useEffect, useCallback, useRef } from 'react'
import './LeftContent.css'
import Search from '../../../Search/Search'
import PopupResults from '../../../PopupResults/PopupResults'
import { useSelector } from 'react-redux'
import { debounceNewSearch } from '../../../../utils/searchHelper'
import { debounceTitilerOverlay } from '../../../../utils/mapLayers'
import { useResizablePanel } from '../../../../hooks/useResizablePanel'
import { useLayout } from '../../../../contexts/LayoutContext'
import { useUrlNavigate } from '../../../../hooks/useUrlNavigate'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import { AccordionStateProvider } from '../../../../contexts/AccordionStateContext'

const LeftContent = () => {
  const panelRef = useRef(null)
  const { isLeftPanelVisible } = useLayout()

  const _clickResults = useSelector((state) => state.mainSlice.clickResults)
  const _searchLoading = useSelector((state) => state.mainSlice.searchLoading)
  const _isDrawingEnabled = useSelector(
    (state) => state.mainSlice.isDrawingEnabled
  )
  const _tabSelected = useSelector((state) => state.mainSlice.tabSelected)
  const _isRightSidebarEnabled = useSelector(
    (state) => state.mainSlice.appConfig?.RIGHT_SIDEBAR_ENABLED ?? false
  )
  const _currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  )
  const _selectedVisualization = useSelector(
    (state) => state.mainSlice.selectedVisualization
  )
  const _selectedCollection = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const _detailsResetKey = useSelector(
    (state) => state.mainSlice.detailsResetKey
  )

  const { handleMouseDown, currentWidth } = useResizablePanel(panelRef)
  const { setTab } = useUrlNavigate()

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === ' ') {
        debounceNewSearch()
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  // Update map visualization when selection changes (works regardless of active tab)
  useEffect(() => {
    if (_currentPopupResult && _selectedVisualization) {
      debounceTitilerOverlay(_currentPopupResult)
    }
  }, [_selectedVisualization, _currentPopupResult])

  const setSearchTab = useCallback(() => {
    setTab('search')
  }, [setTab])

  const setDetailsTab = useCallback(() => {
    setTab('details')
  }, [setTab])

  return (
    <div
      ref={panelRef}
      className={`LeftContent ${_isRightSidebarEnabled ? 'rightSidebar' : ''} ${!isLeftPanelVisible ? 'hidden' : ''}`}
      style={{ width: isLeftPanelVisible ? `${currentWidth}px` : '0px' }}
    >
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
              _tabSelected === 'search'
                ? 'LeftContentTab LeftContentTabSelected'
                : 'LeftContentTab'
            }
            onClick={setSearchTab}
          >
            <span className="LeftContentTabLabel">Search</span>
          </button>
          <button
            className={
              _tabSelected === 'details'
                ? 'LeftContentTab LeftContentTabSelected'
                : 'LeftContentTab'
            }
            onClick={setDetailsTab}
          >
            <span className="LeftContentTabLabel">Item Details</span>
          </button>
        </div>
        <div className="LeftContentSelectedTab">
          <div
            className="LeftContentTabPanel"
            style={{ display: _tabSelected === 'search' ? undefined : 'none' }}
          >
            <Search></Search>
          </div>
          <div
            className="LeftContentTabPanel"
            key={`${_selectedCollection}-${_detailsResetKey}`}
            style={{ display: _tabSelected === 'details' ? undefined : 'none' }}
          >
            <AccordionStateProvider>
              <PopupResults results={_clickResults}></PopupResults>
            </AccordionStateProvider>
          </div>
        </div>
      </div>
      {isLeftPanelVisible && (
        <button
          className="resize-handle"
          onMouseDown={handleMouseDown}
          aria-label="Resize panel"
          type="button"
        >
          <DragHandleIcon className="resize-handle-icon" />
        </button>
      )}
    </div>
  )
}

export default LeftContent
