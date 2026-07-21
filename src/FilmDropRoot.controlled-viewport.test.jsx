import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import FilmDropRoot from './FilmDropRoot'
import { resetRuntimeForTests } from './testing/runtime-test-hooks'

vi.mock('./App', async () => {
  const ReactModule = await import('react')
  const { useStore } = await import('react-redux')
  const { setAppConfig } = await import('./redux/slices/mainSlice')
  const { mockAppConfig } = await import('./testing/shared-mocks')
  const { default: LeafMap } = await import('./components/LeafMap/LeafMap')

  function AppMock() {
    const store = useStore()
    const hasSeededConfig = ReactModule.useRef(false)

    if (!hasSeededConfig.current) {
      hasSeededConfig.current = true
      store.dispatch(
        setAppConfig({
          ...mockAppConfig,
          STAC_API_URL: undefined,
          MAP_CENTER: [40, -100],
          MAP_ZOOM: 4
        })
      )
    }

    return <LeafMap />
  }

  return {
    default: AppMock
  }
})

const capturedMapContainerProps = []

function createMockMap() {
  const handlers = new Map()
  const panes = {
    overlayPane: { style: {} },
    markerPane: { style: {} }
  }

  return {
    on: vi.fn((event, cb) => {
      handlers.set(event, cb)
    }),
    off: vi.fn((event) => {
      handlers.delete(event)
    }),
    addControl: vi.fn(),
    removeControl: vi.fn(),
    createPane: vi.fn((name) => {
      if (!panes[name]) panes[name] = { style: {} }
    }),
    getPane: vi.fn((name) => panes[name] || null),
    setMaxBounds: vi.fn(),
    panInsideBounds: vi.fn(),
    getContainer: vi.fn(() => ({ style: {} })),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    getCenter: vi.fn(() => ({ lat: 10, lng: -10 })),
    getZoom: vi.fn(() => 6)
  }
}

vi.mock('leaflet-draw', () => ({}))

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

vi.mock('./utils/mapInteraction', () => ({
  mapClickHandler: vi.fn(),
  addReferenceLayersToMap: vi.fn()
}))

vi.mock('./utils/dataHelper', () => ({
  setScenesForCartLayer: vi.fn()
}))

vi.mock('./utils/themeHelper', () => ({
  getBasemapConfig: () => ({
    url: 'https://tiles.example.com/{z}/{x}/{y}.png'
  }),
  getMapGeometryColors: () => ({ aoiBoundary: '#00ff00' }),
  shouldApplyDocumentBranding: () => true,
  shouldPersistThemePreference: () => true,
  initializeTheme: () => ({
    currentTheme: 'filmdrop',
    switchingEnabled: false
  }),
  applyTheme: vi.fn()
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
    layerGroup: vi.fn(() => new FeatureGroup()),
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
        addTo: vi.fn()
      }))
    }
  }
})

describe('FilmDropRoot controlled viewport integration', () => {
  beforeEach(() => {
    resetRuntimeForTests()
    capturedMapContainerProps.length = 0
  })

  afterEach(() => {
    resetRuntimeForTests()
  })

  it('applies controlled z/c state to LeafMap on first render through FilmDropRoot', async () => {
    const onUrlStateChange = vi.fn()

    const { unmount } = render(
      <FilmDropRoot
        config={{ MAP_CENTER: [40, -100], MAP_ZOOM: 4 }}
        urlState={{
          collectionId: 'sentinel-2-l2a',
          itemId: undefined,
          search: { z: 8, c: '35.0000,-120.0000' }
        }}
        onUrlStateChange={onUrlStateChange}
      />
    )

    await waitFor(() => {
      expect(capturedMapContainerProps).not.toHaveLength(0)
      const firstProps = capturedMapContainerProps[0]
      expect(firstProps.center).toEqual([35, -120])
      expect(firstProps.zoom).toBe(8)
    })

    unmount()
  })
})
