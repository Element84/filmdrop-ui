import React, { useEffect, useRef } from 'react'
import './CartModal.css'
import { useDispatch } from 'react-redux'
import { setShowCartModal } from '../../../redux/slices/mainSlice'

const CartModal = () => {
  const dispatch = useDispatch()
  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  function onCartModalCloseClick() {
    dispatch(setShowCartModal(false))
  }

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement
    dialogRef.current?.focus()
    return () => {
      const el = previouslyFocusedRef.current
      if (el && typeof el.focus === 'function' && document.contains(el)) {
        el.focus()
      }
    }
  }, [])

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onCartModalCloseClick()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onCartModalCloseClick()
    }
  }

  return (
    <div
      className="cartModal"
      data-testid="testCartModal"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="cartModalContents"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filmdrop-cart-modal-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="cartModalTopBar">
          <span id="filmdrop-cart-modal-title" className="cartModalTopBarText">
            Your cart
          </span>
          <button
            className="closeCartModal"
            aria-label="Close cart"
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
