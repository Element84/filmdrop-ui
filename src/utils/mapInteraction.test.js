import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { store } from '../redux/store'
import {
  mapClickHandler,
  selectMappedScenes,
  enableMapPolyDrawing,
  disableMapPolyDrawing,
  addUploadedGeojsonToMap,
  addReferenceLayersToMap,
  toggleReferenceLayerVisibility,
  parseGeomUpload
} from './mapInteraction'
import { setClickResults } from '../redux/slices/mainSlice'

// Mock dependencies
vi.mock('../redux/store', () => ({
  store: {
    getState: vi.fn(),
    dispatch: vi.fn()
  }
}))

vi.mock('leaflet', () => ({
  Draw: {
    Event: {
      CREATED: 'draw:created'
    }
  },
  latLngBounds: vi.fn(),
  geoJSON: vi.fn(() => ({
    getBounds: vi.fn(() => ({
      intersects: vi.fn(() => false)
    })),
    toGeoJSON: vi.fn(() => ({ features: [] }))
  })),
  tileLayer: {
    wms: vi.fn(() => ({
      layer_name: undefined,
      options: {},
      setStyle: vi.fn(),
      addTo: vi.fn(),
      bringToBack: vi.fn(),
      bringToFront: vi.fn()
    }))
  },
  CRS: {
    EPSG4326: 'EPSG:4326',
    EPSG3857: 'EPSG:3857'
  },
  marker: vi.fn(() => ({
    addTo: vi.fn()
  })),
  icon: vi.fn(() => ({
    iconSize: [25, 41],
    iconAnchor: [10, 41]
  }))
}))

vi.mock('./mapLayers', () => ({
  clearLayer: vi.fn(),
  clearAllLayers: vi.fn(),
  clearMapSelection: vi.fn()
}))

vi.mock('../url-controller', () => ({
  getActiveUrlController: vi.fn(() => ({
    navigate: vi.fn(),
    getPathParams: vi.fn(() => ({ collectionId: 'test-collection' }))
  }))
}))

vi.mock('./searchHelper', () => ({
  searchGridCodeScenes: vi.fn()
}))

