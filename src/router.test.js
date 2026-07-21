import { describe, it, expect } from 'vitest'
import {
  RESERVED_PARAMS,
  extractQueryableParams,
  normalizeSearch,
  getPathParams,
  router
} from './router'

describe('RESERVED_PARAMS', () => {
  it('contains exactly the 6 expected keys (col and item are path params)', () => {
    expect(RESERVED_PARAMS).toEqual(
      new Set(['dt', 'view', 'viz', 'tab', 'z', 'c'])
    )
    expect(RESERVED_PARAMS.size).toBe(6)
  })
})

describe('extractQueryableParams', () => {
  it('returns empty object when all params are reserved', () => {
    expect(
      extractQueryableParams({
        dt: '2024-01-01/2024-01-31',
        view: 'scene',
        tab: 'search',
        viz: '',
        z: 10,
        c: '40,-100'
      })
    ).toEqual({})
  })

  it('returns only non-reserved params', () => {
    expect(
      extractQueryableParams({
        dt: '2024/2024',
        'eo:cloud_cover': '50',
        platform: 'sentinel-2a'
      })
    ).toEqual({
      'eo:cloud_cover': '50',
      platform: 'sentinel-2a'
    })
  })

  it('preserves _min/_max suffixed params as queryable filters', () => {
    expect(
      extractQueryableParams({
        'eo:cloud_cover_min': '0',
        'eo:cloud_cover_max': '50'
      })
    ).toEqual({
      'eo:cloud_cover_min': '0',
      'eo:cloud_cover_max': '50'
    })
  })

  it('returns empty object for empty input', () => {
    expect(extractQueryableParams({})).toEqual({})
  })
})

describe('normalizeSearch', () => {
  it('defaults missing params to empty strings, z to undefined', () => {
    const result = normalizeSearch({})
    expect(result.dt).toBe('')
    expect(result.view).toBe('')
    expect(result.viz).toBe('')
    expect(result.tab).toBe('')
    expect(result.z).toBeUndefined()
    expect(result.c).toBe('')
  })

  it('passes through unknown params as queryable filters', () => {
    const result = normalizeSearch({ col: 'sentinel-2', item: 'SCENE-123' })
    // col and item are path params now; if they appear in search they
    // pass through extractQueryableParams like any non-reserved key
    expect(result.col).toBe('sentinel-2')
    expect(result.item).toBe('SCENE-123')
  })

  it('validates view against allowed values and rejects invalid', () => {
    expect(normalizeSearch({ view: 'scene' }).view).toBe('scene')
    expect(normalizeSearch({ view: 'hex' }).view).toBe('hex')
    expect(normalizeSearch({ view: 'grid-code' }).view).toBe('grid-code')
    expect(normalizeSearch({ view: 'mosaic' }).view).toBe('mosaic')
    expect(normalizeSearch({ view: 'invalid' }).view).toBe('')
    expect(normalizeSearch({ view: '' }).view).toBe('')
  })

  it('validates tab against allowed values and rejects invalid', () => {
    expect(normalizeSearch({ tab: 'search' }).tab).toBe('search')
    expect(normalizeSearch({ tab: 'details' }).tab).toBe('details')
    expect(normalizeSearch({ tab: 'bogus' }).tab).toBe('')
  })

  it('converts z to number and handles null/undefined', () => {
    expect(normalizeSearch({ z: '10' }).z).toBe(10)
    expect(normalizeSearch({ z: 5 }).z).toBe(5)
    expect(normalizeSearch({ z: null }).z).toBeUndefined()
    expect(normalizeSearch({}).z).toBeUndefined()
  })
})

describe('stringifySearch', () => {
  const stringify = router.options.stringifySearch

  it('strips empty string values from the query string', () => {
    expect(stringify({ dt: 'val', tab: '' })).toBe('?dt=val')
  })

  it('strips undefined and null values', () => {
    expect(stringify({ dt: 'test', z: undefined, c: null })).toBe('?dt=test')
  })

  it('preserves 0 and false', () => {
    const qs = stringify({ count: 0, active: false })
    expect(qs).toContain('count=0')
    expect(qs).toContain('active=false')
  })

  it('returns empty string when all values are empty', () => {
    expect(stringify({ dt: '', view: '' })).toBe('')
  })
})

describe('getPathParams', () => {
  it('returns empty object when there are no route matches', () => {
    const fakeRouter = {
      state: {
        matches: []
      }
    }

    expect(getPathParams(fakeRouter)).toEqual({})
  })

  it('returns params from a single matched route', () => {
    const fakeRouter = {
      state: {
        matches: [{ params: { collectionId: 'sentinel-2' } }]
      }
    }

    expect(getPathParams(fakeRouter)).toEqual({ collectionId: 'sentinel-2' })
  })

  it('accumulates params across multiple matches with later matches overriding earlier keys', () => {
    const fakeRouter = {
      state: {
        matches: [
          { params: { collectionId: 'sentinel-2', shared: 'parent' } },
          { params: { itemId: 'scene-123', shared: 'child' } },
          { params: null }
        ]
      }
    }

    expect(getPathParams(fakeRouter)).toEqual({
      collectionId: 'sentinel-2',
      itemId: 'scene-123',
      shared: 'child'
    })
  })
})
