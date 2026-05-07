import * as L from 'leaflet'
import { store } from '../redux/store'
import { colorMap } from './colorMap'
import {
  setClickResults,
  setImageOverlayLoading,
  setSearchLoading,
  setCurrentPopupResult
} from '../redux/slices/mainSlice'
import debounce from './debounce'
import { GetMosaicBoundsService } from '../services/get-mosaic-bounds'
import { DEFAULT_TILE_LAYER_PARAMS } from '../constants/defaults'
import {
  getCollectionConfig,
  getEffectiveMosaicTilerParams
} from './configHelper'
import { appendStacHeaderCookies } from '../utils/stacRequest'

export const CLICKED_SCENE_IMAGE_LAYER = 'clickedSceneImageLayer'

export function addDataToLayer(geojson, layerName, options, clearExisting) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name === layerName) {
        if (clearExisting) {
          clearLayer(layerName)
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
    let matchingLayer = null
    map.eachLayer(function (layer) {
      if (layer.layer_name === layerName) {
        matchingLayer = layer
      }
    })
    return matchingLayer
  }
  return null
}

export function deselectFeature() {
  clearLayer('clickedSceneHighlightLayer')
  clearLayer(CLICKED_SCENE_IMAGE_LAYER)
}

function zoomToBounds(bounds, options) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
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
  return L.latLngBounds(swCorner, neCorner)
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
  const appConfig = store.getState().mainSlice.appConfig
  const colors = colorMap(largestRatio, appConfig)
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
    layer.on('mouseover', function () {
      layer.setStyle({ fillOpacity: 0.1 })
    })
    layer.on('mouseout', function () {
      layer.setStyle({ fillOpacity: 0.4 })
    })
  }
  return { onEachFeature: styleHexGridLayers }
}

export function clearMapSelection() {
  clearLayer('clickedSceneHighlightLayer')
  clearLayer(CLICKED_SCENE_IMAGE_LAYER)
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
    store.dispatch(setImageOverlayLoading(false))
    return
  }

  const sceneTilerURL =
    store.getState().mainSlice.appConfig.SCENE_TILER_URL || ''
  const appConfig = store.getState().mainSlice.appConfig
  const sceneTilerBaseUrl = sceneTilerURL.replace(/\/+$/, '')
  const tileMatrixSetId = 'WebMercatorQuad'
  const visualizations = getCollectionConfig(
    item?.collection,
    'visualizations',
    appConfig
  )
  if (!item || !sceneTilerBaseUrl || !visualizations) {
    store.dispatch(setImageOverlayLoading(false))
    return
  }

  const selectedCollectionData =
    store.getState().mainSlice.selectedCollectionData
  const selectedVisualization = store.getState().mainSlice.selectedVisualization
  store.dispatch(setImageOverlayLoading(true))
  clearLayer(CLICKED_SCENE_IMAGE_LAYER)

  let featureURL = item?.links?.find((x) => x?.rel === 'self')?.href?.toString()
  const tilerParams = constructSceneTilerParams(
    selectedCollectionData.id,
    selectedVisualization
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
            selectedCollectionData.id
          )
          const tileLayerParams = {
            ...DEFAULT_TILE_LAYER_PARAMS,
            ...collectionTileLayerParams,
            bounds: tileBounds
          }

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
              store.dispatch(setImageOverlayLoading(false))
            })
            .on('tileerror', function () {
              store.dispatch(setImageOverlayLoading(false))
            })

          map.eachLayer(function (layer) {
            if (layer.layer_name === CLICKED_SCENE_IMAGE_LAYER) {
              currentSelectionImageTileLayer.addTo(layer)
            }
          })
        }
      } else {
        store.dispatch(setImageOverlayLoading(false))
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
    'tileLayerParams',
    store.getState().mainSlice.appConfig
  )
  return collectionTileLayerParams || {}
}

