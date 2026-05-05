import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import AreaOfInterestSelector from './AreaOfInterestSelector'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setAppConfig,
  setSearchGeojsonBoundary,
  setIsDrawingEnabled,
  setShowUploadGeojsonModal
} from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'
import * as mapInteraction from '../../utils/mapInteraction'
import * as mapLayers from '../../utils/mapLayers'

vi.mock('../../utils/mapInteraction', () => ({
  enableMapPolyDrawing: vi.fn()
}))

vi.mock('../../utils/mapLayers', () => ({
  clearLayer: vi.fn(),
  zoomToCollectionExtent: vi.fn()
}))

describe('AreaOfInterestSelector', () => {
  const user = userEvent.setup()
  const setup = () =>
    render(
      <Provider store={store}>
        <AreaOfInterestSelector />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setAppConfig(mockAppConfig))
    store.dispatch(setSearchGeojsonBoundary(null))
    store.dispatch(setIsDrawingEnabled(false))
    store.dispatch(setShowUploadGeojsonModal(false))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('on render', () => {
    it('should render Draw, Upload, and Map View buttons', () => {
      setup()
      expect(screen.getByRole('button', { name: /draw/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /upload/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /map view/i })
      ).toBeInTheDocument()
    })
  })

  describe('when Draw button clicked', () => {
    it('should enable drawing mode', async () => {
      const spyEnableMapPolyDrawing = vi.spyOn(
        mapInteraction,
        'enableMapPolyDrawing'
      )
      setup()
      const drawButton = screen.getByRole('button', { name: /draw/i })
      await user.click(drawButton)
      expect(spyEnableMapPolyDrawing).toHaveBeenCalled()
      expect(store.getState().mainSlice.isDrawingEnabled).toBeTruthy()
    })

    it('should clear existing boundary and enable drawing when geom exists', async () => {
      const spyEnableMapPolyDrawing = vi.spyOn(
        mapInteraction,
        'enableMapPolyDrawing'
      )
      const spyClearLayer = vi.spyOn(mapLayers, 'clearLayer')
      store.dispatch(
        setSearchGeojsonBoundary({
          type: 'Polygon',
          coordinates: [[]]
        })
      )
      setup()
      const drawButton = screen.getByRole('button', { name: /draw/i })
      await user.click(drawButton)
      expect(spyClearLayer).toHaveBeenCalledWith('drawBoundsLayer')
      expect(spyEnableMapPolyDrawing).toHaveBeenCalled()
      expect(store.getState().mainSlice.searchGeojsonBoundary).toBeNull()
    })
  })

  describe('when Upload button clicked', () => {
    it('should show upload modal', async () => {
      setup()
      const uploadButton = screen.getByRole('button', { name: /upload/i })
      await user.click(uploadButton)
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })

    it('should clear existing boundary and show upload modal when geom exists', async () => {
      const spyClearLayer = vi.spyOn(mapLayers, 'clearLayer')
      store.dispatch(
        setSearchGeojsonBoundary({
          type: 'Polygon',
          coordinates: [[]]
        })
      )
      setup()
      const uploadButton = screen.getByRole('button', { name: /upload/i })
      await user.click(uploadButton)
      expect(spyClearLayer).toHaveBeenCalledWith('drawBoundsLayer')
      expect(store.getState().mainSlice.searchGeojsonBoundary).toBeNull()
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })
  })

  describe('when Map View button clicked', () => {
    it('should clear boundary and reset state', async () => {
      const spyClearLayer = vi.spyOn(mapLayers, 'clearLayer')
      store.dispatch(
        setSearchGeojsonBoundary({
          type: 'Polygon',
          coordinates: [[]]
        })
      )
      setup()
      const mapViewButton = screen.getByRole('button', { name: /map view/i })
      await user.click(mapViewButton)
      expect(spyClearLayer).toHaveBeenCalledWith('drawBoundsLayer')
      expect(store.getState().mainSlice.searchGeojsonBoundary).toBeNull()
    })
  })
})
