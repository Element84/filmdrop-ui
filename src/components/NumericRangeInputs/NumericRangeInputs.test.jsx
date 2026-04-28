import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NumericRangeInputs from './NumericRangeInputs'

const renderComponent = (props = {}) => {
  const defaultProps = {
    value: {},
    onChange: vi.fn(),
    label: 'Test Field',
    mode: 'unbounded',
    ...props
  }
  return {
    ...render(<NumericRangeInputs {...defaultProps} />),
    onChange: defaultProps.onChange
  }
}

describe('NumericRangeInputs', () => {
  describe('unbounded mode', () => {
    it('should render two editable inputs with placeholders', () => {
      renderComponent()
      const minInput = screen.getByLabelText('Test Field minimum value')
      const maxInput = screen.getByLabelText('Test Field maximum value')
      expect(minInput).not.toHaveAttribute('readOnly')
      expect(maxInput).not.toHaveAttribute('readOnly')
      expect(minInput).toHaveAttribute('placeholder', 'Min')
      expect(maxInput).toHaveAttribute('placeholder', 'Max')
    })

    it('should render label', () => {
      renderComponent()
      expect(screen.getByText('Test Field')).toBeInTheDocument()
    })

    it('should not render a slider', () => {
      renderComponent()
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
    })

    it('should call onChange with min value on blur', () => {
      const { onChange } = renderComponent()
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '10' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith({ min: 10 })
    })

    it('should call onChange with max value on blur', () => {
      const { onChange } = renderComponent()
      const maxInput = screen.getByLabelText('Test Field maximum value')
      fireEvent.change(maxInput, { target: { value: '50' } })
      fireEvent.blur(maxInput)
      expect(onChange).toHaveBeenCalledWith({ max: 50 })
    })

    it('should call onChange with null when input is cleared', () => {
      const { onChange } = renderComponent({ value: { min: 10 } })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('should preserve existing max when setting min', () => {
      const { onChange } = renderComponent({ value: { max: 100 } })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '5' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith({ min: 5, max: 100 })
    })

    it('should preserve existing min when setting max', () => {
      const { onChange } = renderComponent({ value: { min: 5 } })
      const maxInput = screen.getByLabelText('Test Field maximum value')
      fireEvent.change(maxInput, { target: { value: '100' } })
      fireEvent.blur(maxInput)
      expect(onChange).toHaveBeenCalledWith({ min: 5, max: 100 })
    })

    it('should clamp min to not exceed current max', () => {
      const { onChange } = renderComponent({ value: { max: 50 } })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '999' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith({ min: 50, max: 50 })
    })

    it('should clamp max to not go below current min', () => {
      const { onChange } = renderComponent({ value: { min: 50 } })
      const maxInput = screen.getByLabelText('Test Field maximum value')
      fireEvent.change(maxInput, { target: { value: '10' } })
      fireEvent.blur(maxInput)
      expect(onChange).toHaveBeenCalledWith({ min: 50, max: 50 })
    })

    it('should handle NaN input by clearing value', () => {
      const { onChange } = renderComponent()
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: 'abc' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('should trigger blur on Enter key', () => {
      renderComponent()
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '10' } })
      fireEvent.keyDown(minInput, { key: 'Enter' })
      // The blur handler should have fired
      expect(minInput).not.toHaveFocus()
    })
  })

  describe('min-only mode', () => {
    it('should render min input as readOnly and max as editable', () => {
      renderComponent({ mode: 'min-only', min: 0 })
      const minInput = screen.getByLabelText('Test Field minimum value')
      const maxInput = screen.getByLabelText('Test Field maximum value')
      expect(minInput).toHaveAttribute('readOnly')
      expect(minInput).toHaveValue('Min: 0')
      expect(maxInput).not.toHaveAttribute('readOnly')
      expect(maxInput).toHaveAttribute('placeholder', 'Max')
    })

    it('should call onChange with max value only', () => {
      const { onChange } = renderComponent({ mode: 'min-only', min: 0 })
      const maxInput = screen.getByLabelText('Test Field maximum value')
      fireEvent.change(maxInput, { target: { value: '50' } })
      fireEvent.blur(maxInput)
      expect(onChange).toHaveBeenCalledWith({ max: 50 })
    })

    it('should clamp max to not go below fixed min', () => {
      const { onChange } = renderComponent({ mode: 'min-only', min: 10 })
      const maxInput = screen.getByLabelText('Test Field maximum value')
      fireEvent.change(maxInput, { target: { value: '5' } })
      fireEvent.blur(maxInput)
      expect(onChange).toHaveBeenCalledWith({ max: 10 })
    })

    it('should call onChange with null when max is cleared', () => {
      const { onChange } = renderComponent({
        mode: 'min-only',
        min: 0,
        value: { max: 50 }
      })
      const maxInput = screen.getByLabelText('Test Field maximum value')
      fireEvent.change(maxInput, { target: { value: '' } })
      fireEvent.blur(maxInput)
      expect(onChange).toHaveBeenCalledWith(null)
    })
  })

  describe('max-only mode', () => {
    it('should render max input as readOnly and min as editable', () => {
      renderComponent({ mode: 'max-only', max: 100 })
      const minInput = screen.getByLabelText('Test Field minimum value')
      const maxInput = screen.getByLabelText('Test Field maximum value')
      expect(maxInput).toHaveAttribute('readOnly')
      expect(maxInput).toHaveValue('Max: 100')
      expect(minInput).not.toHaveAttribute('readOnly')
      expect(minInput).toHaveAttribute('placeholder', 'Min')
    })

    it('should call onChange with min value only', () => {
      const { onChange } = renderComponent({ mode: 'max-only', max: 100 })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '20' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith({ min: 20 })
    })

    it('should clamp min to not exceed fixed max', () => {
      const { onChange } = renderComponent({ mode: 'max-only', max: 100 })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '200' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith({ min: 100 })
    })

    it('should call onChange with null when min is cleared', () => {
      const { onChange } = renderComponent({
        mode: 'max-only',
        max: 100,
        value: { min: 20 }
      })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith(null)
    })
  })

  describe('integer rounding', () => {
    it('should round min value to integer on blur', () => {
      const { onChange } = renderComponent({ integerType: true })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '10.7' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith({ min: 11 })
    })

    it('should round max value to integer on blur', () => {
      const { onChange } = renderComponent({ integerType: true })
      const maxInput = screen.getByLabelText('Test Field maximum value')
      fireEvent.change(maxInput, { target: { value: '5.3' } })
      fireEvent.blur(maxInput)
      expect(onChange).toHaveBeenCalledWith({ max: 5 })
    })

    it('should not round when integerType is false', () => {
      const { onChange } = renderComponent({ integerType: false })
      const minInput = screen.getByLabelText('Test Field minimum value')
      fireEvent.change(minInput, { target: { value: '10.7' } })
      fireEvent.blur(minInput)
      expect(onChange).toHaveBeenCalledWith({ min: 10.7 })
    })
  })

  describe('display values', () => {
    it('should show current values from props when not editing', () => {
      renderComponent({ value: { min: 25, max: 75 } })
      const minInput = screen.getByLabelText('Test Field minimum value')
      const maxInput = screen.getByLabelText('Test Field maximum value')
      expect(minInput).toHaveValue(25)
      expect(maxInput).toHaveValue(75)
    })

    it('should show empty inputs when value is empty object', () => {
      renderComponent({ value: {} })
      const minInput = screen.getByLabelText('Test Field minimum value')
      const maxInput = screen.getByLabelText('Test Field maximum value')
      expect(minInput).toHaveValue(null)
      expect(maxInput).toHaveValue(null)
    })

    it('should sync local state when parent clears value (clear all filters)', () => {
      const { rerender, onChange } = renderComponent({
        value: { min: 25, max: 75 }
      })
      const minInput = screen.getByLabelText('Test Field minimum value')
      const maxInput = screen.getByLabelText('Test Field maximum value')

      // Simulate entering values (focus, type, blur)
      fireEvent.focus(minInput)
      fireEvent.change(minInput, { target: { value: '25' } })
      fireEvent.blur(minInput)

      fireEvent.focus(maxInput)
      fireEvent.change(maxInput, { target: { value: '75' } })
      fireEvent.blur(maxInput)

      // Parent clears value (e.g. "clear all filters")
      rerender(
        <NumericRangeInputs
          value={{}}
          onChange={onChange}
          label="Test Field"
          mode="unbounded"
        />
      )

      // Re-focus inputs — should show cleared values, not stale "25"/"75"
      fireEvent.focus(minInput)
      expect(minInput).toHaveValue(null)
      fireEvent.blur(minInput)

      fireEvent.focus(maxInput)
      expect(maxInput).toHaveValue(null)
    })
  })
})
