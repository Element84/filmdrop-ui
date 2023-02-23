import { React, useEffect, useState } from 'react'
import './Search.css'
import { envTilerURL, constructAssetsURL } from './envVarSetup'
import { MIN_ZOOM } from '../defaults'

// redux imports
import { useSelector, useDispatch } from 'react-redux'
// you need to import each action you need to use
import {
  setSearchResults,
  setDateTime,
  setClickResults,
  setSearchLoading,
  setSearchParameters,
  setShowZoomNotice
} from '../../redux/slices/mainSlice'

import * as L from 'leaflet'
import 'leaflet-draw'
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'

const Search = () => {
  const _map = useSelector((state) => state.mainSlice.map)
  // const _cloudCover = useSelector((state) => state.mainSlice.cloudCover)
  const _collectionSelected = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  const _currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  )
  const tilerURL = envTilerURL
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()

  // set up map state
  const map = _map

  // set default date range (current minus 24hrs * 60min * 60sec * 1000ms per day * 14 days)
  const twoWeeksAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 * 14)

  // set up local state
  const [dateTimeValue, setDateTimeValue] = useState([twoWeeksAgo, new Date()])
  const [resultFootprints, setResultFootprints] = useState()
  const [clickedFootprintHighlights, setClickedFootprintsHighlight] = useState()
  const [clickedFootprintsImageLayer, setClickedFootprintsImageLayer] =
    useState()
  const [collectionError, setCollectionError] = useState(false)
  const [zoomLevel, setZoomLevel] = useState()

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

  // when map is set (will only happen once), set up more controls/layers
  useEffect(() => {
    // if map full loaded
    if (map && Object.keys(map).length > 0) {
      // override position of zoom controls
      L.control
        .zoom({
          position: 'topleft'
        })
        .addTo(map)

      // set up layerGroup for footprints and add to map
      const resultFootprintsInit = new L.FeatureGroup()
      setResultFootprints(resultFootprintsInit)
      resultFootprintsInit.addTo(map)

      // set up layerGroup for highlight footprints and add to map
      const clickedFootprintsHighlightInit = new L.FeatureGroup()
      setClickedFootprintsHighlight(clickedFootprintsHighlightInit)
      clickedFootprintsHighlightInit.addTo(map)

      // set up layerGroup for image layer and add to map
      const clickedFootprintsImageLayerInit = new L.FeatureGroup()
      setClickedFootprintsImageLayer(clickedFootprintsImageLayerInit)
      clickedFootprintsImageLayerInit.addTo(map)

      // set initial zoom level
      setZoomLevel(map.getZoom())

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

      map.on('click', mapClickHandler)

      map.on('zoomend', function () {
        setZoomLevel(map.getZoom())
      })
    }
  }, [map])

  // when zoom level changes, set in global store to hide/show zoom notice
  useEffect(() => {
    if (zoomLevel >= MIN_ZOOM) {
      dispatch(setShowZoomNotice(false))
    } else {
      dispatch(setShowZoomNotice(true))
    }
  }, [zoomLevel])

  // when dataTime changes, set in global store
  useEffect(() => {
    dispatch(setDateTime(dateTimeValue))
  }, [dateTimeValue])

  // when search results change, if map loaded, set new mapClickHandler
  useEffect(() => {
    if (map && Object.keys(map).length > 0 && _searchResults !== null) {
      map.on('click', mapClickHandler)
    }
  }, [_searchResults])

  // when currentPopupResult set, add image layer to map
  useEffect(() => {
    if (_currentPopupResult !== null) {
      if (clickedFootprintsImageLayer) {
        clickedFootprintsImageLayer.clearLayers()
      }
      // call add new image layer to map function
      addImageClicked(_currentPopupResult)
    }
  }, [_currentPopupResult])

  // when a user clicks on a search result tile, highlight the tile
  // or remove the image preview and clear popup result if
  // the user clicks just on the map
  function mapClickHandler(e) {
    const clickBounds = L.latLngBounds(e.latlng, e.latlng)

    if (clickedFootprintHighlights) {
      clickedFootprintHighlights.clearLayers()
    }
    if (clickedFootprintsImageLayer) {
      clickedFootprintsImageLayer.clearLayers()
    }

    const intersectingFeatures = []

    if (_searchResults !== null) {
      for (const f in _searchResults.features) {
        const feature = _searchResults.features[f]
        const bounds = feature.bbox
        const latlng1 = L.latLng(bounds[1], bounds[0])
        const latlng2 = L.latLng(bounds[3], bounds[2])
        const featureBounds = L.latLngBounds(latlng1, latlng2)
        if (featureBounds && clickBounds.intersects(featureBounds)) {
          intersectingFeatures.push(feature)
          // add features to clickedHighlight layer
          const clickedFootprintsSelectedStyle = {
            color: '#ff7800',
            weight: 5,
            opacity: 0.65,
            fillOpacity: 0
          }
          const clickedFootprintsFound = L.geoJSON(feature, {
            style: clickedFootprintsSelectedStyle
          })
          clickedFootprintsFound.id = 'clickedFootprintHighlights'
          clickedFootprintsFound.addTo(clickedFootprintHighlights)
        }
      }
    }

    // if at least one feature found, push to store else clear store
    if (intersectingFeatures.length > 0) {
      dispatch(setClickResults(intersectingFeatures))
      // push to store
    } else {
      // clear store
      dispatch(setClickResults([]))
    }
  }

  // function to convert DateTime Range Picker values to STAC compliant format
  function convertDateTimeForAPI(dateTime) {
    const dateString =
      dateTime.getUTCFullYear() +
      '-' +
      ('0' + (dateTime.getUTCMonth() + 1)).slice(-2) +
      '-' +
      ('0' + dateTime.getUTCDate()).slice(-2) +
      'T' +
      ('0' + dateTime.getUTCHours()).slice(-2) +
      ':' +
      ('0' + dateTime.getUTCMinutes()).slice(-2) +
      ':' +
      ('0' + dateTime.getUTCSeconds()).slice(-2) +
      'Z'
    // format dateTime here
    return dateString
  }

  // remove old footprints from map
  function removeFootprints() {
    resultFootprints.eachLayer(function (layer) {
      map.removeLayer(layer)
    })
  }

  // function called when search button clicked
  function searchAPI() {
    // get viewport bounds
    const viewportBounds = map.getBounds()

    // if the zoom level is too high, abort search
    if (zoomLevel < MIN_ZOOM) return

    // if the date time field is empty, abort search
    if (!dateTimeValue) return

    // if a valid collection is not selected, abort search
    if (!_collectionSelected) {
      removeFootprints()
      clickedFootprintsImageLayer.clearLayers()
      clickedFootprintHighlights.clearLayers()
      setCollectionError(true)
      return
    } else {
      setCollectionError(false)
    }

    // remove clicked footprint highlight
    if (clickedFootprintHighlights) {
      clickedFootprintHighlights.clearLayers()
    }

    // remove image layer
    if (clickedFootprintsImageLayer) {
      clickedFootprintsImageLayer.clearLayers()
    }

    // remove existing footprints from map
    removeFootprints()

    // show loading spinner
    dispatch(setSearchLoading(true))
    dispatch(setSearchResults(null))
    dispatch(setClickResults([]))

    // build datetime input
    const combinedDateRange =
      convertDateTimeForAPI(dateTimeValue[0]) +
      '%2F' +
      convertDateTimeForAPI(dateTimeValue[1])

    const bbox = [
      viewportBounds._southWest.lng,
      viewportBounds._southWest.lat,
      viewportBounds._northEast.lng,
      viewportBounds._northEast.lat
    ].join(',')

    const searchParametersString = [
      `bbox=${bbox}`,
      // `query=%7B"eo%3Acloud_cover"%3A%7B"gte"%3A0,"lte"%3A${_cloudCover}%7D%7D`,
      `datetime=${combinedDateRange}`,
      `collections=${_collectionSelected}`,
      'limit=100'
    ].join('&')

    // set search parameter state
    dispatch(setSearchParameters(searchParametersString))

    // build search URL
    const searchURL = `${process.env.REACT_APP_STAC_API_URL}/search?${searchParametersString}`

    // fetch search results for parameters
    fetch(searchURL, {
      method: 'GET'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        // set search results in store for use in other components
        dispatch(setSearchResults(json))

        // remove loading spinner
        dispatch(setSearchLoading(false))

        // add new footprints to map
        const resultFootprintsFound = L.geoJSON(json, {})
        resultFootprints.id = 'resultFootprints'
        resultFootprintsFound.addTo(resultFootprints)
      })
  }

  // function to remove old image layer and add new Tiler image layer to map
  function addImageClicked(feature) {
    // show loading spinner
    dispatch(setSearchLoading(true))

    clickedFootprintsImageLayer.clearLayers()
    const featureURL = feature.links[0].href
    const assetURL = constructAssetsURL(_collectionSelected)

    fetch(featureURL, {
      method: 'GET'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        const corner1 = L.latLng(json.bbox[1], json.bbox[0])
        const corner2 = L.latLng(json.bbox[3], json.bbox[2])
        const tileBounds = L.latLngBounds(corner1, corner2)
        map.fitBounds(tileBounds, { padding: [100, 100] })

        L.tileLayer(
          tilerURL +
            '/stac/tiles/{z}/{x}/{y}.png?&url=' +
            featureURL +
            assetURL,
          {
            attribution: '©OpenStreetMap',
            tileSize: 256,
            bounds: tileBounds,
            pane: 'imagery'
          }
        )
          .addTo(clickedFootprintsImageLayer)
          .on('load', function () {
            // hide loading spinner
            dispatch(setSearchLoading(false))
          })
          .on('tileerror', function () {
            console.log('Tile Error')
          })
      })
  }

  return (
    <div className="Search" data-testid="Search">
      <div className="searchContainer">
        <label>
          Select Date & Time Range{' '}
          {!dateTimeValue && (
            <span className="error-true">
              <em>Required</em>
            </span>
          )}
        </label>
        <DateTimeRangePicker
          className="dateTimePicker"
          onChange={setDateTimeValue}
          format={'yy-MM-dd HH:mm'}
          maxDate={new Date()}
          required={true}
          value={dateTimeValue}
        ></DateTimeRangePicker>
      </div>
      <div className="searchContainer">
        <CloudSlider></CloudSlider>
      </div>
      <div
        className={`searchContainer collection-dropdown error-${collectionError}`}
      >
        <CollectionDropdown error={collectionError}></CollectionDropdown>
      </div>
      <button className="searchButton" onClick={() => searchAPI()}>
        Search
      </button>
    </div>
  )
}

export default Search
