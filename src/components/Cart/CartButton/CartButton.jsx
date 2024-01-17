import React from 'react'
import './CartButton.css'
import { Box } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { setshowCartModal } from '../../../redux/slices/mainSlice'

const CartButton = () => {
  const dispatch = useDispatch()
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)

  function onCartButtonClick() {
    if (_cartItems.length === 0) {
      return
    }
    dispatch(setshowCartModal(true))
  }
  return (
    <div className="CartButton">
      <Box
        className={
          _cartItems.length > 0 ? 'cartButton cartButtonEnabled' : 'cartButton'
        }
        data-testid="testCartButton"
        onClick={onCartButtonClick}
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
      </Box>
    </div>
  )
}

export default CartButton
