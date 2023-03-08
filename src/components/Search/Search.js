import { React, useEffect, useState, useRef } from 'react'
import './Search.css'
import {
  envTilerURL,
  constructTilerParams,
  envMosaicTilerURL
} from './envVarSetup'
import { convertDateTimeForAPI, debounce } from '../../utils'
import { MIN_ZOOM } from '../defaults'

import { useSelector, useDispatch, batch } from 'react-redux'
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
import ViewSelector from '../ViewSelector/ViewSelector'

const Search = () => {
  const dispatch = useDispatch()
  const _map = useSelector((state) => state.mainSlice.map)
  const _cloudCover = useSelector((state) => state.mainSlice.cloudCover)
  const _showCloudSlider = useSelector(
    (state) => state.mainSlice.showCloudSlider
  )
  const _collectionSelected = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)
  const _searchResults = useSelector((state) => state.mainSlice.searchResults)
  const _currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  )
  const tilerURL = envTilerURL
  const mosaicTilerURL = envMosaicTilerURL

  // set up map state
  const map = _map

  // set default date range (current minus 24hrs * 60min * 60sec * 1000ms per day * 14 days)
  const twoWeeksAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 * 14)

  // set up local state
  const [dateTimeValue, setDateTimeValue] = useState([twoWeeksAgo, new Date()])
  const [collectionError, setCollectionError] = useState(false)
  const [zoomLevelValue, setZoomLevelValue] = useState(0)

  const dateTimeRef = useRef(dateTimeValue)
  const zoomLevelRef = useRef(0)
  const selectedCollectionRef = useRef(_collectionSelected)
  const showCloudSliderRef = useRef(_showCloudSlider)
  const viewModeRef = useRef(_viewMode)

  const resultFootprintsRef = useRef()
  const clickedFootprintHighlightRef = useRef()
  const clickedFootprintImageLayerRef = useRef()

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
      resultFootprintsInit.addTo(map)
      resultFootprintsInit.id = 'resultFootprints'
      resultFootprintsRef.current = resultFootprintsInit

      // set up layerGroup for highlight footprints and add to map
      const clickedFootprintsHighlightInit = new L.FeatureGroup()
      clickedFootprintsHighlightInit.addTo(map)
      clickedFootprintsHighlightInit.id = 'clickedFootprintHighlight'
      clickedFootprintHighlightRef.current = clickedFootprintsHighlightInit

      // set up layerGroup for image layer and add to map
      const clickedFootprintImageLayerInit = new L.FeatureGroup()
      clickedFootprintImageLayerInit.addTo(map)
      clickedFootprintImageLayerInit.id = 'clickedFootprintImageLayer'
      clickedFootprintImageLayerRef.current = clickedFootprintImageLayerInit

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

      map.on('zoomend', function () {
        zoomLevelRef.current = map.getZoom()
        setZoomLevelValue(map.getZoom())
        processSearch()
      })

      map.on('dragend', function () {
        processSearch()
      })

      map.on('click', mapClickHandler)

      // initiate first search on load
      processSearch()
    }
  }, [map])

  // when zoom level changes, set in global store to hide/show zoom notice
  // and perform search if within zoom limits
  useEffect(() => {
    if (zoomLevelValue >= MIN_ZOOM || _viewMode === 'scene') {
      dispatch(setShowZoomNotice(false))
    } else {
      dispatch(setShowZoomNotice(true))
    }
  }, [zoomLevelValue, _viewMode])

  // when there are changes, update store and perform new search
  useEffect(() => {
    dispatch(setDateTime(dateTimeValue))
    dateTimeRef.current = dateTimeValue
    selectedCollectionRef.current = _collectionSelected
    showCloudSliderRef.current = _showCloudSlider
    viewModeRef.current = _viewMode
    if (map && Object.keys(map).length > 0) processSearch()
  }, [
    dateTimeValue,
    _cloudCover,
    _collectionSelected,
    _showCloudSlider,
    _viewMode
  ])

  // when search results change, if map loaded, set new mapClickHandler
  useEffect(() => {
    if (map && Object.keys(map).length > 0 && _searchResults !== null) {
      map.on('click', mapClickHandler)
    }
  }, [_searchResults])

  // when currentPopupResult set, add image layer to map
  useEffect(() => {
    if (_currentPopupResult !== null) {
      clickedFootprintImageLayerRef.current.clearLayers()

      // call add new tiler image layer to map function
      addImageClicked(_currentPopupResult)
    }
  }, [_currentPopupResult])

  // when a user clicks on a search result tile, highlight the tile
  // or remove the image preview and clear popup result if
  // the user clicks just on the map
  function mapClickHandler(e) {
    // if double-clicking the image, zoom in, otherwise process click
    // disable click function in mosaic view
    if (e.originalEvent.detail === 2 || viewModeRef.current === 'mosaic') return

    const clickBounds = L.latLngBounds(e.latlng, e.latlng)

    clickedFootprintHighlightRef.current.clearLayers()
    clickedFootprintImageLayerRef.current.clearLayers()

    const intersectingFeatures = []

    if (_searchResults !== null) {
      for (const f in _searchResults.features) {
        const feature = _searchResults.features[f]
        const bounds = feature.bbox
        const swCorner = L.latLng(bounds[1], bounds[0])
        const neCorner = L.latLng(bounds[3], bounds[2])
        const featureBounds = L.latLngBounds(swCorner, neCorner)
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
          clickedFootprintsFound.addTo(clickedFootprintHighlightRef.current)
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

  function clearResults() {
    // show loading spinner, clear previous results
    batch(() => {
      dispatch(setSearchResults(null))
      dispatch(setClickResults([]))
    })

    // remove clicked footprint highlight
    if (clickedFootprintHighlightRef)
      clickedFootprintHighlightRef.current.clearLayers()

    // remove image layer
    if (clickedFootprintImageLayerRef)
      clickedFootprintImageLayerRef.current.clearLayers()

    // remove existing footprints from map
    resultFootprintsRef.current.eachLayer(function (layer) {
      resultFootprintsRef.current.removeLayer(layer)
    })
  }

  // search throttle set to 1500ms
  const processSearch = () => debounce(searchAPI(), 1500)

  // function called when search is initiated
  function searchAPI() {
    // clear previous results from map
    clearResults()

    // if the zoom level is too high in mosaic view, abort search
    // otherwise, move to the mosaic search
    if (zoomLevelRef.current < MIN_ZOOM && viewModeRef.current === 'mosaic') {
      return
    } else if (
      zoomLevelRef.current >= MIN_ZOOM &&
      viewModeRef.current === 'mosaic'
    ) {
      addMosaic()
      return
    }

    // if a valid collection is not selected, abort search
    if (!_collectionSelected) {
      setCollectionError(true)
      return
    } else {
      setCollectionError(false)
    }

    // if the date time field is empty, abort search
    if (!dateTimeValue) return

    dispatch(setSearchLoading(true))

    // build datetime input
    const combinedDateRange =
      convertDateTimeForAPI(dateTimeRef.current[0]) +
      '%2F' +
      convertDateTimeForAPI(dateTimeRef.current[1])

    // get viewport bounds and setup bbox parameter
    const viewportBounds = map.getBounds()
    const bbox = [
      viewportBounds._southWest.lng,
      viewportBounds._southWest.lat,
      viewportBounds._northEast.lng,
      viewportBounds._northEast.lat
    ].join(',')
    let cloudCover = ''
    if (showCloudSliderRef.current)
      cloudCover = `query=%7B"eo%3Acloud_cover"%3A%7B"gte"%3A0,"lte"%3A${_cloudCover}%7D%7D`

    const searchParametersString = [
      `bbox=${bbox}`,
      `${cloudCover}`,
      `datetime=${combinedDateRange}`,
      `collections=${selectedCollectionRef.current}`,
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
        resultFootprintsFound.addTo(resultFootprintsRef.current)
      })
  }

  // function to remove old image layer and add new Tiler image layer to map
  function addImageClicked(feature) {
    // show loading spinner
    dispatch(setSearchLoading(true))

    clickedFootprintImageLayerRef.current.clearLayers()
    const featureURL = feature.links[0].href
    const tilerParams = constructTilerParams(_collectionSelected)

    fetch(featureURL, {
      method: 'GET'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        const swCorner = L.latLng(json.bbox[1], json.bbox[0])
        const neCorner = L.latLng(json.bbox[3], json.bbox[2])
        const tileBounds = L.latLngBounds(swCorner, neCorner)

        L.tileLayer(
          `${tilerURL}/stac/tiles/{z}/{x}/{y}.png?url=${featureURL}${tilerParams}`,
          {
            attribution: '©OpenStreetMap',
            tileSize: 256,
            bounds: tileBounds,
            pane: 'imagery'
          }
        )
          .addTo(clickedFootprintImageLayerRef.current)
          .on('load', function () {
            // hide loading spinner
            dispatch(setSearchLoading(false))
          })
          .on('tileerror', function () {
            console.log('Tile Error')
          })
      })
  }

  // function to remove old image layer and add new Tiler image layer to map
  function addMosaic() {
    // clear previous results from map
    clearResults()

    // show loading spinner
    dispatch(setSearchLoading(true))

    // const tilerParams = constructTilerParams(_collectionSelected)

    // build date input
    const datetime =
      convertDateTimeForAPI(dateTimeRef.current[0]) +
      '/' +
      convertDateTimeForAPI(dateTimeRef.current[1])

    // get viewport bounds and setup bbox parameter
    const viewportBounds = map.getBounds()
    const bbox = [
      viewportBounds._southWest.lng,
      viewportBounds._southWest.lat,
      viewportBounds._northEast.lng,
      viewportBounds._northEast.lat
    ]

    const swCorner = L.latLng(bbox[1], bbox[0])
    const neCorner = L.latLng(bbox[3], bbox[2])
    const mosaicBounds = L.latLngBounds(swCorner, neCorner)

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.titiler.stac-api-query+json'
      },
      body: JSON.stringify({
        stac_api_root: process.env.REACT_APP_STAC_API_URL,
        asset_name: 'visual', // todo: use first entry in assets config
        collections: [selectedCollectionRef.current],
        datetime,
        bbox,
        max_items: 10
        // todo: query w/ cloud_cover, as a JSON object rather than a url-encoded string
      })
    }
    fetch(`${mosaicTilerURL}/mosaicjson/mosaics`, requestOptions)
      .then((r) => r.json())
      .then((body) => {
        const tileHref = body?.links?.find((el) => el.rel === 'tiles').href
        L.tileLayer(`${tileHref}`, {
          attribution: '©OpenStreetMap',
          tileSize: 256,
          bounds: mosaicBounds,
          pane: 'imagery'
        })
          .addTo(clickedFootprintImageLayerRef.current)
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
      <div
        className={`searchContainer collectionDropdown error-${collectionError}`}
      >
        <CollectionDropdown error={collectionError}></CollectionDropdown>
      </div>
      <div className="searchContainer datePicker">
        <label>
          Date Range{' '}
          {!dateTimeValue && (
            <span className="error-true">
              <em>Required</em>
            </span>
          )}
        </label>
        <DateTimeRangePicker
          className="dateTimePicker"
          onChange={setDateTimeValue}
          format={'yy-MM-dd'}
          maxDate={new Date()}
          required={true}
          value={dateTimeValue}
        ></DateTimeRangePicker>
      </div>
      <div className="searchContainer cloudSlider">
        <CloudSlider></CloudSlider>
      </div>
      {mosaicTilerURL && (
        <div className="searchContainer">
          <ViewSelector></ViewSelector>
        </div>
      )}
    </div>
  )
}

export default Search
