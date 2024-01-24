import React from 'react'
import { render, screen } from '@testing-library/react'
import LayerLegend from './LayerLegend'
import { Provider } from 'react-redux'
import { store } from '../../../redux/store'
import {
  setSearchResults,
  setappConfig,
  setSearchType,
  setcartItems
} from '../../../redux/slices/mainSlice'
import {
  mockAppConfig,
  mockGridAggregateSearchResult,
  mockHexAggregateSearchResult,
  mockSceneSearchResult
} from '../../../testing/shared-mocks'

describe('LayerLegend', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <LayerLegend />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
  })

  describe('on conditional render', () => {
    describe('confirm conditional cart render', () => {
      it('should render scenes in cart legend item if cart enabled in config and cart has items', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        store.dispatch(setcartItems([mockSceneSearchResult]))
        setup()
        expect(screen.queryByText(/scenes in cart/i)).toBeInTheDocument()
      })
      it('should not render scenes in cart legend item if cart enabled in config but cart has no items', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        expect(screen.queryByText(/scenes in cart/i)).not.toBeInTheDocument()
      })
      it('should not render scenes in cart legend item if cart not enabled in config', () => {
        setup()
        expect(screen.queryByText(/scenes in cart/i)).not.toBeInTheDocument()
      })
    })
    describe('confirm conditional scene render', () => {
      it('should render available scene legend item if searchType set to scene in redux', () => {
        store.dispatch(setSearchType('scene'))
        setup()
        expect(screen.queryByText(/available scene/i)).toBeInTheDocument()
      })
      it('should not render available scene legend item if searchType not set to scene in redux', () => {
        store.dispatch(setSearchType('grid-code'))
        setup()
        expect(screen.queryByText(/available scene/i)).not.toBeInTheDocument()
      })
    })
    describe('confirm conditional gird-code render', () => {
      it('should render grid-code legend item if searchType set to grid-code and searchResults set in redux', () => {
        store.dispatch(setSearchType('grid-code'))
        store.dispatch(setSearchResults(mockGridAggregateSearchResult))
        setup()
        expect(screen.queryByText(/scene aggregation/i)).toBeInTheDocument()
      })
      it('should not render grid-code legend item if searchType not set to grid-code', () => {
        store.dispatch(setSearchType('scene'))
        store.dispatch(setSearchResults({ type: 'Point', coordinates: [0, 0] }))
        setup()
        expect(screen.queryByText(/scene aggregation/i)).not.toBeInTheDocument()
      })
      it('should not render grid-code legend item if searchResults not set in redux', () => {
        store.dispatch(setSearchType('grid-code'))
        setup()
        expect(screen.queryByText(/scene aggregation/i)).not.toBeInTheDocument()
      })
    })
    describe('confirm conditional search area render', () => {
      it('should not render search area legend item if searchGeojsonBoundary set in redux', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          SEARCH_BY_GEOM_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        expect(screen.queryByText(/search area/i)).not.toBeInTheDocument()
      })
    })
    describe('confirm conditional hex render', () => {
      it('should render hex legend item if searchType and searchResult set in redux and search result contains aggregated results', () => {
        store.dispatch(setSearchType('hex'))
        store.dispatch(setSearchResults(mockHexAggregateSearchResult))
        setup()
        expect(screen.queryByText(/aggregate scenes/i)).toBeInTheDocument()
      })
      it('should not render hex legend item if searchType not set to hex in redux', () => {
        store.dispatch(setSearchType('grid-code'))
        store.dispatch(setSearchResults(mockHexAggregateSearchResult))
        setup()
        expect(screen.queryByText(/aggregate scenes/i)).not.toBeInTheDocument()
      })
      it('should not render hex legend item if searchResult not set in redux', () => {
        store.dispatch(setSearchType('hex'))
        setup()
        expect(screen.queryByText(/aggregate scenes/i)).not.toBeInTheDocument()
      })
    })
  })
})
