import { store } from '../redux/store'
import {
  VITE_SEARCH_MIN_ZOOM_LEVELS,
  VITE_API_MAX_ITEMS
} from '../assets/config'
import { DEFAULT_MED_ZOOM, DEFAULT_HIGH_ZOOM } from '../components/defaults'
import {
  getCurrentMapZoomLevel,
  clearAllLayers,
  bboxFromMapBounds
} from './mapHelper'
import { convertDateForURL } from './datetime'
import { SearchService } from '../services/get-search-service'
import { AggregateSearchService } from '../services/get-aggregate-service'
import {
  setSearchLoading,
  setSearchType,
  setShowZoomNotice,
  setZoomLevelNeeded,
  setShowPopupModal
} from '../redux/slices/mainSlice'
import * as h3 from 'h3-js'
import debounce from './debounce'

export function newSearch() {
  clearAllLayers()
  store.dispatch(setShowZoomNotice(false))
  store.dispatch(setShowPopupModal(false))

  const _selectedCollection = store.getState().mainSlice.selectedCollectionData

  const midZoomLevel =
    VITE_SEARCH_MIN_ZOOM_LEVELS[_selectedCollection.id]?.medium ||
    DEFAULT_MED_ZOOM

  const highZoomLevel =
    VITE_SEARCH_MIN_ZOOM_LEVELS[_selectedCollection.id]?.high ||
    DEFAULT_HIGH_ZOOM

  const currentMapZoomLevel = getCurrentMapZoomLevel()

  const includesGeoHex = _selectedCollection.aggregations.some(
    (el) => el.name === 'grid_geohex_frequency'
  )
  const includesGridCode = _selectedCollection.aggregations.some(
    (el) => el.name === 'grid_code_frequency'
  )
  const includesGridCodeLandsat = _selectedCollection.aggregations.some(
    (el) => el.name === 'grid_code_landsat_frequency'
  )

  if (store.getState().mainSlice.viewMode !== 'scene') {
    if (currentMapZoomLevel < 7) {
      store.dispatch(setZoomLevelNeeded(7))
      store.dispatch(setShowZoomNotice(true))
      return
    }
    // buildSearchMosaicParams()
    // call moasic service
    console.log('call mosaic service')
    return
  }
  if (currentMapZoomLevel >= highZoomLevel) {
    const searchScenesParams = buildSearchScenesParams()
    console.log(searchScenesParams)
    // searchType = scene | grid_code | geohex
    store.dispatch(setSearchType('scene'))
    store.dispatch(setSearchLoading(true))
    SearchService(searchScenesParams, 'scene')
    console.log('call scene search service')
    return
  }
  if (includesGeoHex && currentMapZoomLevel < midZoomLevel) {
    const searchAggregateParams = buildSearchAggregateParams('hex')
    console.log(searchAggregateParams)
    store.dispatch(setSearchLoading(true))
    // searchType = scene | grid_code | geohex
    store.dispatch(setSearchType('hex'))
    AggregateSearchService(searchAggregateParams, 'hex')
    console.log('call agg hex service')
    return
  }
  if (includesGridCode || includesGridCodeLandsat) {
    if (currentMapZoomLevel < midZoomLevel) {
      store.dispatch(setZoomLevelNeeded(midZoomLevel))
      store.dispatch(setShowZoomNotice(true))
      return
    }
    const searchAggregateParams = buildSearchAggregateParams('grid-code')
    console.log(searchAggregateParams)
    // searchType = scene | grid_code | geohex
    store.dispatch(setSearchType('grid-code'))
    store.dispatch(setSearchLoading(true))
    AggregateSearchService(searchAggregateParams, 'grid-code')
    // call agg service
    console.log('call agg grid service')
    return
  }
  if (currentMapZoomLevel < highZoomLevel) {
    store.dispatch(setZoomLevelNeeded(highZoomLevel))
    store.dispatch(setShowZoomNotice(true))
  }
}

