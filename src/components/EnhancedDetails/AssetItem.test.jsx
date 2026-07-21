import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AssetItem from './AssetItem.jsx'

vi.mock('./OverflowTooltip.jsx', () => ({
  default: ({
    children,
    component: Component = 'span',
    className,
    ...rest
  }) => (
    <Component className={className} {...rest}>
      {children}
    </Component>
  )
}))

describe('AssetItem', () => {
  let onCopyToClipboard

  beforeEach(() => {
    onCopyToClipboard = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders asset metadata and forwards copy actions', () => {
    render(
      <AssetItem
        asset={{
          key: 'blue',
          href: 'https://example.com/blue.tif',
          title: 'Blue band',
          description: 'Band 2 reflectance',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          roles: ['data', 'reflectance'],
          gsd: 10,
          'file:size': 1572864
        }}
        copiedUrl={null}
        onCopyToClipboard={onCopyToClipboard}
      />
    )

    expect(screen.getByText('Blue band')).toBeInTheDocument()
    expect(screen.getByText('Band 2 reflectance')).toBeInTheDocument()
    expect(screen.getByText('Roles:')).toBeInTheDocument()
    expect(screen.getByText('reflectance')).toBeInTheDocument()
    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(screen.getByText('COG')).toBeInTheDocument()
    expect(screen.getByText('GSD:')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Size:')).toBeInTheDocument()
    expect(screen.getByText('1.5 MB')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy link to clipboard' })
    )

    expect(onCopyToClipboard).toHaveBeenCalledWith(
      'https://example.com/blue.tif',
      'blue'
    )
  })

  it('shows unknown size for invalid byte counts', () => {
    render(
      <AssetItem
        asset={{
          key: 'metadata',
          href: 'https://example.com/metadata.json',
          type: 'application/json',
          size: -1
        }}
        copiedUrl={null}
        onCopyToClipboard={onCopyToClipboard}
      />
    )

    expect(screen.getByText('Size:')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })
})
