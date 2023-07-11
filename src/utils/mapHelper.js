import * as L from 'leaflet'
import 'leaflet-draw'
import { store } from '../redux/store'
import { colorMap } from './colorMap'
import {
  setClickResults,
  setShowPopupModal,
  setShowZoomNotice,
  setSearchLoading,
  setisDrawingEnabled,
  setsearchGeojsonBoundary
} from '../redux/slices/mainSlice'
import { searchGridCodeScenes, debounceNewSearch } from './searchHelper'
import debounce from './debounce'
import {
  VITE_SCENE_TILER_URL,
  VITE_SCENE_TILER_PARAMS,
  VITE_MOSAIC_MIN_ZOOM_LEVEL,
  VITE_MOSAIC_TILER_PARAMS
} from '../assets/config'
import { GetMosaicBoundsService } from '../services/get-mosaic-bounds'
import GeoJSONValidation from './geojsonValidation'

export const footprintLayerStyle = {
  color: '#3183f5',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.1,
  fillColor: '#3183f5',
  pane: 'searchResults'
}

export const gridCodeLayerStyle = {
  color: '#3183f5',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.1,
  fillColor: '#3183f5',
  pane: 'searchResults'
}

export const clickedFootprintLayerStyle = {
  color: '#ff7800',
  weight: 4,
  opacity: 0.65,
  fillOpacity: 0,
  pane: 'searchResults'
}

const customSearchPointIconStyle = L.icon({
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png'
})

export const customSearchLineStyle = {
  color: '#00C07B',
  weight: 2,
  opacity: 1,
  dashArray: '4, 4',
  dashOffset: '0',
  pane: 'drawPane'
}

export const customSearchPolygonStyle = {
  color: '#00C07B',
  weight: 2,
  opacity: 1,
  fillOpacity: 0,
  dashArray: '4, 4',
  dashOffset: '0',
  pane: 'drawPane'
}

export function mapClickHandler(e) {
  if (store.getState().mainSlice.isDrawingEnabled) {
    return
  }
  const map = store.getState().mainSlice.map
  const clickBounds = L.latLngBounds(e.latlng, e.latlng)
  if (map && Object.keys(map).length > 0) {
    const _searchResults = store.getState().mainSlice.searchResults
    const _searchType = store.getState().mainSlice.searchType

    clearMapSelection()

    if (
      e.originalEvent.detail === 2 ||
      store.getState().mainSlice.viewMode === 'mosaic' ||
      _searchType === 'hex'
    ) {
      return
    }

    // pull all items from search results that intersect with the click bounds
    let intersectingFeatures = []
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

          if (_searchType === 'scene') {
            // if at least one feature found, push to store else clear store
            intersectingFeatures = [...intersectingFeatures, feature]
            if (intersectingFeatures.length > 0) {
              // push to store
              store.dispatch(setClickResults(intersectingFeatures))
              store.dispatch(setShowPopupModal(true))
            } else {
              // clear store
              store.dispatch(setClickResults([]))
            }
          } else if (_searchType === 'grid-code') {
            // fetch all scenes from API with matching grid code
            searchGridCodeScenes(feature.properties['grid:code'])
          }
        }
      }
    }
  }
}

// searchResultsLayer | clickedSceneHighlightLayer
export function addDataToLayer(geojson, layerName, options) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name === layerName) {
        clearLayer(layerName) // clear layer before adding new
        if (options !== 'undefined') {
          L.geoJSON(geojson, options).addTo(layer)
        } else {
          L.geoJSON(geojson).addTo(layer)
        }
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
      if (layer.layer_name && layer.layer_name !== 'drawBoundsLayer') {
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

function zoomToBounds(bounds) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.fitBounds(bounds)
  }
}

export function setMapZoomLevel(level) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.setZoom(level)
  }
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
    return [
      mapBounds._southWest.lng,
      mapBounds._southWest.lat,
      mapBounds._northEast.lng,
      mapBounds._northEast.lat
    ]
  }
}

