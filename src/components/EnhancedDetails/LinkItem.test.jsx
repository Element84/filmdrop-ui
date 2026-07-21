import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LinkItem from './LinkItem.jsx'

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

describe('LinkItem', () => {
  let originalClipboard
  let originalOpen

  beforeEach(() => {
    originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    originalOpen = window.open
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn()
      }
    })
    window.open = vi.fn()
  })

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard)
    } else {
      delete navigator.clipboard
    }
    window.open = originalOpen
    vi.restoreAllMocks()
  })

  it('copies the href and opens HTTP links in a new tab', () => {
    render(
      <LinkItem
        link={{
          rel: 'self',
          href: 'https://example.com/items/scene-1.json',
          type: 'application/geo+json',
          title: 'Scene 1'
        }}
      />
    )

    expect(screen.getByText('Scene 1')).toBeInTheDocument()
    expect(screen.getByText('Host:')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy link to clipboard' })
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/items/scene-1.json'
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Open link in new tab' })
    )
    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/items/scene-1.json',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('disables opening non-http links', () => {
    render(
      <LinkItem
        link={{
          rel: 'canonical',
          href: 's3://bucket/scene-1.json',
          type: 'application/json',
          title: 'S3 manifest'
        }}
      />
    )

    const openButton = screen.getByRole('button', {
      name: 'Link not accessible (non-HTTP)'
    })

    expect(openButton).toBeDisabled()
    fireEvent.click(openButton)
    expect(window.open).not.toHaveBeenCalled()
  })
})
