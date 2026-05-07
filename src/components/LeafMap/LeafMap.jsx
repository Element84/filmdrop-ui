import { React, useCallback, useEffect, useRef, useMemo, useState } from 'react'
import './LeafMap.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  setMap,
  setMapDrawPolygonHandler,
  setShowMapAttribution
} from '../../redux/slices/mainSlice'
import * as L from 'leaflet'
import { useNavigate } from '@tanstack/react-router'
import 'leaflet-draw'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { SearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import markerIconUrl from '../../assets/marker-icon.png'
import markerShadowUrl from '../../assets/marker-shadow.png'
import {
  mapClickHandler,
  addReferenceLayersToMap
} from '../../utils/mapInteraction'
import { CLICKED_SCENE_IMAGE_LAYER } from '../../utils/mapLayers'
import { setScenesForCartLayer } from '../../utils/dataHelper'
import debounce from '../../utils/debounce'
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAP_ZOOM_MAX
} from '../../constants/defaults'
import { getBasemapConfig, getMapGeometryColors } from '../../utils/themeHelper'
import { getActiveRouterOrNull } from '../../router-test-hooks'

const LeafMap = () => {
  const dispatch = useDispatch()
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  const _currentTheme = useSelector((state) => state.mainSlice.currentTheme)
  const navigate = useNavigate()

  // set map ref to itself with useRef
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const mapInstanceRef = useRef(null)
  const mapTouchedRef = useRef(false)
  const hasInitializedViewport = useRef(false)
  const zoomControlRef = useRef(null)
  const searchControlRef = useRef(null)
  const referenceLayerGroupRef = useRef(null)
  const resultFootprintsRef = useRef(null)
  const cartFootprintsRef = useRef(null)
  const clickedFootprintsHighlightRef = useRef(null)
  const clickedFootprintImageLayerRef = useRef(null)
  const mosaicImageLayerRef = useRef(null)
  const drawBoundsRef = useRef(null)

  // Mount-only snapshot: MapContainer reads center/zoom once on mount,
  // so this value should not be reactive. Runtime URL ↔ map sync happens
  // via the `moveend` handler below (replace: true).
  const [initialPosition] = useState(() => {
    const initialSearch = getActiveRouterOrNull()?.state?.location?.search || {}
    let center = _appConfig.MAP_CENTER || DEFAULT_MAP_CENTER
    // Ensure the initial zoom fills the viewport vertically so tiles
    // are pre-loaded behind the loading cover (no blank bands on reveal).
    const minZoom = Math.ceil(Math.log2(window.innerHeight / 256))
    let zoom = Math.max(_appConfig.MAP_ZOOM || DEFAULT_MAP_ZOOM, minZoom)
    if (initialSearch.z != null) {
      zoom = Math.max(Number(initialSearch.z), minZoom)
    }
    if (initialSearch.c) {
      const parts = String(initialSearch.c).split(',').map(Number)
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        center = parts
      }
    }
    return { center, zoom }
  })

  const mapMarkerIcon = useMemo(
    () =>
      L.icon({
        iconSize: [25, 41],
        iconAnchor: [10, 41],
        popupAnchor: [2, -40],
        iconUrl: markerIconUrl,
        shadowUrl: markerShadowUrl
      }),
    []
  )

  const searchControl = useMemo(
    () =>
      new SearchControl({
        style: 'button',
        notFoundMessage: 'Sorry, that address could not be found.',
        provider: new OpenStreetMapProvider(),
        marker: {
          icon: mapMarkerIcon
        }
      }),
    [mapMarkerIcon]
  )

  const handleMapRef = useCallback((map) => {
    mapRef.current = map
    setMapInstance(map || null)
  }, [])

  useEffect(() => {
    setScenesForCartLayer(_cartItems)
  }, [_cartItems])

  const ensureLayer = (map, ref, createLayer, layerName) => {
    if (!ref.current) {
      ref.current = createLayer()
      ref.current.layer_name = layerName
    }
    ref.current.addTo(map)
    return ref.current
  }

  const removeLayer = (map, ref, { clear = false } = {}) => {
    if (!ref.current) return
    if (clear && typeof ref.current.clearLayers === 'function') {
      ref.current.clearLayers()
    }
    try {
      map.removeLayer(ref.current)
    } catch {
      // map already destroyed (e.g. during test cleanup)
    }
  }

  useEffect(() => {
    const map = mapInstance
    if (!map || mapInstanceRef.current === map) return
    mapInstanceRef.current = map

    // override position of zoom controls (tracked below for cleanup)
    if (!zoomControlRef.current) {
      zoomControlRef.current = L.control.zoom({
        position: 'topleft'
      })
    }
    zoomControlRef.current.addTo(map)

    if (!searchControlRef.current) {
      searchControlRef.current = searchControl
    }
    // add geosearch/geocoder to map
    map.addControl(searchControlRef.current)

    // setup custom panes for results — guard each against duplicate
    // creation when the effect re-fires.
    const ensurePane = (name, zIndex, pointerEvents) => {
      if (!map.getPane(name)) {
        map.createPane(name)
      }
      const pane = map.getPane(name)
      pane.style.zIndex = zIndex
      if (pointerEvents !== undefined) {
        pane.style.pointerEvents = pointerEvents
      }
    }
    ensurePane('searchResults', 600)
    ensurePane('imagery', 650, 'none')
    ensurePane('drawPane', 700)

    // override existing panes for draw controls
    map.getPane('overlayPane').style.zIndex = 700
    map.getPane('markerPane').style.zIndex = 700

    // setup max map bounds
    const southWest = L.latLng(-90, -180)
    const northEast = L.latLng(90, 180)
    const bounds = L.latLngBounds(southWest, northEast)
    map.setMaxBounds(bounds)

    const onDrag = function () {
      map.panInsideBounds(bounds, { animate: false })
    }
    map.on('drag', onDrag)

    // set up map layers
    ensureLayer(
      map,
      referenceLayerGroupRef,
      () => L.layerGroup(),
      'referenceLayerGroup'
    )
    ensureLayer(
      map,
      resultFootprintsRef,
      () => new L.FeatureGroup(),
      'searchResultsLayer'
    )
    ensureLayer(
      map,
      cartFootprintsRef,
      () => new L.FeatureGroup(),
      'cartFootprintsLayer'
    )
    cartFootprintsRef.current.eachLayer(function (layer) {
      layer.on('mouseover', function () {
        map.getContainer().style.cursor = 'default'
      })
      layer.on('mouseout', function () {
        map.getContainer().style.cursor = ''
      })
    })

    ensureLayer(
      map,
      clickedFootprintsHighlightRef,
      () => new L.FeatureGroup(),
      'clickedSceneHighlightLayer'
    )
    ensureLayer(
      map,
      clickedFootprintImageLayerRef,
      () => new L.FeatureGroup(),
      CLICKED_SCENE_IMAGE_LAYER
    )
    ensureLayer(
      map,
      mosaicImageLayerRef,
      () => new L.FeatureGroup(),
      'mosaicImageLayer'
    )
    ensureLayer(
      map,
      drawBoundsRef,
      () => new L.FeatureGroup(),
      'drawBoundsLayer'
    )
    drawBoundsRef.current.pane = 'drawPane'

    // eslint-disable-next-line no-new
    new L.Control.Draw({
      edit: {
        featureGroup: drawBoundsRef.current
      }
    })

    const mapColors = getMapGeometryColors()
    const drawPolygonHandler = new L.Draw.Polygon(map, {
      shapeOptions: { color: mapColors.aoiBoundary }
    })

    dispatch(setMapDrawPolygonHandler(drawPolygonHandler))

    // set up map events
    const onZoomEnd = function () {
      if (!mapTouchedRef.current) {
        mapTouchedRef.current = true
        dispatch(setShowMapAttribution(false))
      }
    }
    map.on('zoomend', onZoomEnd)

    map.on('click', mapClickHandler)

    const onMouseDown = function () {
      if (!mapTouchedRef.current) {
        mapTouchedRef.current = true
        dispatch(setShowMapAttribution(false))
      }
    }
    map.on('mousedown', onMouseDown)

    // Sync map viewport to URL (debounced)
    const syncViewportToUrl = debounce(() => {
      // Skip syncing the initial viewport to avoid interfering with URL-based item zoom
      if (!hasInitializedViewport.current) {
        hasInitializedViewport.current = true
        return
      }
      try {
        const center = map.getCenter()
        const zoom = map.getZoom()
        navigate({
          search: (prev) => ({
            ...prev,
            z: Math.round(zoom),
            c: `${center.lat.toFixed(4)},${center.lng.toFixed(4)}`
          }),
          replace: true
        })
      } catch {
        // Map may have been destroyed (e.g. during test cleanup)
      }
    }, 300)
    map.on('moveend', syncViewportToUrl)

    // push map into redux state
    dispatch(setMap(map))

    addReferenceLayersToMap()

    return () => {
      syncViewportToUrl.cancel()
      map.off('moveend', syncViewportToUrl)
      map.off('drag', onDrag)
      map.off('zoomend', onZoomEnd)
      map.off('click', mapClickHandler)
      map.off('mousedown', onMouseDown)

      removeLayer(map, drawBoundsRef, { clear: true })
      removeLayer(map, mosaicImageLayerRef)
      removeLayer(map, clickedFootprintImageLayerRef)
      removeLayer(map, clickedFootprintsHighlightRef)
      removeLayer(map, cartFootprintsRef)
      removeLayer(map, resultFootprintsRef)
      removeLayer(map, referenceLayerGroupRef, { clear: true })

      try {
        if (zoomControlRef.current) {
          map.removeControl(zoomControlRef.current)
        }
        if (searchControlRef.current) {
          map.removeControl(searchControlRef.current)
        }
      } catch {
        // map already destroyed (e.g. during test cleanup)
      }

      mapInstanceRef.current = null
      mapTouchedRef.current = false
      hasInitializedViewport.current = false
    }
  }, [dispatch, mapInstance, navigate, searchControl])

  return (
    <div className="LeafMap" data-testid="LeafMap">
      {/* this sets up the base of the map component and a few default params */}
      <MapContainer
        className="mainMap"
        ref={handleMapRef}
        center={initialPosition.center}
        zoom={initialPosition.zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        maxZoom={
          _appConfig.MAP_ZOOM_MAX
            ? _appConfig.MAP_ZOOM_MAX
            : DEFAULT_MAP_ZOOM_MAX
        }
      >
        {/* set basemap layers here: */}
        <TileLayer
          key={_currentTheme} // Force re-mount when theme changes
          className="map-tiles"
          url={getBasemapConfig(_appConfig, _currentTheme)?.url}
          maxNativeZoom={18}
          minNativeZoom={2}
          maxZoom={
            _appConfig.MAP_ZOOM_MAX
              ? _appConfig.MAP_ZOOM_MAX
              : DEFAULT_MAP_ZOOM_MAX
          }
          minZoom={2}
        />
      </MapContainer>
    </div>
  )
}

export default LeafMap
