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
import { setSearchLoading } from '../redux/slices/mainSlice'

export function newSearch() {
  clearAllLayers()

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
      console.log('need to zoom in')
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
    // show Loading Spinner
    store.dispatch(setSearchLoading(true))
    SearchService(searchScenesParams)
    // call search service
    console.log('call scene search service')
    return
  }
  if (includesGeoHex && currentMapZoomLevel < midZoomLevel) {
    const searchAggregateParams = buildSearchAggregateParams('hex')
    console.log(searchAggregateParams)
    // call agg service
    console.log('call agg hex service')
    return
  }
  if (includesGridCode || includesGridCodeLandsat) {
    if (currentMapZoomLevel < midZoomLevel) {
      console.log('need to zoom in')
      return
    }

    const searchAggregateParams = buildSearchAggregateParams('grid-code')
    console.log(searchAggregateParams)
    // call agg service
    console.log('call agg grid service')
    return
  }
  if (currentMapZoomLevel < highZoomLevel) {
    console.log('need to zoom in')
  }
}

function buildSearchScenesParams() {
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

  const searchParamsStr = [...searchParams]
    .reduce((obj, x) => {
      obj.push(x.join('='))
      return obj
    }, [])
    .join('&')

  if (_selectedCollection.queryables['eo:cloud_cover']) {
    const cloudCover = `{"eo:cloud_cover":{"gte":0,"lte":${
      store.getState().mainSlice.cloudCover
    }}}`
    const encodedQueryString = encodeURIComponent(cloudCover)
    const combinedParamString = searchParamsStr + `&query=` + encodedQueryString
    return combinedParamString
  } else {
    return searchParamsStr
  }
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

  const aggregateParamsStr = [...searchParams]
    .reduce((obj, x) => {
      obj.push(x.join('='))
      return obj
    }, [])
    .join('&')

  if (_selectedCollection.queryables['eo:cloud_cover']) {
    const cloudCover = `{"eo:cloud_cover":{"gte":0,"lte":${
      store.getState().mainSlice.cloudCover
    }}}`
    const encodedQueryString = encodeURIComponent(cloudCover)
    const combinedParamString =
      aggregateParamsStr + `&query=` + encodedQueryString
    return combinedParamString
  } else {
    return aggregateParamsStr
  }
}

function buildUrlParamFromBBOX() {
  const viewportBounds = bboxFromMapBounds()
  const neLng = viewportBounds[2] > 180 ? 180 : viewportBounds[2]
  const swLng = viewportBounds[0] < -180 ? -180 : viewportBounds[0]
  return [swLng, viewportBounds[1], neLng, viewportBounds[3]].join(',')
}
