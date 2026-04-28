import { describe, it, expect } from 'vitest'
import {
  serializeQueryableFiltersForUrl,
  deserializeQueryableFiltersFromURL
} from './urlParamHelper'

describe('serializeQueryableFiltersForUrl', () => {
  it('returns empty object for empty filters', () => {
    expect(serializeQueryableFiltersForUrl({})).toEqual({})
  })

  it('skips null and undefined values', () => {
    expect(
      serializeQueryableFiltersForUrl({ field1: null, field2: undefined })
    ).toEqual({})
  })

  it('serializes range objects to _min/_max string pairs', () => {
    expect(
      serializeQueryableFiltersForUrl({
        'eo:cloud_cover': { min: 0, max: 50 }
      })
    ).toEqual({
      'eo:cloud_cover_min': '0',
      'eo:cloud_cover_max': '50'
    })
  })

  it('serializes partial range with only min', () => {
    expect(
      serializeQueryableFiltersForUrl({
        gsd: { min: 20 }
      })
    ).toEqual({
      gsd_min: '20'
    })
  })

  it('serializes partial range with only max', () => {
    expect(
      serializeQueryableFiltersForUrl({
        gsd: { max: 50 }
      })
    ).toEqual({
      gsd_max: '50'
    })
  })

  it('serializes arrays as comma-separated strings', () => {
    expect(
      serializeQueryableFiltersForUrl({
        platform: ['sentinel-2a', 'sentinel-2b']
      })
    ).toEqual({ platform: 'sentinel-2a,sentinel-2b' })
  })

  it('skips empty arrays', () => {
    expect(serializeQueryableFiltersForUrl({ platform: [] })).toEqual({})
  })

  it('serializes booleans as strings', () => {
    expect(serializeQueryableFiltersForUrl({ active: true })).toEqual({
      active: 'true'
    })
    expect(serializeQueryableFiltersForUrl({ active: false })).toEqual({
      active: 'false'
    })
  })

  it('serializes numbers as strings', () => {
    expect(serializeQueryableFiltersForUrl({ gsd: 10.5 })).toEqual({
      gsd: '10.5'
    })
  })

  it('passes through string values', () => {
    expect(
      serializeQueryableFiltersForUrl({ constellation: 'sentinel-2' })
    ).toEqual({ constellation: 'sentinel-2' })
  })

  it('handles mixed filter types in one call', () => {
    const filters = {
      'eo:cloud_cover': { min: 0, max: 50 },
      platform: ['sentinel-2a', 'sentinel-2b'],
      active: true,
      gsd: 10,
      constellation: 'sentinel-2',
      empty: null
    }
    expect(serializeQueryableFiltersForUrl(filters)).toEqual({
      'eo:cloud_cover_min': '0',
      'eo:cloud_cover_max': '50',
      platform: 'sentinel-2a,sentinel-2b',
      active: 'true',
      gsd: '10',
      constellation: 'sentinel-2'
    })
  })
})

