import { store } from '../redux/store'
import {
  DEFAULT_MED_ZOOM,
  DEFAULT_HIGH_ZOOM,
  DEFAULT_API_MAX_ITEMS,
  DEFAULT_MOSAIC_MAX_ITEMS
} from '../components/defaults'
import {
  getCurrentMapZoomLevel,
  clearAllLayers,
  bboxFromMapBounds,
  getTilerParams,
  clearMapSelection
} from './mapHelper'
import { convertDateForURL, convertDate } from './datetime'
import { SearchService } from '../services/get-search-service'
import { AggregateSearchService } from '../services/get-aggregate-service'
import {
  setSearchLoading,
  setSearchType,
  setShowZoomNotice,
  setZoomLevelNeeded,
  setSearchResults
} from '../redux/slices/mainSlice'
import * as h3 from 'h3-js'
import debounce from './debounce'
import { AddMosaicService } from '../services/post-mosaic-service'

export function newSearch() {
  clearMapSelection()
  clearAllLayers()
  store.dispatch(setSearchResults(null))
  store.dispatch(setShowZoomNotice(false))
  store.dispatch(setSearchLoading(false))

  const _selectedCollection = store.getState().mainSlice.selectedCollectionData

  const midZoomLevel =
    store.getState().mainSlice.appConfig.SEARCH_MIN_ZOOM_LEVELS[
      _selectedCollection.id
    ]?.medium || DEFAULT_MED_ZOOM

  const highZoomLevel =
    store.getState().mainSlice.appConfig.SEARCH_MIN_ZOOM_LEVELS[
      _selectedCollection.id
    ]?.high || DEFAULT_HIGH_ZOOM

  const currentMapZoomLevel = getCurrentMapZoomLevel()

  const includesGeoHex = _selectedCollection.aggregations?.some(
    (el) => el.name === 'grid_geohex_frequency'
  )
  const includesGridCode = _selectedCollection.aggregations?.some(
    (el) => el.name === 'grid_code_frequency'
  )

  if (store.getState().mainSlice.viewMode !== 'scene') {
    if (currentMapZoomLevel < 7) {
      store.dispatch(setZoomLevelNeeded(7))
      store.dispatch(setShowZoomNotice(true))
      return
    }
    newMosaicSearch()
    return
  }
  if (currentMapZoomLevel >= highZoomLevel) {
    const searchScenesParams = buildSearchScenesParams()
    store.dispatch(setSearchType('scene'))
    store.dispatch(setSearchLoading(true))
    SearchService(searchScenesParams, 'scene')
    return
  }
  if (includesGeoHex && currentMapZoomLevel < midZoomLevel) {
    const searchAggregateParams = buildSearchAggregateParams('hex')
    store.dispatch(setSearchLoading(true))
    store.dispatch(setSearchType('hex'))
    AggregateSearchService(searchAggregateParams, 'hex')
    return
  }
  if (includesGridCode) {
    if (currentMapZoomLevel < midZoomLevel) {
      store.dispatch(setZoomLevelNeeded(midZoomLevel))
      store.dispatch(setShowZoomNotice(true))
      return
    }
    const searchAggregateParams = buildSearchAggregateParams('grid-code')
    store.dispatch(setSearchType('grid-code'))
    store.dispatch(setSearchLoading(true))
    AggregateSearchService(searchAggregateParams, 'grid-code')
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
  const _dateTimeRange = convertDateForURL(
    store.getState().mainSlice.searchDateRangeValue
  )
  const limit =
    store.getState().mainSlice.appConfig.API_MAX_ITEMS || DEFAULT_API_MAX_ITEMS
  const collections = _selectedCollection.id
  const _searchGeojsonBoundary =
    store.getState().mainSlice.searchGeojsonBoundary

  const searchParams = new Map([
    ['datetime', _dateTimeRange],
    ['limit', limit],
    ['collections', collections]
  ])
  if (_searchGeojsonBoundary) {
    searchParams.set(
      'intersects',
      encodeURIComponent(JSON.stringify(_searchGeojsonBoundary.geometry))
    )
  } else {
    searchParams.set('bbox', bbox)
  }

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
    query['grid:code'] = { in: gridCodeToSearchIn }
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
  const _dateTimeRange = convertDateForURL(
    store.getState().mainSlice.searchDateRangeValue
  )
  const _searchGeojsonBoundary =
    store.getState().mainSlice.searchGeojsonBoundary
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
    aggregations = `grid_code_frequency,total_count`
  }

  const searchParams = new Map([
    ['datetime', _dateTimeRange],
    ['collections', collections],
    ['aggregations', aggregations]
  ])
  if (_searchGeojsonBoundary) {
    searchParams.set(
      'intersects',
      encodeURIComponent(JSON.stringify(_searchGeojsonBoundary.geometry))
    )
  } else {
    searchParams.set('bbox', bbox)
  }

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
  const _gridCellData = store.getState().mainSlice.localGridData
  const buckets = json.aggregations?.find(
    (el) => el.name === 'grid_code_frequency'
  ).buckets
  const numberMatched = json?.aggregations?.find(
    (el) => el.name === 'total_count'
  )?.value
  const overflow = json?.aggregations.find(
    (el) => el.name === 'grid_code_frequency'
  ).overflow

  const mappedKeysToGrid = buckets
    .map((feature) => {
      const keyParts = feature.key.split('-', 2)
      const pattern = /^[A-Z0-9]+-[-_.A-Za-z0-9]+$/

      if (keyParts.length !== 2 || !pattern.test(feature.key)) {
        return null
      }

      const prefix = keyParts[0]
      const cell = keyParts[1]

      const gridToMapInto = _gridCellData[prefix]

      if (!gridToMapInto) {
        return null
      }

      const type = gridToMapInto.type
      const coordinates = gridToMapInto.cells[cell]

      return {
        geometry: {
          type,
          coordinates
        },
        type: 'Feature',
        properties: {
          'grid:code': feature.key,
          frequency: feature.frequency
        }
      }
    })
    .filter((feature) => feature && feature.geometry.coordinates)

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
  SearchService(searchScenesParams, 'grid-code')
}

