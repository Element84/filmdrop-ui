import * as L from 'leaflet'
import 'leaflet-draw'
import { store } from '../redux/store'
import { colorMap } from './colorMap'
import {
  setClickResults,
  setisDrawingEnabled,
  setsearchGeojsonBoundary,
  setimageOverlayLoading,
  setSearchLoading,
  setCurrentPopupResult
} from '../redux/slices/mainSlice'
import { searchGridCodeScenes } from './searchHelper'
import debounce from './debounce'
import { GetMosaicBoundsService } from '../services/get-mosaic-bounds'
import GeoJSONValidation from './geojsonValidation'
import { DEFAULT_TILE_LAYER_PARAMS } from '../components/defaults'
import { router, getPathParams } from '../router'
import { getCollectionConfig } from './configHelper'
import { appendStacHeaderCookies } from '../utils/stacRequest'
import { getMapGeometryColors } from './themeHelper'

const isDev =
  typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)

const debugLog = (...args) => {
  if (isDev) console.debug(...args)
}

/**
 * Gets the style for search result footprint layers.
 * Reads colors from CSS variables for theme support.
 */
export function getFootprintLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.searchResult,
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: colors.searchResult,
    pane: 'searchResults'
  }
}

/**
 * Gets the style for grid code aggregation layers.
 * Reads colors from CSS variables for theme support.
 */
export function getGridCodeLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.searchResult,
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: colors.searchResult,
    pane: 'searchResults'
  }
}

/**
 * Gets the style for clicked/highlighted scene footprints.
 * Reads colors from CSS variables for theme support.
 */
export function getClickedFootprintLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.highlighted,
    weight: 4,
    opacity: 0.65,
    fillOpacity: 0,
    pane: 'searchResults'
  }
}

/**
 * Gets the style for cart item footprints.
 * Reads colors from CSS variables for theme support.
 */
export function getCartFootprintLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.cartItem,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: colors.cartItem,
    pane: 'searchResults'
  }
}

const customSearchPointIconStyle = L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png'
})

/**
 * Gets the style for user-drawn line boundaries.
 * Reads colors from CSS variables for theme support.
 */
export function getCustomSearchLineStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.aoiBoundary,
    weight: 2,
    opacity: 1,
    dashArray: '4, 4',
    dashOffset: '0',
    pane: 'drawPane'
  }
}

/**
 * Gets the style for user-drawn polygon boundaries.
 * Reads colors from CSS variables for theme support.
 */
export function getCustomSearchPolygonStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.aoiBoundary,
    weight: 2,
    opacity: 1,
    fillOpacity: 0,
    dashArray: '4, 4',
    dashOffset: '0',
    pane: 'drawPane'
  }
}

// Backward-compatible exports - these evaluate at import time
// For dynamic theme support, use the getter functions instead
export const footprintLayerStyle = getFootprintLayerStyle()
export const gridCodeLayerStyle = getGridCodeLayerStyle()
export const clickedFootprintLayerStyle = getClickedFootprintLayerStyle()
export const cartFootprintLayerStyle = getCartFootprintLayerStyle()
export const customSearchLineStyle = getCustomSearchLineStyle()
export const customSearchPolygonStyle = getCustomSearchPolygonStyle()

