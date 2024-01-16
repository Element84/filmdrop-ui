import { describe, vi } from 'vitest'
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
  setSearchType,
  setcartItems,
  setimageOverlayLoading,
  setShowAppLoading,
  setSearchLoading,
  setShowZoomNotice,
  setShowPopupModal,
  setClickResults,
  setZoomLevelNeeded,
  setViewMode,
  setmappedScenes,
  setappName
} from '../../../../redux/slices/mainSlice'
import {
  mockSceneSearchResult,
  mockHexAggregateSearchResult,
  mockGridAggregateSearchResult,
  mockAppConfig,
  mockClickResults
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
        screen.queryByTestId('test_imageOverlayLoadingAnimation')
      ).toBeInTheDocument()
    })
    it('should not render loading animation when imageOverlay loading is false', async () => {
      store.dispatch(setimageOverlayLoading(false))
      store.dispatch(setappConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('test_imageOverlayLoadingAnimation')
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
    it('should render analyze Button if ANALYZE_BTN_URL set in config', () => {
      setup()
      expect(
        screen.queryByRole('button', {
          name: /analyze/i
        })
      ).toBeInTheDocument()
    })
    it('should not render analyze Button if ANALYZE_BTN_URL not set in config', () => {
      const mockAppConfigSearchEnabled = {
        ...mockAppConfig,
        ANALYZE_BTN_URL: ''
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      setup()
      expect(
        screen.queryByRole('button', {
          name: /analyze/i
        })
      ).not.toBeInTheDocument()
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
    it('should render popup results if showPopupModal set to true in redux and clickResults greater than 0', () => {
      store.dispatch(setShowPopupModal(true))
      store.dispatch(setClickResults([mockClickResults[0]]))
      setup()
      expect(screen.queryByTestId('testPopupResults')).toBeInTheDocument()
    })
    it('should not render popup results if showPopupModal set to false in redux', () => {
      store.dispatch(setClickResults([mockClickResults[0]]))
      setup()
      expect(screen.queryByTestId('testPopupResults')).not.toBeInTheDocument()
    })
    it('should not render popup results clickResults has not results added', () => {
      store.dispatch(setShowPopupModal(true))
      store.dispatch(setClickResults([]))
      setup()
      expect(screen.queryByTestId('testPopupResults')).not.toBeInTheDocument()
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
    describe('on analyze clicked', () => {
      it('should open a new window with analyze URL', async () => {
        window.open = vi.fn()
        const openSpy = vi.spyOn(window, 'open')
        const mockAnalyzeBtnUrl = 'https://example.com/analyze'
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          ANALYZE_BTN_URL: mockAnalyzeBtnUrl
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        const analyzeButton = screen.getByRole('button', {
          name: /analyze/i
        })
        await user.click(analyzeButton)
        expect(openSpy).toHaveBeenCalledWith(mockAnalyzeBtnUrl, '_blank')
      })
    })
    describe('on launch clicked', () => {
      it('should open a new window with launch URL', async () => {
        window.open = vi.fn()
        const openSpy = vi.spyOn(window, 'open')
        const mockLaunchBtnUrl = 'https://example.com/launch'
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          LAUNCH_URL: mockLaunchBtnUrl
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        const launchButton = screen.getByRole('button', {
          name: /launch your own/i
        })
        await user.click(launchButton)
        expect(openSpy).toHaveBeenCalledWith(mockLaunchBtnUrl, '_blank')
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
