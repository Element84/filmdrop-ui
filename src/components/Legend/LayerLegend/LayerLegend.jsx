import React from 'react'
import './LayerLegend.css'
import { useSelector } from 'react-redux'
import HeatMapSymbology from '../HeatMapSymbology/HeatMapSymbology'
import markerIconUrl from '../../../assets/marker-icon.png'

const LayerLegend = () => {
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _searchType = useSelector((state) => state.mainSlice.searchType)
  const _searchGeojsonBoundary = useSelector(
    (state) => state.mainSlice.searchGeojsonBoundary
  )
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  return (
    <div data-testid="testLayerLegend" className="LayerLegend">
      {_appConfig.CART_ENABLED && _cartItems.length > 0 ? (
        <div className="legendRow">
          <div className="legendSymbol sceneInCartLegendSymbol"></div>
          <span>Scenes in Cart</span>
        </div>
      ) : null}
      {_searchType === 'scene' && (
        <div className="sceneLegend">
          <div className="legendRow">
            <div className="legendSymbol sceneLegendSymbol"></div>
            <span>Available Scene</span>
          </div>
        </div>
      )}
      {_searchType === 'grid-code' && _searchResults && (
        <div className="legendRow">
          <div className="legendSymbol sceneLegendSymbol"></div>
          <span>Scene Aggregation</span>
        </div>
      )}
      {_searchGeojsonBoundary && (
        <div className="legendRow">
          <div className="legendSymbol searchAreaLegendSymbol"></div>
          <img
            src={markerIconUrl}
            alt="Search area point"
            className="searchAreaLegendIcon"
          ></img>
          <span>Search Area</span>
        </div>
      )}
      {_searchType === 'hex' &&
        _searchResults?.searchType === 'AggregatedResults' && (
          <div className="hexLegendContainer">
            <span className="hexLegendLabel">Aggregate Scenes</span>
            <HeatMapSymbology results={_searchResults}></HeatMapSymbology>
          </div>
        )}
    </div>
  )
}

export default LayerLegend