export function mapClickHandler(e) {
  if (store.getState().mainSlice.isDrawingEnabled) {
    return
  }
  const map = store.getState().mainSlice.map
  const clickBounds = L.latLngBounds(e.latlng, e.latlng)
  if (map && Object.keys(map).length > 0) {
    const _searchType = store.getState().mainSlice.searchType
    const _searchResults = store.getState().mainSlice.searchResults

    if (
      e.originalEvent.detail === 2 ||
      store.getState().mainSlice.viewMode === 'mosaic' ||
      _searchType === 'hex'
    ) {
      return
    }

    // pull all items from search results that intersect with the click bounds
    let intersectingFeatures = []
    const gridCodesToSearch = []
    if (_searchResults !== null) {
      for (const f in _searchResults.features) {
        const feature = _searchResults.features[f]
        const featureBounds = L.geoJSON(feature).getBounds()
        if (featureBounds && featureBounds.intersects(clickBounds)) {
          // highlight layer
          const clickedFootprintsFound = L.geoJSON(feature, {
            style: clickedFootprintLayerStyle
          })
          map.eachLayer(function (layer) {
            if (layer.layer_name === 'clickedSceneHighlightLayer') {
              clickedFootprintsFound.addTo(layer)
            }
          })
          intersectingFeatures = [...intersectingFeatures, feature]
          if (intersectingFeatures.length === 0) {
            store.dispatch(setClickResults([]))
          }
          if (_searchType === 'scene') {
            // if at least one feature found, push to store
            if (intersectingFeatures.length > 0) {
              // push to store
              store.dispatch(setClickResults(intersectingFeatures))

              // Update URL with selected item (tab sync handled by useUrlStateSync)
              const firstItem = intersectingFeatures[0]
              if (firstItem.id) {
                const { collectionId } = getPathParams()
                router.navigate({
                  to: '/$collectionId/$itemId',
                  params: { collectionId, itemId: firstItem.id },
                  search: (prev) => ({ ...prev, tab: 'details' }),
                  replace: true
                })
              }
            }
          } else if (_searchType === 'grid-code') {
            for (const i in intersectingFeatures) {
              const feature = intersectingFeatures[i]
              // fetch all scenes from API with matching grid code
              gridCodesToSearch.push(feature.properties['grid:code'])
            }
          }
        }
      }
      if (_searchType === 'grid-code') {
        searchGridCodeScenes(gridCodesToSearch)
      }
    }
  }
}

export function selectMappedScenes() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    const _mappedScenes = store.getState().mainSlice.mappedScenes
    store.dispatch(setClickResults(_mappedScenes))
    for (const f in _mappedScenes) {
      const feature = _mappedScenes[f]
      const clickedFootprintsFound = L.geoJSON(feature, {
        style: clickedFootprintLayerStyle
      })
      map.eachLayer(function (layer) {
        if (layer.layer_name === 'clickedSceneHighlightLayer') {
          clickedFootprintsFound.addTo(layer)
        }
      })
    }
  }
}

// searchResultsLayer | clickedSceneHighlightLayer
export function addDataToLayer(geojson, layerName, options, clearExisting) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name === layerName) {
        if (clearExisting) {
          clearLayer(layerName) // clear layer before adding new
        }
        if (options !== 'undefined') {
          L.geoJSON(geojson, options).addTo(layer)
        } else {
          L.geoJSON(geojson).addTo(layer)
        }
      }
      if (layer.layer_name === 'cartFootprintsLayer') {
        layer.bringToFront()
      }
    })
  }
}

// searchResultsLayer | clickedSceneHighlightLayer | clickedSceneImageLayer | mosaicImageLayer
export function clearLayer(layerName) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name === layerName) {
        layer.clearLayers()
      }
    })
  }
}

export function clearAllLayers() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (
        layer.layer_name &&
        layer.layer_name !== 'drawBoundsLayer' &&
        layer.layer_name !== 'cartFootprintsLayer' &&
        layer.layer_name !== 'referenceLayerGroup' &&
        !store
          .getState()
          .mainSlice.referenceLayers.some(
            (data) => data.combinedLayerName === layer.layer_name
          )
      ) {
        layer.clearLayers()
      }
    })
  }
}

export function getLayerByName(layerName) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name === layerName) {
        return layer
      } else {
        return null
      }
    })
  }
}

export function deselectFeature() {
  clearLayer('clickedSceneHighlightLayer')
  clearLayer('clickedSceneImageLayer')
}

