import React from 'react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MultiSelect from './MultiSelect.jsx'

/* eslint-disable react/prop-types -- mock components don't need prop validation */
vi.mock('@mui/material', () => {
  const React = require('react')

  const Select = React.forwardRef(
    ({ value, onChange, renderValue, children, ...rest }, ref) => (
      <div ref={ref} {...rest}>
        <input data-testid="multiselect-input" />
        <button
          type="button"
          data-testid="multiselect-change-string"
          onClick={() => onChange({ target: { value: 'one,two' } })}
        >
          change-string
        </button>
        <button
          type="button"
          data-testid="multiselect-change-array"
          onClick={() => onChange({ target: { value: ['two'] } })}
        >
          change-array
        </button>
        <div data-testid="multiselect-render-value">{renderValue(value)}</div>
        <div>{children}</div>
      </div>
    )
  )
  Select.displayName = 'Select'

  return {
    Select,
    MenuItem: ({ value, children }) => <div data-value={value}>{children}</div>,
    OutlinedInput: () => null,
    Box: ({ children, ...rest }) => <div {...rest}>{children}</div>,
    Chip: ({ label, onDelete }) => (
      <button type="button" onClick={onDelete}>
        {label}
      </button>
    )
  }
})
/* eslint-enable react/prop-types */

describe('MultiSelect', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('normalizes string and array changes before calling onChange', () => {
    const onChange = vi.fn()

    render(
      <MultiSelect
        label="Fields"
        value={['one']}
        onChange={onChange}
        options={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' }
        ]}
      />
    )

    fireEvent.click(screen.getByTestId('multiselect-change-string'))
    expect(onChange).toHaveBeenCalledWith(['one', 'two'])

    fireEvent.click(screen.getByTestId('multiselect-change-array'))
    expect(onChange).toHaveBeenCalledWith(['two'])
  })

  it('deletes chip values and blurs the internal input', () => {
    const onChange = vi.fn()

    render(
      <MultiSelect
        label="Fields"
        value={['one', 'two']}
        onChange={onChange}
        options={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' }
        ]}
      />
    )

    const input = screen.getByTestId('multiselect-input')
    const blurSpy = vi.spyOn(input, 'blur')

    fireEvent.click(screen.getByRole('button', { name: 'One' }))

    expect(onChange).toHaveBeenCalledWith(['two'])
    expect(blurSpy).toHaveBeenCalled()
  })
})
