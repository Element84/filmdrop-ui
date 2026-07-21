import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card.jsx'

describe('Card', () => {
  it('renders label, children, and custom class', () => {
    render(
      <Card label="Filters" className="extra-class">
        <div>Card content</div>
      </Card>
    )

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()

    const card = screen.getByText('Card content').closest('.Card')
    expect(card).toHaveClass('extra-class')
  })

  it('applies fixed height style when numeric height is provided', () => {
    render(
      <Card height={420}>
        <div>Card content</div>
      </Card>
    )

    const card = screen.getByText('Card content').closest('.Card')
    expect(card).toHaveStyle({ height: '420px' })
  })
})
