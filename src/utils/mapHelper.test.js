import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { store } from '../redux/store'
import {
  roundCoord,
  bboxFromMapBounds,
  clampAndRoundBbox,
  zoomToCollectionExtent,
  constructMosaicTilerParams,
  getLayerByName,
  clearLayer,
  deselectFeature,
  clearMapSelection,
  getTilerParams,
  addDataToLayer,
  clearAllLayers,
  getCurrentMapZoomLevel,
  setMapZoomLevel,
  zoomToItemExtent
} from './mapLayers'
import {
  getFootprintLayerStyle,
  getClickedFootprintLayerStyle,
  getCartFootprintLayerStyle,
  getGridCodeLayerStyle,
  getCustomSearchLineStyle,
  getCustomSearchPolygonStyle
} from './mapStyles'
import {
  setAppConfig,
  setSelectedVisualization,
  setClickResults,
  setCurrentPopupResult
} from '../redux/slices/mainSlice'

describe('mapHelper bbox precision', () => {
  describe('roundCoord', () => {
    it('rounds to 6 decimal places', () => {
      expect(roundCoord(1.123456789012)).toBe(1.123457)
      expect(roundCoord(-45.987654321)).toBe(-45.987654)
    })

    it('returns integers unchanged when within precision', () => {
      expect(roundCoord(0)).toBe(0)
      expect(roundCoord(180)).toBe(180)
      expect(roundCoord(-180)).toBe(-180)
    })

    it('rounds trailing precision beyond 6 decimals', () => {
      expect(roundCoord(10.1234561)).toBe(10.123456)
      expect(roundCoord(10.1234569)).toBe(10.123457)
    })
  })

  describe('bboxFromMapBounds', () => {
    it('returns undefined when map is not available', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(bboxFromMapBounds()).toBeUndefined()
    })

    it('returns undefined when map is empty object', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: {} }
      })
      expect(bboxFromMapBounds()).toBeUndefined()
    })

    it('returns bbox rounded to 6 decimal places when map has bounds', () => {
      const rawBounds = {
        _southWest: { lng: -122.123456789012, lat: 37.987654321098 },
        _northEast: { lng: -121.111222333444, lat: 38.555666777888 }
      }
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            getBounds: () => rawBounds
          }
        }
      })
      const result = bboxFromMapBounds()
      expect(result).toEqual([-122.123457, 37.987654, -121.111222, 38.555667])
    })
  })

  describe('clampAndRoundBbox', () => {
    it('returns original value when bbox is missing or too short', () => {
      expect(clampAndRoundBbox(undefined)).toBeUndefined()
      expect(clampAndRoundBbox([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('clamps longitudes to [-180, 180] and rounds all coordinates', () => {
      const input = [-190.1234567, 10.1234567, 200.9876543, -5.9876543]
      const result = clampAndRoundBbox(input)
      expect(result).toEqual([-180, 10.123457, 180, -5.987654])
    })
  })

  describe('zoomToCollectionExtent', () => {
    it('does not throw when map is missing', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      const collection = {
        extent: {
          spatial: {
            bbox: [[-10, -10, 10, 10]]
          }
        }
      }
      expect(() => zoomToCollectionExtent(collection, {})).not.toThrow()
    })
  })

  describe('constructMosaicTilerParams', () => {
    it('uses explicit mosaicTilerParams when present', () => {
      store.dispatch(
        setAppConfig({
          COLLECTIONS_CONFIG: {
            col1: {
              mosaicTilerParams: {
                assets: ['visual'],
                rescale: ['0,3000']
              },
              visualizations: {
                vegetation: {
                  assets: ['nir', 'red', 'green'],
                  rescale: [0, 5000]
                }
              }
            }
          }
        })
      )
      store.dispatch(setSelectedVisualization('vegetation'))

      const params = constructMosaicTilerParams('col1')
      expect(params).toContain('rescale=0,3000')
      expect(params).not.toContain('rescale=0,5000')
    })

    it('falls back to selected visualization when mosaicTilerParams are missing', () => {
      store.dispatch(
        setAppConfig({
          COLLECTIONS_CONFIG: {
            col2: {
              visualizations: {
                'true-color': {
                  assets: ['visual'],
                  rescale: ['0,3000']
                },
                vegetation: {
                  assets: ['nir', 'red', 'green'],
                  rescale: ['0,5000']
                }
              }
            }
          }
        })
      )
      store.dispatch(setSelectedVisualization('vegetation'))

      const params = constructMosaicTilerParams('col2')
      expect(params).toContain('rescale=0,5000')
      expect(params).not.toContain('rescale=0&rescale=5000')
    })
  })
})

describe('mapHelper layer management and styles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('layer querying and manipulation', () => {
    it('getLayerByName should return matching layer', () => {
      const targetLayer = { layer_name: 'search-results' }
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            eachLayer: (cb) => cb(targetLayer)
          }
        }
      })
      expect(getLayerByName('search-results')).toBe(targetLayer)
    })

    it('getLayerByName should return null when no map', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(getLayerByName('search-results')).toBeNull()
    })

    it('clearLayer should clear specific named layer', () => {
      const clearLayers = vi.fn()
      const targetLayer = { layer_name: 'highlight', clearLayers }
      const otherLayer = { layer_name: 'other' }

      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            eachLayer: (cb) => {
              cb(otherLayer)
              cb(targetLayer)
            }
          }
        }
      })

      clearLayer('highlight')
      expect(clearLayers).toHaveBeenCalled()
    })

    it('clearLayer should not throw when map is unavailable', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(() => clearLayer('highlight')).not.toThrow()
    })

    it('clearAllLayers should clear all layers except protected layers', () => {
      const clearLayers = vi.fn()
      const layers = [
        { layer_name: 'search-results', clearLayers },
        { layer_name: 'mosaic', clearLayers },
        { layer_name: 'drawBoundsLayer', clearLayers: vi.fn() },
        { layer_name: 'cartFootprintsLayer', clearLayers: vi.fn() }
      ]

      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            eachLayer: (cb) => layers.forEach(cb)
          },
          referenceLayers: []
        }
      })

      clearAllLayers()

      expect(clearLayers).toHaveBeenCalledTimes(2) // Only non-protected layers
    })

    it('deselectFeature should clear highlight and image layers', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            eachLayer: (cb) => {
              cb({
                layer_name: 'clickedSceneHighlightLayer',
                clearLayers: vi.fn()
              })
              cb({ layer_name: 'clickedSceneImageLayer', clearLayers: vi.fn() })
            }
          }
        }
      })

      expect(() => deselectFeature()).not.toThrow()
    })

    it('clearMapSelection should clear layers and dispatch actions', () => {
      const dispatch = vi.spyOn(store, 'dispatch')
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            eachLayer: (cb) => {
              cb({
                layer_name: 'clickedSceneHighlightLayer',
                clearLayers: vi.fn()
              })
              cb({ layer_name: 'clickedSceneImageLayer', clearLayers: vi.fn() })
            }
          }
        }
      })

      clearMapSelection()

      // Should dispatch setClickResults and setCurrentPopupResult
      expect(dispatch).toHaveBeenCalledWith(setClickResults([]))
      expect(dispatch).toHaveBeenCalledWith(setCurrentPopupResult(null))
    })
  })

  describe('style functions', () => {
    it('getFootprintLayerStyle should return style object with correct properties', () => {
      const style = getFootprintLayerStyle()
      expect(style).toHaveProperty('color')
      expect(style).toHaveProperty('weight', 1)
      expect(style).toHaveProperty('opacity', 1)
      expect(style).toHaveProperty('fillOpacity', 0.1)
      expect(style).toHaveProperty('pane', 'searchResults')
    })

    it('getClickedFootprintLayerStyle should return highlighted style', () => {
      const style = getClickedFootprintLayerStyle()
      expect(style).toHaveProperty('color')
      expect(style).toHaveProperty('weight', 4)
      expect(style).toHaveProperty('opacity', 0.65)
      expect(style).toHaveProperty('fillOpacity', 0)
      expect(style).toHaveProperty('pane', 'searchResults')
    })

    it('getCartFootprintLayerStyle should return cart-specific style', () => {
      const style = getCartFootprintLayerStyle()
      expect(style).toHaveProperty('color')
      expect(style).toHaveProperty('weight', 3)
      expect(style).toHaveProperty('opacity', 1)
      expect(style).toHaveProperty('fillOpacity', 0.1)
      expect(style).toHaveProperty('pane', 'searchResults')
    })

    it('getGridCodeLayerStyle should return grid code style', () => {
      const style = getGridCodeLayerStyle()
      expect(style).toHaveProperty('color')
      expect(style).toHaveProperty('weight', 1)
      expect(style).toHaveProperty('fillOpacity', 0.1)
      expect(style).toHaveProperty('pane', 'searchResults')
    })

    it('getCustomSearchLineStyle should return line boundary style', () => {
      const style = getCustomSearchLineStyle()
      expect(style).toHaveProperty('color')
      expect(style).toHaveProperty('weight', 2)
      expect(style).toHaveProperty('dashArray', '4, 4')
      expect(style).toHaveProperty('pane', 'drawPane')
    })

    it('getCustomSearchPolygonStyle should return polygon style', () => {
      const style = getCustomSearchPolygonStyle()
      expect(style).toHaveProperty('color')
      expect(style).toHaveProperty('weight', 2)
      expect(style).toHaveProperty('fillOpacity', 0)
      expect(style).toHaveProperty('pane', 'drawPane')
    })
  })

  describe('zoom level management', () => {
    it('getCurrentMapZoomLevel should return map zoom level', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: { getZoom: () => 12 }
        }
      })
      expect(getCurrentMapZoomLevel()).toBe(12)
    })

    it('getCurrentMapZoomLevel should return undefined when no map', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(getCurrentMapZoomLevel()).toBeUndefined()
    })

    it('setMapZoomLevel should set zoom level on map', () => {
      const setZoom = vi.fn()
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: { setZoom }
        }
      })
      setMapZoomLevel(15)
      expect(setZoom).toHaveBeenCalledWith(15)
    })

    it('setMapZoomLevel should not throw when map is unavailable', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(() => setMapZoomLevel(15)).not.toThrow()
    })
  })

  describe('item extent zooming', () => {
    it('zoomToItemExtent should process item bbox', () => {
      const item = {
        bbox: [-122.5, 37.5, -122.0, 38.0]
      }
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            fitBounds: vi.fn(),
            getContainer: () => ({ clientHeight: 600 }),
            getBoundsZoom: vi.fn(() => 10)
          }
        }
      })
      expect(() => zoomToItemExtent(item)).not.toThrow()
    })

    it('zoomToItemExtent should handle missing bbox', () => {
      const item = {}
      expect(() => zoomToItemExtent(item)).not.toThrow()
    })
  })

  describe('tiler params construction', () => {
    it('getTilerParams should deep clone config variable', () => {
      const original = {
        assets: ['red', 'green', 'blue'],
        rescale: [
          [0, 3000],
          [0, 3000],
          [0, 3000]
        ],
        nested: { deep: { value: 42 } }
      }
      const result = getTilerParams(original)
      expect(result).toEqual(original)
      expect(result).not.toBe(original) // Should be a copy
    })

    it('getTilerParams should return empty object on JSON parse error', () => {
      const malformed = { circular: null }
      malformed.circular = malformed
      const result = getTilerParams(malformed)
      expect(result).toEqual({})
    })
  })

  describe('mosaic tiler params', () => {
    it('constructMosaicTilerParams should include unscale when expression present', () => {
      store.dispatch(
        setAppConfig({
          COLLECTIONS_CONFIG: {
            col1: {
              mosaicTilerParams: {
                assets: ['visual'],
                expression: 'red/nir',
                rescale: ['0,1']
              }
            }
          }
        })
      )
      store.dispatch(setSelectedVisualization(null))

      const params = constructMosaicTilerParams('col1')
      expect(params).toContain('unscale=true')
      expect(params).toContain('expression')
    })

    it('constructMosaicTilerParams should handle empty config', () => {
      store.dispatch(setAppConfig({ COLLECTIONS_CONFIG: {} }))
      const params = constructMosaicTilerParams('non-existent')
      expect(params).toBe('')
    })

    it('constructMosaicTilerParams should not include unscale when not needed', () => {
      store.dispatch(
        setAppConfig({
          COLLECTIONS_CONFIG: {
            col1: {
              mosaicTilerParams: {
                assets: ['visual'],
                rescale: ['0,3000']
              }
            }
          }
        })
      )
      store.dispatch(setSelectedVisualization(null))

      const params = constructMosaicTilerParams('col1')
      expect(params).not.toContain('unscale=true')
    })

    it('constructMosaicTilerParams should include all relevant parameters', () => {
      store.dispatch(
        setAppConfig({
          COLLECTIONS_CONFIG: {
            col1: {
              mosaicTilerParams: {
                assets: ['red', 'green', 'blue'],
                rescale: [
                  [0, 3000],
                  [0, 3000],
                  [0, 3000]
                ],
                bidx: '1,2,3',
                nodata: 0
              }
            }
          }
        })
      )
      store.dispatch(setSelectedVisualization(null))

      const params = constructMosaicTilerParams('col1')
      expect(params).toContain('rescale')
      expect(params).toContain('nodata=0')
      expect(params).toContain('bidx')
    })
  })

  describe('data layer management', () => {
    it('addDataToLayer should not throw when map is unavailable', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(() => addDataToLayer({}, 'search')).not.toThrow()
    })
  })
})
