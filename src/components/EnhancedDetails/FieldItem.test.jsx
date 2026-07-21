import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FieldItem from './FieldItem.jsx'

const { mockUseEnhancedDetails, mockGetFieldLabel, mockGetFieldMetadata } =
  vi.hoisted(() => ({
    mockUseEnhancedDetails: vi.fn(),
    mockGetFieldLabel: vi.fn(),
    mockGetFieldMetadata: vi.fn()
  }))

vi.mock('../../contexts/EnhancedDetailsContext', () => ({
  useEnhancedDetails: mockUseEnhancedDetails
}))

vi.mock('../../utils/fieldFormatting.js', () => ({
  getFieldLabel: mockGetFieldLabel
}))

vi.mock('../../utils/fieldDiscovery.js', () => ({
  getFieldMetadata: mockGetFieldMetadata
}))

/* eslint-disable react/prop-types -- mock components don't need prop validation */
vi.mock('@mui/material/Tooltip', () => ({
  default: ({ title, children }) => (
    <div data-testid="mui-tooltip" data-title={title}>
      {children}
    </div>
  )
}))

vi.mock('./OverflowTooltip.jsx', () => ({
  default: ({ children, className }) => (
    <span data-testid="overflow-tooltip" className={className}>
      {children}
    </span>
  )
}))

vi.mock('./EnhancedFieldRenderer.jsx', () => ({
  default: ({ field, value }) => (
    <span data-testid="enhanced-field-renderer">
      {field}:{String(value)}
    </span>
  )
}))
/* eslint-enable react/prop-types */

describe('FieldItem', () => {
  beforeEach(() => {
    mockUseEnhancedDetails.mockReset()
    mockGetFieldLabel.mockReset()
    mockGetFieldMetadata.mockReset()

    mockUseEnhancedDetails.mockReturnValue({ item: { id: 'scene-1' } })
    mockGetFieldLabel.mockReturnValue('Cloud Cover')
    mockGetFieldMetadata.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders label and value without metadata tooltip', () => {
    render(<FieldItem field="eo:cloud_cover" value={12.5} />)

    expect(screen.getByText('Cloud Cover:')).toBeInTheDocument()
    expect(screen.queryByTestId('mui-tooltip')).not.toBeInTheDocument()
    expect(screen.getByTestId('overflow-tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('enhanced-field-renderer')).toHaveTextContent(
      'eo:cloud_cover:12.5'
    )
    expect(mockGetFieldLabel).toHaveBeenCalledWith('eo:cloud_cover', {
      id: 'scene-1'
    })
  })

  it('wraps label with tooltip when metadata provides tooltip content', () => {
    mockGetFieldMetadata.mockReturnValue({
      hasTooltip: true,
      tooltipContent: 'Percentage of cloud cover'
    })

    render(<FieldItem field="eo:cloud_cover" value={12.5} />)

    expect(screen.getByTestId('mui-tooltip')).toHaveAttribute(
      'data-title',
      'Percentage of cloud cover'
    )
    expect(screen.getByText('Cloud Cover:')).toBeInTheDocument()
  })
})
