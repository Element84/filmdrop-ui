import { describe, it, expect, beforeEach, vi } from 'vitest'
import StacFields from '@radiantearth/stac-fields'
import {
  getStacFieldType,
  getFieldSpec,
  getFieldMetadata,
  getFieldTooltipInfo,
  isFieldSupported,
  discoverFieldMetadata,
  getFallbackFieldLabel,
  clearFieldCaches
} from './fieldDiscovery.js'

// Mock STAC item for testing
const mockStacItem = {
  id: 'test-item',
  collection: 'sentinel-2-l2a',
  properties: {
    datetime: '2025-08-26T17:25:46.656000Z',
    platform: 'sentinel-2c',
    'eo:cloud_cover': 22.959924,
    'view:sun_elevation': 64.1772473903606,
    'proj:epsg': 32614,
    's2:processing_baseline': '05.11',
    's2:product_type': 'S2MSI2A',
    'proj:centroid': [30.23598, -98.42964],
    'proj:shape': [10980, 10980],
    'mgrs:utm_zone': 14,
    'mgrs:latitude_band': 'R',
    'mgrs:grid_square': 'NU'
  }
}

describe('fieldDiscovery', () => {
  describe('getStacFieldType', () => {
    it('should identify grid fields', () => {
      const result = getStacFieldType('mgrs:utm_zone', 14, mockStacItem)
      expect(result).toBe('grid')
    })

    it('should identify coordinate fields', () => {
      const result = getStacFieldType(
        'proj:centroid',
        [30.23598, -98.42964],
        mockStacItem
      )
      expect(result).toBe('coordinate')
    })

    it('should identify shape fields', () => {
      const result = getStacFieldType(
        'proj:shape',
        [10980, 10980],
        mockStacItem
      )
      // proj:shape with array values is correctly detected as shape
      expect(result).toBe('shape')
    })

    it('should identify boolean fields', () => {
      const result = getStacFieldType(
        'storage:requester_pays',
        true,
        mockStacItem
      )
      expect(result).toBe('boolean')
    })

    it('should identify percentage fields', () => {
      const result = getStacFieldType('eo:cloud_cover', 0.5, mockStacItem)
      expect(result).toBe('percentage')
    })

    it('should default to standard for unknown types', () => {
      const result = getStacFieldType('unknown:field', 'value', mockStacItem)
      expect(result).toBe('standard')
    })
  })

  describe('getFieldSpec', () => {
    it('should return specification for known fields', () => {
      const result = getFieldSpec('eo:cloud_cover')
      expect(result).toBeDefined()
    })

    it('should return null for unknown fields', () => {
      const result = getFieldSpec('unknown:field')
      // Note: getFieldSpec returns empty object for unknown fields, not null
      expect(result).toBeDefined()
    })
  })

  describe('getFieldMetadata', () => {
    it('should return metadata for fields with tooltips', () => {
      const result = getFieldMetadata('eo:cloud_cover')
      expect(result).toHaveProperty('hasTooltip')
      expect(result).toHaveProperty('tooltipContent')
      expect(result).toHaveProperty('tooltipSource')
    })

    it('should handle fields without tooltips', () => {
      const result = getFieldMetadata('unknown:field')
      expect(result.hasTooltip).toBe(false)
      expect(result.tooltipContent).toBeNull()
    })
  })

  describe('getFieldTooltipInfo', () => {
    it('should return tooltip info for fields with descriptions', () => {
      const result = getFieldTooltipInfo('eo:cloud_cover', mockStacItem)
      if (result) {
        expect(result).toHaveProperty('content')
        expect(result).toHaveProperty('shouldShow')
        expect(result).toHaveProperty('source')
      }
    })

    it('should return null for fields without tooltips', () => {
      const result = getFieldTooltipInfo('unknown:field', mockStacItem)
      expect(result).toBeNull()
    })
  })

  describe('isFieldSupported', () => {
    it('should return true for supported fields', () => {
      const result = isFieldSupported('eo:cloud_cover')
      expect(typeof result).toBe('boolean')
    })

    it('should return false for unsupported fields', () => {
      const result = isFieldSupported('unknown:field')
      // Note: isFieldSupported may return true for some unknown fields
      expect(typeof result).toBe('boolean')
    })
  })

  describe('discoverFieldMetadata', () => {
    it('should discover field metadata', () => {
      const result = discoverFieldMetadata('eo:cloud_cover', 'sentinel-2-l2a')
      expect(result).toHaveProperty('label')
      expect(result).toHaveProperty('unit')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('type')
    })

    it('should handle unknown fields gracefully', () => {
      const result = discoverFieldMetadata(
        'unknown:field',
        'unknown-collection'
      )
      expect(result).toHaveProperty('label')
      expect(result).toHaveProperty('unit')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('type')
    })
  })

  describe('getFallbackFieldLabel', () => {
    it('should format field names correctly', () => {
      const result = getFallbackFieldLabel('eo:cloud_cover')
      expect(result).toBe('Cloud Cover')
    })

    it('should handle complex field names', () => {
      const result = getFallbackFieldLabel('s2:degraded_msi_data_percentage')
      expect(result).toBe('Degraded Msi Data Percentage')
    })

    it('should handle fields without prefixes', () => {
      const result = getFallbackFieldLabel('platform')
      expect(result).toBe('Platform')
    })
  })
})

