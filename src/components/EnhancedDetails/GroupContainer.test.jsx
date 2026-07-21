import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GroupContainer from './GroupContainer.jsx'
import { AccordionStateProvider } from '../../contexts/AccordionStateContext.jsx'

/* eslint-disable react/prop-types -- mock components don't need prop validation */
vi.mock('@mui/material/Collapse', () => ({
  default: ({ in: open, children }) =>
    open ? <div data-testid="collapse-open">{children}</div> : null
}))

vi.mock('@mui/icons-material/KeyboardArrowUp', () => ({
  default: () => <span data-testid="icon-up">up</span>
}))

vi.mock('@mui/icons-material/KeyboardArrowDown', () => ({
  default: () => <span data-testid="icon-down">down</span>
}))
/* eslint-enable react/prop-types */

function renderSubject(props) {
  return render(
    <AccordionStateProvider>
      <GroupContainer {...props} />
    </AccordionStateProvider>
  )
}

describe('GroupContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders expanded by default when defaultExpanded is true', () => {
    renderSubject({
      groupName: 'Core Fields',
      defaultExpanded: true,
      count: 3,
      children: <div data-testid="group-child">content</div>
    })

    const button = screen.getByRole('button', { name: /Core Fields/i })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('collapse-open')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.queryByText('3')).not.toBeInTheDocument()
    expect(screen.getByTestId('icon-up')).toBeInTheDocument()
  })

  it('toggles collapsed state and shows count badge when collapsed', () => {
    renderSubject({
      groupName: 'Quality',
      defaultExpanded: true,
      count: 2,
      children: <div data-testid="group-child">content</div>
    })

    const button = screen.getByRole('button', { name: /Quality/i })
    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('collapse-open')).not.toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByTestId('icon-down')).toBeInTheDocument()
  })

  it('renders non-grid children when renderChildrenInGrid is false', () => {
    renderSubject({
      groupName: 'Links',
      defaultExpanded: true,
      renderChildrenInGrid: false,
      children: <div data-testid="group-child">content</div>
    })

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByTestId('group-child')).toBeInTheDocument()
  })
})
