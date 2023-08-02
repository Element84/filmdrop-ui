import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Search from './Search'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setappConfig,
  setcartItems,
  setCloudCover,
  setsearchGeojsonBoundary,
  setshowAdvancedSearchOptions
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
    describe('if advanced search enabled is false', () => {
      beforeEach(() => {
        store.dispatch(setappConfig(mockAppConfig))
      })
      describe('on render', () => {
        it('should render auto search when ADVANCED_SEARCH_ENABLED is false', () => {
          setup()
          expect(screen.getByText(/auto search/i)).toBeInTheDocument()
        })
      })
    })
    describe('if advanced search enabled is true', () => {
      beforeEach(() => {
        vi.mock('../../utils/mapHelper')
        vi.mock('../../utils/searchHelper')
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          ADVANCED_SEARCH_ENABLED: true
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      })
      describe('on render', () => {
        it('should not render auto search when ADVANCED_SEARCH_ENABLED is true', () => {
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
          expect(
            store.getState().mainSlice.showAdvancedSearchOptions
          ).toBeFalsy()
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
          expect(
            store.getState().mainSlice.showAdvancedSearchOptions
          ).toBeFalsy()
        })
      })
      describe('when advanced clicked', () => {
        it('should set showAdvancedSearchOptions be the opposite showAdvancedSearchOptions of in redux', async () => {
          setup()
          const advancedButton = screen.getByText(/advanced/i)
          await user.click(advancedButton)
          expect(
            store.getState().mainSlice.showAdvancedSearchOptions
          ).toBeTruthy()
          await user.click(advancedButton)
          expect(
            store.getState().mainSlice.showAdvancedSearchOptions
          ).toBeFalsy()
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
          expect(
            store.getState().mainSlice.showAdvancedSearchOptions
          ).toBeFalsy()
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
          expect(
            store.getState().mainSlice.showAdvancedSearchOptions
          ).toBeFalsy()
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
          expect(
            store.getState().mainSlice.showAdvancedSearchOptions
          ).toBeFalsy()
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
  })

  describe('cart button', () => {
    describe('if cartEnabled is set to false in config', () => {
      beforeEach(() => {
        store.dispatch(setappConfig(mockAppConfig))
      })
      describe('on render', () => {
        it('should not render cart button when CART_ENABLED is false', () => {
          setup()
          expect(screen.queryByText(/cart/i)).not.toBeInTheDocument()
        })
      })
    })
    describe('if cartEnabled is set to true in config', () => {
      beforeEach(() => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: true
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      })
      describe('on render', () => {
        it('should render cart button when CART_ENABLED is true', () => {
          setup()
          expect(screen.queryByText(/cart/i)).toBeInTheDocument()
        })
      })
      describe('on cart button click', () => {
        it('should not open modal if no items in cart', async () => {
          setup()
          expect(store.getState().mainSlice.showCartModal).toBeFalsy()
          await user.click(screen.getByTestId('testCartButton'))
          expect(store.getState().mainSlice.showCartModal).toBeFalsy()
        })
        it('should open modal if cart has items', async () => {
          store.dispatch(setcartItems([{ name: 'test item' }]))
          setup()
          expect(store.getState().mainSlice.showCartModal).toBeFalsy()
          await user.click(screen.getByTestId('testCartButton'))
          expect(store.getState().mainSlice.showCartModal).toBeTruthy()
        })
      })
      describe('show count from from cartItems in redux state', () => {
        it('should show count of 0 items initial redux state', () => {
          setup()
          expect(screen.getByTestId('testCartCount').innerHTML).toBe('0')
        })
        it('should show count of 1 items if redux state changed', () => {
          store.dispatch(setcartItems([{ name: 'test item' }]))
          setup()
          expect(screen.getByTestId('testCartCount').innerHTML).toBe('1')
        })
      })
    })
  })
})
