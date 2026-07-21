import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingAnimation from './LoadingAnimation'

describe('LoadingAnimation', () => {
  it('renders the loader container and svg', () => {
    const { container } = render(<LoadingAnimation />)

    expect(container.querySelector('.animated-loader')).toBeInTheDocument()
    expect(container.querySelector('#filmdrop-loader')).toBeInTheDocument()
    expect(
      container.querySelector('#filmdrop-loader .chevron')
    ).toBeInTheDocument()
    expect(
      container.querySelector('#filmdrop-loader .triangle')
    ).toBeInTheDocument()
  })
})
