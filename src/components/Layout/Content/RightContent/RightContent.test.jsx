import { describe, vi } from 'vitest'
import React from 'react'
import { screen } from '@testing-library/react'
import RightContent from './RightContent'
import { createFilmDropStore } from '../../../../redux/store'
import { LayoutProvider } from '../../../../contexts/LayoutContext'
import { renderFilmDrop } from '../../../../testing/renderFilmDrop'
import {
  setSearchResults,
  setIsDrawingEnabled,
  setAppConfig,
  setSearchGeojsonBoundary,
  setSearchType,
  setCartItems,
  setImageOverlayLoading,
  setShowAppLoading,
  setSearchLoading,
  setShowZoomNotice,
  setZoomLevelNeeded,
  setViewMode,
  setAppName
} from '../../../../redux/slices/mainSlice'
import {
  mockSceneSearchResult,
  mockHexAggregateSearchResult,
  mockGridAggregateSearchResult,
  mockAppConfig
} from '../../../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'
import * as mapHelper from '../../../../utils/mapHelper'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearch: () => ({})
  }
})

describe('RightContent', () => {
  const user = userEvent.setup()
  let currentStore

  const setup = () => {
    return renderFilmDrop(
      <LayoutProvider>
        <RightContent />
      </LayoutProvider>,
      {
        store: currentStore
      }
    )
  }

  beforeEach(() => {
    currentStore = createFilmDropStore()
    currentStore.dispatch(setAppConfig(mockAppConfig))
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('on render', () => {
    it('should position using left offset when RIGHT_SIDEBAR_ENABLED is false', () => {
      currentStore.dispatch(
        setAppConfig({
          ...mockAppConfig,
          RIGHT_SIDEBAR_ENABLED: false
        })
      )
      const { container } = setup()
      const rightContent = container.querySelector('.RightContent')
      expect(rightContent.style.left).toBe('340px')
      expect(rightContent.style.right).toBe('')
    })

    it('should position using right offset when RIGHT_SIDEBAR_ENABLED is true', () => {
      currentStore.dispatch(
        setAppConfig({
          ...mockAppConfig,
          RIGHT_SIDEBAR_ENABLED: true
        })
      )
      const { container } = setup()
      const rightContent = container.querySelector('.RightContent')
      expect(rightContent.style.right).toBe('340px')
    })

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
      currentStore.dispatch(setAppConfig(mockAppConfigNoAction))
      setup()
      expect(
        screen.queryByRole('button', {
          name: /launch your own/i
        })
      ).not.toBeInTheDocument()
    })
    it('should render Legend if geojsonBoundary set in redux', () => {
      currentStore.dispatch(
        setSearchGeojsonBoundary({ type: 'Point', coordinates: [0, 0] })
      )
      setup()
      expect(screen.queryByTestId('testLayerLegend')).toBeInTheDocument()
    })
    it('should render Legend if searchType and searchResults set in redux', () => {
      currentStore.dispatch(setSearchType('hex'))
      currentStore.dispatch(
        setSearchResults({ type: 'Point', coordinates: [0, 0] })
      )
      setup()
      expect(screen.queryByTestId('testLayerLegend')).toBeInTheDocument()
    })
    it('should render Legend if cartItems has items set in redux', () => {
      currentStore.dispatch(setCartItems([mockSceneSearchResult]))
      setup()
      expect(screen.queryByTestId('testLayerLegend')).toBeInTheDocument()
    })
    it('should not render Legend if geojsonBoundary not set and searchType and searchResults not set in redux', () => {
      setup()
      expect(screen.queryByTestId('testLayerLegend')).not.toBeInTheDocument()
    })
    it('should not render Legend if searchType not set in redux', () => {
      currentStore.dispatch(
        setSearchResults({ type: 'Point', coordinates: [0, 0] })
      )
      setup()
      expect(screen.queryByTestId('testLayerLegend')).not.toBeInTheDocument()
    })
    it('should not render Legend if searchResults not set in redux', () => {
      currentStore.dispatch(setSearchType('hex'))
      setup()
      expect(screen.queryByTestId('testLayerLegend')).not.toBeInTheDocument()
    })
    it('should render loading animation when searchLoading is true', async () => {
      currentStore.dispatch(setSearchLoading(true))
      currentStore.dispatch(setAppConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('testsearchLoadingAnimation')
      ).toBeInTheDocument()
    })
    it('should not render loading animation when searchLoading is false', async () => {
      currentStore.dispatch(setSearchLoading(false))
      currentStore.dispatch(setAppConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('testsearchLoadingAnimation')
      ).not.toBeInTheDocument()
    })
    it('should render loading animation when imageOverlay loading is true', async () => {
      currentStore.dispatch(setImageOverlayLoading(true))
      currentStore.dispatch(setAppConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('test_loadingImageryOverlay')
      ).toBeInTheDocument()
    })
    it('should not render loading animation when imageOverlay loading is false', async () => {
      currentStore.dispatch(setImageOverlayLoading(false))
      currentStore.dispatch(setAppConfig(mockAppConfig))
      setup()
      expect(
        screen.queryByTestId('test_loadingImageryOverlay')
      ).not.toBeInTheDocument()
    })
    it('should render application loading animation when showAppLoading loading is true', async () => {
      currentStore.dispatch(setShowAppLoading(true))
      currentStore.dispatch(setAppName('Test App'))
      setup()
      const container = screen.queryByTestId('test_applicationLoadingAnimation')
      expect(container).toBeInTheDocument()
      expect(container).toHaveTextContent(/loading test app/i)
    })
    it('should not render application loading animation when showAppLoading loading is false', async () => {
      currentStore.dispatch(setAppConfig(mockAppConfig))
      currentStore.dispatch(setShowAppLoading(false))
      currentStore.dispatch(setAppName('Test App'))
      setup()
      expect(
        screen.queryByTestId('test_applicationLoadingAnimation')
      ).not.toBeInTheDocument()
    })
    it('should render zoom notice if showZoomNotice set to true in redux', () => {
      currentStore.dispatch(setShowZoomNotice(true))
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
      currentStore.dispatch(setIsDrawingEnabled(true))
    })
    it('should not show scene message when drawing message is showing', () => {
      currentStore.dispatch(setSearchResults(mockSceneSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingScenesMessage')
      ).not.toBeInTheDocument()
    })
    it('should not show grid aggregate messages when drawing message is showing', () => {
      currentStore.dispatch(setSearchResults(mockGridAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).not.toBeInTheDocument()
    })
    it('should not show hex aggregate messages when drawing message is showing', () => {
      currentStore.dispatch(setSearchResults(mockHexAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).not.toBeInTheDocument()
    })
    describe('on draw message close clicked', () => {
      it('should setIsDrawingEnabled to false in redux state and call disableMapPolyDrawing', async () => {
        const spyDisableMapPolyDrawing = vi.spyOn(
          mapHelper,
          'disableMapPolyDrawing'
        )
        setup()
        expect(currentStore.getState().mainSlice.isDrawingEnabled).toBeTruthy()
        await user.click(
          screen.getByRole('button', {
            name: /cancel/i
          })
        )
        expect(currentStore.getState().mainSlice.isDrawingEnabled).toBeFalsy()
        expect(spyDisableMapPolyDrawing).toHaveBeenCalledOnce()
      })
    })
  })
  describe('when isDrawingEnabled is false', () => {
    it('should show scene messages when not drawing', () => {
      currentStore.dispatch(setIsDrawingEnabled(false))
      currentStore.dispatch(setSearchResults(mockSceneSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingScenesMessage')
      ).toBeInTheDocument()
    })
    it('should show grid aggregate messages when not drawing', () => {
      currentStore.dispatch(setIsDrawingEnabled(false))
      currentStore.dispatch(setSearchResults(mockGridAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).toBeInTheDocument()
    })
    it('should show hex aggregate messages when not drawing', () => {
      currentStore.dispatch(setIsDrawingEnabled(false))
      currentStore.dispatch(setSearchResults(mockHexAggregateSearchResult))
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
        currentStore.dispatch(setAppConfig(mockAppConfigSearchEnabled))
        setup()
        const actionButton = screen.getByRole('button', {
          name: /launch your own/i
        })
        await user.click(actionButton)
        expect(openSpy).toHaveBeenCalledWith(
          mockActionBtnUrl,
          '_blank',
          'noopener,noreferrer'
        )
      })
    })
    describe('on zoom Clicked', () => {
      it('should zoom in to match the redux zoom level if view mode is not mosaic', async () => {
        currentStore.dispatch(setShowZoomNotice(true))
        currentStore.dispatch(setZoomLevelNeeded(7))
        const zoomSpy = vi.spyOn(mapHelper, 'setMapZoomLevel')
        setup()
        const zoomButton = screen.getByText(/zoom in/i)
        await user.click(zoomButton)
        expect(zoomSpy).toHaveBeenCalledWith(7)
      })
      it('should zoom in to match the config zoom level if view mode is mosaic', async () => {
        currentStore.dispatch(setShowZoomNotice(true))
        currentStore.dispatch(setZoomLevelNeeded(7))
        currentStore.dispatch(setViewMode('mosaic'))
        const zoomSpy = vi.spyOn(mapHelper, 'setMapZoomLevel')
        currentStore.dispatch(setAppConfig(mockAppConfig))
        setup()
        const zoomButton = screen.getByText(/zoom in/i)
        await user.click(zoomButton)
        expect(zoomSpy).toHaveBeenCalledWith(7)
        expect(currentStore.getState().mainSlice.showZoomNotice).toBeFalsy()
      })
    })
    describe('on Cancel Draw Geom clicked', () => {
      it('should set isDrawingEnabled to false in redux and call disableMapPolyDrawing', async () => {
        const disableMapPloyDrawingSpy = vi.spyOn(
          mapHelper,
          'disableMapPolyDrawing'
        )
        currentStore.dispatch(setAppConfig(mockAppConfig))
        currentStore.dispatch(setIsDrawingEnabled(true))
        setup()
        const cancelButton = screen.getByRole('button', {
          name: /cancel/i
        })
        await user.click(cancelButton)
        expect(currentStore.getState().mainSlice.isDrawingEnabled).toBeFalsy()
        expect(disableMapPloyDrawingSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
