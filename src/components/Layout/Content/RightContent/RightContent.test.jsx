import { describe, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import RightContent from './RightContent'
import { Provider } from 'react-redux'
import { store } from '../../../../redux/store'
import {
  setSearchResults,
  setisDrawingEnabled,
  setappConfig,
  setsearchGeojsonBoundary,
  setSearchType,
  setcartItems,
  setimageOverlayLoading,
  setShowAppLoading,
  setSearchLoading,
  setShowZoomNotice,
  setZoomLevelNeeded,
  setViewMode,
  setmappedScenes,
  setappName
} from '../../../../redux/slices/mainSlice'
import {
  mockSceneSearchResult,
  mockHexAggregateSearchResult,
  mockGridAggregateSearchResult,
  mockAppConfig
} from '../../../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'
import * as mapHelper from '../../../../utils/mapHelper'

describe('RightContent', () => {
  const user = userEvent.setup()
  const setup = () =>
    render(
      <Provider store={store}>
        <RightContent />
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
    it('should render action button if ACTION_BUTTON set in config', () => {
      setup()
      expect(
        screen.queryByRole('button', {
          name: /launch your own/i
        })
      ).toBeInTheDocument()
    })
    it('should not render action button if ACTION_BUTTON not set in config', () => {
      const { ACTION_BUTTON, ...mockAppConfigNoAction } = mockAppConfig
      store.dispatch(setappConfig(mockAppConfigNoAction))
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
    it('should render Legend if cartItems has items set in redux', () => {
      store.dispatch(setcartItems([mockSceneSearchResult]))
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
    it('should render loading animation when searchLoading is true', async () => {
      store.dispatch(setSearchLoading(true))
      store.dispatch(setappConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('testsearchLoadingAnimation')
      ).toBeInTheDocument()
    })
    it('should not render loading animation when searchLoading is false', async () => {
      store.dispatch(setSearchLoading(false))
      store.dispatch(setappConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('testsearchLoadingAnimation')
      ).not.toBeInTheDocument()
    })
    it('should render loading animation when imageOverlay loading is true', async () => {
      store.dispatch(setimageOverlayLoading(true))
      store.dispatch(setappConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('test_loadingImageryOverlay')
      ).toBeInTheDocument()
    })
    it('should not render loading animation when imageOverlay loading is false', async () => {
      store.dispatch(setimageOverlayLoading(false))
      store.dispatch(setappConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('test_loadingImageryOverlay')
      ).not.toBeInTheDocument()
    })
    it('should render application loading animation when showAppLoading loading is true', async () => {
      store.dispatch(setShowAppLoading(true))
      store.dispatch(setappName('Test App'))
      setup()
      expect(
        screen.queryByTestId('test_applicationLoadingAnimation')
      ).toBeInTheDocument()
      expect(screen.queryByText(/loading test app/i)).toBeInTheDocument()
    })
    it('should not render application loading animation when showAppLoading loading is false', async () => {
      store.dispatch(setappConfig(mockAppConfig))
      store.dispatch(setShowAppLoading(false))
      store.dispatch(setappName('Test App'))
      setup()
      expect(
        screen.queryByTestId('test_applicationLoadingAnimation')
      ).not.toBeInTheDocument()
      expect(screen.queryByText(/loading test app/i)).not.toBeInTheDocument()
    })
    it('should render zoom notice if showZoomNotice set to true in redux', () => {
      store.dispatch(setShowZoomNotice(true))
      setup()
      expect(
        screen.queryByText(/images are not visible at this zoom level\./i)
      ).toBeInTheDocument()
    })
    it('should not render  zoom notice if showZoomNotice set to false in redux', () => {
      setup()
      expect(
        screen.queryByText(/images are not visible at this zoom level\./i)
      ).not.toBeInTheDocument()
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
  describe('on button clicks', () => {
    describe('on action button clicked', () => {
      it('should open a new window with action button URL', async () => {
        window.open = vi.fn()
        const openSpy = vi.spyOn(window, 'open')
        const mockActionBtnUrl = 'https://example.com/launch'
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          ACTION_BUTTON: {
            text: 'Launch Your Own',
            url: mockActionBtnUrl
          }
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        const actionButton = screen.getByRole('button', {
          name: /launch your own/i
        })
        await user.click(actionButton)
        expect(openSpy).toHaveBeenCalledWith(mockActionBtnUrl, '_blank')
      })
    })
    describe('on zoom Clicked', () => {
      it('should zoom in to match the redux zoom level if view mode is not mosaic', async () => {
        store.dispatch(setShowZoomNotice(true))
        store.dispatch(setZoomLevelNeeded(7))
        const zoomSpy = vi.spyOn(mapHelper, 'setMapZoomLevel')
        setup()
        const zoomButton = screen.getByText(/zoom in/i)
        await user.click(zoomButton)
        expect(zoomSpy).toHaveBeenCalledWith(7)
      })
      it('should zoom in to match the config zoom level if view mode is mosaic', async () => {
        store.dispatch(setShowZoomNotice(true))
        store.dispatch(setZoomLevelNeeded(7))
        store.dispatch(setViewMode('mosaic'))
        const zoomSpy = vi.spyOn(mapHelper, 'setMapZoomLevel')
        store.dispatch(setappConfig(mockAppConfig))
        setup()
        const zoomButton = screen.getByText(/zoom in/i)
        await user.click(zoomButton)
        expect(zoomSpy).toHaveBeenCalledWith(7)
        expect(store.getState().mainSlice.showZoomNotice).toBeFalsy()
      })
    })
    describe('on Cancel Draw Geom clicked', () => {
      it('should set isDrawingEnabled to false in redux and call disableMapPolyDrawing', async () => {
        const disableMapPloyDrawingSpy = vi.spyOn(
          mapHelper,
          'disableMapPolyDrawing'
        )
        store.dispatch(setappConfig(mockAppConfig))
        store.dispatch(setisDrawingEnabled(true))
        setup()
        const cancelButton = screen.getByRole('button', {
          name: /cancel/i
        })
        await user.click(cancelButton)
        expect(store.getState().mainSlice.isDrawingEnabled).toBeFalsy()
        expect(disableMapPloyDrawingSpy).toHaveBeenCalledOnce()
      })
    })
    describe('on Select All Scenes clicked', () => {
      it('should call selectMappedScenes', async () => {
        const selectMappedScenesSpy = vi.spyOn(mapHelper, 'selectMappedScenes')
        store.dispatch(setappConfig(mockAppConfig))
        store.dispatch(setSearchResults(mockSceneSearchResult))
        store.dispatch(setmappedScenes(mockSceneSearchResult.features))
        setup()
        const selectScenesButton = screen.getByRole('button', {
          name: /select scenes/i
        })
        await user.click(selectScenesButton)
        expect(selectMappedScenesSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
