import React from 'react'
import { render, screen } from '@testing-library/react'
import PageHeader from './PageHeader'
import { Provider } from 'react-redux'
import { store } from '../../../redux/store'
import { setappConfig, setcartItems } from '../../../redux/slices/mainSlice'
import { mockAppConfig } from '../../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'

describe('PageHeader', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <PageHeader />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
  })
  describe('on app render', () => {
    it('should load the filmdrop logo into the document if SHOW_BRAND_LOGO set to true in config', () => {
      setup()
      expect(
        screen.queryByRole('img', {
          name: /filmdrop by element 84/i
        })
      ).toBeInTheDocument()
    })
    it('should load the filmdrop logo into the document if SHOW_BRAND_LOGO does not exists in config', () => {
      const SHOW_BRAND_LOGO = mockAppConfig.SHOW_BRAND_LOGO
      const mockAppConfigSearchEnabled = {
        SHOW_BRAND_LOGO,
        ...mockAppConfig
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      setup()
      expect(
        screen.queryByRole('img', {
          name: /filmdrop by element 84/i
        })
      ).toBeInTheDocument()
    })
    it('should not load the filmdrop logo into the document if SHOW_BRAND_LOGO set to false in config', () => {
      const mockAppConfigSearchEnabled = {
        ...mockAppConfig,
        SHOW_BRAND_LOGO: false
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      setup()
      expect(
        screen.queryByRole('img', {
          name: /filmdrop by element 84/i
        })
      ).not.toBeInTheDocument()
    })
  })
  describe('cart button', () => {
    const user = userEvent.setup()
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
