import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ButtonGroup from './ButtonGroup'

/* eslint-disable react/prop-types -- lightweight mocks for interaction testing */
vi.mock('@mui/material/ToggleButtonGroup', () => ({
  default: ({ children, onChange }) => (
    <div>
      <button
        type="button"
        data-testid="toggle-select-b"
        onClick={() => onChange(null, 'b')}
      >
        select-b
      </button>
      <button
        type="button"
        data-testid="toggle-reclick"
        onClick={() => onChange(null, null)}
      >
        reclick
      </button>
      {children}
    </div>
  )
}))

vi.mock('@mui/material/ToggleButton', () => ({
  default: ({ children, disabled }) => (
    <button type="button" disabled={disabled}>
      {children}
    </button>
  )
}))
/* eslint-enable react/prop-types */

describe('ButtonGroup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls selected button handler when a new value is chosen', () => {
    const onClickA = vi.fn()
    const onClickB = vi.fn()

    render(
      <ButtonGroup
        label="Tabs"
        buttons={[
          { value: 'a', label: 'A', onClick: onClickA, active: true },
          { value: 'b', label: 'B', onClick: onClickB }
        ]}
      />
    )

    fireEvent.click(screen.getByTestId('toggle-select-b'))

    expect(onClickB).toHaveBeenCalledTimes(1)
    expect(onClickA).not.toHaveBeenCalled()
  })

  it('re-clicking active button triggers active handler when not disabled', () => {
    const onClickA = vi.fn()

    render(
      <ButtonGroup
        label="Tabs"
        buttons={[
          { value: 'a', label: 'A', onClick: onClickA, active: true },
          { value: 'b', label: 'B', onClick: vi.fn(), disabled: true }
        ]}
      />
    )

    fireEvent.click(screen.getByTestId('toggle-reclick'))

    expect(onClickA).toHaveBeenCalledTimes(1)
  })
})
