import { React, useEffect, useState, useRef } from 'react'
import './Search.css'
import {
  envSceneTilerURL,
  constructSceneTilerParams,
  envMosaicTilerURL,
  constructMosaicTilerParams,
  constructMosaicAssetVal
} from './envVarSetup'
import {
  convertDate,
  debounce,
  setupArrayBbox,
  setupBounds,
  colorMap
} from '../../utils'
import { MOSAIC_MIN_ZOOM, MOSAIC_MAX_ITEMS, SearchTypes } from '../defaults'
import {
  fetchAPIitems,
  fetchGridCodeItems,
  fetchGeoHexItems
} from './SearchAPI'
import { getSearchParams, getCloudCoverQueryVal } from './SearchParameters'
import { setSearchType } from './SearchTypeSetup'

import { useSelector, useDispatch } from 'react-redux'
import {
  setSearchResults,
  setClickResults,
  setSearchLoading,
  setShowZoomNotice,
  setZoomLevelNeeded,
  setTypeOfSearch,
  setSearchParameters,
  setShowPopupModal
} from '../../redux/slices/mainSlice'

import * as L from 'leaflet'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Switch from '@mui/material/Switch'

import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker'
import CloudSlider from '../CloudSlider/CloudSlider'
import CollectionDropdown from '../CollectionDropdown/CollectionDropdown'
import ViewSelector from '../ViewSelector/ViewSelector'
import { VITE_STAC_API_URL } from '../../assets/config.js'

const Search = () => {
  const dispatch = useDispatch()
  const _showAppLoading = useSelector((state) => state.mainSlice.showAppLoading)
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
  const _sarPolarizations = useSelector(
    (state) => state.mainSlice.sarPolarizations
  )
  const _temporalData = useSelector(
    (state) => state.mainSlice.collectionTemporalData
  )
  const _spatialData = useSelector(
    (state) => state.mainSlice.collectionSpatialData
  )
  const _fullCollectionData = useSelector(
    (state) => state.mainSlice.fullCollectionData
  )
  const sceneTilerURL = envSceneTilerURL
  const mosaicTilerURL = envMosaicTilerURL
  let colors = null

  // set up map state
  const map = _map

  // set default date range (current minus 24hrs * 60min * 60sec * 1000ms per day * 14 days)
  const twoWeeksAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 * 14)

  // set up local state
  const [datePickerValue, setDatePickerValue] = useState([
    twoWeeksAgo,
    new Date()
  ])
  const [collectionError, setCollectionError] = useState(false)
  const [zoomLevelValue, setZoomLevelValue] = useState(0)
  const [clickedFootprintsHighlightLayer, setClickedFootprintsHighlightLayer] =
    useState()
  const [autoSearchSwitch, setAutoSearchSwitch] = useState(false)

  const searchResultsRef = useRef(_searchResults)
  const datePickerRef = useRef(datePickerValue)
  const zoomLevelRef = useRef(0)
  const fullCollectionDataRef = useRef(_fullCollectionData)
  const showAppLoadingRef = useRef(_showAppLoading)
  const selectedCollectionRef = useRef(_collectionSelected)
  const showCloudSliderRef = useRef(_showCloudSlider)
  const sarPolarizationsRef = useRef(_sarPolarizations)
  const viewModeRef = useRef(_viewMode)
  const resultFootprintsRef = useRef()
  const clickedFootprintHighlightRef = useRef()
  const clickedFootprintImageLayerRef = useRef()
  const currentImageClickedRef = useRef(false)
  const pickerMinDateRef = useRef()
  const collectionStartDateRef = useRef()
  const collectionEndDateRef = useRef(new Date())
  const searchTypeRef = useRef(SearchTypes.Scene)
  const autoSearchSwitchRef = useRef(false)
  const gridCellDataRef = useRef(null)

  // when map is set (will only happen once), set up layers and map functions
  useEffect(() => {
    // if map full loaded
    if (map && Object.keys(map).length > 0) {
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

  // fetch grid cell json data files
  useEffect(() => {
    const cache = {}
    const dataFiles = ['cdem', 'doqq', 'mgrs', 'wrs2']
    const fetchData = async (fileName) => {
      if (!cache[fileName]) {
        const response = await fetch(`/data/${fileName}.json`)
        if (!response.ok) {
          throw new Error(`An error has occurred: ${response.status}`)
        }
        const data = await response.json()
        cache[fileName] = data // set response in gridCellData cache;
      }
    }
    dataFiles.map((d) => fetchData(d))
    gridCellDataRef.current = cache
  }, [])

  // when zoom level changes, set in global store to hide/show zoom notice
  // and perform search if within zoom limits
  useEffect(() => {
    viewModeRef.current = _viewMode
    if (zoomLevelValue >= MOSAIC_MIN_ZOOM || _viewMode === 'scene') {
      dispatch(setShowZoomNotice(false))
    } else {
      dispatch(setShowZoomNotice(true))
    }
  }, [zoomLevelValue, _viewMode])

  // when there are changes, update store and perform new search
  useEffect(() => {
    datePickerRef.current = datePickerValue
    selectedCollectionRef.current = _collectionSelected
    showCloudSliderRef.current = _showCloudSlider
    viewModeRef.current = _viewMode
    showAppLoadingRef.current = _showAppLoading
    if (map && Object.keys(map).length > 0) {
      currentImageClickedRef.current = false
      if (clickedFootprintsHighlightLayer) {
        clickedFootprintsHighlightLayer.clearLayers()
      }
      processSearch()
    }
  }, [
    datePickerValue,
    _cloudCover,
    _collectionSelected,
    _showCloudSlider,
    _viewMode,
    _showAppLoading
  ])

  useEffect(() => {
    if (_fullCollectionData) {
      fullCollectionDataRef.current = _fullCollectionData
    }
  }, [_fullCollectionData])

  useEffect(() => {
    if (_sarPolarizations) {
      sarPolarizationsRef.current = true
    } else {
      sarPolarizationsRef.current = false
    }
  }, [_sarPolarizations])

  // setup datepicker based on collection temporal data
  useEffect(() => {
    if (_temporalData) {
      collectionStartDateRef.current = new Date(_temporalData[0])
      if (_temporalData.length >= 1 && _temporalData[1]) {
        collectionEndDateRef.current = new Date(_temporalData[1])
      } else {
        collectionEndDateRef.current = new Date()
      }
      pickerMinDateRef.current = collectionStartDateRef.current

      if (datePickerValue) {
        if (
          // set picker if picker date range falls outside of collection date range
          (datePickerValue[0] < collectionStartDateRef.current &&
            datePickerValue[1] < collectionStartDateRef.current) ||
          (datePickerValue[0] > collectionEndDateRef.current &&
            datePickerValue[1] > collectionEndDateRef.current)
        ) {
          setDatePickerValue([
            collectionStartDateRef.current,
            collectionEndDateRef.current
          ])
        }
      } else {
        // set date range to collection date range if date picker is empty
        setDatePickerValue([
          collectionStartDateRef.current,
          collectionEndDateRef.current
        ])
      }
    }
  }, [_collectionSelected, _temporalData])

  // setup viewport based on collection spatial data
  useEffect(() => {
    // move viewport if current bbox is outside of spatial metadata
    if (_spatialData && _spatialData.length >= 1) {
      const collectionBounds = setupBounds(_spatialData)
      const viewportBounds = setupBounds(setupArrayBbox(map))
      if (!collectionBounds.contains(viewportBounds)) {
        map.fitBounds(collectionBounds)
      }
    }
  }, [_collectionSelected, _spatialData])

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

  const handleSwitchChange = (event) => {
    setAutoSearchSwitch(event.target.checked)
    autoSearchSwitchRef.current = event.target.checked
    if (event.target.checked) {
      processSearch()
    }
  }

  // when a user clicks on a search result tile, highlight the tile
  // or remove the image preview and clear popup result if
  // the user clicks just on the map
  async function mapClickHandler(e) {
    // if double-clicking the image, zoom in, otherwise process click
    // disable click function in mosaic view
    if (
      e.originalEvent.detail === 2 ||
      viewModeRef.current === 'mosaic' ||
      searchTypeRef.current === SearchTypes.GeoHex
    ) {
      return
    }

    const clickBounds = L.latLngBounds(e.latlng, e.latlng)

    if (clickedFootprintHighlightRef) {
      clickedFootprintHighlightRef.current.clearLayers()
    }
    if (clickedFootprintImageLayerRef) {
      clickedFootprintImageLayerRef.current.clearLayers()
    }

    // styling for clickedHighlight layer
    const clickedFootprintsSelectedStyle = {
      color: '#ff7800',
      weight: 5,
      opacity: 0.65,
      fillOpacity: 0
    }

    // pull all items from search results that intersect with the click bounds
    let intersectingFeatures = []
    if (searchResultsRef.current !== null) {
      for (const f in searchResultsRef.current.features) {
        const feature = searchResultsRef.current.features[f]
        const featureBounds = L.geoJSON(feature).getBounds()
        if (featureBounds && featureBounds.intersects(clickBounds)) {
          // highlight layer
          const clickedFootprintsFound = L.geoJSON(feature, {
            style: clickedFootprintsSelectedStyle
          })
          clickedFootprintsFound.addTo(clickedFootprintHighlightRef.current)

          if (searchTypeRef.current === SearchTypes.Scene) {
            // if at least one feature found, push to store else clear store
            intersectingFeatures = [...intersectingFeatures, feature]
            if (intersectingFeatures.length > 0) {
              // push to store
              dispatch(setClickResults(intersectingFeatures))
              dispatch(setShowPopupModal(true))
            } else {
              // clear store
              dispatch(setClickResults([]))
            }
          } else if (searchTypeRef.current === SearchTypes.GridCode) {
            // fetch all scenes from API with matching grid code
            try {
              getResults(
                SearchTypes.GridCodeScenes,
                feature.properties['grid:code']
              ).then((aggregatedResponse) => {
                if (aggregatedResponse) {
                  dispatch(
                    setClickResults(aggregatedResponse.response.features)
                  )
                  dispatch(setShowPopupModal(true))
                }
              })
            } catch (error) {
              console.log('Error: ', error)
            }
          }
        }
      }
    }
  }

  // clears search results and empties out all the layers on the map
  function clearResultsFromMap() {
    // show loading spinner, clear previous results
    dispatch(setSearchResults(null))
    dispatch(setClickResults([]))

    // only remove layers if the user clicked on a different footprint
    if (clickedFootprintImageLayerRef.current) {
      clickedFootprintImageLayerRef.current.clearLayers()
    }
    if (clickedFootprintHighlightRef.current) {
      clickedFootprintHighlightRef.current.clearLayers()
    }
    // remove existing footprints from map
    if (resultFootprintsRef.current) {
      resultFootprintsRef.current.eachLayer(function (layer) {
        map.removeLayer(layer)
      })
      resultFootprintsRef.current.clearLayers()
    }
  }

  // search throttle set to 1500ms
  const processSearch = debounce(function () {
    if (autoSearchSwitchRef.current) {
      searchAPI()
    }
  }, 800)

  const processSearchBtn = debounce(() => searchAPI(), { immediate: true })

  // function called when search is initiated
  async function searchAPI() {
    if (showAppLoadingRef.current) return

    // clear previous results from map
    clearResultsFromMap()

    // if the zoom level is too high in mosaic view, abort search
    // otherwise, move to the mosaic search
    if (
      zoomLevelRef.current < MOSAIC_MIN_ZOOM &&
      viewModeRef.current === 'mosaic'
    ) {
      return
    } else if (
      zoomLevelRef.current >= MOSAIC_MIN_ZOOM &&
      viewModeRef.current === 'mosaic' &&
      selectedCollectionRef.current
    ) {
      addMosaic()
      return
    }

    // if a valid collection is not selected, abort search
    if (!selectedCollectionRef.current) {
      setCollectionError(true)
      return
    } else {
      setCollectionError(false)
    }

    // if the date picker is empty, abort search
    if (!datePickerRef.current) return

    dispatch(setSearchLoading(true))

    // determine search type
    const { typeOfSearch, zoomLevelNeeded } = setSearchType(
      zoomLevelRef,
      selectedCollectionRef,
      fullCollectionDataRef
    )
    searchTypeRef.current = typeOfSearch
    dispatch(setTypeOfSearch(typeOfSearch))

    if (zoomLevelNeeded) {
      dispatch(setShowZoomNotice(true))
      dispatch(setZoomLevelNeeded(zoomLevelNeeded))
      dispatch(setSearchLoading(false))
    } else {
      dispatch(setShowZoomNotice(false))
    }

    if (typeOfSearch) {
      try {
        const { response, options } = await getResults(typeOfSearch)
        if (response) {
          dispatch(setSearchResults(response))
          searchResultsRef.current = response
          dispatch(setSearchLoading(false))

          // add new footprints to map
          clearResultsFromMap()
          const resultFootprintsFound = L.geoJSON(response, options)
          resultFootprintsFound.id = 'resultLayer'
          resultFootprintsFound.addTo(resultFootprintsRef.current)
        }
      } catch (error) {
        console.log('Error: ', error)
      }
    }
  }

  function getResults(typeOfSearch, gridCode) {
    if (typeOfSearch === null) return
    const promise = new Promise(function (resolve, reject) {
      let response = {}
      let options = {}
      if (
        typeOfSearch === SearchTypes.Scene ||
        typeOfSearch === SearchTypes.GridCodeScenes
      ) {
        const searchParamsStr = getSearchParams({
          datePickerRef,
          map,
          selectedCollectionRef,
          showCloudSliderRef,
          _cloudCover,
          sarPolarizationsRef,
          gridCode,
          typeOfSearch
        })
        dispatch(setSearchParameters(searchParamsStr))
        fetchAPIitems(searchParamsStr).then((sceneResponse) => {
          if (sceneResponse) {
            response = sceneResponse
          }
          resolve({ response })
        })
      } else if (typeOfSearch === SearchTypes.GridCode) {
        const aggregatedSearchParamsStr = getSearchParams({
          datePickerRef,
          map,
          selectedCollectionRef,
          showCloudSliderRef,
          _cloudCover,
          sarPolarizationsRef,
          typeOfSearch
        })
        dispatch(setSearchParameters(aggregatedSearchParamsStr))
        fetchGridCodeItems(
          aggregatedSearchParamsStr,
          selectedCollectionRef.current,
          gridCellDataRef.current
        ).then((aggregatedResponse) => {
          if (aggregatedResponse) {
            response = aggregatedResponse
            options = {
              onEachFeature: function (feature, layer) {
                const scenes =
                  feature.properties.frequency > 1 ? 'scenes' : 'scene'
                layer.bindTooltip(
                  `${feature.properties.frequency.toString()} <span>${scenes}</span>`,
                  {
                    permanent: false,
                    direction: 'top',
                    className: 'tooltip_style',
                    interactive: false
                  }
                )
              }
            }
            resolve({ response, options })
          }
        })
      } else if (typeOfSearch === SearchTypes.GeoHex) {
        const aggregatedSearchParamsStr = getSearchParams({
          datePickerRef,
          map,
          selectedCollectionRef,
          showCloudSliderRef,
          _cloudCover,
          sarPolarizationsRef,
          typeOfSearch
        })
        dispatch(setSearchParameters(aggregatedSearchParamsStr))
        fetchGeoHexItems(aggregatedSearchParamsStr, zoomLevelRef.current).then(
          (aggregatedResponse) => {
            if (aggregatedResponse) {
              response = aggregatedResponse
              colors = colorMap(response.properties.largestRatio)
              options = {
                onEachFeature: styleHexGridLayers
              }
              resolve({ response, options })
            }
          }
        )
      }
    })
    return promise
  }

  function styleHexGridLayers(feature, layer) {
    const colorIndex =
      Math.round(feature.properties.colorRatio) ===
      Math.round(feature.properties.largestRatio)
        ? Math.round(feature.properties.largestRatio) - 1
        : Math.round(feature.properties.colorRatio)
    layer.setStyle({
      fillColor: colors[colorIndex],
      fillOpacity: 0.4,
      weight: 1,
      color: colors[colorIndex],
      opacity: 1
    })
    layer.bindTooltip(feature.properties.frequency.toString(), {
      permanent: false,
      direction: 'center',
      className: 'label_style',
      interactive: false
    })
    layer.on('mouseover', function (e) {
      layer.setStyle({
        fillOpacity: 0.1
      })
    })
    layer.on('mouseout', function (e) {
      layer.setStyle({
        fillOpacity: 0.4
      })
    })
  }

  const scale = () =>
    (window.devicePixelRatio && window.devicePixelRatio >= 2) ||
    (window.matchMedia && window.matchMedia('(min-resolution: 192dpi)').matches)
      ? 2
      : 1

  // remove old image layer and add new Tiler image layer to map
  function addImageClicked(feature) {
    // show loading spinner
    dispatch(setSearchLoading(true))

    clickedFootprintImageLayerRef.current.clearLayers()
    const featureURL = feature.links[0].href
    const tilerParams = constructSceneTilerParams(selectedCollectionRef.current)

    fetch(featureURL, {
      method: 'GET'
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        const tileBounds = setupBounds(json.bbox)
        if (sceneTilerURL) {
          L.tileLayer(
            `${sceneTilerURL}/stac/tiles/{z}/{x}/{y}@${scale()}x.png?url=${featureURL}&${tilerParams}`,
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
        } else {
          dispatch(setSearchLoading(false))
          console.log('VITE_SCENE_TILER_URL is not set in env variables.')
        }
      })
  }

  // add mosaic items to map
  function addMosaic() {
    // clear previous results from map
    clearResultsFromMap()

    // show loading spinner
    dispatch(setSearchLoading(true))

    // build date input
    const datetime = convertDate(datePickerRef.current)

    // get viewport bounds and setup bbox parameter
    const bbox = setupArrayBbox(map)
    const mosaicBounds = setupBounds(bbox)

    const createMosaicBody = {
      stac_api_root: VITE_STAC_API_URL,
      asset_name: constructMosaicAssetVal(selectedCollectionRef.current),
      collections: [selectedCollectionRef.current],
      datetime,
      bbox,
      max_items: MOSAIC_MAX_ITEMS
    }

    if (showCloudSliderRef.current) {
      createMosaicBody.query = {
        'eo:cloud_cover': getCloudCoverQueryVal(_cloudCover)
      }
    }

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

    const searchParamsStr = getSearchParams({
      datePickerRef,
      map,
      selectedCollectionRef,
      showCloudSliderRef,
      _cloudCover,
      mosaicLimit: MOSAIC_MAX_ITEMS
    })

    // fetch items from API for results notice
    fetchAPIitems(searchParamsStr).then((response) => {
      dispatch(setSearchResults(response))
      searchResultsRef.current = response
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
          {_temporalData && (
            <>
              <a data-tooltip-id="dateRange-tooltip">
                <InfoOutlinedIcon />
              </a>
              <Tooltip id="dateRange-tooltip">
                <strong>Collection dates:</strong>
                <br />
                {new Date(collectionStartDateRef.current).toDateString()} -{' '}
                {new Date(collectionEndDateRef.current).toDateString()}
              </Tooltip>
            </>
          )}
          {!datePickerRef.current && (
            <span className="error-true">
              <em>Required</em>
            </span>
          )}
        </label>
        <DateTimeRangePicker
          className="dateTimePicker"
          format={'yy-MM-dd'}
          calendarType="US"
          showLeadingZeros={false}
          disableClock={true}
          required={true}
          minDate={pickerMinDateRef.current}
          onChange={setDatePickerValue}
          value={datePickerValue}
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
      <div className="searchContainer searchButton">
        <button
          className={`actionButton disabled-${autoSearchSwitch}`}
          onClick={() => processSearchBtn()}
          disabled={autoSearchSwitch}
        >
          Search
        </button>

        <div className="autoSearchContainer">
          <label>Auto Search</label>
          <Switch
            checked={autoSearchSwitch}
            onChange={handleSwitchChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </div>
      </div>
    </div>
  )
}

export default Search
