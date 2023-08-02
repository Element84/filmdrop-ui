import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../../redux/store'
import { setappConfig, setshowCartModal } from '../../../redux/slices/mainSlice'
import { mockAppConfig } from '../../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'
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
    it('should set setshowCartModal to false in redux state', async () => {
      store.dispatch(setshowCartModal(true))
      setup()
      expect(store.getState().mainSlice.showCartModal).toBeTruthy()
      await userEvent.click(
        screen.getByRole('button', {
          name: /✕/i
        })
      )
      expect(store.getState().mainSlice.showCartModal).toBeFalsy()
    })
  })
})
