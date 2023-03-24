import { React, useEffect, useState, useRef } from 'react'
import './LeafMap.css'

// redux imports
import { useSelector, useDispatch } from 'react-redux'
// you need to import each action you need to use
import { setMap, setMapAttribution } from '../../redux/slices/mainSlice'

import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

const LeafMap = () => {
  // set map ref to itself with useRef
  const mapRef = useRef()
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()
  const _mapAttribution = useSelector((state) => state.mainSlice.mapAttribution)

  // set up local state
  const [map, setLocalMap] = useState({})

  useEffect(() => {
    if (mapRef) {
      setLocalMap(mapRef.current)
    }
    // eslint-disable-next-line
  }, [mapRef.current])

  useEffect(() => {
    // update the shared map context when the map loads
    dispatch(setMap(map))

    // eslint-disable-next-line
  }, [map]) // this will give a linter error only because setting context API in useEffect, but context has to be set outside

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
