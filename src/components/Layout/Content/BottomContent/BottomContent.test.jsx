import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import BottomContent from './BottomContent'
import { Provider } from 'react-redux'
import { store } from '../../../../redux/store'
import {
  setSearchResults,
  setisDrawingEnabled,
  setappConfig,
  setsearchGeojsonBoundary,
  setSearchType
} from '../../../../redux/slices/mainSlice'
import {
  mockSceneSearchResult,
  mockHexAggregateSearchResult,
  mockGridAggregateSearchResult,
  mockAppConfig
} from '../../../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'
import * as mapHelper from '../../../../utils/mapHelper'

describe('BottomContent', () => {
  const user = userEvent.setup()
  const setup = () =>
    render(
      <Provider store={store}>
        <BottomContent />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
    vi.mock('../../../../utils/mapHelper')
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('on render', () => {
    it('should render Launch Your Own Viewer Button if LAUNCH_URL set in config', () => {
      setup()
      expect(
        screen.queryByRole('button', {
          name: /launch your own/i
        })
      ).toBeInTheDocument()
    })
    it('should not render Launch Your Own Viewer Button if LAUNCH_URL not set in config', () => {
      const mockAppConfigSearchEnabled = {
        ...mockAppConfig,
        LAUNCH_URL: ''
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      setup()
      expect(
        screen.queryByRole('button', {
          name: /launch your own/i
        })
      ).not.toBeInTheDocument()
    })
    it('should render Legend if geojsonBoundary set in redux', () => {
      store.dispatch(
        setsearchGeojsonBoundary({ type: 'Point', coordinates: [0, 0] })
      )
      setup()
      expect(screen.queryByTestId('testLayerLegend')).toBeInTheDocument()
    })
    it('should render Legend if searchType and searchResults set in redux', () => {
      store.dispatch(setSearchType('hex'))
      store.dispatch(setSearchResults({ type: 'Point', coordinates: [0, 0] }))
      setup()
      expect(screen.queryByTestId('testLayerLegend')).toBeInTheDocument()
    })
    it('should not render Legend if geojsonBoundary not set and searchType and searchResults not set in redux', () => {
      setup()
      expect(screen.queryByTestId('testLayerLegend')).not.toBeInTheDocument()
    })
    it('should not render Legend if searchType not set in redux', () => {
      store.dispatch(setSearchResults({ type: 'Point', coordinates: [0, 0] }))
      setup()
      expect(screen.queryByTestId('testLayerLegend')).not.toBeInTheDocument()
    })
    it('should not render Legend if searchResults not set in redux', () => {
      store.dispatch(setSearchType('hex'))
      setup()
      expect(screen.queryByTestId('testLayerLegend')).not.toBeInTheDocument()
    })
  })

  describe('when isDrawingEnabled is true', () => {
    beforeEach(() => {
      store.dispatch(setisDrawingEnabled(true))
    })
    it('should not show scene message when drawing message is showing', () => {
      store.dispatch(setSearchResults(mockSceneSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingScenesMessage')
      ).not.toBeInTheDocument()
    })
    it('should not show grid aggregate messages when drawing message is showing', () => {
      store.dispatch(setSearchResults(mockGridAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).not.toBeInTheDocument()
    })
    it('should not show hex aggregate messages when drawing message is showing', () => {
      store.dispatch(setSearchResults(mockHexAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).not.toBeInTheDocument()
    })
    describe('on draw message close clicked', () => {
      it('should setisDrawingEnabled to false in redux state and call disableMapPolyDrawing', async () => {
        const spyDisableMapPolyDrawing = vi.spyOn(
          mapHelper,
          'disableMapPolyDrawing'
        )
        setup()
        expect(store.getState().mainSlice.isDrawingEnabled).toBeTruthy()
        await user.click(
          screen.getByRole('button', {
            name: /cancel/i
          })
        )
        expect(store.getState().mainSlice.isDrawingEnabled).toBeFalsy()
        expect(spyDisableMapPolyDrawing).toHaveBeenCalledOnce()
      })
    })
  })
  describe('when isDrawingEnabled is false', () => {
    it('should show scene messages when not drawing', () => {
      store.dispatch(setisDrawingEnabled(false))
      store.dispatch(setSearchResults(mockSceneSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingScenesMessage')
      ).toBeInTheDocument()
    })
    it('should show grid aggregate messages when not drawing', () => {
      store.dispatch(setisDrawingEnabled(false))
      store.dispatch(setSearchResults(mockGridAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).toBeInTheDocument()
    })
    it('should show hex aggregate messages when not drawing', () => {
      store.dispatch(setisDrawingEnabled(false))
      store.dispatch(setSearchResults(mockHexAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).toBeInTheDocument()
    })
  })
})
