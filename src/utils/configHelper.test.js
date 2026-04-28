import { vi } from 'vitest'
import { setappConfig } from '../redux/slices/mainSlice'
import { store } from '../redux/store'
import { mockAppConfig } from '../testing/shared-mocks'
import {
  loadAppTitle,
  loadAppFavicon,
  normalizeCollectionsConfig,
  applyConfigDefaults,
  getCollectionConfig,
  autoConfigureRendering
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
      expect(global.window.document.title).toBe('FilmDrop UI')
      expect(store.getState().mainSlice.appName).toBe('FilmDrop UI')
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
    it('should return modern config unchanged', () => {
      const newFormatConfig = {
        COLLECTIONS: { include: ['collection1', 'collection2'] },
        COLLECTIONS_CONFIG: {
          collection1: {
            visualizations: { default: { param1: 'value1' } },
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

    it('should throw for legacy config keys', () => {
      const legacyConfig = {
        COLLECTIONS: { include: ['collection1', 'collection2'] },
        SCENE_TILER_PARAMS: {
          collection1: { param1: 'value1' },
          collection2: { param2: 'value2' }
        }
      }

      expect(() => normalizeCollectionsConfig(legacyConfig)).toThrow(
        'Legacy configuration format is not supported'
      )
    })

    it('should throw for legacy COLLECTIONS array format', () => {
      const legacyCollectionsConfig = {
        COLLECTIONS: ['collection1']
      }
      expect(() => normalizeCollectionsConfig(legacyCollectionsConfig)).toThrow(
        'Legacy COLLECTIONS array format is not supported'
      )
    })

    it('should throw for invalid COLLECTIONS type', () => {
      const invalidCollectionsConfig = {
        COLLECTIONS: 'collection1'
      }
      expect(() =>
        normalizeCollectionsConfig(invalidCollectionsConfig)
      ).toThrow('Invalid COLLECTIONS format')
    })
  })

  describe('applyConfigDefaults', () => {
    it('should default RIGHT_SIDEBAR_ENABLED to false when missing', () => {
      const inputConfig = {
        BASEMAP: mockAppConfig.BASEMAP
      }

      const result = applyConfigDefaults(inputConfig)
      expect(result.RIGHT_SIDEBAR_ENABLED).toBe(false)
    })

    it('should preserve RIGHT_SIDEBAR_ENABLED=true when provided', () => {
      const inputConfig = {
        RIGHT_SIDEBAR_ENABLED: true
      }

      const result = applyConfigDefaults(inputConfig)
      expect(result.RIGHT_SIDEBAR_ENABLED).toBe(true)
    })
  })

  describe('autoConfigureRendering', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Spy on console methods
      vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(console, 'debug').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return config unchanged if no SCENE_TILER_URL', () => {
      const config = {
        COLLECTIONS_CONFIG: {
          col1: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'col1',
            renders: {
              visual: {
                assets: ['red', 'green', 'blue']
              }
            }
          }
        ]
      }

      const result = autoConfigureRendering(config)
      expect(result).toEqual(config)
      expect(console.debug).toHaveBeenCalledWith(
        'SCENE_TILER_URL not configured, skipping rendering auto-configuration'
      )
    })

    it('should return config unchanged if no _STAC_COLLECTIONS', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          col1: {}
        }
      }

      const result = autoConfigureRendering(config)
      expect(result).toEqual(config)
    })

    it('should skip collections without renders object', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          col1: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'col1'
            // No renders
          }
        ]
      }

      const result = autoConfigureRendering(config)
      expect(result.COLLECTIONS_CONFIG.col1.visualizations).toBeUndefined()
      expect(console.debug).toHaveBeenCalledWith(
        "No 'renders' found for collection 'col1', skipping rendering auto-configuration"
      )
    })

    it('should auto-configure from basic render definition with assets', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          sentinel2: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'sentinel2',
            renders: {
              'true-color': {
                title: 'True Color',
                assets: ['red', 'green', 'blue']
              }
            }
          }
        ]
      }

      const result = autoConfigureRendering(config)
      // Should populate visualizations field
      expect(result.COLLECTIONS_CONFIG.sentinel2.visualizations).toBeDefined()
      expect(
        result.COLLECTIONS_CONFIG.sentinel2.visualizations['true-color'].assets
      ).toEqual(['red', 'green', 'blue'])
      expect(result.COLLECTIONS_CONFIG.sentinel2.tileLayerParams).toEqual({})
      expect(console.log).toHaveBeenCalledWith(
        "Auto-configured visualizations for collection 'sentinel2': stored 1 visualization(s) (default: 'true-color')"
      )
    })

    it('should map render extension fields to TiTiler parameters', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          landsat: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'landsat',
            renders: {
              swir: {
                title: 'Shortwave Infrared',
                assets: ['swir22', 'nir', 'red'],
                rescale: [
                  [0, 5000],
                  [0, 7000],
                  [0, 9000]
                ],
                resampling: 'nearest',
                color_formula: 'Gamma+RGB+3.2'
              }
            }
          }
        ]
      }

      const result = autoConfigureRendering(config)
      const params = result.COLLECTIONS_CONFIG.landsat.visualizations.swir

      expect(params.assets).toEqual(['swir22', 'nir', 'red'])
      expect(params.rescale).toEqual(['0,5000', '0,7000', '0,9000'])
      expect(params.resampling).toEqual('nearest')
      expect(params.color_formula).toEqual('Gamma+RGB+3.2')
    })

    it('should handle colormap_name and expression', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          ndvi: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'ndvi',
            renders: {
              ndvi: {
                title: 'NDVI',
                assets: ['nir', 'red'],
                expression: '(nir-red)/(nir+red)',
                rescale: [[-1, 1]],
                colormap_name: 'ylgn',
                resampling: 'average'
              }
            }
          }
        ]
      }

      const result = autoConfigureRendering(config)
      const params = result.COLLECTIONS_CONFIG.ndvi.visualizations.ndvi

      expect(params.assets).toEqual(['nir', 'red'])
      expect(params.expression).toEqual('(nir-red)/(nir+red)')
      expect(params.rescale).toEqual(['-1,1'])
      expect(params.colormap_name).toEqual('ylgn')
      expect(params.resampling).toEqual('average')
    })

    it('should handle custom colormap object', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          dem: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'dem',
            renders: {
              elevation: {
                assets: ['data'],
                colormap: {
                  0: '#000000',
                  1000: '#419bdf',
                  2000: '#397d49'
                },
                nodata: -9999
              }
            }
          }
        ]
      }

      const result = autoConfigureRendering(config)
      const params = result.COLLECTIONS_CONFIG.dem.visualizations.elevation

      expect(params.assets).toEqual(['data'])
      expect(params.colormap).toEqual({
        0: '#000000',
        1000: '#419bdf',
        2000: '#397d49'
      })
      expect(params.nodata).toEqual(-9999)
    })

    it('should skip collections with user-configured visualizations', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          col1: {
            visualizations: {
              'custom-vis': {
                assets: ['custom-asset'],
                color_formula: 'custom'
              }
            }
          }
        },
        _STAC_COLLECTIONS: [
          {
            id: 'col1',
            renders: {
              default: {
                assets: ['auto-asset']
              }
            }
          }
        ]
      }

      const result = autoConfigureRendering(config)
      expect(
        result.COLLECTIONS_CONFIG.col1.visualizations['custom-vis'].assets
      ).toEqual(['custom-asset'])
      expect(
        result.COLLECTIONS_CONFIG.col1.visualizations['custom-vis']
          .color_formula
      ).toEqual('custom')
      expect(console.debug).toHaveBeenCalledWith(
        "Skipping rendering auto-configuration for 'col1' - visualizations already configured"
      )
    })

    it('should use first render definition when multiple exist', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          col1: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'col1',
            renders: {
              'true-color': {
                assets: ['red', 'green', 'blue']
              },
              'false-color': {
                assets: ['nir', 'red', 'green']
              }
            }
          }
        ]
      }

      const result = autoConfigureRendering(config)
      // Should use the first one (true-color)
      expect(
        result.COLLECTIONS_CONFIG.col1.visualizations['true-color'].assets
      ).toEqual(['red', 'green', 'blue'])
      expect(
        result.COLLECTIONS_CONFIG.col1.visualizations['false-color'].assets
      ).toEqual(['nir', 'red', 'green'])
    })

    it('should handle empty renders object', () => {
      const config = {
        SCENE_TILER_URL: 'https://example.com/titiler',
        COLLECTIONS_CONFIG: {
          col1: {}
        },
        _STAC_COLLECTIONS: [
          {
            id: 'col1',
            renders: {}
          }
        ]
      }

      const result = autoConfigureRendering(config)
      expect(result.COLLECTIONS_CONFIG.col1.visualizations).toBeUndefined()
      expect(console.debug).toHaveBeenCalledWith(
        "Collection 'col1' has empty 'renders' object"
      )
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
              visualizations: { default: { scene: 'value1' } },
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
      const result = getCollectionConfig('collection1', 'visualizations')
      expect(result).toEqual({ default: { scene: 'value1' } })
    })

    it('should return undefined if collection does not exist', () => {
      const result = getCollectionConfig('nonexistent', 'visualizations')
      expect(result).toBeUndefined()
    })

    it('should return undefined if parameter does not exist for collection', () => {
      const result = getCollectionConfig('collection1', 'nonexistentParam')
      expect(result).toBeUndefined()
    })

    it('should work with visualizations parameter', () => {
      store.dispatch(
        setappConfig({
          COLLECTIONS: ['collection1'],
          COLLECTIONS_CONFIG: {
            collection1: {
              visualizations: {
                'true-color': { assets: ['red', 'green', 'blue'] }
              }
            }
          }
        })
      )

      const result = getCollectionConfig('collection1', 'visualizations')
      expect(result).toEqual({
        'true-color': { assets: ['red', 'green', 'blue'] }
      })
    })

    it('should use custom config when provided as third parameter', () => {
      const customConfig = {
        COLLECTIONS_CONFIG: {
          testCollection: {
            visualizations: { default: { custom: 'test' } }
          }
        }
      }

      const result = getCollectionConfig(
        'testCollection',
        'visualizations',
        customConfig
      )
      expect(result).toEqual({ default: { custom: 'test' } })
    })

    it('should handle all parameter types from COLLECTIONS_CONFIG', () => {
      store.dispatch(
        setappConfig({
          COLLECTIONS: ['col1'],
          COLLECTIONS_CONFIG: {
            col1: {
              mosaicTilerParams: { m: '1' },
              sceneMinZoom: 7,
              popupDisplayFields: ['f1'],
              tileLayerParams: { t: '1' },
              enhancedDisplayConfig: { e: '1' }
            }
          }
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

    it('should retrieve visualizations from COLLECTIONS_CONFIG', () => {
      store.dispatch(
        setappConfig({
          COLLECTIONS: ['collection1'],
          COLLECTIONS_CONFIG: {
            collection1: {
              visualizations: { default: { new: 'value' } }
            }
          }
        })
      )

      const result = getCollectionConfig('collection1', 'visualizations')
      expect(result).toEqual({ default: { new: 'value' } })
    })
  })
})
