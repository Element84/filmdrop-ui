import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Search from './Search'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setCloudCover,
  setsearchGeojsonBoundary,
  setshowAdvancedSearchOptions
} from '../../redux/slices/mainSlice'
import userEvent from '@testing-library/user-event'
import * as mapHelper from '../../utils/mapHelper'

describe('Search', () => {
  const user = userEvent.setup()
  const setup = () =>
    render(
      <Provider store={store}>
        <Search />
      </Provider>
    )

  beforeEach(() => {
    vi.mock('../../utils/mapHelper')
    vi.mock('../../utils/searchHelper')
    vi.mock('../../assets/config', async () => {
      const actualConfig = await vi.importActual('../../assets/config')
      return {
        ...actualConfig,
        VITE_ADVANCED_SEARCH_ENABLED: true
      }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('on render', () => {
    it('should not render auto search when VITE_ADVANCED_SEARCH_ENABLED is true', () => {
      setup()
      expect(
        screen.queryByText('test_autoSearchContainer')
      ).not.toBeInTheDocument()
    })
    it('should not render disabled search bar overlay div', async () => {
      setup()
      expect(
        screen.queryByTestId('test_disableSearchOverlay')
      ).not.toBeInTheDocument()
    })
  })
  describe('when search options changed', () => {
    it('should set showAdvancedSearchOptions to false in redux', () => {
      store.dispatch(setshowAdvancedSearchOptions(true))
      setup()
      store.dispatch(setCloudCover(5))
      expect(store.getState().mainSlice.showAdvancedSearchOptions).toBeFalsy()
    })
  })
  describe('when search button clicked', () => {
    it('should set showAdvancedSearchOptions to false in redux', async () => {
      store.dispatch(setshowAdvancedSearchOptions(true))
      setup()
      const searchButton = screen.getByRole('button', {
        name: /search/i
      })
      await user.click(searchButton)
      expect(store.getState().mainSlice.showAdvancedSearchOptions).toBeFalsy()
    })
  })
  describe('when advanced clicked', () => {
    it('should set showAdvancedSearchOptions be the opposite showAdvancedSearchOptions of in redux', async () => {
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      expect(store.getState().mainSlice.showAdvancedSearchOptions).toBeTruthy()
      await user.click(advancedButton)
      expect(store.getState().mainSlice.showAdvancedSearchOptions).toBeFalsy()
    })
  })
  describe('when draw boundary button clicked', () => {
    it('should not call functions if geom already exists', async () => {
      const spyEnableMapPolyDrawing = vi.spyOn(
        mapHelper,
        'enableMapPolyDrawing'
      )
      store.dispatch(
        setsearchGeojsonBoundary({
          type: 'Polygon',
          coordinates: [[]]
        })
      )
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      const drawBoundaryButton = screen.getByRole('button', {
        name: /draw boundary/i
      })
      await user.click(drawBoundaryButton)
      expect(spyEnableMapPolyDrawing).not.toHaveBeenCalled()
    })
    it('should enter drawing state if geom does not exists', async () => {
      const spyEnableMapPolyDrawing = vi.spyOn(
        mapHelper,
        'enableMapPolyDrawing'
      )
      store.dispatch(setshowAdvancedSearchOptions(true))
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      const drawBoundaryButton = screen.getByRole('button', {
        name: /draw boundary/i
      })
      await user.click(drawBoundaryButton)
      expect(spyEnableMapPolyDrawing).toHaveBeenCalled()
      expect(store.getState().mainSlice.showAdvancedSearchOptions).toBeFalsy()
      expect(store.getState().mainSlice.isDrawingEnabled).toBeTruthy()
    })
  })
  describe('when clear button clicked', () => {
    it('should not call functions if geom does not exists', async () => {
      const spyClearLayer = vi.spyOn(mapHelper, 'clearLayer')
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      const clearButton = screen.getByRole('button', {
        name: /clear/i
      })
      await user.click(clearButton)
      expect(spyClearLayer).not.toHaveBeenCalled()
    })
    it('should clear layer and close options if geom exists', async () => {
      const spyClearLayer = vi.spyOn(mapHelper, 'clearLayer')
      store.dispatch(
        setsearchGeojsonBoundary({
          type: 'Polygon',
          coordinates: [[]]
        })
      )
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      const clearButton = screen.getByRole('button', {
        name: /clear/i
      })
      await user.click(clearButton)
      expect(spyClearLayer).toHaveBeenCalled()
      expect(store.getState().mainSlice.searchGeojsonBoundary).toBeNull()
      expect(store.getState().mainSlice.showAdvancedSearchOptions).toBeFalsy()
    })
  })
  describe('when upload geojson button clicked', () => {
    it('should not call dispatch functions if geom already exists', async () => {
      store.dispatch(
        setsearchGeojsonBoundary({
          type: 'Polygon',
          coordinates: [[]]
        })
      )
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      const uploadGeojsonButton = screen.getByRole('button', {
        name: /upload geojson/i
      })
      await user.click(uploadGeojsonButton)
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })
    it('should call dispatch functions if geom does not exists', async () => {
      store.dispatch(setshowAdvancedSearchOptions(true))
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      const uploadGeojsonButton = screen.getByRole('button', {
        name: /upload geojson/i
      })
      await user.click(uploadGeojsonButton)
      expect(store.getState().mainSlice.showAdvancedSearchOptions).toBeFalsy()
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })
  })
  describe('when drawing mode enabled', () => {
    it('should render disabled search bar overlay div', async () => {
      setup()
      const advancedButton = screen.getByText(/advanced/i)
      await user.click(advancedButton)
      const drawBoundaryButton = screen.getByRole('button', {
        name: /draw boundary/i
      })
      await user.click(drawBoundaryButton)
      expect(
        screen.queryByTestId('test_disableSearchOverlay')
      ).toBeInTheDocument()
    })
  })
})
