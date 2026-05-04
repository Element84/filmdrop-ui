import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUrlNavigate } from './useUrlNavigate'

const mockNavigate = vi.fn()
let mockParams = { collectionId: 'sentinel-2' }
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams
}))

describe('useUrlNavigate', () => {
  const prev = {
    dt: '2024-01-01/2024-01-31',
    view: 'scene',
    viz: 'true-color',
    tab: 'search',
    z: 10,
    c: '40,-100'
  }

  beforeEach(() => {
    mockNavigate.mockClear()
    mockParams = { collectionId: 'sentinel-2' }
  })

  /** Helper: call the navigate search function with prev */
  function getSearchResult() {
    const searchFn = mockNavigate.mock.calls[0][0].search
    return searchFn(prev)
  }

  it('setTab updates tab and uses replace', () => {
    const { result } = renderHook(() => useUrlNavigate())
    result.current.setTab('details')

    expect(mockNavigate).toHaveBeenCalledOnce()
    expect(mockNavigate.mock.calls[0][0].replace).toBe(true)
    expect(getSearchResult()).toEqual({ ...prev, tab: 'details' })
  })

  it('setViz updates viz and uses replace', () => {
    const { result } = renderHook(() => useUrlNavigate())
    result.current.setViz('false-color')

    expect(mockNavigate).toHaveBeenCalledOnce()
    expect(mockNavigate.mock.calls[0][0].replace).toBe(true)
    expect(getSearchResult()).toEqual({ ...prev, viz: 'false-color' })
  })

  it('setItem navigates to /$collectionId/$itemId path and switches to details tab', () => {
    const { result } = renderHook(() => useUrlNavigate())
    result.current.setItem('SCENE-123')

    expect(mockNavigate).toHaveBeenCalledOnce()
    const call = mockNavigate.mock.calls[0][0]
    expect(call.to).toBe('/$collectionId/$itemId')
    expect(call.params).toEqual({
      collectionId: 'sentinel-2',
      itemId: 'SCENE-123'
    })
    expect(call.replace).toBe(true)
    expect(getSearchResult().tab).toBe('details')
  })

  it('clearItem navigates back to /$collectionId path', () => {
    const { result } = renderHook(() => useUrlNavigate())
    result.current.clearItem()

    expect(mockNavigate).toHaveBeenCalledOnce()
    const call = mockNavigate.mock.calls[0][0]
    expect(call.to).toBe('/$collectionId')
    expect(call.params).toEqual({ collectionId: 'sentinel-2' })
    expect(call.replace).toBe(true)
  })

  it('returns referentially stable callbacks across renders with unchanged params', () => {
    const { result, rerender } = renderHook(() => useUrlNavigate())
    const first = result.current
    rerender()
    rerender()
    const second = result.current

    expect(second.setTab).toBe(first.setTab)
    expect(second.setViz).toBe(first.setViz)
    expect(second.setItem).toBe(first.setItem)
    expect(second.clearItem).toBe(first.clearItem)
  })

  it('invalidates collectionId-dependent callbacks when collectionId changes; keeps the others stable', () => {
    const { result, rerender } = renderHook(() => useUrlNavigate())
    const first = result.current

    mockParams = { collectionId: 'landsat-c2-l2' }
    rerender()
    const second = result.current

    expect(second.setItem).not.toBe(first.setItem)
    expect(second.clearItem).not.toBe(first.clearItem)
    expect(second.setTab).toBe(first.setTab)
    expect(second.setViz).toBe(first.setViz)
  })
})