const constructSceneTilerParams = (
  collection,
  selectedVisualizationKey = null
) => {
  const visualizations = getCollectionConfig(
    collection,
    'visualizations',
    store.getState().mainSlice.appConfig
  )
  if (!visualizations || typeof visualizations !== 'object') {
    return ''
  }

  const visualizationKeys = Object.keys(visualizations)
  if (visualizationKeys.length === 0) return ''

  const visualizationKey =
    selectedVisualizationKey && visualizations[selectedVisualizationKey]
      ? selectedVisualizationKey
      : visualizationKeys[0]

  const tilerParams = visualizations[visualizationKey]
  if (!tilerParams) return ''

  const params = []
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
    const explicitAssetAsBand = parameters.assetAsBand(tilerParams)
    if (explicitAssetAsBand) {
      params.push(explicitAssetAsBand)
    } else if (
      Array.isArray(tilerParams?.assets) &&
      tilerParams.assets.length > 1
    ) {
      params.push('asset_as_band=true')
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

export const getTilerParams = (configVariable) => {
  try {
    return JSON.parse(JSON.stringify(configVariable))
  } catch {
    return {}
  }
}

const constructSceneAssetsParam = (tilerParams) => {
  const assets = tilerParams?.assets || ''
  if (!assets) return [null, '']
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
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      value.every(
        (v) =>
          typeof v === 'number' || (typeof v === 'string' && !v.includes(','))
      )
    ) {
      return `rescale=${value.join(',')}`
    }
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
    if (asset) {
      const assetBidx = asset && value ? `${asset}|${value}` : null
      return assetBidx && `asset_bidx=${assetBidx}`
    }
    return value
      ?.split(',')
      .map((x) => `bidx=${x}`)
      .join('&')
  },
  assetAsBand: (tilerParams) => {
    const value = tilerParams?.asset_as_band
    if (value === true) return 'asset_as_band=true'
    if (value === false) return 'asset_as_band=false'
    return null
  }
}

export const constructMosaicTilerParams = (collection) => {
  const selectedVisualization =
    store.getState().mainSlice.selectedVisualization || null
  const appConfig = store.getState().mainSlice.appConfig
  const tilerParams = getEffectiveMosaicTilerParams(
    collection,
    selectedVisualization,
    appConfig
  )
  if (!tilerParams) return ''

  const params = []
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
    const selectedCollectionData =
      store.getState().mainSlice.selectedCollectionData
    const imgFormat = 'png'
    const baseTileLayerHref = json?.links?.find(
      (el) => el.rel === 'tiles'
    )?.href
    const tilerParams = constructMosaicTilerParams(selectedCollectionData.id)
    const mosaicURL = `${baseTileLayerHref}.${imgFormat}?${tilerParams}`
    const baseTileLayerHrefForBounds = json?.links?.find(
      (el) => el.rel === 'tilejson'
    )?.href

    GetMosaicBoundsService(baseTileLayerHrefForBounds).then(function (bounds) {
      const mosaicBounds = leafletBoundsFromBBOX(bounds)
      const tileLayerParams = getTileLayerParams(selectedCollectionData.id)
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

function findReplaceTitilerUrl(featureURL) {
  let ret = featureURL
  const replaceTitilerURL =
    store.getState().mainSlice.appConfig.TILER_SETTINGS?.URL_SUBST ?? false
  if (replaceTitilerURL === true) {
    const findStr =
      store.getState().mainSlice.appConfig.TILER_SETTINGS.URL_SUBST_FIND
    const replaceStr =
      store.getState().mainSlice.appConfig.TILER_SETTINGS.URL_SUBST_REPLACE

    if (
      findStr !== undefined &&
      replaceStr !== undefined &&
      typeof findStr === 'string' &&
      typeof replaceStr === 'string'
    ) {
      try {
        ret = ret.replace(findStr, replaceStr)
      } catch {
        // no-op
      }
    }
  }

  return ret
}