function buildSearchScenesParams(gridCodeToSearchIn) {
  const _selectedCollection = store.getState().mainSlice.selectedCollectionData

  const bbox = buildUrlParamFromBBOX()
  const dateTimeRange = convertDateForURL(
    store.getState().mainSlice.searchDateRangeValue
  )
  const limit = VITE_API_MAX_ITEMS || 200
  const collections = _selectedCollection.id

  const searchParams = new Map([
    ['bbox', bbox],
    ['datetime', dateTimeRange],
    ['limit', limit],
    ['collections', collections]
  ])

  const query = {}
  if (_selectedCollection.queryables['eo:cloud_cover']) {
    query['eo:cloud_cover'] = {
      gte: 0,
      lte: store.getState().mainSlice.cloudCover
    }
  }
  if (_selectedCollection.queryables['sar:polarizations']) {
    query['sar:polarizations'] = { in: ['VV', 'VH'] }
  }
  if (gridCodeToSearchIn) {
    if (_selectedCollection.id.includes('landsat')) {
      // extract the path and row from gridcode value, e.g., WRS2-123123
      query['landsat:wrs_path'] = { eq: gridCodeToSearchIn.substring(5, 8) }
      query['landsat:wrs_row'] = { eq: gridCodeToSearchIn.slice(-3) }
    } else {
      query['grid:code'] = { eq: gridCodeToSearchIn }
    }
  }

  let searchParamsStr
  if (Object.keys(query).length > 0) {
    searchParams.set('query', encodeURIComponent(JSON.stringify(query)))

    searchParamsStr = [...searchParams]
      .reduce((obj, x) => {
        obj.push(x.join('='))
        return obj
      }, [])
      .join('&')
  } else {
    searchParamsStr = [...searchParams]
      .reduce((obj, x) => {
        obj.push(x.join('='))
        return obj
      }, [])
      .join('&')
  }

  return searchParamsStr
}

function buildSearchAggregateParams(gridType) {
  const _selectedCollection = store.getState().mainSlice.selectedCollectionData

  const bbox = buildUrlParamFromBBOX()
  const dateTimeRange = convertDateForURL(
    store.getState().mainSlice.searchDateRangeValue
  )
  const collections = _selectedCollection.id

  let aggregations
  if (gridType === 'hex') {
    const currentMapZoomLevel = getCurrentMapZoomLevel()
    let precision
    switch (true) {
      case currentMapZoomLevel === 0:
        precision = 1
        break
      case currentMapZoomLevel >= 1 && currentMapZoomLevel <= 3:
        precision = 2
        break
      case currentMapZoomLevel >= 4 && currentMapZoomLevel <= 6:
        precision = 3
        break
      case currentMapZoomLevel >= 7 && currentMapZoomLevel <= 8:
        precision = 4
        break
      case currentMapZoomLevel >= 9:
        precision = 5
        break
    }
    aggregations = `grid_geohex_frequency,total_count&grid_geohex_frequency_precision=${precision}`
  } else {
    const gridAggName = _selectedCollection.id.includes('landsat')
      ? 'grid_code_landsat_frequency'
      : 'grid_code_frequency'
    aggregations = `${gridAggName},total_count`
  }

  const searchParams = new Map([
    ['bbox', bbox],
    ['datetime', dateTimeRange],
    ['collections', collections],
    ['aggregations', aggregations]
  ])

  const query = {}
  if (_selectedCollection.queryables['eo:cloud_cover']) {
    query['eo:cloud_cover'] = {
      gte: 0,
      lte: store.getState().mainSlice.cloudCover
    }
  }
  if (_selectedCollection.queryables['sar:polarizations']) {
    query['sar:polarizations'] = { in: ['VV', 'VH'] }
  }

  let aggregateParamsStr
  if (Object.keys(query).length > 0) {
    searchParams.set('query', encodeURIComponent(JSON.stringify(query)))

    aggregateParamsStr = [...searchParams]
      .reduce((obj, x) => {
        obj.push(x.join('='))
        return obj
      }, [])
      .join('&')
  } else {
    aggregateParamsStr = [...searchParams]
      .reduce((obj, x) => {
        obj.push(x.join('='))
        return obj
      }, [])
      .join('&')
  }
  return aggregateParamsStr
}

function buildUrlParamFromBBOX() {
  const viewportBounds = bboxFromMapBounds()
  const neLng = viewportBounds[2] > 180 ? 180 : viewportBounds[2]
  const swLng = viewportBounds[0] < -180 ? -180 : viewportBounds[0]
  return [swLng, viewportBounds[1], neLng, viewportBounds[3]].join(',')
}

