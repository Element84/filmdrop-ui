import { React, useEffect, useState, useRef } from 'react'
import './LeafMap.css'

// redux imports
import { useSelector, useDispatch } from 'react-redux'
import { setMap, setMapAttribution } from '../../redux/slices/mainSlice'

import * as L from 'leaflet'
import 'leaflet-draw'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { SearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

const LeafMap = () => {
  // set map ref to itself with useRef
  const mapRef = useRef()

  const dispatch = useDispatch()
  const _mapAttribution = useSelector((state) => state.mainSlice.mapAttribution)

  // set up local state
  const [map, setLocalMap] = useState({})

  // override leaflet draw tooltips
  // eslint-disable-next-line no-import-assign
  L.drawLocal = {
    draw: {
      handlers: {
        rectangle: {
          tooltip: {
            start: 'Click and drag to draw bounding box.'
          }
        },
        simpleshape: {
          tooltip: {
            end: 'Release mouse to finish drawing.'
          }
        }
      }
    }
  }

  const mapMarkerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png'
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
    if (map && Object.keys(map).length > 0) {
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

      // update the shared map context when the map loads
      dispatch(setMap(map))
    }
  }, [map])

  useEffect(() => {
    const defaultMapAttribution = [
      {
        label: '',
        linkText: 'OpenStreetMap',
        linkUrl: 'https://www.openstreetmap.org/copyright',
        postText: 'contributors'
      }
    ]
    dispatch(setMapAttribution(defaultMapAttribution))
  }, [])

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
          className="map-tiles"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
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
            <span aria-hidden="true">|</span>
            {_mapAttribution &&
              _mapAttribution.map((item) => (
                <span key={item.label}>
                  {item.label} &copy; <a href={item.linkUrl}>{item.linkText}</a>{' '}
                  {item.postText}
                </span>
              ))}
          </div>
        </Tooltip>
      </div>
    </div>
  )
}

export default LeafMap
