import { React, useEffect, useState, useRef } from 'react'
import './Search.css'
import {
  envTilerURL,
  constructTilerParams,
  constructMosaicTilerParams,
  constructMosaicAssetVal,
  envMosaicTilerURL
} from './envVarSetup'
import {
  convertDate,
  convertDateForURL,
  debounce,
  setupArrayBbox,
  setupCommaSeparatedBbox,
  setupBounds
} from '../../utils'
import { MIN_ZOOM, MOSAIC_MAX_ITEMS, API_MAX_ITEMS } from '../defaults'

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
  const [clickedFootprintsHighlightLayer, setClickedFootprintsHighlightLayer] =
    useState()

  const dateTimeRef = useRef(dateTimeValue)
  const zoomLevelRef = useRef(0)
  const selectedCollectionRef = useRef(_collectionSelected)
  const showCloudSliderRef = useRef(_showCloudSlider)
  const viewModeRef = useRef(_viewMode)
  const resultFootprintsRef = useRef()
  const clickedFootprintHighlightRef = useRef()
  const clickedFootprintImageLayerRef = useRef()
  const currentImageClickBoundsRef = useRef()
  const currentImageClickedRef = useRef(false)

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
      setClickedFootprintsHighlightLayer(clickedFootprintsHighlightInit)

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
    viewModeRef.current = _viewMode
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
    if (map && Object.keys(map).length > 0) {
      currentImageClickedRef.current = false
      if (clickedFootprintsHighlightLayer)
        clickedFootprintsHighlightLayer.clearLayers()
      processSearch()
    }
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

    // set value to initial click
    if (!currentImageClickBoundsRef.current) {
      currentImageClickBoundsRef.current = clickBounds
    }
    if (clickedFootprintHighlightRef)
      clickedFootprintHighlightRef.current.clearLayers()
    const intersectingFeatures = []

    if (_searchResults !== null) {
      for (const f in _searchResults.features) {
        const feature = _searchResults.features[f]
        const featureBounds = setupBounds(feature.bbox)

        // preserve current image if clicking on the same image
        if (clickBounds.intersects(currentImageClickBoundsRef.current)) {
          currentImageClickedRef.current = true
        } else {
          currentImageClickedRef.current = false
          currentImageClickBoundsRef.current = clickBounds
          if (clickedFootprintsHighlightLayer)
            clickedFootprintsHighlightLayer.clearLayers()
        }

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

  // clears search results and empties out all the layers on the map
  function clearResultsFromMap() {
    // show loading spinner, clear previous results
    batch(() => {
      dispatch(setSearchResults(null))
      dispatch(setClickResults([]))
    })

    // if user does not click on the same image, clear layers
    if (!currentImageClickedRef.current) {
      // only remove layers if the user clicked on a different footprint
      if (clickedFootprintImageLayerRef.current)
        clickedFootprintImageLayerRef.current.clearLayers()
      if (clickedFootprintHighlightRef.current)
        clickedFootprintHighlightRef.current.clearLayers()
    }

    // remove existing footprints from map
    resultFootprintsRef.current.clearLayers()
  }

  const getQueryVal = () => ({ 'eo:cloud_cover': { gte: 0, lte: _cloudCover } })

  async function fetchAPIitems() {
    // build datetime input
    const combinedDateRange = convertDateForURL(dateTimeRef.current)

    // get viewport bounds and setup bbox parameter
    const bbox = setupCommaSeparatedBbox(map)

    const searchParams = new Map([
      ['bbox', bbox],
      ['datetime', combinedDateRange],
      ['collections', selectedCollectionRef.current],
      ['limit', API_MAX_ITEMS]
    ])

    if (showCloudSliderRef.current)
      searchParams.set(
        'query',
        encodeURIComponent(JSON.stringify(getQueryVal()))
      )

    const searchParamsStr = [...searchParams]
      .reduce((obj, x) => {
        obj.push(x.join('='))
        return obj
      }, [])
      .join('&')

    dispatch(setSearchParameters(searchParamsStr))

    const searchURL = `${process.env.REACT_APP_STAC_API_URL}/search?${searchParamsStr}`

    const response = await fetch(searchURL)
    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`
      throw new Error(message)
    }
    const items = await response.json()
    return items
  }

  // search throttle set to 1500ms
  const processSearch = () => debounce(searchAPI(), 1500)

  // function called when search is initiated
  function searchAPI() {
    // clear previous results from map
    clearResultsFromMap()

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

    // fetch search results for parameters
    fetchAPIitems().then((response) => {
      // set search results in store for use in other components
      dispatch(setSearchResults(response))

      // remove loading spinner
      dispatch(setSearchLoading(false))

      // add new footprints to map
      const resultFootprintsFound = L.geoJSON(response, {})
      resultFootprintsFound.addTo(resultFootprintsRef.current)
    })
  }

  // remove old image layer and add new Tiler image layer to map
  function addImageClicked(feature) {
    // show loading spinner
    dispatch(setSearchLoading(true))

    clickedFootprintImageLayerRef.current.clearLayers()
    const featureURL = feature.links[0].href
    const tilerParams = constructTilerParams(selectedCollectionRef.current)

    fetch(featureURL, {
      method: 'GET'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        const tileBounds = setupBounds(json.bbox)

        L.tileLayer(
          `${tilerURL}/stac/tiles/{z}/{x}/{y}.png?url=${featureURL}&${tilerParams}`,
          {
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

  // add mosaic items to map
  function addMosaic() {
    // clear previous results from map
    clearResultsFromMap()

    // show loading spinner
    dispatch(setSearchLoading(true))

    // build date input
    const datetime = convertDate(dateTimeRef.current)

    // get viewport bounds and setup bbox parameter
    const bbox = setupArrayBbox(map)
    const mosaicBounds = setupBounds(bbox)

    const createMosaicBody = {
      stac_api_root: process.env.REACT_APP_STAC_API_URL,
      asset_name: constructMosaicAssetVal(selectedCollectionRef.current),
      collections: [selectedCollectionRef.current],
      datetime,
      bbox,
      max_items: MOSAIC_MAX_ITEMS
    }

    if (showCloudSliderRef.current) createMosaicBody.query = getQueryVal()

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.titiler.stac-api-query+json'
      },
      body: JSON.stringify(createMosaicBody)
    }
    fetch(`${mosaicTilerURL}/mosaicjson/mosaics`, requestOptions)
      .then((r) => r.json())
      .then((body) => {
        const imgFormat = 'png'
        const baseTileLayerHref = body?.links?.find(
          (el) => el.rel === 'tiles'
        )?.href
        const tilerParams = constructMosaicTilerParams(
          selectedCollectionRef.current
        )
        const tileLayerHref = `${baseTileLayerHref}.${imgFormat}?${tilerParams}`

        if (tileLayerHref) {
          L.tileLayer(tileLayerHref, {
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
        }
      })
    // fetch items from API for results notice
    fetchAPIitems().then((response) => {
      dispatch(setSearchResults(response))
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