export function zoomToCollectionExtent(collection) {
  if (
    collection.extent.spatial.bbox &&
    collection.extent.spatial.bbox.length >= 1
  ) {
    const collectionBounds = leafletBoundsFromBBOX(
      collection.extent.spatial.bbox[0]
    )
    const viewportBounds = leafletBoundsFromBBOX(bboxFromMapBounds())
    if (!collectionBounds.contains(viewportBounds)) {
      zoomToBounds(collectionBounds)
    }
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
}

export function mapCallDebounceNewSearch() {
  if (store.getState().mainSlice.isAutoSearchSet) {
    debounceNewSearch()
  }
}

export const debounceTitilerOverlay = debounce(() => addImageOverlay(), 800)

function addImageOverlay() {
  const sceneTilerURL = VITE_SCENE_TILER_URL || ''
  const _currentPopupResult = store.getState().mainSlice.currentPopupResult
  const _selectedCollectionData =
    store.getState().mainSlice.selectedCollectionData
  // TODO: consider changing how spinner loads, or not at all?
  // maybe load spinner in footprint extent? or different loading spinner?
  store.dispatch(setSearchLoading(true))

  clearLayer('clickedSceneImageLayer')

  const featureURL = _currentPopupResult.links[0].href
  const tilerParams = constructSceneTilerParams(_selectedCollectionData.id)

  fetch(featureURL, {
    method: 'GET'
  })
    .then(function (response) {
      return response.json()
    })
    .then(function (json) {
      const tileBounds = setupBounds(json.bbox)
      if (sceneTilerURL) {
        const map = store.getState().mainSlice.map
        if (map && Object.keys(map).length > 0) {
          const currentSelectionImageTileLayer = L.tileLayer(
            `${sceneTilerURL}/stac/tiles/{z}/{x}/{y}@${scale()}x.png?url=${featureURL}&${tilerParams}`,
            {
              tileSize: 256,
              bounds: tileBounds,
              pane: 'imagery'
            }
          )
            .on('load', function () {
              store.dispatch(setSearchLoading(false))
            })
            .on('tileerror', function () {
              store.dispatch(setSearchLoading(false))
              console.log('Tile Error')
            })

          map.eachLayer(function (layer) {
            if (layer.layer_name === 'clickedSceneImageLayer') {
              currentSelectionImageTileLayer.addTo(layer)
            }
          })
        }
      } else {
        store.dispatch(setSearchLoading(false))
        console.log('VITE_SCENE_TILER_URL is not set in env variables.')
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

const constructSceneTilerParams = (collection) => {
  const envSceneTilerParams = VITE_SCENE_TILER_PARAMS || ''
  // retrieve mosaic tiler parameters from env variable
  const tilerParams = getTilerParams(envSceneTilerParams)

  const params = []

  const [asset, assetsParam] = constructSceneAssetsParam(
    collection,
    tilerParams
  )

  params.push(assetsParam)

  const assetBidx = parameters.bidx(tilerParams, collection, asset)
  if (assetBidx) params.push(assetBidx)

  const colorFormula = parameters.colorFormula(tilerParams, collection)
  if (colorFormula) params.push(colorFormula)

  const expression = parameters.expression(tilerParams, collection)
  if (expression) params.push(expression)

  const rescale = parameters.rescale(tilerParams, collection)
  if (rescale) params.push(rescale)

  const colormapName = parameters.colormapName(tilerParams, collection)
  if (colormapName) params.push(colormapName)

  return params.join('&')
}

export const getTilerParams = (configVariable) => {
  try {
    return JSON.parse(JSON.stringify(configVariable))
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }
  return {}
}

const constructSceneAssetsParam = (collection, tilerParams) => {
  const assets = tilerParams[collection]?.assets || ''
  if (!assets) {
    console.log(`Assets not defined for ${collection}`)
    return [null, '']
  }
  // titiler accepts multiple `assets` parameters for compositing
  // multiple files, so add extra params here if there's more than
  // one asset specified
  return [assets[0], `assets=${assets.join('&assets=')}`]
}

const parameters = {
  colorFormula: (tilerParams, collection) => {
    const value = tilerParams[collection]?.color_formula
    return value && `color_formula=${value}`
  },
  expression: (tilerParams, collection) => {
    const value = tilerParams[collection]?.expression
    return value && `expression=${value}`
  },
  rescale: (tilerParams, collection) => {
    const value = tilerParams[collection]?.rescale
    return value && `rescale=${value}`
  },
  colormapName: (tilerParams, collection) => {
    const value = tilerParams[collection]?.colormap_name
    return value && `colormap_name=${value}`
  },
  bidx: (tilerParams, collection, asset) => {
    const value = tilerParams[collection]?.bidx
    // for scene tiler
    if (asset) {
      const assetBidx = asset && value ? `${asset}|${value}` : null
      return assetBidx && `asset_bidx=${assetBidx}`
    } else {
      return value && `bidx=${value}`
    }
  }
}

export function setMosaicZoomMessage() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    const MOSAIC_MIN_ZOOM = VITE_MOSAIC_MIN_ZOOM_LEVEL || 7
    if (
      map.getZoom() >= MOSAIC_MIN_ZOOM ||
      store.getState().mainSlice.viewMode === 'scene'
    ) {
      store.dispatch(setShowZoomNotice(false))
    } else {
      store.dispatch(setShowZoomNotice(true))
    }
  }
}

export const constructMosaicTilerParams = (collection) => {
  const mosaicTilerParams = VITE_MOSAIC_TILER_PARAMS || ''
  // retrieve mosaic tiler parameters from env variable
  const tilerParams = getTilerParams(mosaicTilerParams)

  const params = []

  const bidx = parameters.bidx(tilerParams, collection)
  if (bidx) params.push(bidx)

  const colorFormula = parameters.colorFormula(tilerParams, collection)
  if (colorFormula) params.push(colorFormula)

  const expression = parameters.expression(tilerParams, collection)
  if (expression) params.push(expression)

  const rescale = parameters.rescale(tilerParams, collection)
  if (rescale) params.push(rescale)

  const colormapName = parameters.colormapName(tilerParams, collection)
  if (colormapName) params.push(colormapName)

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
      const currentMosaicImageTileLayer = L.tileLayer(mosaicURL, {
        tileSize: 256,
        bounds: mosaicBounds,
        pane: 'imagery'
      })
        .on('load', function () {
          store.dispatch(setSearchLoading(false))
        })
        .on('tileerror', function () {
          store.dispatch(setSearchLoading(false))
          console.log('Tile Error')
        })

      map.eachLayer(function (layer) {
        if (layer.layer_name === 'mosaicImageLayer') {
          currentMosaicImageTileLayer.addTo(layer)
        }
      })
    })
  }
}

