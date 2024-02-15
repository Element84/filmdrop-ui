import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Search from './Search'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setappConfig,
  setCloudCover,
  setsearchGeojsonBoundary,
  setshowSearchByGeom
} from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
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

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('search button', () => {
    describe('if SEARCH_BY_GEOM_ENABLED is true', () => {
      beforeEach(() => {
        vi.mock('../../utils/mapHelper')
        vi.mock('../../utils/searchHelper')
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          SEARCH_BY_GEOM_ENABLED: true
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      })
      describe('on render', () => {
        it('should not render disabled search bar overlay div', async () => {
          setup()
          expect(
            screen.queryByTestId('test_disableSearchOverlay')
          ).not.toBeInTheDocument()
        })
      })
      describe('when search options changed', () => {
        it('should set showSearchByGeom to false in redux', () => {
          store.dispatch(setshowSearchByGeom(true))
          setup()
          store.dispatch(setCloudCover(5))
          expect(store.getState().mainSlice.showSearchByGeom).toBeFalsy()
        })
      })
      describe('when search button clicked', () => {
        it('should set showSearchByGeom to false in redux', async () => {
          store.dispatch(setshowSearchByGeom(true))
          setup()
          const searchButton = screen.getByRole('button', {
            name: /search/i
          })
          await user.click(searchButton)
          expect(store.getState().mainSlice.showSearchByGeom).toBeFalsy()
        })
      })
      describe('when drawing mode enabled', () => {
        it('should render disabled search bar overlay div', async () => {
          setup()
          const drawBoundaryButton = screen.getByRole('button', {
            name: /draw/i
          })
          await user.click(drawBoundaryButton)
          expect(store.getState().mainSlice.isDrawingEnabled).toBeTruthy()
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
          const drawBoundaryButton = screen.getByRole('button', {
            name: /draw/i
          })
          await user.click(drawBoundaryButton)
          expect(spyEnableMapPolyDrawing).not.toHaveBeenCalled()
        })
        it('should enter drawing state if geom does not exists', async () => {
          const spyEnableMapPolyDrawing = vi.spyOn(
            mapHelper,
            'enableMapPolyDrawing'
          )
          store.dispatch(setshowSearchByGeom(true))
          setup()
          const drawBoundaryButton = screen.getByRole('button', {
            name: /draw/i
          })
          await user.click(drawBoundaryButton)
          expect(spyEnableMapPolyDrawing).toHaveBeenCalled()
          expect(store.getState().mainSlice.isDrawingEnabled).toBeTruthy()
        })
      })
      describe('when clear button clicked', () => {
        it('should not call functions if geom does not exists', async () => {
          const spyClearLayer = vi.spyOn(mapHelper, 'clearLayer')
          setup()
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
          const clearButton = screen.getByRole('button', {
            name: /clear/i
          })
          await user.click(clearButton)
          expect(spyClearLayer).toHaveBeenCalled()
          expect(store.getState().mainSlice.searchGeojsonBoundary).toBeNull()
          expect(store.getState().mainSlice.showSearchByGeom).toBeFalsy()
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
          const uploadGeojsonButton = screen.getByRole('button', {
            name: /upload/i
          })
          await user.click(uploadGeojsonButton)
          expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
        })
        it('should call dispatch functions if geom does not exists', async () => {
          store.dispatch(setshowSearchByGeom(true))
          setup()
          const uploadGeojsonButton = screen.getByRole('button', {
            name: /upload/i
          })
          await user.click(uploadGeojsonButton)
          expect(store.getState().mainSlice.showSearchByGeom).toBeFalsy()
          expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
        })
      })
    })
  })
})