function zoomToBounds(bounds, options) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    // Prevent blank bands: on large viewports the map container can be
    // taller than the Mercator world at the zoom fitBounds would choose.
    // In that case, zoom to the center of the bounds at the minimum
    // level that fills the container vertically instead.
    const containerHeight = map.getContainer()?.clientHeight
    if (containerHeight > 0) {
      const minZoom = Math.ceil(Math.log2(containerHeight / 256))
      if (map.getBoundsZoom(bounds) < minZoom) {
        map.setView(bounds.getCenter(), minZoom, options)
        return
      }
    }
    map.fitBounds(bounds, options)
  }
}

export function setMapZoomLevel(level) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.setZoom(level)
  }
}

const COORD_PRECISION = 6
export const roundCoord = (n) => Number(n.toFixed(COORD_PRECISION))
const roundBbox = (bbox) => bbox.map(roundCoord)

export const clampAndRoundBbox = (bbox) => {
  if (!bbox || bbox.length < 4) return bbox
  const clampLng = (lng) => (lng < -180 ? -180 : lng > 180 ? 180 : lng)
  return [
    roundCoord(clampLng(bbox[0])),
    roundCoord(bbox[1]),
    roundCoord(clampLng(bbox[2])),
    roundCoord(bbox[3])
  ]
}

function leafletBoundsFromBBOX(bbox) {
  const swCorner = L.latLng(bbox[1], bbox[0])
  const neCorner = L.latLng(bbox[3], bbox[2])
  const leafletBounds = L.latLngBounds(swCorner, neCorner)
  return leafletBounds
}

export function bboxFromMapBounds() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    const mapBounds = map.getBounds()
    return roundBbox([
      mapBounds._southWest.lng,
      mapBounds._southWest.lat,
      mapBounds._northEast.lng,
      mapBounds._northEast.lat
    ])
  }
}

export function zoomToCollectionExtent(collection, options) {
  if (
    collection.extent.spatial.bbox &&
    collection.extent.spatial.bbox.length >= 1
  ) {
    const collectionBounds = leafletBoundsFromBBOX(
      collection.extent.spatial.bbox[0]
    )
    const bbox = bboxFromMapBounds()
    if (!bbox) return
    const viewportBounds = leafletBoundsFromBBOX(bbox)
    if (!collectionBounds.contains(viewportBounds)) {
      zoomToBounds(collectionBounds, options)
    }
  }
}

export function zoomToItemExtent(item) {
  if (item.bbox) {
    const itemBounds = leafletBoundsFromBBOX(item.bbox)
    zoomToBounds(itemBounds)
  }
}

export function getCurrentMapZoomLevel() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    return map.getZoom()
  }
}

export function buildHexGridLayerOptions(largestRatio) {
  const colors = colorMap(largestRatio)
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
  return {
    onEachFeature: styleHexGridLayers
  }
}

export function clearMapSelection() {
  clearLayer('clickedSceneHighlightLayer')
  clearLayer('clickedSceneImageLayer')
  store.dispatch(setClickResults([]))
  store.dispatch(setCurrentPopupResult(null))
}

export const debounceTitilerOverlay = debounce(
  (item) => addImageOverlay(item),
  800
)

