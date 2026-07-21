import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import LeafMap from './LeafMap'
import { CLICKED_SCENE_IMAGE_LAYER } from '../../utils/mapLayers'
import { renderFilmDrop } from '../../testing/renderFilmDrop'
import { createFilmDropStore } from '../../redux/store'
import { setAppConfig } from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
import { FilmDropOptionsContext } from '../../contexts/FilmDropOptionsContext'

const mapInstances = []
const controllerNavigateMock = vi.fn()
const getSearchMock = vi.fn(() => ({}))
let activeController = null
let mockResolvedUrlState = { col: '', item: '' }

function createMockMap() {
  const panes = {
    overlayPane: { style: {} },
    markerPane: { style: {} }
  }
  const handlers = new Map()

  const map = {
    controlsAdded: [],
    controlsRemoved: [],
    createdPanes: [],
    layersAdded: [],
    layersRemoved: [],
    getHandler: vi.fn((event) => handlers.get(event)),
    on: vi.fn((event, cb) => {
      handlers.set(event, cb)
    }),
    off: vi.fn((event) => {
      handlers.delete(event)
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

vi.mock('../../url-controller', () => ({
  getActiveUrlControllerOrNull: () => activeController
}))

vi.mock('../../hooks/useResolvedUrlState', () => ({
  useResolvedUrlState: () => mockResolvedUrlState
}))

vi.mock('leaflet-draw', () => ({}))

const capturedMapContainerProps = []

/* eslint-disable react/prop-types */
vi.mock('react-leaflet/MapContainer', async () => {
  const ReactModule = await import('react')
  return {
    MapContainer: ({ children, ref, ...props }) => {
      const map = ReactModule.useMemo(() => createMockMap(), [])
      capturedMapContainerProps.push(props)
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

vi.mock('../../utils/mapInteraction', () => ({
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
    capturedMapContainerProps.length = 0
    controllerNavigateMock.mockReset()
    getSearchMock.mockReset()
    getSearchMock.mockReturnValue({})
    mockResolvedUrlState = { col: '', item: '' }
    activeController = {
      navigate: controllerNavigateMock,
      getSearch: getSearchMock
    }
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const renderSubject = (options = {}) => {
    const store = createFilmDropStore()
    const urlState = options.urlState
    const onUrlStateChange = options.onUrlStateChange
    if (urlState !== undefined) {
      mockResolvedUrlState = {
        ...(urlState?.search || {}),
        col: urlState?.collectionId || '',
        item: urlState?.itemId || ''
      }
    }

    store.dispatch(
      setAppConfig({
        ...mockAppConfig,
        MAP_CENTER: [40, -100],
        MAP_ZOOM: 4
      })
    )

    return renderFilmDrop(
      <FilmDropOptionsContext.Provider
        value={{ config: undefined, urlState, onUrlStateChange }}
      >
        <LeafMap />
      </FilmDropOptionsContext.Provider>,
      { store }
    )
  }

  const findNamedLayer = (map, name) =>
    map.layersAdded.find((layer) => layer.layer_name === name)

  it('derives initial center/zoom from useResolvedUrlState in uncontrolled mode', () => {
    mockResolvedUrlState = { z: 9, c: '12.3400,-45.6700', col: '', item: '' }

    renderSubject()

    const firstProps = capturedMapContainerProps[0]
    expect(firstProps.zoom).toBe(9)
    expect(firstProps.center).toEqual([12.34, -45.67])
  })

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
      CLICKED_SCENE_IMAGE_LAYER,
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

  it('skips the first viewport sync and navigates on the next moveend', async () => {
    const { unmount } = renderSubject()

    await act(async () => {})

    const map = mapInstances[0]
    expect(map).toBeTruthy()

    await act(async () => {
      map.getHandler('moveend')()
      vi.advanceTimersByTime(300)
    })

    expect(controllerNavigateMock).not.toHaveBeenCalled()

    map.getCenter.mockReturnValue({ lat: 38.8897, lng: -77.0089 })
    map.getZoom.mockReturnValue(9.6)

    await act(async () => {
      map.getHandler('moveend')()
      vi.advanceTimersByTime(300)
    })

    expect(controllerNavigateMock).toHaveBeenCalledTimes(1)
    expect(controllerNavigateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replace: true,
        search: expect.any(Function)
      })
    )

    const [{ search }] = controllerNavigateMock.mock.calls[0]
    expect(search({ item: 'scene-1' })).toEqual({
      item: 'scene-1',
      z: 10,
      c: '38.8897,-77.0089'
    })

    await act(async () => {
      unmount()
    })

    expect(map.off.mock.calls.some((call) => call[0] === 'moveend')).toBe(true)
  })

  it('emits controlled viewport updates through onUrlStateChange callback', async () => {
    const onUrlStateChange = vi.fn()
    activeController = {
      getSearch: getSearchMock,
      navigate: (options) => {
        controllerNavigateMock(options)
        const nextSearch = options.search({ tab: 'search' })
        onUrlStateChange(
          {
            collectionId: 'sentinel-2-l2a',
            itemId: undefined,
            search: nextSearch
          },
          {
            replace: options.replace,
            source: 'filmdrop-controller'
          }
        )
      }
    }

    const { unmount } = renderSubject({
      urlState: {
        collectionId: 'sentinel-2-l2a',
        itemId: undefined,
        search: { tab: 'search' }
      },
      onUrlStateChange
    })

    await act(async () => {})

    const map = mapInstances[0]
    map.getCenter.mockReturnValue({ lat: 35.4321, lng: -120.8765 })
    map.getZoom.mockReturnValue(7.2)

    await act(async () => {
      map.getHandler('moveend')()
      vi.advanceTimersByTime(300)
    })

    // First move initializes the guard and does not sync.
    expect(onUrlStateChange).not.toHaveBeenCalled()

    await act(async () => {
      map.getHandler('moveend')()
      vi.advanceTimersByTime(300)
    })

    expect(controllerNavigateMock).toHaveBeenCalledTimes(1)
    expect(onUrlStateChange).toHaveBeenCalledWith(
      {
        collectionId: 'sentinel-2-l2a',
        itemId: undefined,
        search: {
          tab: 'search',
          z: 7,
          c: '35.4321,-120.8765'
        }
      },
      {
        replace: true,
        source: 'filmdrop-controller'
      }
    )

    await act(async () => {
      unmount()
    })
  })
})