describe('deserializeQueryableFiltersFromURL', () => {
  it('returns empty object when queryables is null', () => {
    expect(deserializeQueryableFiltersFromURL({ foo: 'bar' }, null)).toEqual({})
  })

  it('returns empty object when queryables has no properties', () => {
    expect(deserializeQueryableFiltersFromURL({ foo: 'bar' }, {})).toEqual({})
  })

  it('deserializes _min/_max pairs into range objects for number type', () => {
    const params = {
      'eo:cloud_cover_min': '0',
      'eo:cloud_cover_max': '50.5'
    }
    const queryables = {
      properties: { 'eo:cloud_cover': { type: 'number' } }
    }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      'eo:cloud_cover': { min: 0, max: 50.5 }
    })
  })

  it('deserializes _min/_max pairs for integer type with parseInt', () => {
    const params = { count_min: '10', count_max: '100' }
    const queryables = { properties: { count: { type: 'integer' } } }
    const result = deserializeQueryableFiltersFromURL(params, queryables)
    expect(result).toEqual({ count: { min: 10, max: 100 } })
    expect(Number.isInteger(result.count.min)).toBe(true)
    expect(Number.isInteger(result.count.max)).toBe(true)
  })

  it('deserializes partial range with only _min present', () => {
    const params = { 'eo:cloud_cover_min': '0' }
    const queryables = {
      properties: { 'eo:cloud_cover': { type: 'number' } }
    }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      'eo:cloud_cover': { min: 0 }
    })
  })

  it('deserializes partial range with only _max present', () => {
    const params = { 'eo:cloud_cover_max': '50.5' }
    const queryables = {
      properties: { 'eo:cloud_cover': { type: 'number' } }
    }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      'eo:cloud_cover': { max: 50.5 }
    })
  })

  it('deserializes partial range with only _max for integer type', () => {
    const params = { count_max: '100' }
    const queryables = { properties: { count: { type: 'integer' } } }
    const result = deserializeQueryableFiltersFromURL(params, queryables)
    expect(result).toEqual({ count: { max: 100 } })
    expect(Number.isInteger(result.count.max)).toBe(true)
  })

  it('deserializes comma-separated strings into arrays', () => {
    const params = { platform: 'sentinel-2a,sentinel-2b' }
    const queryables = { properties: { platform: { type: 'array' } } }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      platform: ['sentinel-2a', 'sentinel-2b']
    })
  })

  it('deserializes number type with parseFloat', () => {
    const params = { gsd: '10.5' }
    const queryables = { properties: { gsd: { type: 'number' } } }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      gsd: 10.5
    })
  })

  it('deserializes integer type with parseInt', () => {
    const params = { count: '42' }
    const queryables = { properties: { count: { type: 'integer' } } }
    const result = deserializeQueryableFiltersFromURL(params, queryables)
    expect(result).toEqual({ count: 42 })
    expect(Number.isInteger(result.count)).toBe(true)
  })

  it('passes through string type unchanged', () => {
    const params = { constellation: 'sentinel-2' }
    const queryables = {
      properties: { constellation: { type: 'string' } }
    }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      constellation: 'sentinel-2'
    })
  })

  it('ignores params not in queryables schema', () => {
    const params = { unknown_field: 'value' }
    const queryables = {
      properties: { known_field: { type: 'string' } }
    }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({})
  })

  it('deserializes string enum as array', () => {
    const params = { platform: 'sentinel-2a,sentinel-2b' }
    const queryables = {
      properties: {
        platform: {
          type: 'string',
          enum: ['sentinel-2a', 'sentinel-2b', 'landsat-8']
        }
      }
    }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      platform: ['sentinel-2a', 'sentinel-2b']
    })
  })

  it('deserializes number enum as array of numbers', () => {
    const params = { resolution: '10,20,60' }
    const queryables = {
      properties: {
        resolution: { type: 'number', enum: [10, 20, 60] }
      }
    }
    const result = deserializeQueryableFiltersFromURL(params, queryables)
    expect(result).toEqual({ resolution: [10, 20, 60] })
    result.resolution.forEach((v) => expect(typeof v).toBe('number'))
  })

  it('deserializes integer enum as array of integers', () => {
    const params = { band: '1,2,3' }
    const queryables = {
      properties: {
        band: { type: 'integer', enum: [1, 2, 3, 4] }
      }
    }
    const result = deserializeQueryableFiltersFromURL(params, queryables)
    expect(result).toEqual({ band: [1, 2, 3] })
    result.band.forEach((v) => expect(Number.isInteger(v)).toBe(true))
  })

  it('deserializes single enum value as one-element array', () => {
    const params = { platform: 'sentinel-2a' }
    const queryables = {
      properties: {
        platform: {
          type: 'string',
          enum: ['sentinel-2a', 'sentinel-2b']
        }
      }
    }
    expect(deserializeQueryableFiltersFromURL(params, queryables)).toEqual({
      platform: ['sentinel-2a']
    })
  })
})

describe('serialize/deserialize roundtrip', () => {
  it('preserves filter state through serialization roundtrip', () => {
    const originalFilters = {
      'eo:cloud_cover': { min: 0, max: 50 },
      platform: ['sentinel-2a', 'sentinel-2b'],
      gsd: 10.5,
      count: 42,
      constellation: 'sentinel-2'
    }

    const queryables = {
      properties: {
        'eo:cloud_cover': { type: 'number' },
        platform: { type: 'array' },
        gsd: { type: 'number' },
        count: { type: 'integer' },
        constellation: { type: 'string' }
      }
    }

    const serialized = serializeQueryableFiltersForUrl(originalFilters)
    const deserialized = deserializeQueryableFiltersFromURL(
      serialized,
      queryables
    )

    expect(deserialized).toEqual(originalFilters)
  })

  it('preserves partial range filter state through serialization roundtrip', () => {
    const originalFilters = {
      gsd: { min: 20 },
      score: { max: 80 }
    }

    const queryables = {
      properties: {
        gsd: { type: 'integer' },
        score: { type: 'number' }
      }
    }

    const serialized = serializeQueryableFiltersForUrl(originalFilters)
    const deserialized = deserializeQueryableFiltersFromURL(
      serialized,
      queryables
    )

    expect(deserialized).toEqual(originalFilters)
  })

  it('preserves enum filter state through serialization roundtrip', () => {
    const originalFilters = {
      platform: ['sentinel-2a', 'sentinel-2b'],
      resolution: [10, 20],
      band: [1, 3]
    }

    const queryables = {
      properties: {
        platform: {
          type: 'string',
          enum: ['sentinel-2a', 'sentinel-2b', 'landsat-8']
        },
        resolution: { type: 'number', enum: [10, 20, 60] },
        band: { type: 'integer', enum: [1, 2, 3, 4] }
      }
    }

    const serialized = serializeQueryableFiltersForUrl(originalFilters)
    const deserialized = deserializeQueryableFiltersFromURL(
      serialized,
      queryables
    )

    expect(deserialized).toEqual(originalFilters)
  })
})
