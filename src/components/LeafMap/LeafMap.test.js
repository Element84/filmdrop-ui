import React from 'react'
import { describe, test, render, screen, expect } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import LeafMap from './LeafMap'

describe('<LeafMap />', () => {
  test('it should mount', () => {
    render(<LeafMap />)

    const leafMap = screen.getByTestId('LeafMap')

    expect(leafMap).toBeInTheDocument()
  })
})
