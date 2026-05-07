import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RangeSliderWithInputs from './RangeSliderWithInputs'

/* eslint-disable react/prop-types -- lightweight mocks for interaction testing */
vi.mock('@mui/material', () => ({
  Slider: ({ onChange }) => (
    <button
      type="button"
      data-testid="mock-slider"
      onClick={() => onChange(null, [3, 8])}
    >
      slider-change
    </button>
  )
}))
/* eslint-enable react/prop-types */

describe('RangeSliderWithInputs', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('forwards slider value changes to onChange', () => {
    const onChange = vi.fn()

    render(
      <RangeSliderWithInputs
        min={0}
        max={10}
        value={{ min: 1, max: 9 }}
        onChange={onChange}
        label="Cloud cover"
      />
    )

    fireEvent.click(screen.getByTestId('mock-slider'))

    expect(onChange).toHaveBeenCalledWith({ min: 3, max: 8 })
  })

  it('clamps and normalizes min/max input values on blur', () => {
    const onChange = vi.fn()

    render(
      <RangeSliderWithInputs
        min={0}
        max={10}
        value={{ min: 2, max: 7 }}
        onChange={onChange}
        label="Cloud cover"
      />
    )

    const minInput = screen.getByLabelText('Cloud cover minimum value')
    const maxInput = screen.getByLabelText('Cloud cover maximum value')

    fireEvent.focus(minInput)
    fireEvent.change(minInput, { target: { value: '-4' } })
    fireEvent.blur(minInput)

    fireEvent.focus(maxInput)
    fireEvent.change(maxInput, { target: { value: '30' } })
    fireEvent.blur(maxInput)

    expect(onChange).toHaveBeenCalledWith({ min: 0, max: 7 })
    expect(onChange).toHaveBeenCalledWith({ min: 2, max: 10 })
  })
})
