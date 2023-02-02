import { React, useEffect, useState, useRef } from 'react'
import './LeafMap.css'

// redux imports
import { useDispatch } from 'react-redux'
// you need to import each action you need to use
import { setMap } from '../../store/slices/mainSlice'

import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'

const LeafMap = () => {
  // set map ref to itself with useRef
  const mapRef = useRef()
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()

  // set up local state
  const [localMap, setLocalMap] = useState({})

  useEffect(() => {
    if (mapRef) {
      setLocalMap(mapRef.current)
    }
    // eslint-disable-next-line
  }, [mapRef.current]);

  useEffect(() => {
    // update the shared map context when the map loads
    dispatch(setMap(localMap))

    // if map full loaded
    if (localMap && Object.keys(localMap).length > 0) {
      // onMapLoaded();
    }

    // eslint-disable-next-line
  }, [localMap]); // this will give a linter error only beacuse setting context API in useEffect, but context has to be set outside

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
      >
        {/* set basemap layers here: */}
        <TileLayer
          className='map-tiles'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  )
}

export default LeafMap