function addImageOverlay(item) {
  const showSceneOverlay = store.getState().mainSlice.showSceneOverlay
  if (!showSceneOverlay) {
    store.dispatch(setimageOverlayLoading(false))
    return
  }
  const sceneTilerURL =
    store.getState().mainSlice.appConfig.SCENE_TILER_URL || ''
  const sceneTilerBaseUrl = sceneTilerURL.replace(/\/+$/, '')
  const tileMatrixSetId = 'WebMercatorQuad'
  const visualizations = getCollectionConfig(item?.collection, 'visualizations')
  if (!item || !sceneTilerBaseUrl || !visualizations) {
    if (!visualizations && item?.collection) {
      console.warn(
        `[TiTiler Scene] Cannot display scene imagery - no visualizations configured for collection '${item.collection}'`
      )
    }
    store.dispatch(setimageOverlayLoading(false))
    return
  }
  const _selectedCollectionData =
    store.getState().mainSlice.selectedCollectionData
  const _selectedVisualization =
    store.getState().mainSlice.selectedVisualization
  // TODO: consider changing how spinner loads, or not at all?
  // maybe load spinner in footprint extent? or different loading spinner?
  store.dispatch(setimageOverlayLoading(true))

  clearLayer('clickedSceneImageLayer')

  let featureURL = item?.links?.find((x) => x?.rel === 'self')?.href?.toString()
  const tilerParams = constructSceneTilerParams(
    _selectedCollectionData.id,
    _selectedVisualization
  )

  const requestHeaders = new Headers()
  appendStacHeaderCookies(requestHeaders)
  fetch(featureURL, {
    headers: requestHeaders,
    credentials:
      store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin'
  })
    .then(function (response) {
      return response.json()
    })
    .then(function (json) {
      const tileBounds = setupBounds(json.bbox)
      if (sceneTilerURL) {
        const map = store.getState().mainSlice.map
        if (map && Object.keys(map).length > 0) {
          const collectionTileLayerParams = getTileLayerParams(
            _selectedCollectionData.id
          )
          const tileLayerParams = {
            ...DEFAULT_TILE_LAYER_PARAMS,
            ...collectionTileLayerParams,
            bounds: tileBounds
          }

          // Find and replace within the titiler url, if configured
          featureURL = findReplaceTitilerUrl(featureURL)

          const queryParts = []
          if (scale() === 2) queryParts.push('tilesize=512')
          queryParts.push(`url=${encodeURIComponent(featureURL)}`)
          if (tilerParams) queryParts.push(tilerParams)

          const currentSelectionImageTileLayer = L.tileLayer(
            `${sceneTilerBaseUrl}/stac/tiles/${tileMatrixSetId}/{z}/{x}/{y}.png?${queryParts.join('&')}`,
            tileLayerParams
          )
            .on('load', function () {
              store.dispatch(setimageOverlayLoading(false))
            })
            .on('tileerror', function () {
              store.dispatch(setimageOverlayLoading(false))
              debugLog('[TiTiler Scene] Tile error')
            })

          map.eachLayer(function (layer) {
            if (layer.layer_name === 'clickedSceneImageLayer') {
              currentSelectionImageTileLayer.addTo(layer)
            }
          })
        }
      } else {
        store.dispatch(setimageOverlayLoading(false))
      }
    })
}

const scale = () =>
  (window.devicePixelRatio && window.devicePixelRatio >= 2) ||
  (window.matchMedia && window.matchMedia('(min-resolution: 192dpi)').matches)
    ? 2
    : 1

function setupBounds(bbox) {
  const swCorner = L.latLng(bbox[1], bbox[0])
  const neCorner = L.latLng(bbox[3], bbox[2])
  return L.latLngBounds(swCorner, neCorner)
}

const getTileLayerParams = (collection) => {
  const collectionTileLayerParams = getCollectionConfig(
    collection,
    'tileLayerParams'
  )
  if (!collectionTileLayerParams) {
    debugLog(`[TiTiler Scene] tileLayerParams not defined for ${collection}`)
    return {}
  }
  return collectionTileLayerParams
}

