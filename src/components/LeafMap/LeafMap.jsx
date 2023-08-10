import { React, useEffect, useState, useRef } from 'react'
import './LeafMap.css'
import { useDispatch, useSelector } from 'react-redux'
import { setMap, setmapDrawPolygonHandler } from '../../redux/slices/mainSlice'
import * as L from 'leaflet'
import 'leaflet-draw'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { SearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import DOMPurify from 'dompurify'
import {
  mapClickHandler,
  mapCallDebounceNewSearch,
  setMosaicZoomMessage
} from '../../utils/mapHelper'
import { setScenesForCartLayer } from '../../utils/dataHelper'

const LeafMap = () => {
  const dispatch = useDispatch()
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _cartItems = useSelector((state) => state.mainSlice.cartItems)
  // set map ref to itself with useRef
  const mapRef = useRef()

  const [map, setLocalMap] = useState({})
  const [mapAttribution, setmapAttribution] = useState('')

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
        mapCallDebounceNewSearch()
        setMosaicZoomMessage()
      })

      map.on('dragend', function () {
        mapCallDebounceNewSearch()
      })

      map.on('click', mapClickHandler)

      // push map into redux state
      dispatch(setMap(map))
    }
  }, [map])

  useEffect(() => {
    if (_appConfig.BASEMAP_HTML_ATTRIBUTION) {
      const output = sanitize(String(_appConfig.BASEMAP_HTML_ATTRIBUTION))
      setmapAttribution(output)
    }
  }, [])

  function sanitize(dirty) {
    const clean = {
      __html: DOMPurify.sanitize(dirty, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: ['a'],
        ALLOWED_ATTR: ['href', 'target']
      })
    }
    return clean
  }

  return (
    <div className="LeafMap" data-testid="LeafMap">
      {/* this sets up the base of the map component and a few default params */}
      <MapContainer
        className="mainMap"
        ref={mapRef}
        center={[30, 0]}
        zoom={3}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        {/* set basemap layers here: */}
        <TileLayer
          className={_appConfig.BASEMAP_URL ? '' : 'map-tiles'}
          url={
            _appConfig.BASEMAP_URL ||
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
      </MapContainer>
      <div className="attributionTooltipContainer">
        <div data-tooltip-id="attribution-tooltip">
          <InfoOutlinedIcon />
        </div>
        <Tooltip id="attribution-tooltip" place="left" clickable="true">
          <div className="mapAttribution leaflet-control-attribution leaflet-control">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="8"
              viewBox="0 0 12 8"
              className="leaflet-attribution-flag"
            >
              <path fill="#4C7BE1" d="M0 0h12v4H0z"></path>
              <path fill="#FFD500" d="M0 4h12v3H0z"></path>
              <path fill="#E0BC00" d="M0 7h12v1H0z"></path>
            </svg>{' '}
            <a
              href="https://leafletjs.com"
              title="A JavaScript library for interactive maps"
            >
              Leaflet
            </a>{' '}
            <span aria-hidden="true">|</span>{' '}
            {_appConfig.BASEMAP_URL && mapAttribution ? (
              <span dangerouslySetInnerHTML={mapAttribution}></span>
            ) : (
              <span>
                &copy;{' '}
                <a href="https://www.openstreetmap.org/copyright">
                  OpenStreetMap
                </a>
              </span>
            )}
          </div>
        </Tooltip>
      </div>
    </div>
  )
}

export default LeafMap
