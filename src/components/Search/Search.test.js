import React from 'react'
import { describe, test, render, screen, expect } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Search from './Search'

describe('<Search />', () => {
  test('it should mount', () => {
    render(<Search />)

    const search = screen.getByTestId('Search')

    expect(search).toBeInTheDocument()
  })
})