const constructSceneTilerParams = (
  collection,
  selectedVisualizationKey = null
) => {
  // Get visualizations dictionary
  const visualizations = getCollectionConfig(collection, 'visualizations')

  if (!visualizations) {
    console.warn(
      `[TiTiler Scene] No visualizations configured for collection '${collection}'. ` +
        `Scene imagery will not be available. Configure visualizations in COLLECTIONS_CONFIG.`
    )
    return ''
  }

  if (typeof visualizations !== 'object') {
    console.warn(
      `[TiTiler Scene] Invalid visualizations config for collection '${collection}'. ` +
        `Expected object, got ${typeof visualizations}.`
    )
    return ''
  }

  const visualizationKeys = Object.keys(visualizations)
  if (visualizationKeys.length === 0) {
    console.warn(
      `[TiTiler Scene] Visualizations object is empty for collection '${collection}'. ` +
        `Add at least one visualization definition.`
    )
    return ''
  }

  const visualizationKey =
    selectedVisualizationKey && visualizations[selectedVisualizationKey]
      ? selectedVisualizationKey
      : visualizationKeys[0]

  if (selectedVisualizationKey && !visualizations[selectedVisualizationKey]) {
    console.warn(
      `[TiTiler Scene] Selected visualization '${selectedVisualizationKey}' not found for collection '${collection}'. ` +
        `Falling back to first available visualization.`
    )
  }

  const tilerParams = visualizations[visualizationKey]

  debugLog(
    `[TiTiler Scene] Collection: ${collection}, using visualization: ${visualizationKey}`,
    tilerParams
  )

  if (!tilerParams) return ''

  const params = []

  // Unscale applies scale/offset metadata.
  // Default to unscale for expression-based visualizations (e.g., NDVI), since
  // derived indices typically expect physical values. For RGB-style visualizations
  // tuned to raw DN ranges, keep the historical behavior unless explicitly enabled.
  const explicitUnscale = tilerParams?.unscale
  const shouldUnscale =
    explicitUnscale === true ||
    (explicitUnscale == null && Boolean(tilerParams?.expression))
  if (shouldUnscale) params.push('unscale=true')

  const [asset, assetsParam] = constructSceneAssetsParam(tilerParams)
  params.push(assetsParam)

  const assetBidx = parameters.bidx(tilerParams, asset)
  if (assetBidx) params.push(assetBidx)

  const nodata = parameters.nodata(tilerParams)
  if (nodata) params.push(nodata)

  const colorFormula = parameters.colorFormula(tilerParams)
  if (colorFormula) params.push(colorFormula)

  const expression = parameters.expression(tilerParams)
  if (expression) {
    params.push(expression)

    // `asset_as_band` is only needed for some expression modes.
    // Prefer an explicit per-visualization override. Otherwise, if the
    // visualization provides multiple assets, enable `asset_as_band` by default.
    // The deployed FilmDrop TiTiler expects this for multi-asset expressions.
    const explicitAssetAsBand = parameters.assetAsBand(tilerParams)
    if (explicitAssetAsBand) {
      params.push(explicitAssetAsBand)
    } else {
      if (Array.isArray(tilerParams?.assets) && tilerParams.assets.length > 1) {
        params.push('asset_as_band=true')
      }
    }
  }

  const rescale = parameters.rescale(tilerParams)
  if (rescale) params.push(rescale)

  const colormapName = parameters.colormapName(tilerParams)
  if (colormapName) params.push(colormapName)

  const colormap = parameters.colormap(tilerParams)
  if (colormap) params.push(colormap)

  return params.join('&')
}

/**
 * @deprecated This function is no longer used internally. Use getCollectionConfig() instead.
 * Deep clones a configuration object via JSON serialization.
 * @param {Object} configVariable - Configuration object to clone
 * @returns {Object} Deep cloned configuration object
 */
export const getTilerParams = (configVariable) => {
  try {
    return JSON.parse(JSON.stringify(configVariable))
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }
  return {}
}

const constructSceneAssetsParam = (tilerParams) => {
  const assets = tilerParams?.assets || ''
  if (!assets) {
    return [null, '']
  }
  // titiler accepts multiple `assets` parameters for compositing
  // multiple files, so add extra params here if there's more than
  // one asset specified
  return [assets[0], `assets=${assets.join('&assets=')}`]
}

