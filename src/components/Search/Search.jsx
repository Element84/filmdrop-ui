import React from 'react'
import './Search.css'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import VisualizationDropdown from '../VisualizationDropdown/VisualizationDropdown'
import DateTimeRangeSelector from '../DateTimeRangeSelector/DateTimeRangeSelector'
import AreaOfInterestSelector from '../AreaOfInterestSelector/AreaOfInterestSelector'
import QueryableFilters from '../QueryableFilters/QueryableFilters'
import ViewSelector from '../ViewSelector/ViewSelector'
import { useRenderableQueryables } from '../../hooks/useRenderableQueryables'
import { newSearch } from '../../utils/searchHelper'
import { flushAllPendingCallbacks } from '../../hooks/useDebouncedCallback'

const Search = () => {
  const { hasFields } = useRenderableQueryables()

  const handleSearchClick = () => {
    flushAllPendingCallbacks()
    newSearch()
  }

  return (
    <div className="Search" data-testid="Search">
      <div className="Search__scrollable">
        {/* Collection Section */}
        <div className="Search__section">
          <CollectionDropdown />
          <VisualizationDropdown />
        </div>

        {/* Location & Date Section */}
        <div className="Search__section">
          <h2 className="Search__section-heading">Location & Date</h2>
          <div className="Search__section-content">
            <AreaOfInterestSelector />
            <DateTimeRangeSelector />
          </div>
        </div>

        {/* Filters Section */}
        {hasFields && (
          <div className="Search__section">
            <h2 className="Search__section-heading">Filters</h2>
            <div className="Search__section-content">
              <QueryableFilters />
            </div>
          </div>
        )}
      </div>

      {/* View & Search Section */}
      <div className="Search__section Search__section--footer">
        <h2 className="Search__section-heading">View & Search</h2>
        <div className="Search__section-content">
          <ViewSelector />
          <button className="Search__button" onClick={handleSearchClick}>
            Search
          </button>
        </div>
      </div>
    </div>
  )
}

export default Search
