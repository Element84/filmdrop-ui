import { React, useEffect, useState, useRef } from 'react'
import './LeafMap.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  setMap,
  setmapDrawPolygonHandler,
  setshowMapAttribution
} from '../../redux/slices/mainSlice'
import * as L from 'leaflet'
import 'leaflet-draw'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { SearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import {
  mapClickHandler,
  setMosaicZoomMessage,
  addReferenceLayersToMap
} from '../../utils/mapHelper'
import { setScenesForCartLayer } from '../../utils/dataHelper'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../defaults'

const LeafMap = () => {
  const dispatch = useDispatch()
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  // set map ref to itself with useRef
  const mapRef = useRef()

  const [map, setLocalMap] = useState({})
  const [mapTouched, setmapTouched] = useState(false)

  const mapMarkerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png'
  })

  const searchControl = new SearchControl({
    style: 'button',
    notFoundMessage: 'Sorry, that address could not be found.',
    provider: new OpenStreetMapProvider(),
    marker: {
      icon: mapMarkerIcon
    }
  })

  useEffect(() => {
    if (mapRef) {
      setLocalMap(mapRef.current)
    }
  }, [mapRef.current])

  useEffect(() => {
    setScenesForCartLayer()
  }, [_cartItems])

  useEffect(() => {
    if (map && Object.keys(map).length) {
      // override position of zoom controls
      L.control
        .zoom({
          position: 'topleft'
        })
        .addTo(map)
      // add geosearch/geocoder to map
      map.addControl(searchControl)

      // setup custom panes for results
      map.createPane('searchResults')
      map.getPane('searchResults').style.zIndex = 600

      map.createPane('imagery')
      map.getPane('imagery').style.zIndex = 650
      map.getPane('imagery').style.pointerEvents = 'none'

      map.createPane('drawPane')
      map.getPane('drawPane').style.zIndex = 700

      // override existing panes for draw controls
      map.getPane('overlayPane').style.zIndex = 700
      map.getPane('markerPane').style.zIndex = 700

      // setup max map bounds
      const southWest = L.latLng(-90, -180)
      const northEast = L.latLng(90, 180)
      const bounds = L.latLngBounds(southWest, northEast)
      map.setMaxBounds(bounds)

      map.on('drag', function () {
        map.panInsideBounds(bounds, { animate: false })
      })

      // set up map layers
      const referenceLayerGroup = L.layerGroup().addTo(map)
      referenceLayerGroup.layer_name = 'referenceLayerGroup'

      const resultFootprintsInit = new L.FeatureGroup()
      resultFootprintsInit.addTo(map)
      resultFootprintsInit.layer_name = 'searchResultsLayer'

      const cartFootprintsInit = new L.FeatureGroup()
      cartFootprintsInit.addTo(map)
      cartFootprintsInit.layer_name = 'cartFootprintsLayer'
      cartFootprintsInit.eachLayer(function (layer) {
        layer.on('mouseover', function (e) {
          map.getContainer().style.cursor = 'default'
        })
        layer.on('mouseout', function (e) {
          map.getContainer().style.cursor = ''
        })
      })

      const clickedFootprintsHighlightInit = new L.FeatureGroup()
      clickedFootprintsHighlightInit.addTo(map)
      clickedFootprintsHighlightInit.layer_name = 'clickedSceneHighlightLayer'

      const clickedFootprintImageLayerInit = new L.FeatureGroup()
      clickedFootprintImageLayerInit.addTo(map)
      clickedFootprintImageLayerInit.layer_name = 'clickedSceneImageLayer'

      const mosaicImageLayerInit = new L.FeatureGroup()
      mosaicImageLayerInit.addTo(map)
      mosaicImageLayerInit.layer_name = 'mosaicImageLayer'

      const drawBounds = new L.FeatureGroup()
      drawBounds.pane = 'drawPane'
      drawBounds.addTo(map)
      drawBounds.layer_name = 'drawBoundsLayer'

      // eslint-disable-next-line no-new
      new L.Control.Draw({
        edit: {
          featureGroup: drawBounds
        }
      })

      const drawPolygonHandler = new L.Draw.Polygon(map, {
        shapeOptions: { color: '#00C07B' }
      })

      dispatch(setmapDrawPolygonHandler(drawPolygonHandler))

      // set up map events
      map.on('zoomend', function () {
        setMosaicZoomMessage()
        if (!mapTouched) {
          setmapTouched(true)
          dispatch(setshowMapAttribution(false))
        }
      })

      map.on('click', mapClickHandler)

      map.on('mousedown', function () {
        if (!mapTouched) {
          setmapTouched(true)
          dispatch(setshowMapAttribution(false))
        }
      })

      // push map into redux state
      dispatch(setMap(map))

      addReferenceLayersToMap()
    }
  }, [map])

  return (
    <div className="LeafMap" data-testid="LeafMap">
      {/* this sets up the base of the map component and a few default params */}
      <MapContainer
        className="mainMap"
        ref={mapRef}
        center={
          _appConfig.MAP_CENTER ? _appConfig.MAP_CENTER : DEFAULT_MAP_CENTER
        }
        zoom={_appConfig.MAP_ZOOM ? _appConfig.MAP_ZOOM : DEFAULT_MAP_ZOOM}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        {/* set basemap layers here: */}
        <TileLayer
          className={_appConfig.BASEMAP_DARK_THEME === false ? '' : 'map-tiles'}
          url={
            _appConfig.BASEMAP_URL ||
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
      </MapContainer>
    </div>
  )
}

export default LeafMap
