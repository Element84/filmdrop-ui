import React from 'react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createFilmDropStore } from '../../../redux/store'
import { setCartItems, setShowCartModal } from '../../../redux/slices/mainSlice'
import CartButton from './CartButton.jsx'

function renderSubject(cartItems = []) {
  const store = createFilmDropStore()
  store.dispatch(setCartItems(cartItems))
  store.dispatch(setShowCartModal(false))

  const view = render(
    <Provider store={store}>
      <CartButton />
    </Provider>
  )

  return { ...view, store }
}

describe('CartButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the current cart count', () => {
    renderSubject([{ id: 'scene-1' }, { id: 'scene-2' }])

    expect(screen.getByText('Cart')).toBeInTheDocument()
    expect(screen.getByTestId('testCartCount')).toHaveTextContent('2')
  })

  it('does not open the cart modal when the cart is empty', () => {
    const { store } = renderSubject([])

    fireEvent.click(screen.getByTestId('testCartButton'))

    expect(store.getState().mainSlice.showCartModal).toBe(false)
  })

  it('opens the cart modal when items are present', () => {
    const { store } = renderSubject([{ id: 'scene-1' }])

    fireEvent.click(screen.getByTestId('testCartButton'))

    expect(store.getState().mainSlice.showCartModal).toBe(true)
  })
})
