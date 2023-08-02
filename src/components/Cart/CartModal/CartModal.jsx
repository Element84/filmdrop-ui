import React from 'react'
import './CartModal.css'
import { useDispatch } from 'react-redux'
import { setshowCartModal } from '../../../redux/slices/mainSlice'

const CartModal = () => {
  const dispatch = useDispatch()

  function onCartModalCloseClick() {
    dispatch(setshowCartModal(false))
  }
  return (
    <div className="cartModal" data-testid="testCartModal">
      <div className="cartModalContents">
        <div className="cartModalTopBar">
          <span className="cartModalTopBarText">Your cart</span>
          <button
            className="closeCartModal"
            onClick={() => onCartModalCloseClick()}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartModal
