import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { openExternal } from './openExternal'

describe('openExternal', () => {
  let originalOpen

  beforeEach(() => {
    originalOpen = window.open
    window.open = vi.fn()
    delete window.__filmdropOnOpenExternal
  })

  afterEach(() => {
    window.open = originalOpen
    delete window.__filmdropOnOpenExternal
    vi.restoreAllMocks()
  })

  it('uses default window.open behavior when no override is provided', () => {
    openExternal('https://example.com', { source: 'test' })

    expect(window.open).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('uses consumer override when provided', () => {
    const override = vi.fn()
    window.__filmdropOnOpenExternal = override

    openExternal('https://example.com', { source: 'test' })

    expect(override).toHaveBeenCalledWith('https://example.com', {
      source: 'test'
    })
    expect(window.open).not.toHaveBeenCalled()
  })

  it('falls back to window.open when override throws', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    window.__filmdropOnOpenExternal = vi.fn(() => {
      throw new Error('override failed')
    })

    openExternal('https://example.com', { source: 'test' })

    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer'
    )
  })
})