export function mapHexGridFromJson(json) {
  let largestRatio = 0
  let largestFrequency = 0
  const buckets = json.aggregations?.find(
    (el) => el.name === 'grid_geohex_frequency'
  ).buckets
  const numberMatched = json?.aggregations?.find(
    (el) => el.name === 'total_count'
  )?.value
  const overflow = json?.aggregations.find(
    (el) => el.name === 'grid_geohex_frequency'
  ).overflow

  const convertedItems = buckets.map((feature) => {
    const hexBoundary = h3.cellToBoundary(feature.key, true)

    // fix coordinates that cross anti-meridian
    const fixedBoundaries = fixAntiMeridianPoints(hexBoundary)

    // calculate heat map color ratio
    const colorRatio = (feature.frequency / numberMatched) * 5000
    // capture largest ratio value to set the total number of color variations in colormap
    largestRatio = colorRatio > largestRatio ? colorRatio : largestRatio
    // capture largest frequency value to use in the legend and colormap
    largestFrequency =
      feature.frequency > largestFrequency
        ? feature.frequency
        : largestFrequency

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [fixedBoundaries]
      },
      properties: { frequency: feature.frequency, colorRatio, largestRatio }
    }
  })

  return {
    type: 'FeatureCollection',
    features: convertedItems,
    numberMatched,
    searchType: 'AggregatedResults',
    properties: { largestRatio, largestFrequency, overflow }
  }
}

function fixAntiMeridianPoints(hexBoundary) {
  // Example: [-170.6193233947984, -161.63482061718392, -165.41674992858836, -176.05696384421353, 175.98600155652952, 177.51613498805204, -170.6193233947984]
  const longArray = hexBoundary.map((element) => element[0])

  // get general location of polygon points east or west of antimeridian
  const lessThanNegative100 = longArray.filter((lng) => lng < -100)
  const greaterThanPositive100 = longArray.filter((lng) => lng > 100)
  const hasMorePositive =
    greaterThanPositive100.length > lessThanNegative100.length

  // adjust coordinate to join the rest of the polygon on the same side of the meridian
  for (const n in hexBoundary) {
    if (
      !hasMorePositive &&
      greaterThanPositive100.length > 0 &&
      hexBoundary[n][0] > -100
    ) {
      hexBoundary[n][0] = hexBoundary[n][0] - 360
      if (hexBoundary[n][0] < -180) {
        hexBoundary[n][0] = -180
      }
    } else if (
      hasMorePositive &&
      lessThanNegative100.length > 0 &&
      hexBoundary[n][0] < -100
    ) {
      hexBoundary[n][0] = hexBoundary[n][0] + 360
      if (hexBoundary[n][0] > 180) {
        hexBoundary[n][0] = 180
      }
    }
  }
  return hexBoundary
}

export function mapGridCodeFromJson(json) {
  const _selectedCollection = store.getState().mainSlice.selectedCollectionData
  const _gridCellData = store.getState().mainSlice.localGridData

  const gridAggName = _selectedCollection.id.includes('landsat')
    ? 'grid_code_landsat_frequency'
    : 'grid_code_frequency'
  const buckets = json.aggregations?.find(
    (el) => el.name === gridAggName
  ).buckets

  const numberMatched = json?.aggregations?.find(
    (el) => el.name === 'total_count'
  )?.value
  const overflow = json?.aggregations.find(
    (el) =>
      el.name === 'grid_code_frequency' ||
      el.name === 'grid_code_landsat_frequency'
  ).overflow

  // create Geojson file with matched geometry and frequency
  const mappedKeysToGrid = buckets
    .map((feature) => {
      let gridCellDataIndex
      for (let i = 0; i < _gridCellData.length; i++) {
        if (
          Object.keys(_gridCellData[i])[0] ===
          feature.key.split('-')[0].toLowerCase()
        ) {
          gridCellDataIndex = i
        }
      }
      const coordinates =
        _gridCellData[gridCellDataIndex][
          feature.key.split('-')[0].toLowerCase()
        ].cells[feature.key.split('-')[1]]

      return {
        geometry: {
          type: _gridCellData[gridCellDataIndex][
            feature.key.split('-')[0].toLowerCase()
          ].type,
          coordinates
        },
        type: 'Feature',
        properties: {
          'grid:code': feature.key,
          frequency: feature.frequency
        }
      }
    })
    .filter((feature) => feature.geometry.coordinates)

  return {
    type: 'FeatureCollection',
    features: mappedKeysToGrid,
    numberMatched,
    searchType: 'AggregatedResults',
    properties: { overflow }
  }
}

export function searchGridCodeScenes(gridCodeToSearchIn) {
  const searchScenesParams = buildSearchScenesParams(gridCodeToSearchIn)
  console.log(searchScenesParams)
  SearchService(searchScenesParams, 'grid-code')
}

export function debounceNewSearch() {
  // TODO: fix snyk error can call in a better way
  // ALSO: confirm debounce is actually working...
  debounce(newSearch(), 1200)
}