export const debounceNewSearch = debounce(() => newSearch(), 300)

function newMosaicSearch() {
  clearAllLayers()
  store.dispatch(setSearchResults(null))
  store.dispatch(setShowZoomNotice(false))
  store.dispatch(setSearchLoading(true))
  const _selectedCollectionData =
    store.getState().mainSlice.selectedCollectionData
  const datetime = convertDate(store.getState().mainSlice.searchDateRangeValue)
  const _searchGeojsonBoundary =
    store.getState().mainSlice.searchGeojsonBoundary
  const bboxFromMap = bboxFromMapBounds()

  const createMosaicBody = {
    stac_api_root: store.getState().mainSlice.appConfig.STAC_API_URL,
    asset_name: constructMosaicAssetVal(_selectedCollectionData.id),
    collections: [_selectedCollectionData.id],
    datetime,
    max_items:
      store.getState().mainSlice.appConfig.MOSAIC_MAX_ITEMS ||
      DEFAULT_MOSAIC_MAX_ITEMS
  }
  if (_searchGeojsonBoundary) {
    createMosaicBody.intersects = _searchGeojsonBoundary.geometry
  } else {
    createMosaicBody.bbox = bboxFromMap
  }

  if (store.getState().mainSlice.showCloudSlider) {
    createMosaicBody.query = {
      'eo:cloud_cover': {
        gte: 0,
        lte: store.getState().mainSlice.cloudCover
      }
    }
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.titiler.stac-api-query+json'
    },
    body: JSON.stringify(createMosaicBody)
  }

  AddMosaicService(requestOptions)
}

const constructMosaicAssetVal = (collection) => {
  const envMosaicTilerParams =
    store.getState().mainSlice.appConfig.MOSAIC_TILER_PARAMS || ''
  const asset = getTilerParams(envMosaicTilerParams)[collection]?.assets || ''
  if (!asset) {
    console.log(`Assets not defined for ${collection}`)
    return null
  } else {
    return asset.pop()
  }
}
