import { React, useEffect, useState, useRef } from 'react'
import './LeafMap.css'

// redux imports
import { useDispatch } from 'react-redux'
import { setMap, setTypeOfSearch } from '../../redux/slices/mainSlice'

import * as L from 'leaflet'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { SearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

import {
  VITE_BASEMAP_URL,
  VITE_BASEMAP_HTML_ATTRIBUTION
} from '../../assets/config.js'

import DOMPurify from 'dompurify'

import { mapClickHandler } from '../../utils/mapHelper'

const LeafMap = () => {
  // set map ref to itself with useRef
  const mapRef = useRef()

  const dispatch = useDispatch()

  // set up local state
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
    style: 'bar',
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
    if (map && Object.keys(map).length) {
      // add geosearch function
      map.addControl(searchControl)

      // override position of zoom controls
      L.control
        .zoom({
          position: 'topleft'
        })
        .addTo(map)

      // setup custom pane for tiler image result
      map.createPane('imagery')
      map.getPane('imagery').style.zIndex = 650
      map.getPane('imagery').style.pointerEvents = 'none'

      // setup max map bounds
      const southWest = L.latLng(-90, -180)
      const northEast = L.latLng(90, 180)
      const bounds = L.latLngBounds(southWest, northEast)
      map.setMaxBounds(bounds)

      map.on('drag', function () {
        map.panInsideBounds(bounds, { animate: false })
      })

      // map init

      const resultFootprintsInit = new L.FeatureGroup()
      resultFootprintsInit.addTo(map)
      resultFootprintsInit.layer_name = 'searchResultsLayer'

      // set up layerGroup for highlight footprints and add to map
      const clickedFootprintsHighlightInit = new L.FeatureGroup()
      clickedFootprintsHighlightInit.addTo(map)
      clickedFootprintsHighlightInit.layer_name = 'clickedSceneHighlightLayer'

      // set up layerGroup for image layer and add to map
      const clickedFootprintImageLayerInit = new L.FeatureGroup()
      clickedFootprintImageLayerInit.addTo(map)
      clickedFootprintImageLayerInit.layer_name = 'clickedSceneImageLayer'

      // set initial zoom state here? // setZoomLevelValue(map.getZoom())

      map.on('zoomend', function () {
        // TODO: setZoomLevel in redux state // setZoomLevelValue(map.getZoom())
        // processSearch()
        // dispatch(setSearchType());
        console.log('zoomend')
      })

      map.on('dragend', function () {
        // processSearch()
        console.log('dragend')
      })

      map.on('click', mapClickHandler)

      // update the shared map context when the map loads
      dispatch(setMap(map))
    }
  }, [map])

  useEffect(() => {
    if (VITE_BASEMAP_HTML_ATTRIBUTION) {
      const output = sanitize(String(VITE_BASEMAP_HTML_ATTRIBUTION))
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
        center={[30, -0]}
        zoom={3}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        {/* set basemap layers here: */}
        <TileLayer
          className={VITE_BASEMAP_URL ? '' : 'map-tiles'}
          url={
            VITE_BASEMAP_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
      </MapContainer>
      <div className="attributionTooltipContainer">
        <a data-tooltip-id="attribution-tooltip">
          <InfoOutlinedIcon />
        </a>
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
            {VITE_BASEMAP_URL && mapAttribution ? (
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
