import { describe, it, expect } from 'vitest'
import {
  LEGACY_CONFIG_KEYS,
  MODERN_CONFIG_KEYS,
  TOP_LEVEL_CONFIG_EXPECTED_TYPES,
  detectConfigFormat,
  migrateLegacyConfig,
  getLegacyKeysPresent
} from './configFormat.mjs'

describe('configFormat', () => {
  it('TOP_LEVEL_CONFIG_EXPECTED_TYPES keys match MODERN and LEGACY union', () => {
    const typedKeys = Object.keys(TOP_LEVEL_CONFIG_EXPECTED_TYPES).sort()
    const unionKeys = [
      ...new Set([...MODERN_CONFIG_KEYS, ...LEGACY_CONFIG_KEYS])
    ].sort()
    expect(typedKeys).toEqual(unionKeys)
  })

  it('detects config formats', () => {
    expect(detectConfigFormat({ COLLECTIONS_CONFIG: {} })).toBe('new')
    expect(detectConfigFormat({ SCENE_TILER_PARAMS: {} })).toBe('legacy')
    expect(
      detectConfigFormat({ COLLECTIONS_CONFIG: {}, SCENE_TILER_PARAMS: {} })
    ).toBe('mixed')
    expect(detectConfigFormat({ STAC_API_URL: 'https://example.com' })).toBe(
      'unknown'
    )
  })

  it('detects legacy format when only COLLECTIONS is a legacy array', () => {
    expect(detectConfigFormat({ COLLECTIONS: ['a'] })).toBe('legacy')
  })

  it('detects new format when COLLECTIONS is object with COLLECTIONS_CONFIG', () => {
    expect(
      detectConfigFormat({
        COLLECTIONS_CONFIG: {},
        COLLECTIONS: { include: ['a'] }
      })
    ).toBe('new')
  })

  it('detects mixed when COLLECTIONS_CONFIG and legacy COLLECTIONS array', () => {
    expect(
      detectConfigFormat({
        COLLECTIONS_CONFIG: {},
        COLLECTIONS: ['a']
      })
    ).toBe('mixed')
  })

  it('returns present legacy keys', () => {
    const keys = getLegacyKeysPresent({
      SCENE_TILER_PARAMS: {},
      DEFAULT_COLLECTION: 'test'
    })
    expect(keys).toEqual(['SCENE_TILER_PARAMS', 'DEFAULT_COLLECTION'])
  })

  it('migrates scene tiler params to visualizations.default', () => {
    const { migratedConfig } = migrateLegacyConfig({
      SCENE_TILER_PARAMS: {
        collectionA: {
          assets: ['red', 'green', 'blue']
        }
      }
    })
    expect(
      migratedConfig.COLLECTIONS_CONFIG.collectionA.visualizations.default
    ).toEqual({
      assets: ['red', 'green', 'blue']
    })
    expect(migratedConfig.SCENE_TILER_PARAMS).toBeUndefined()
  })

  it('keeps new format as no-op during migration', () => {
    const input = {
      COLLECTIONS: { include: ['collectionA'] },
      COLLECTIONS_CONFIG: { collectionA: { visualizations: { default: {} } } }
    }
    const { migratedConfig, removedKeys, format } = migrateLegacyConfig(input)
    expect(format).toBe('new')
    expect(removedKeys).toEqual([])
    expect(migratedConfig).toEqual(input)
  })

  it('throws for mixed format migration to prevent silent data loss', () => {
    expect(() =>
      migrateLegacyConfig({
        COLLECTIONS_CONFIG: {
          collectionA: { visualizations: { default: {} } }
        },
        SCENE_TILER_PARAMS: { collectionA: { assets: ['red'] } }
      })
    ).toThrow('Mixed configuration format is not supported for migration')
  })

  it('throws for mixed format when COLLECTIONS_CONFIG plus legacy COLLECTIONS array names the array signal', () => {
    expect(() =>
      migrateLegacyConfig({
        COLLECTIONS_CONFIG: { collectionA: {} },
        COLLECTIONS: ['collectionA']
      })
    ).toThrow(/Conflicting legacy inputs:.*COLLECTIONS \(legacy array\)/)
  })

  it('throws for unknown format migration', () => {
    expect(() =>
      migrateLegacyConfig({
        STAC_API_URL: 'https://example.com'
      })
    ).toThrow('Unknown configuration format')
  })

  it('migrates legacy COLLECTIONS array-only config without unknown format error', () => {
    const { migratedConfig, format } = migrateLegacyConfig({
      COLLECTIONS: ['collectionA']
    })
    expect(format).toBe('legacy')
    expect(migratedConfig.COLLECTIONS).toEqual({ include: ['collectionA'] })
  })

  it('filters reserved metadata keys from migrated collection ids', () => {
    const { migratedConfig } = migrateLegacyConfig({
      SCENE_TILER_PARAMS: {
        _comment: { text: 'ignored' },
        collectionA: { assets: ['red'] }
      },
      ENHANCED_DISPLAY_CONFIG: {
        _DEPRECATED_SCENE_TILER_PARAMS: { text: 'ignored' }
      }
    })

    expect(migratedConfig.COLLECTIONS_CONFIG._comment).toBeUndefined()
    expect(
      migratedConfig.COLLECTIONS_CONFIG._DEPRECATED_SCENE_TILER_PARAMS
    ).toBeUndefined()
    expect(migratedConfig.COLLECTIONS_CONFIG.collectionA).toBeDefined()
  })
})
