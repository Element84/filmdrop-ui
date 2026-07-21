import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  AccordionStateProvider,
  useAccordionState
} from './AccordionStateContext'

// eslint-disable-next-line react/prop-types
function Probe({ name = 'Core Fields', defaultExpanded = false }) {
  const { isExpanded, toggleGroup } = useAccordionState()
  const expanded = isExpanded(name, defaultExpanded)

  return (
    <>
      <span data-testid="expanded">{String(expanded)}</span>
      <button type="button" onClick={() => toggleGroup(name, expanded)}>
        Toggle
      </button>
    </>
  )
}

describe('AccordionStateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws when hook is used outside provider', () => {
    expect(() => render(<Probe />)).toThrow(
      'useAccordionState must be used within AccordionStateProvider'
    )
  })

  it('uses defaultExpanded when group has no stored state', () => {
    render(
      <AccordionStateProvider>
        <Probe defaultExpanded={true} />
      </AccordionStateProvider>
    )

    expect(screen.getByTestId('expanded')).toHaveTextContent('true')
  })

  it('toggles and persists group state by normalized group key', () => {
    const { rerender } = render(
      <AccordionStateProvider>
        <Probe name="Core Fields" defaultExpanded={false} />
      </AccordionStateProvider>
    )

    expect(screen.getByTestId('expanded')).toHaveTextContent('false')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(screen.getByTestId('expanded')).toHaveTextContent('true')

    rerender(
      <AccordionStateProvider>
        <Probe name="core fields" defaultExpanded={false} />
      </AccordionStateProvider>
    )

    expect(screen.getByTestId('expanded')).toHaveTextContent('true')
  })
})
