import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useResolvedUrlState } from './useResolvedUrlState'

let mockSearch = {}
let mockParams = {}
let mockOptions = {
  config: undefined,
  urlState: undefined,
  onUrlStateChange: undefined
}

vi.mock('@tanstack/react-router', async () => {
  const { mockTanstackRouter } = await import('../testing/shared-mocks')
  return mockTanstackRouter({
    useSearch: () => mockSearch,
    useParams: () => mockParams
  })()
})

vi.mock('../contexts/FilmDropOptionsContext', () => ({
  useFilmDropOptions: () => mockOptions
}))

describe('useResolvedUrlState', () => {
  beforeEach(() => {
    mockSearch = { tab: 'search', view: 'scene' }
    mockParams = { collectionId: 'sentinel-2', itemId: 's2-item' }
    mockOptions = {
      config: undefined,
      urlState: undefined,
      onUrlStateChange: undefined
    }
  })

  it('returns router-derived state when controlled urlState is undefined', () => {
    const { result } = renderHook(() => useResolvedUrlState())

    expect(result.current).toEqual({
      tab: 'search',
      view: 'scene',
      col: 'sentinel-2',
      item: 's2-item'
    })
  })

  it('returns controlled state when urlState is provided', () => {
    mockOptions = {
      config: undefined,
      urlState: {
        collectionId: 'landsat-c2-l2',
        itemId: 'landsat-item',
        search: { tab: 'details', viz: 'false-color' }
      },
      onUrlStateChange: vi.fn()
    }

    const { result } = renderHook(() => useResolvedUrlState())

    expect(result.current).toEqual({
      tab: 'details',
      viz: 'false-color',
      col: 'landsat-c2-l2',
      item: 'landsat-item'
    })
  })

  it('controlled state overrides router search and path params', () => {
    mockSearch = { tab: 'search', view: 'scene' }
    mockParams = { collectionId: 'router-collection', itemId: 'router-item' }
    mockOptions = {
      config: undefined,
      urlState: {
        collectionId: 'controlled-collection',
        itemId: 'controlled-item',
        search: { tab: 'details', view: 'hex' }
      },
      onUrlStateChange: vi.fn()
    }

    const { result } = renderHook(() => useResolvedUrlState())

    expect(result.current).toEqual({
      tab: 'details',
      view: 'hex',
      col: 'controlled-collection',
      item: 'controlled-item'
    })
  })

  it('normalizes undefined collection/item in controlled state to empty strings', () => {
    mockOptions = {
      config: undefined,
      urlState: {
        search: { tab: 'search' }
      },
      onUrlStateChange: vi.fn()
    }

    const { result } = renderHook(() => useResolvedUrlState())

    expect(result.current).toEqual({
      tab: 'search',
      col: '',
      item: ''
    })
  })
})