describe('mapInteraction', () => {
  let mockMap
  let mockState

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Leaflet components
    mockMap = {
      eachLayer: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      getBounds: vi.fn(() => ({
        intersects: vi.fn(() => false)
      }))
    }

    mockState = {
      map: mockMap,
      isDrawingEnabled: false,
      searchType: 'scene',
      searchResults: null,
      viewMode: 'scene',
      mappedScenes: [],
      mapDrawPolygonHandler: {
        enable: vi.fn(),
        disable: vi.fn()
      },
      referenceLayers: []
    }

    store.getState.mockReturnValue({
      mainSlice: mockState
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('mapClickHandler - guard logic', () => {
    it('returns early when drawing is enabled', () => {
      mockState.isDrawingEnabled = true
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 1 } }

      mapClickHandler(event)

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('returns early when map is not available', () => {
      mockState.map = null
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 1 } }

      mapClickHandler(event)

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('returns early when map has no keys (empty/invalid)', () => {
      mockState.map = {}
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 1 } }

      mapClickHandler(event)

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('returns early on double-click (detail === 2)', () => {
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 2 } }

      mapClickHandler(event)

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('returns early when view mode is mosaic', () => {
      mockState.viewMode = 'mosaic'
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 1 } }

      mapClickHandler(event)

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('returns early when search type is hex', () => {
      mockState.searchType = 'hex'
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 1 } }

      mapClickHandler(event)

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('mapClickHandler - state snapshot', () => {
    it('returns early and does not dispatch when searchResults is null', () => {
      mockState.searchResults = null
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 1 } }

      mapClickHandler(event)

      // Should not dispatch any actions when no search results
      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('handles null search results gracefully', () => {
      mockState.searchResults = null
      const event = { latlng: { lat: 0, lng: 0 }, originalEvent: { detail: 1 } }

      mapClickHandler(event)

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('selectMappedScenes - guard logic', () => {
    it('returns early when map is not available', () => {
      mockState.map = null

      selectMappedScenes()

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('returns early when map has no keys', () => {
      mockState.map = {}

      selectMappedScenes()

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('dispatches click results with mapped scenes', () => {
      const mockScenes = [{ type: 'Feature', properties: { id: 'scene1' } }]
      mockState.mappedScenes = mockScenes
      mockMap.eachLayer.mockImplementation(() => {})

      selectMappedScenes()

      expect(store.dispatch).toHaveBeenCalledWith(setClickResults(mockScenes))
    })
  })

  describe('enableMapPolyDrawing - guard logic', () => {
    it('returns early when map is not available', () => {
      mockState.map = null

      enableMapPolyDrawing()

      expect(mockState.mapDrawPolygonHandler.enable).not.toHaveBeenCalled()
    })

    it('returns early when map has no keys', () => {
      mockState.map = {}

      enableMapPolyDrawing()

      expect(mockState.mapDrawPolygonHandler.enable).not.toHaveBeenCalled()
    })

    it('returns early when mapDrawPolygonHandler is not available', () => {
      mockState.mapDrawPolygonHandler = null

      enableMapPolyDrawing()

      expect(mockMap.on).not.toHaveBeenCalled()
    })

    it('enables map draw polygon handler', () => {
      mockMap.on.mockImplementation(() => {})

      enableMapPolyDrawing()

      expect(mockState.mapDrawPolygonHandler.enable).toHaveBeenCalled()
    })
  })

  describe('disableMapPolyDrawing - guard logic', () => {
    it('returns early when map is not available', () => {
      mockState.map = null

      disableMapPolyDrawing()

      expect(mockState.mapDrawPolygonHandler.disable).not.toHaveBeenCalled()
    })

    it('returns early when map has no keys', () => {
      mockState.map = {}

      disableMapPolyDrawing()

      expect(mockState.mapDrawPolygonHandler.disable).not.toHaveBeenCalled()
    })

    it('disables map draw polygon handler', () => {
      disableMapPolyDrawing()

      expect(mockState.mapDrawPolygonHandler.disable).toHaveBeenCalled()
    })

    it('handles missing handler gracefully', () => {
      mockState.mapDrawPolygonHandler = null

      disableMapPolyDrawing()

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('addUploadedGeojsonToMap - guard logic', () => {
    it('returns early when map is not available', () => {
      mockState.map = null
      const geojson = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] }
      }

      addUploadedGeojsonToMap(geojson)

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('returns early when map has no keys', () => {
      mockState.map = {}
      const geojson = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] }
      }

      addUploadedGeojsonToMap(geojson)

      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('addReferenceLayersToMap - guard logic', () => {
    it('returns early when map is not available', () => {
      mockState.map = null

      addReferenceLayersToMap()

      expect(mockMap.eachLayer).not.toHaveBeenCalled()
    })

    it('returns early when map has no keys', () => {
      mockState.map = {}

      addReferenceLayersToMap()

      expect(mockMap.eachLayer).not.toHaveBeenCalled()
    })

    it('handles empty reference layers array', () => {
      mockState.referenceLayers = []
      mockMap.eachLayer.mockImplementation(() => {})

      addReferenceLayersToMap()

      expect(mockMap.eachLayer).toHaveBeenCalled()
    })
  })

  describe('toggleReferenceLayerVisibility - guard logic', () => {
    it('returns early when map is not available', () => {
      mockState.map = null

      toggleReferenceLayerVisibility('some-layer')

      expect(mockMap.eachLayer).not.toHaveBeenCalled()
    })

    it('returns early when map has no keys', () => {
      mockState.map = {}

      toggleReferenceLayerVisibility('some-layer')

      expect(mockMap.eachLayer).not.toHaveBeenCalled()
    })
  })

  describe('parseGeomUpload', () => {
    it('parses valid FeatureCollection with single feature', async () => {
      const geom = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {}
          }
        ]
      }

      const result = await parseGeomUpload(geom)

      expect(result.type).toBe('Feature')
      expect(result.geometry.type).toBe('Point')
    })

    it('parses valid Feature directly', async () => {
      const geom = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {}
      }

      const result = await parseGeomUpload(geom)

      expect(result.type).toBe('Feature')
    })

    it('parses valid Geometry and wraps in Feature', async () => {
      const geom = {
        type: 'Point',
        coordinates: [0, 0]
      }

      const result = await parseGeomUpload(geom)

      expect(result.type).toBe('Feature')
      expect(result.geometry.type).toBe('Point')
    })

    it('throws error for FeatureCollection with multiple features', async () => {
      const geom = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {}
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 1] },
            properties: {}
          }
        ]
      }

      await expect(parseGeomUpload(geom)).rejects.toThrow(
        'Only FeatureCollections with a single feature are supported'
      )
    })

    it('throws error for invalid geometry', async () => {
      const geom = { type: 'InvalidType', coordinates: [0, 0] }

      await expect(parseGeomUpload(geom)).rejects.toThrow(
        'Invalid geojson uploaded'
      )
    })
  })

  describe('enableMapPolyDrawing - listener lifecycle', () => {
    it('calls map.off before map.on to prevent duplicate listeners', () => {
      enableMapPolyDrawing()

      // Should call map.off to remove any previously registered listener
      expect(mockMap.off).toHaveBeenCalledWith('draw:created')
      // Should then register new listener
      expect(mockMap.on).toHaveBeenCalledWith(
        'draw:created',
        expect.any(Function)
      )
    })

    it('prevents listener accumulation on repeated calls', () => {
      enableMapPolyDrawing()
      vi.clearAllMocks()

      enableMapPolyDrawing()
      // Each call should clean up before registering
      expect(mockMap.off).toHaveBeenCalledWith('draw:created')
      expect(mockMap.on).toHaveBeenCalledWith(
        'draw:created',
        expect.any(Function)
      )
    })
  })
})
