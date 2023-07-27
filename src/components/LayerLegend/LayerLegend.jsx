import React from 'react'
import './LayerLegend.css'
import { useSelector } from 'react-redux'
import Legend from '../Legend/Legend'

const LayerLegend = () => {
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _searchType = useSelector((state) => state.mainSlice.searchType)
  const _searchGeojsonBoundary = useSelector(
    (state) => state.mainSlice.searchGeojsonBoundary
  )
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  return (
    <div className="LayerLegend">
      {_searchType === 'scene' && (
        <div className="sceneLegend">
          {_appConfig.CART_ENABLED ? (
            <div className="legendRow">
              <div className="sceneInCartLegendSymbol"></div>
              <span>Scene in cart</span>
            </div>
          ) : null}
          <div className="legendRow">
            <div className="sceneLegendSymbol"></div>
            <span>Available scene</span>
          </div>
        </div>
      )}
      {_searchType === 'grid-code' && _searchResults && (
        <div className="legendRow">
          <div className="sceneLegendSymbol"></div>
          <span>Scene aggregation</span>
        </div>
      )}
      {_appConfig.ADVANCED_SEARCH_ENABLED && _searchGeojsonBoundary && (
        <div className="legendRow">
          <div className="searchAreaLegendSymbol"></div>
          <img
            src="/marker-icon.png"
            alt="Search area point"
            className="searchAreaLegendIcon"
          ></img>
          <span>Search area</span>
        </div>
      )}
      {_searchType === 'hex' &&
        _searchResults?.searchType === 'AggregatedResults' && (
          <div className="hexLegendContainer">
            <span className="hexLegendLabel">Aggregate Scenes</span>
            <Legend results={_searchResults}></Legend>
          </div>
        )}
    </div>
  )
}

export default LayerLegend
