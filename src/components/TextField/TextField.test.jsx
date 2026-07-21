import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import TextField from './TextField'

describe('TextField (seed)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the label and current value', () => {
    render(<TextField label="Name" value="hello" onChange={() => {}} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('updates the displayed value when the external `value` prop changes', () => {
    const { rerender } = render(
      <TextField label="Name" value="alpha" onChange={() => {}} />
    )
    expect(screen.getByDisplayValue('alpha')).toBeInTheDocument()

    rerender(<TextField label="Name" value="beta" onChange={() => {}} />)
    expect(screen.getByDisplayValue('beta')).toBeInTheDocument()
  })

  it('debounces onChange so rapid typing fires the callback once with the latest value', () => {
    const onChange = vi.fn()
    render(
      <TextField label="Q" value="" onChange={onChange} debounceDelay={300} />
    )

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.change(input, { target: { value: 'abc' } })

    expect(onChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('abc')
  })
})
