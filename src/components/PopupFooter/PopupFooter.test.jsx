import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PopupFooter from './PopupFooter'

describe('PopupFooter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('disables previous/next navigation at bounds', () => {
    const onPrevClick = vi.fn()
    const onNextClick = vi.fn()

    const { rerender } = render(
      <PopupFooter
        currentIndex={0}
        totalCount={3}
        onPrevClick={onPrevClick}
        onNextClick={onNextClick}
      />
    )

    expect(
      screen.getByRole('button', { name: /previous item/i })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /next item/i })
    ).not.toBeDisabled()

    rerender(
      <PopupFooter
        currentIndex={2}
        totalCount={3}
        onPrevClick={onPrevClick}
        onNextClick={onNextClick}
      />
    )

    expect(screen.getByRole('button', { name: /next item/i })).toBeDisabled()
  })

  it('renders cart action and calls handler when enabled', () => {
    const onCartClick = vi.fn()

    render(
      <PopupFooter
        currentIndex={1}
        totalCount={3}
        onPrevClick={vi.fn()}
        onNextClick={vi.fn()}
        cartEnabled
        isInCart={false}
        onCartClick={onCartClick}
      />
    )

    const cartButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(cartButton)

    expect(onCartClick).toHaveBeenCalledTimes(1)
  })
})
