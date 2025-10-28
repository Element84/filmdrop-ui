import { vi } from 'vitest'
import { setappConfig } from '../redux/slices/mainSlice'
import { store } from '../redux/store'
import { mockAppConfig } from '../testing/shared-mocks'
import {
  loadAppTitle,
  loadAppFavicon,
  normalizeCollectionsConfig,
  getCollectionConfig
} from './configHelper'
import { DoesFaviconExistService } from '../services/get-config-service'

describe('ConfigHelper', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })
  describe('loadAppTitle', () => {
    it('sets document title and appName from config if present', () => {
      const mockAppConfigAppTitle = {
        ...mockAppConfig,
        APP_NAME: 'Demo App'
      }
      store.dispatch(setappConfig(mockAppConfigAppTitle))
      loadAppTitle()
      expect(global.window.document.title).toBe('Demo App')
      expect(store.getState().mainSlice.appName).toBe('Demo App')
    })
    it('sets document title and appName from default if App_Name not present in config', () => {
      store.dispatch(setappConfig(mockAppConfig))
      loadAppTitle()
      expect(global.window.document.title).toBe('FilmDrop Console')
      expect(store.getState().mainSlice.appName).toBe('FilmDrop Console')
    })
  })
  describe('loadAppFavicon', () => {
    const originalQuerySelector = document.querySelector
    beforeEach(() => {
      vi.clearAllMocks()
      vi.mock('../services/get-config-service', () => ({
        DoesFaviconExistService: vi.fn()
      }))
    })
    afterEach(() => {
      document.querySelector = originalQuerySelector
    })

    it('should do nothing when APP_FAVICON is not provided', async () => {
      store.dispatch(setappConfig(mockAppConfig))
      await loadAppFavicon()
      expect(DoesFaviconExistService).not.toHaveBeenCalled()
    })
    it('should do nothing when DoesFaviconExistService returns false', async () => {
      DoesFaviconExistService.mockResolvedValueOnce(false)
      const mockAppConfigFavicon = {
        ...mockAppConfig,
        APP_FAVICON: 'favicon.ico'
      }
      store.dispatch(setappConfig(mockAppConfigFavicon))
      await loadAppFavicon()
      expect(DoesFaviconExistService).toHaveBeenCalled()
    })
    it('should call DoesFaviconExistService but not query for link if Favicon set in config but file does not exist', async () => {
      DoesFaviconExistService.mockResolvedValueOnce(false)
      const mockAppConfigFavicon = {
        ...mockAppConfig,
        APP_FAVICON: 'favicon.ico'
      }
      store.dispatch(setappConfig(mockAppConfigFavicon))
      const mockLink = document.createElement('link')
      mockLink.rel = 'icon'
      mockLink.href = '/favicon.ico'
      document.querySelector = vi.fn(() => mockLink)
      await loadAppFavicon()
      expect(DoesFaviconExistService).toHaveBeenCalled()
      expect(document.querySelector).not.toHaveBeenCalledWith(
        "link[rel~='icon']"
      )
    })
    it('should call DoesFaviconExistService and query for link if favicon set in config and file exists', async () => {
      DoesFaviconExistService.mockResolvedValueOnce(true)
      const mockAppConfigFavicon = {
        ...mockAppConfig,
        APP_FAVICON: 'favicon.ico'
      }
      store.dispatch(setappConfig(mockAppConfigFavicon))
      const mockLink = document.createElement('link')
      mockLink.rel = 'icon'
      mockLink.href = '/config/favicon.ico?_cb=123'
      document.querySelector = vi.fn(() => mockLink)
      await loadAppFavicon()
      expect(DoesFaviconExistService).toHaveBeenCalled()
      expect(document.querySelector).toHaveBeenCalledWith("link[rel~='icon']")
      expect(mockLink.href).toContain(
        'http://localhost:3000/config/favicon.ico?_cb='
      )
      expect(mockLink.href).toMatch(/_cb=\d+/)
    })
  })

  describe('normalizeCollectionsConfig', () => {
    it('should return config unchanged if COLLECTIONS_CONFIG already exists', () => {
      const newFormatConfig = {
        COLLECTIONS: ['collection1', 'collection2'],
        COLLECTIONS_CONFIG: {
          collection1: {
            sceneTilerParams: { param1: 'value1' },
            mosaicTilerParams: { param2: 'value2' }
          },
          collection2: {
            sceneMinZoom: 7
          }
        }
      }

      const result = normalizeCollectionsConfig(newFormatConfig)

      expect(result).toEqual(newFormatConfig)
      expect(result.COLLECTIONS_CONFIG).toBeDefined()
    })

    it('should migrate legacy SCENE_TILER_PARAMS to COLLECTIONS_CONFIG', () => {
      const legacyConfig = {
        COLLECTIONS: ['collection1', 'collection2'],
        SCENE_TILER_PARAMS: {
          collection1: { param1: 'value1' },
          collection2: { param2: 'value2' }
        }
      }

      const result = normalizeCollectionsConfig(legacyConfig)

      expect(result.COLLECTIONS_CONFIG.collection1.sceneTilerParams).toEqual({
        param1: 'value1'
      })
      expect(result.COLLECTIONS_CONFIG.collection2.sceneTilerParams).toEqual({
        param2: 'value2'
      })
      expect(result.SCENE_TILER_PARAMS).toBeDefined() // Backward compatibility
    })

    it('should migrate legacy MOSAIC_TILER_PARAMS to COLLECTIONS_CONFIG', () => {
      const legacyConfig = {
        COLLECTIONS: ['collection1'],
        MOSAIC_TILER_PARAMS: {
          collection1: { mosaic: 'param' }
        }
      }

      const result = normalizeCollectionsConfig(legacyConfig)

      expect(result.COLLECTIONS_CONFIG.collection1.mosaicTilerParams).toEqual({
        mosaic: 'param'
      })
      expect(result.MOSAIC_TILER_PARAMS).toBeDefined()
    })

    it('should migrate legacy SEARCH_MIN_ZOOM_LEVELS to COLLECTIONS_CONFIG as sceneMinZoom', () => {
      const legacyConfig = {
        COLLECTIONS: ['collection1'],
        SEARCH_MIN_ZOOM_LEVELS: {
          collection1: { medium: 5, high: 7 }
        }
      }

      const result = normalizeCollectionsConfig(legacyConfig)

      expect(result.COLLECTIONS_CONFIG.collection1.sceneMinZoom).toEqual(7)
      expect(result.SEARCH_MIN_ZOOM_LEVELS).toBeDefined()
    })

    it('should migrate legacy POPUP_DISPLAY_FIELDS to COLLECTIONS_CONFIG', () => {
      const legacyConfig = {
        COLLECTIONS: ['collection1'],
        POPUP_DISPLAY_FIELDS: {
          collection1: ['field1', 'field2']
        }
      }

      const result = normalizeCollectionsConfig(legacyConfig)

      expect(result.COLLECTIONS_CONFIG.collection1.popupDisplayFields).toEqual([
        'field1',
        'field2'
      ])
      expect(result.POPUP_DISPLAY_FIELDS).toBeDefined()
    })

    it('should migrate legacy TILE_LAYER_PARAMS to COLLECTIONS_CONFIG', () => {
      const legacyConfig = {
        COLLECTIONS: ['collection1'],
        TILE_LAYER_PARAMS: {
          collection1: { tileSize: 256 }
        }
      }

      const result = normalizeCollectionsConfig(legacyConfig)

      expect(result.COLLECTIONS_CONFIG.collection1.tileLayerParams).toEqual({
        tileSize: 256
      })
      expect(result.TILE_LAYER_PARAMS).toBeDefined()
    })

    it('should migrate legacy ENHANCED_DISPLAY_CONFIG to COLLECTIONS_CONFIG', () => {
      const legacyConfig = {
        COLLECTIONS: ['collection1'],
        ENHANCED_DISPLAY_CONFIG: {
          collection1: { groups: ['group1'] }
        }
      }

      const result = normalizeCollectionsConfig(legacyConfig)

      expect(
        result.COLLECTIONS_CONFIG.collection1.enhancedDisplayConfig
      ).toEqual({ groups: ['group1'] })
      expect(result.ENHANCED_DISPLAY_CONFIG).toBeDefined()
    })

    it('should migrate all legacy parameters together', () => {
      const legacyConfig = {
        COLLECTIONS: ['collection1', 'collection2'],
        SCENE_TILER_PARAMS: {
          collection1: { scene: 'param1' }
        },
        MOSAIC_TILER_PARAMS: {
          collection1: { mosaic: 'param1' }
        },
        SEARCH_MIN_ZOOM_LEVELS: {
          collection2: { medium: 5, high: 7 }
        },
        POPUP_DISPLAY_FIELDS: {
          collection2: ['field1']
        }
      }

      const result = normalizeCollectionsConfig(legacyConfig)

      expect(result.COLLECTIONS_CONFIG.collection1.sceneTilerParams).toEqual({
        scene: 'param1'
      })
      expect(result.COLLECTIONS_CONFIG.collection1.mosaicTilerParams).toEqual({
        mosaic: 'param1'
      })
      expect(result.COLLECTIONS_CONFIG.collection2.sceneMinZoom).toEqual(7)
      expect(result.COLLECTIONS_CONFIG.collection2.popupDisplayFields).toEqual([
        'field1'
      ])
      // Ensure backward compatibility
      expect(result.SCENE_TILER_PARAMS).toBeDefined()
      expect(result.MOSAIC_TILER_PARAMS).toBeDefined()
      expect(result.SEARCH_MIN_ZOOM_LEVELS).toBeDefined()
      expect(result.POPUP_DISPLAY_FIELDS).toBeDefined()
    })

    it('should handle config with no legacy parameters', () => {
      const minimalConfig = {
        COLLECTIONS: ['collection1']
      }

      const result = normalizeCollectionsConfig(minimalConfig)

      expect(result.COLLECTIONS_CONFIG).toBeDefined()
      expect(result.COLLECTIONS_CONFIG.collection1).toBeDefined()
      expect(Object.keys(result.COLLECTIONS_CONFIG.collection1)).toHaveLength(0)
    })
  })

  describe('getCollectionConfig', () => {
    beforeEach(() => {
      // Reset store before each test
      store.dispatch(
        setappConfig({
          COLLECTIONS: ['collection1', 'collection2'],
          COLLECTIONS_CONFIG: {
            collection1: {
              sceneTilerParams: { scene: 'value1' },
              popupDisplayFields: ['field1', 'field2']
            },
            collection2: {
              sceneMinZoom: 7
            }
          }
        })
      )
    })

    it('should retrieve value from COLLECTIONS_CONFIG (new format)', () => {
      const result = getCollectionConfig('collection1', 'sceneTilerParams')
      expect(result).toEqual({ scene: 'value1' })
    })

    it('should return undefined if collection does not exist', () => {
      const result = getCollectionConfig('nonexistent', 'sceneTilerParams')
      expect(result).toBeUndefined()
    })

    it('should return undefined if parameter does not exist for collection', () => {
      const result = getCollectionConfig('collection1', 'nonexistentParam')
      expect(result).toBeUndefined()
    })

    it('should fall back to legacy parameter if not in COLLECTIONS_CONFIG', () => {
      store.dispatch(
        setappConfig({
          COLLECTIONS: ['collection1'],
          SCENE_TILER_PARAMS: {
            collection1: { legacy: 'value' }
          },
          COLLECTIONS_CONFIG: {
            collection1: {} // No sceneTilerParams in new config
          }
        })
      )

      const result = getCollectionConfig('collection1', 'sceneTilerParams')
      expect(result).toEqual({ legacy: 'value' })
    })

    it('should use custom config when provided as third parameter', () => {
      const customConfig = {
        COLLECTIONS_CONFIG: {
          testCollection: {
            sceneTilerParams: { custom: 'test' }
          }
        }
      }

      const result = getCollectionConfig(
        'testCollection',
        'sceneTilerParams',
        customConfig
      )
      expect(result).toEqual({ custom: 'test' })
    })

    it('should handle all parameter type mappings', () => {
      store.dispatch(
        setappConfig({
          COLLECTIONS: ['col1'],
          MOSAIC_TILER_PARAMS: { col1: { m: '1' } },
          SEARCH_MIN_ZOOM_LEVELS: { col1: { medium: 5, high: 7 } },
          POPUP_DISPLAY_FIELDS: { col1: ['f1'] },
          TILE_LAYER_PARAMS: { col1: { t: '1' } },
          ENHANCED_DISPLAY_CONFIG: { col1: { e: '1' } },
          COLLECTIONS_CONFIG: { col1: {} }
        })
      )

      expect(getCollectionConfig('col1', 'mosaicTilerParams')).toEqual({
        m: '1'
      })
      expect(getCollectionConfig('col1', 'sceneMinZoom')).toEqual(7)
      expect(getCollectionConfig('col1', 'popupDisplayFields')).toEqual(['f1'])
      expect(getCollectionConfig('col1', 'tileLayerParams')).toEqual({
        t: '1'
      })
      expect(getCollectionConfig('col1', 'enhancedDisplayConfig')).toEqual({
        e: '1'
      })
    })

    it('should prioritize COLLECTIONS_CONFIG over legacy parameters', () => {
      store.dispatch(
        setappConfig({
          COLLECTIONS: ['collection1'],
          SCENE_TILER_PARAMS: {
            collection1: { legacy: 'old' }
          },
          COLLECTIONS_CONFIG: {
            collection1: {
              sceneTilerParams: { new: 'value' }
            }
          }
        })
      )

      const result = getCollectionConfig('collection1', 'sceneTilerParams')
      expect(result).toEqual({ new: 'value' })
    })
  })
})