const parameters = {
  nodata: (tilerParams) => {
    const value = tilerParams?.nodata
    return value == null ? null : `nodata=${value}`
  },
  colorFormula: (tilerParams) => {
    const value = tilerParams?.color_formula
    return value && `color_formula=${value}`
  },
  expression: (tilerParams) => {
    const value = tilerParams?.expression
    return value && `expression=${encodeURIComponent(value)}`
  },
  rescale: (tilerParams) => {
    const value = tilerParams?.rescale
    if (!value) return null
    // Handle array of rescale values (one per band) - TiTiler expects separate rescale params
    if (Array.isArray(value)) {
      return value.map((v) => `rescale=${v}`).join('&')
    }
    return `rescale=${value}`
  },
  colormapName: (tilerParams) => {
    const value = tilerParams?.colormap_name
    return value && `colormap_name=${value}`
  },
  colormap: (tilerParams) => {
    const value = tilerParams?.colormap
    return value && `colormap=${encodeURIComponent(JSON.stringify(value))}`
  },
  bidx: (tilerParams, asset) => {
    const value = tilerParams?.bidx
    // for scene tiler
    if (asset) {
      const assetBidx = asset && value ? `${asset}|${value}` : null
      return assetBidx && `asset_bidx=${assetBidx}`
    } else {
      return value
        ?.split(',')
        .map((x) => `bidx=${x}`)
        .join('&')
    }
  },
  assetAsBand: (tilerParams) => {
    const value = tilerParams?.asset_as_band
    if (value === true) return 'asset_as_band=true'
    if (value === false) return 'asset_as_band=false'
    return null
  }
}

export const constructMosaicTilerParams = (collection) => {
  const tilerParams = getCollectionConfig(collection, 'mosaicTilerParams')
  if (!tilerParams) return ''

  const params = []

  // Unscale applies scale/offset metadata. Default on for expression-based
  // mosaic visualizations, or opt-in via config.
  const explicitUnscale = tilerParams?.unscale
  const shouldUnscale =
    explicitUnscale === true ||
    (explicitUnscale == null && Boolean(tilerParams?.expression))
  if (shouldUnscale) params.push('unscale=true')

  const bidx = parameters.bidx(tilerParams)
  if (bidx) params.push(bidx)

  const nodata = parameters.nodata(tilerParams)
  if (nodata) params.push(nodata)

  const colorFormula = parameters.colorFormula(tilerParams)
  if (colorFormula) params.push(colorFormula)

  const expression = parameters.expression(tilerParams)
  if (expression) params.push(expression)

  const rescale = parameters.rescale(tilerParams)
  if (rescale) params.push(rescale)

  const colormapName = parameters.colormapName(tilerParams)
  if (colormapName) params.push(colormapName)

  const colormap = parameters.colormap(tilerParams)
  if (colormap) params.push(colormap)

  return params.join('&')
}

export async function addMosaicLayer(json) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    const _selectedCollectionData =
      store.getState().mainSlice.selectedCollectionData
    const imgFormat = 'png'
    const baseTileLayerHref = json?.links?.find(
      (el) => el.rel === 'tiles'
    )?.href
    const tilerParams = constructMosaicTilerParams(_selectedCollectionData.id)
    const mosaicURL = `${baseTileLayerHref}.${imgFormat}?${tilerParams}`
    const baseTileLayerHrefForBounds = json?.links?.find(
      (el) => el.rel === 'tilejson'
    )?.href
    GetMosaicBoundsService(baseTileLayerHrefForBounds).then(function (bounds) {
      const mosaicBounds = leafletBoundsFromBBOX(bounds)
      const tileLayerParams = getTileLayerParams(_selectedCollectionData.id)
      const currentMosaicImageTileLayer = L.tileLayer(mosaicURL, {
        ...DEFAULT_TILE_LAYER_PARAMS,
        ...tileLayerParams,
        bounds: mosaicBounds
      })
        .on('load', function () {
          store.dispatch(setSearchLoading(false))
        })
        .on('tileerror', function () {
          store.dispatch(setSearchLoading(false))
          debugLog('[TiTiler Mosaic] Tile error')
        })

      map.eachLayer(function (layer) {
        if (layer.layer_name === 'mosaicImageLayer') {
          currentMosaicImageTileLayer.addTo(layer)
        }
      })
    })
  }
}