export function enableMapPolyDrawing() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    clearLayer('drawBoundsLayer')
    store.getState().mainSlice.mapDrawPolygonHandler.enable()

    // save drawn items
    map.on(L.Draw.Event.CREATED, (e) => {
      e.layer.options.color = '#00FF00'
      map.eachLayer(function (layer) {
        if (layer.layer_name === 'drawBoundsLayer') {
          const drawLayer = e.layer
          drawLayer.setStyle(customSearchPolygonStyle)
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

        if (
          geojson.geometry.type === 'Point' ||
          geojson.geometry.type === 'MultiPoint'
        ) {
          geojsonLayer = L.geoJSON(geojson, {
            pointToLayer: function (feature, latlng) {
              return L.marker(latlng, { icon: customSearchPointIconStyle })
            }
          })
        }
        if (
          geojson.geometry.type === 'LineString' ||
          geojson.geometry.type === 'MultiLineString'
        ) {
          geojsonLayer.setStyle(customSearchLineStyle)
        }
        if (
          geojson.geometry.type === 'Polygon' ||
          geojson.geometry.type === 'MultiPolygon'
        ) {
          geojsonLayer.setStyle(customSearchPolygonStyle)
        }

        geojsonLayer.options.interactive = false
        layer.addLayer(geojsonLayer)
        store.dispatch(setsearchGeojsonBoundary(geojson))
      }
    })
  }
}

export async function parseGeomUpload(geom) {
  if (GeoJSONValidation.isValidFeatureCollection(geom)) {
    if (
      GeoJSONValidation.isValidGeometryCollection(geom.features[0].geometry)
    ) {
      throw Error('GeometryCollection not supported')
    }
    return geom.features[0]
  }
  if (GeoJSONValidation.isValidFeature(geom)) {
    if (GeoJSONValidation.isValidGeometryCollection(geom.geometry)) {
      throw Error('GeometryCollection not supported')
    }
    return geom
  }
  if (GeoJSONValidation.isValidGeometry(geom)) {
    if (GeoJSONValidation.isValidGeometryCollection(geom)) {
      throw Error('GeometryCollection not supported')
    }
    return {
      type: 'Feature',
      geometry: geom,
      properties: {}
    }
  }
  throw Error('Invalid geojson uploaded')
}
