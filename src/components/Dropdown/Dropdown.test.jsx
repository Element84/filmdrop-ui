import React from 'react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dropdown from './Dropdown.jsx'

/* eslint-disable react/prop-types -- mock components don't need prop validation */
vi.mock('@mui/material', () => ({
  Select: ({ value, onChange, children, ...rest }) => (
    <div {...rest}>
      <select data-testid="dropdown-select" value={value} readOnly>
        {children}
      </select>
      <button
        type="button"
        data-testid="dropdown-change"
        onClick={() => onChange({ target: { value: 'two' } })}
      >
        change
      </button>
    </div>
  ),
  MenuItem: ({ value, children }) => <option value={value}>{children}</option>,
  OutlinedInput: () => null
}))
/* eslint-enable react/prop-types */

describe('Dropdown', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders options and forwards change events', () => {
    const onChange = vi.fn()

    render(
      <Dropdown
        label="Collection"
        value="one"
        onChange={onChange}
        options={[
          { value: 'one', label: 'Option One' },
          { value: 'two', label: 'Option Two' }
        ]}
      />
    )

    expect(screen.getByText('Collection')).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Option One' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Option Two' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('dropdown-change'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.value).toBe('two')
  })
})