export function hasMosaicImageLayer() {
  const map = store.getState().mainSlice.map
  if (!map || Object.keys(map).length === 0) {
    return false
  }
  let hasLayer = false
  map.eachLayer((layer) => {
    if (layer.layer_name === 'mosaicImageLayer') {
      hasLayer = true
    }
  })
  return hasLayer
}

export function enableMapPolyDrawing() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    clearLayer('drawBoundsLayer')
    store.getState().mainSlice.mapDrawPolygonHandler.enable()

    // save drawn items
    map.on(L.Draw.Event.CREATED, (e) => {
      const colors = getMapGeometryColors()
      e.layer.options.color = colors.aoiBoundary
      map.eachLayer(function (layer) {
        if (layer.layer_name === 'drawBoundsLayer') {
          const drawLayer = e.layer
          drawLayer.setStyle(getCustomSearchPolygonStyle())
          drawLayer.options.interactive = false
          layer.addLayer(drawLayer)
          const data = layer.toGeoJSON()
          store.dispatch(setsearchGeojsonBoundary(data.features[0]))
          store.dispatch(setisDrawingEnabled(false))
        }
      })
    })
  }
}

export function disableMapPolyDrawing() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    store.getState().mainSlice.mapDrawPolygonHandler.disable()
  }
}

export function addUploadedGeojsonToMap(geojson) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    clearLayer('drawBoundsLayer')
    map.eachLayer(function (layer) {
      if (layer.layer_name === 'drawBoundsLayer') {
        let geojsonLayer = L.geoJSON(geojson)

        geojsonLayer = L.geoJSON(geojson, {
          pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: customSearchPointIconStyle })
          }
        })
        geojsonLayer.setStyle((feature) => {
          return styleFeatures(feature, geojsonLayer)
        })
        geojsonLayer.options.interactive = false
        layer.addLayer(geojsonLayer)
        store.dispatch(setsearchGeojsonBoundary(geojson))
      }
    })
  }
}

export async function parseGeomUpload(geom) {
  if (GeoJSONValidation.isValidFeatureCollection(geom)) {
    if (geom.features.length > 1) {
      throw Error('Only FeatureCollections with a single feature are supported')
    }
    return geom.features[0]
  }
  if (GeoJSONValidation.isValidFeature(geom)) {
    return geom
  }
  if (GeoJSONValidation.isValidGeometry(geom)) {
    return {
      type: 'Feature',
      geometry: geom,
      properties: {}
    }
  }
  throw Error('Invalid geojson uploaded')
}

function styleFeatures(feature, geojsonLayer) {
  if (
    feature.geometry.type === 'LineString' ||
    feature.geometry.type === 'MultiLineString'
  ) {
    return getCustomSearchLineStyle()
  }
  if (
    feature.geometry.type === 'Polygon' ||
    feature.geometry.type === 'MultiPolygon'
  ) {
    return getCustomSearchPolygonStyle()
  }
  if (feature.geometry.type === 'GeometryCollection') {
    const accumulatedStyle = {}
    feature.geometry.geometries.forEach((part) => {
      if (part.type === 'LineString' || part.type === 'MultiLineString') {
        Object.assign(accumulatedStyle, getCustomSearchLineStyle())
      }
      if (part.type === 'Polygon' || part.type === 'MultiPolygon') {
        Object.assign(accumulatedStyle, getCustomSearchPolygonStyle())
      }
    })
    return accumulatedStyle
  }
}