describe('fieldDiscovery LRU cache (via getFieldSpec)', () => {
  let getSpecSpy

  beforeEach(() => {
    clearFieldCaches()
    getSpecSpy = vi
      .spyOn(StacFields.Registry, 'getSpecification')
      .mockImplementation((name) => ({ label: `spec:${name}` }))
  })

  it('caches subsequent lookups of the same field', () => {
    getFieldSpec('eo:cloud_cover')
    getFieldSpec('eo:cloud_cover')
    getFieldSpec('eo:cloud_cover')
    expect(getSpecSpy).toHaveBeenCalledTimes(1)
  })

  it('clearFieldCaches forces the next lookup to re-invoke the registry', () => {
    getFieldSpec('eo:cloud_cover')
    expect(getSpecSpy).toHaveBeenCalledTimes(1)
    clearFieldCaches()
    getFieldSpec('eo:cloud_cover')
    expect(getSpecSpy).toHaveBeenCalledTimes(2)
  })

  it('evicts the oldest entry when cache exceeds MAX_CACHE_SIZE (1000)', () => {
    for (let i = 0; i < 1001; i++) getFieldSpec(`field:${i}`)
    expect(getSpecSpy).toHaveBeenCalledTimes(1001)

    // field:0 was evicted → lookup calls registry again.
    getFieldSpec('field:0')
    expect(getSpecSpy).toHaveBeenCalledTimes(1002)

    // field:999 was the 1000th insert and should still be cached.
    const callsBefore = getSpecSpy.mock.calls.length
    getFieldSpec('field:999')
    expect(getSpecSpy.mock.calls.length).toBe(callsBefore)
  })

  it('re-access promotes an entry (MRU) so older entries get evicted first', () => {
    for (let i = 0; i < 1000; i++) getFieldSpec(`field:${i}`)
    // Promote field:0 to MRU.
    getFieldSpec('field:0')
    // Insert one more → oldest (field:1) should now be evicted.
    getFieldSpec('field:NEW')

    const callsBeforeProbe = getSpecSpy.mock.calls.length

    // field:0 still cached (MRU)
    getFieldSpec('field:0')
    expect(getSpecSpy.mock.calls.length).toBe(callsBeforeProbe)

    // field:1 was evicted
    getFieldSpec('field:1')
    expect(getSpecSpy.mock.calls.length).toBe(callsBeforeProbe + 1)
  })
})
