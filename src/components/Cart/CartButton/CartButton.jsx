import React from 'react'
import './CartButton.css'
import { Stack } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { setShowCartModal } from '../../../redux/slices/mainSlice'

const CartButton = () => {
  const dispatch = useDispatch()
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)

  function onCartButtonClick() {
    if (_cartItems.length === 0) {
      return
    }
    dispatch(setShowCartModal(true))
  }
  return (
    <div className="CartButton">
      <Stack
        component="button"
        type="button"
        className={
          _cartItems.length > 0 ? 'cartButton cartButtonEnabled' : 'cartButton'
        }
        disabled={_cartItems.length === 0}
        data-testid="testCartButton"
        onClick={onCartButtonClick}
        aria-label={`Cart, ${_cartItems.length} item${_cartItems.length === 1 ? '' : 's'}`}
      >
        <span>Cart</span>
        <div
          className={
            _cartItems.length > 0
              ? 'cartCountContainer cartCountContainerEnabled'
              : 'cartCountContainer'
          }
          data-testid="testCartCount"
        >
          {_cartItems.length}
        </div>
      </Stack>
    </div>
  )
}

export default CartButton