export function addReferenceLayersToMap() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name === 'referenceLayerGroup') {
        const reversedReferenceLayersArr = store
          .getState()
          .mainSlice.referenceLayers.slice()
          .reverse()
        reversedReferenceLayersArr.forEach((refLayer) => {
          if (refLayer.type !== 'wms') {
            console.error(
              'Error adding layer: ' +
                refLayer.name +
                ': only wms type supported'
            )
            return
          }
          const wmsLayer = L.tileLayer.wms(refLayer.url, {
            layers: refLayer.layerName,
            format: 'image/png',
            transparent: true,
            version: '1.1.1',
            crs: refLayer.crs === 'EPSG:4326' ? L.CRS.EPSG4326 : L.CRS.EPSG3857
          })
          wmsLayer.layer_name = refLayer.combinedLayerName
          layer.addLayer(wmsLayer)
          if (!refLayer.visibility) {
            layer.removeLayer(wmsLayer)
          }
        })
      }
    })
  }
}

export function toggleReferenceLayerVisibility(combinedLayerNameToToggle) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name === 'referenceLayerGroup') {
        const refLayerToToggle = store
          .getState()
          .mainSlice.referenceLayers.find(
            (item) => item.combinedLayerName === combinedLayerNameToToggle
          )

        const layersInGroup = []
        layer.eachLayer(function (layerInGroup) {
          layersInGroup.push(layerInGroup.layer_name)
          if (layerInGroup.layer_name === combinedLayerNameToToggle) {
            layer.removeLayer(layerInGroup)
          }
        })

        if (
          !layersInGroup.includes(combinedLayerNameToToggle) &&
          refLayerToToggle.visibility
        ) {
          const wmsLayer = L.tileLayer.wms(refLayerToToggle.url, {
            layers: refLayerToToggle.layerName,
            format: 'image/png',
            transparent: true,
            version: '1.1.1',
            crs:
              refLayerToToggle.crs === 'EPSG:4326'
                ? L.CRS.EPSG4326
                : L.CRS.EPSG3857
          })
          wmsLayer.layer_name = refLayerToToggle.combinedLayerName
          wmsLayer.bringToBack()
          layer.addLayer(wmsLayer)
          wmsLayer.bringToFront()

          // need this to keep layer order when adding and removing layers
          const layersInGroup = layer.getLayers()
          const orderMap = {}
          store.getState().mainSlice.referenceLayers.forEach((item, index) => {
            orderMap[item.combinedLayerName] = index
          })
          layersInGroup.sort(
            (a, b) => orderMap[b.layer_name] - orderMap[a.layer_name]
          )
          layersInGroup.forEach(function (layerInGroup) {
            layerInGroup.bringToFront()
          })
        }
      }
    })
  }
}

// if TILER_SETTINGS.URL_SUBST = true, modify the get request url made to titiler by finding and replacing
// strings defined by TILER_URL_SUBST_F and TILER_URL_SUBST_R
function findReplaceTitilerUrl(featureURL) {
  let ret = featureURL

  const replaceTitilerURL =
    store.getState().mainSlice.appConfig.TILER_SETTINGS?.URL_SUBST ?? false
  if (replaceTitilerURL === true) {
    const findStr =
      store.getState().mainSlice.appConfig.TILER_SETTINGS.URL_SUBST_FIND
    const replaceStr =
      store.getState().mainSlice.appConfig.TILER_SETTINGS.URL_SUBST_REPLACE

    if (findStr === undefined || replaceStr === undefined) {
      console.warn(
        '[TILER_SETTINGS.URL_SUBST] URL_SUBST = true but URL_SUBST_FIND or URL_SUBST_REPLACE is not set. Skipping substitution.'
      )
    } else if (typeof findStr !== 'string' || typeof replaceStr !== 'string') {
      console.warn(
        '[TILER_SETTINGS.URL_SUBST] URL_SUBST_FIND and URL_SUBST_REPLACE must be strings. Skipping substitution.'
      )
    } else {
      // replace can fail
      try {
        ret = ret.replace(findStr, replaceStr)
      } catch (err) {
        console.error(
          '[TILER_SETTINGS.URL_SUBST] Error performing substitution:',
          err
        )
      }
    }
  }

  return ret
}
