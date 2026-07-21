import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeatMapSymbology from './HeatMapSymbology.jsx'

const { colorMapMock } = vi.hoisted(() => ({
  colorMapMock: vi.fn()
}))

vi.mock('../../../utils', () => ({
  colorMap: colorMapMock
}))

describe('HeatMapSymbology', () => {
  it('builds gradient colors from colorMap and shows max frequency', () => {
    colorMapMock.mockReturnValue(['#111111', '#222222', '#333333', '#444444'])

    const { container } = render(
      <HeatMapSymbology
        results={{
          properties: {
            largestRatio: 1.5,
            largestFrequency: 47
          }
        }}
      />
    )

    expect(colorMapMock).toHaveBeenCalledWith(1.5)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('47')).toBeInTheDocument()

    const gradient = container.querySelector('.gradient')
    expect(gradient).toHaveStyle({ '--color-1': '#111111' })
    expect(gradient).toHaveStyle({ '--color-2': '#222222' })
    expect(gradient).toHaveStyle({ '--color-3': '#333333' })
    expect(gradient).toHaveStyle({ '--color-4': '#444444' })
    expect(gradient.style.background).toContain('linear-gradient(90deg')
  })
})
