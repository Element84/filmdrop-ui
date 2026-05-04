import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../../redux/store'
import { setAppConfig, setShowCartModal } from '../../../redux/slices/mainSlice'
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
    store.dispatch(setAppConfig(mockAppConfig))
  })

  describe('on close clicked', () => {
    it('should set setShowCartModal to false in redux state', () => {
      store.dispatch(setShowCartModal(true))
      setup()
      expect(store.getState().mainSlice.showCartModal).toBeTruthy()
      const closeButton = screen.getByRole('button', { name: /close cart/i })
      fireEvent.click(closeButton)
      expect(store.getState().mainSlice.showCartModal).toBeFalsy()
    })
  })

  describe('dialog semantics', () => {
    it('exposes role=dialog with aria-modal and aria-labelledby pointing at title', () => {
      store.dispatch(setShowCartModal(true))
      setup()
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      const labelId = dialog.getAttribute('aria-labelledby')
      expect(labelId).toBeTruthy()
      expect(document.getElementById(labelId)).toHaveTextContent('Your cart')
    })

    it('closes when Escape is pressed inside the dialog', () => {
      store.dispatch(setShowCartModal(true))
      setup()
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      expect(store.getState().mainSlice.showCartModal).toBeFalsy()
    })

    it('closes when the backdrop is clicked', () => {
      store.dispatch(setShowCartModal(true))
      setup()
      const backdrop = screen.getByTestId('testCartModal')
      fireEvent.click(backdrop)
      expect(store.getState().mainSlice.showCartModal).toBeFalsy()
    })

    it('does not close when the dialog content is clicked', () => {
      store.dispatch(setShowCartModal(true))
      setup()
      fireEvent.click(screen.getByRole('dialog'))
      expect(store.getState().mainSlice.showCartModal).toBeTruthy()
    })

    it('returns focus to the previously focused element on unmount', () => {
      store.dispatch(setShowCartModal(true))
      const trigger = document.createElement('button')
      trigger.textContent = 'open'
      document.body.appendChild(trigger)
      trigger.focus()
      expect(document.activeElement).toBe(trigger)
      const { unmount } = setup()
      // Mount focuses the dialog
      expect(document.activeElement).toBe(screen.getByRole('dialog'))
      unmount()
      expect(document.activeElement).toBe(trigger)
      trigger.remove()
    })
  })
})
