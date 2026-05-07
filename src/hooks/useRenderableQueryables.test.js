import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRenderableQueryables } from './useRenderableQueryables'
import { getCollectionConfig } from '../utils/configHelper'

const selectorState = {
  selectedCollection: 'demo',
  selectedCollectionData: { queryables: null }
}

vi.mock('react-redux', () => ({
  useSelector: (selector) =>
    selector({
      mainSlice: {
        selectedCollection: selectorState.selectedCollection,
        selectedCollectionData: selectorState.selectedCollectionData
      }
    })
}))

vi.mock('../utils/configHelper', () => ({
  getCollectionConfig: vi.fn()
}))

describe('useRenderableQueryables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    selectorState.selectedCollection = 'demo'
    selectorState.selectedCollectionData = { queryables: null }
    vi.mocked(getCollectionConfig).mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns normalized error when queryables include explicit service error', () => {
    selectorState.selectedCollectionData = {
      queryables: { error: true, message: 'Queryables failed' }
    }

    const { result } = renderHook(() => useRenderableQueryables())

    expect(result.current).toEqual({
      fields: [],
      hasFields: false,
      error: { message: 'Queryables failed' }
    })
  })

  it('returns empty output when queryables payload is invalid', () => {
    selectorState.selectedCollectionData = {
      queryables: []
    }

    const { result } = renderHook(() => useRenderableQueryables())

    expect(result.current).toEqual({
      fields: [],
      hasFields: false,
      error: null
    })
  })

  it('sorts renderable queryables by component priority', () => {
    selectorState.selectedCollectionData = {
      queryables: {
        textField: { type: 'string' },
        multiSelect: { type: 'string', enum: ['A', 'B'] },
        numericRange: { type: 'number' },
        rangeSlider: { type: 'integer', minimum: 0, maximum: 100 },
        unsupported: { type: 'boolean' }
      }
    }

    const { result } = renderHook(() => useRenderableQueryables())

    expect(result.current.error).toBeNull()
    expect(result.current.hasFields).toBe(true)
    expect(result.current.fields.map(([name]) => name)).toEqual([
      'rangeSlider',
      'numericRange',
      'multiSelect',
      'textField'
    ])
  })

  it('filters fields when queryableFilters allowlist exists', () => {
    selectorState.selectedCollectionData = {
      queryables: {
        textField: { type: 'string' },
        multiSelect: { type: 'string', enum: ['A', 'B'] },
        numericRange: { type: 'number' }
      }
    }
    vi.mocked(getCollectionConfig).mockReturnValue(['multiSelect'])

    const { result } = renderHook(() => useRenderableQueryables())

    expect(result.current.fields).toEqual([
      ['multiSelect', { type: 'string', enum: ['A', 'B'] }]
    ])
    expect(result.current.hasFields).toBe(true)
  })
})
