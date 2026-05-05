import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import LeafMap from './LeafMap'
import { renderFilmDrop } from '../../testing/renderFilmDrop'
import { createFilmDropStore } from '../../redux/store'
import { setAppConfig } from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'

const mapInstances = []

function createMockMap() {
  const panes = {
    overlayPane: { style: {} },
    markerPane: { style: {} }
  }
  const handlers = {}

  const map = {
    controlsAdded: [],
    controlsRemoved: [],
    createdPanes: [],
    layersAdded: [],
    layersRemoved: [],
    on: vi.fn((event, cb) => {
      handlers[event] = cb
    }),
    off: vi.fn((event) => {
      delete handlers[event]
    }),
    addControl: vi.fn((control) => {
      map.controlsAdded.push(control)
    }),
    removeControl: vi.fn((control) => {
      map.controlsRemoved.push(control)
    }),
    createPane: vi.fn((name) => {
      if (!panes[name]) {
        panes[name] = { style: {} }
      }
      map.createdPanes.push(name)
    }),
    getPane: vi.fn((name) => panes[name] || null),
    setMaxBounds: vi.fn(),
    panInsideBounds: vi.fn(),
    getContainer: vi.fn(() => ({ style: {} })),
    addLayer: vi.fn((layer) => {
      map.layersAdded.push(layer)
    }),
    removeLayer: vi.fn((layer) => {
      map.layersRemoved.push(layer)
    }),
    getCenter: vi.fn(() => ({ lat: 10, lng: -10 })),
    getZoom: vi.fn(() => 6)
  }

  mapInstances.push(map)
  return map
}

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

vi.mock('leaflet-draw', () => ({}))

/* eslint-disable react/prop-types */
vi.mock('react-leaflet/MapContainer', async () => {
  const ReactModule = await import('react')
  return {
    MapContainer: ({ children, ref }) => {
      const map = ReactModule.useMemo(() => createMockMap(), [])
      ReactModule.useEffect(() => {
        if (typeof ref === 'function') {
          ref(map)
        } else if (ref && typeof ref === 'object') {
          ref.current = map
        }
      }, [ref, map])
      return <div data-testid="mock-map-container">{children}</div>
    }
  }
})
/* eslint-enable react/prop-types */

vi.mock('react-leaflet/TileLayer', () => ({
  TileLayer: () => <div data-testid="mock-tile-layer" />
}))

vi.mock('leaflet-geosearch', () => ({
  SearchControl: class SearchControl {
    constructor(config) {
      this.config = config
    }
  },
  OpenStreetMapProvider: class OpenStreetMapProvider {}
}))

vi.mock('../../utils/mapHelper', () => ({
  mapClickHandler: vi.fn(),
  addReferenceLayersToMap: vi.fn()
}))

vi.mock('../../utils/dataHelper', () => ({
  setScenesForCartLayer: vi.fn()
}))

vi.mock('../../utils/themeHelper', () => ({
  getBasemapConfig: () => ({
    url: 'https://tiles.example.com/{z}/{x}/{y}.png'
  }),
  getMapGeometryColors: () => ({ aoiBoundary: '#00ff00' })
}))

vi.mock('leaflet', () => {
  class FeatureGroup {
    constructor() {
      this.layer_name = ''
      this.pane = null
      this.clearLayers = vi.fn()
      this.eachLayer = vi.fn()
    }

    addTo(map) {
      map.addLayer(this)
      return this
    }
  }

  return {
    icon: vi.fn(() => ({})),
    latLng: vi.fn((lat, lng) => ({ lat, lng })),
    latLngBounds: vi.fn(() => ({})),
    layerGroup: vi.fn(() => {
      const group = new FeatureGroup()
      return group
    }),
    FeatureGroup,
    Draw: {
      Polygon: function Polygon() {
        return {}
      }
    },
    Control: {
      Draw: function Draw() {
        return {}
      }
    },
    control: {
      zoom: vi.fn(() => ({
        addTo: vi.fn((map) => {
          map.addControl('zoom-control')
        })
      }))
    }
  }
})

describe('LeafMap', () => {
  beforeEach(() => {
    mapInstances.length = 0
  })

  const renderSubject = () => {
    const store = createFilmDropStore()
    store.dispatch(
      setAppConfig({
        ...mockAppConfig,
        MAP_CENTER: [40, -100],
        MAP_ZOOM: 4
      })
    )

    return renderFilmDrop(<LeafMap />, { store })
  }

  const findNamedLayer = (map, name) =>
    map.layersAdded.find((layer) => layer.layer_name === name)

  it('keeps pane and control creation stable across remount', async () => {
    const first = renderSubject()

    await act(async () => {})

    expect(mapInstances).toHaveLength(1)
    const firstMap = mapInstances[0]
    expect(firstMap.controlsAdded).toHaveLength(2)
    expect([...firstMap.createdPanes].sort()).toEqual([
      'drawPane',
      'imagery',
      'searchResults'
    ])

    await act(async () => {
      first.unmount()
    })

    const dataLayerNames = [
      'searchResultsLayer',
      'cartFootprintsLayer',
      'clickedSceneHighlightLayer',
      'clickedSceneImageLayer',
      'mosaicImageLayer'
    ]
    dataLayerNames.forEach((name) => {
      const layer = findNamedLayer(firstMap, name)
      expect(layer).toBeTruthy()
      expect(layer.clearLayers).not.toHaveBeenCalled()
    })

    const ephemeralLayerNames = ['drawBoundsLayer', 'referenceLayerGroup']
    ephemeralLayerNames.forEach((name) => {
      const layer = findNamedLayer(firstMap, name)
      expect(layer).toBeTruthy()
      expect(layer.clearLayers).toHaveBeenCalledTimes(1)
    })

    // Assert that cleanup actually occurred on unmount
    expect(firstMap.removeControl).toHaveBeenCalled()
    expect(firstMap.off.mock.calls.some((call) => call[0] === 'moveend')).toBe(
      true
    )
    expect(firstMap.off.mock.calls.some((call) => call[0] === 'drag')).toBe(
      true
    )
    expect(firstMap.off.mock.calls.some((call) => call[0] === 'zoomend')).toBe(
      true
    )

    const second = renderSubject()

    await act(async () => {})

    expect(mapInstances).toHaveLength(2)
    const secondMap = mapInstances[1]
    expect(secondMap.controlsAdded).toHaveLength(2)
    expect([...secondMap.createdPanes].sort()).toEqual([
      'drawPane',
      'imagery',
      'searchResults'
    ])

    await act(async () => {
      second.unmount()
    })
  })
})
