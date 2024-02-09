import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import PopupResults from './PopupResults'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setShowPopupModal,
  setappConfig,
  setcartItems,
  setimageOverlayLoading
} from '../../redux/slices/mainSlice'
import { mockAppConfig, mockClickResults } from '../../testing/shared-mocks'
import { describe } from 'vitest'

describe('PopupResult', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <PopupResults results={mockClickResults} />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
  })

  describe('on conditional render', () => {
    describe('cart buttons', () => {
      it('should render cart count in popup header if cart enabled in config and cart has items', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(
          screen.queryByText(/2 scenes selected \(1 in cart\)/i)
        ).toBeInTheDocument()
      })
      it('should render add all to cart button in popup header if cart enabled in config', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /add all to cart/i
          })
        ).toBeInTheDocument()
      })
      it('should render add all to cart button in popup footer if cart enabled in config', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /add scene to cart/i
          })
        ).toBeInTheDocument()
      })
      it('should not render cart count in popup header if cart not enabled in config', () => {
        store.dispatch(setappConfig(mockAppConfig))
        setup()
        expect(screen.queryByText(/2 scenes selected/i)).toBeInTheDocument()
        expect(
          screen.queryByText(/2 scenes selected \(1 in cart\)/i)
        ).not.toBeInTheDocument()
      })
      it('should not render add all to cart button in popup header if cart not enabled in config', () => {
        store.dispatch(setappConfig(mockAppConfig))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /add all to cart/i
          })
        ).not.toBeInTheDocument()
      })
      it('should not render add all to cart button in popup footer if cart not enabled in config', () => {
        store.dispatch(setappConfig(mockAppConfig))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /add scene to cart/i
          })
        ).not.toBeInTheDocument()
      })
      it('should render text as remove from cart in popup footer if scene already in cart', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /remove scene from cart/i
          })
        ).toBeInTheDocument()
      })
    })
  })
  describe('on button clicks', () => {
    describe('on Add all to cart button clicked', () => {
      it('should add all items to cart if none currently in cart', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        expect(store.getState().mainSlice.cartItems.length).toBe(0)
        fireEvent.click(
          screen.getByRole('button', { name: /add all to cart/i })
        )
        expect(store.getState().mainSlice.cartItems.length).toBe(
          mockClickResults.length
        )
      })
      it('should only add items to cart that are not already in cart', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(store.getState().mainSlice.cartItems.length).toBe(1)
        fireEvent.click(
          screen.getByRole('button', { name: /add all to cart/i })
        )
        expect(store.getState().mainSlice.cartItems.length).toBe(
          mockClickResults.length
        )
      })
      it('should not add any items if all items are already in cart', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        store.dispatch(setcartItems(mockClickResults))
        setup()
        expect(store.getState().mainSlice.cartItems.length).toBe(
          mockClickResults.length
        )
        fireEvent.click(
          screen.getByRole('button', { name: /add all to cart/i })
        )
        expect(store.getState().mainSlice.cartItems.length).toBe(
          mockClickResults.length
        )
      })
    })
    describe('on Add scene to cart button clicked', () => {
      it('should add clicked scene to cart if scene not in cart', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        setup()
        expect(store.getState().mainSlice.cartItems.length).toBe(0)
        fireEvent.click(
          screen.getByRole('button', { name: /add scene to cart/i })
        )
        expect(store.getState().mainSlice.cartItems.length).toBe(1)
      })
      it('should remove clicked scene from cart if scene in cart', () => {
        const mockAppConfigSearchEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigSearchEnabled))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(store.getState().mainSlice.cartItems.length).toBe(1)
        fireEvent.click(
          screen.getByRole('button', { name: /remove scene from cart/i })
        )
        expect(store.getState().mainSlice.cartItems.length).toBe(0)
      })
    })
    describe('on prev & next scene buttons clicked', () => {
      it('should set scene result in redux to next and prev scene if not out of range', () => {
        store.dispatch(setappConfig(mockAppConfig))
        setup()
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[0]
        )
        fireEvent.click(screen.getByTestId('ChevronRightIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[1]
        )
        fireEvent.click(screen.getByTestId('ChevronRightIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[1]
        )
        fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[0]
        )
        fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[0]
        )
      })
    })
  })
})
