import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../../redux/store'
import { setappConfig, setshowCartModal } from '../../../redux/slices/mainSlice'
import { mockAppConfig } from '../../../testing/shared-mocks'
import CartModal from './CartModal'

describe('CartModal', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <CartModal />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
  })

  describe('on close clicked', () => {
    it('should set setshowCartModal to false in redux state', () => {
      store.dispatch(setshowCartModal(true))
      setup()
      expect(store.getState().mainSlice.showCartModal).toBeTruthy()
      const closeButton = screen.getByText('✕')
      fireEvent.click(closeButton)
      expect(store.getState().mainSlice.showCartModal).toBeFalsy()
    })
  })
})
