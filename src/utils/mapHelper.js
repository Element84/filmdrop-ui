import * as L from 'leaflet'
import 'leaflet-draw'
import { store } from '../redux/store'
import { colorMap } from './colorMap'
import {
  setClickResults,
  setShowZoomNotice,
  setisDrawingEnabled,
  setsearchGeojsonBoundary,
  setimageOverlayLoading,
  setSearchLoading,
  settabSelected,
  setCurrentPopupResult,
  sethasLeftPanelTabChanged
} from '../redux/slices/mainSlice'
import { searchGridCodeScenes } from './searchHelper'
import debounce from './debounce'
import { GetMosaicBoundsService } from '../services/get-mosaic-bounds'
import GeoJSONValidation from './geojsonValidation'
import { DEFAULT_MOSAIC_MIN_ZOOM } from '../components/defaults'

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
  color: '#BEA835',
  weight: 4,
  opacity: 0.65,
  fillOpacity: 0,
  pane: 'searchResults'
}

export const cartFootprintLayerStyle = {
  color: '#ad5c11',
  weight: 3,
  opacity: 1,
  fillOpacity: 0.1,
  fillColor: '#ad5c11',
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
    const _searchType = store.getState().mainSlice.searchType
    const _searchResults = store.getState().mainSlice.searchResults

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
              store.dispatch(settabSelected('details'))
              store.dispatch(sethasLeftPanelTabChanged(true))
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
  const sceneTilerURL =
    store.getState().mainSlice.appConfig.SCENE_TILER_URL || ''
  if (
    !item ||
    !sceneTilerURL ||
    !Object.prototype.hasOwnProperty.call(
      store.getState().mainSlice.appConfig.SCENE_TILER_PARAMS,
      item.collection
    )
  ) {
    store.dispatch(setimageOverlayLoading(false))
    return
  }
  const _selectedCollectionData =
    store.getState().mainSlice.selectedCollectionData
  // TODO: consider changing how spinner loads, or not at all?
  // maybe load spinner in footprint extent? or different loading spinner?
  store.dispatch(setimageOverlayLoading(true))

  clearLayer('clickedSceneImageLayer')

  const featureURL = item.links[0].href
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
              store.dispatch(setimageOverlayLoading(false))
            })
            .on('tileerror', function () {
              store.dispatch(setimageOverlayLoading(false))
              console.log('Tile Error')
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

const constructSceneTilerParams = (collection) => {
  const envSceneTilerParams =
    store.getState().mainSlice.appConfig.SCENE_TILER_PARAMS || ''
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
      return value
        ?.split(',')
        .map((x) => `bidx=${x}`)
        .join('&')
    }
  }
}

export function setMosaicZoomMessage() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    const MOSAIC_MIN_ZOOM =
      store.getState().mainSlice.appConfig.MOSAIC_MIN_ZOOM_LEVEL ||
      DEFAULT_MOSAIC_MIN_ZOOM
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
  const mosaicTilerParams =
    store.getState().mainSlice.appConfig.MOSAIC_TILER_PARAMS || ''
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
    return customSearchLineStyle
  }
  if (
    feature.geometry.type === 'Polygon' ||
    feature.geometry.type === 'MultiPolygon'
  ) {
    return customSearchPolygonStyle
  }
  if (feature.geometry.type === 'GeometryCollection') {
    const accumulatedStyle = {}
    feature.geometry.geometries.forEach((part) => {
      if (part.type === 'LineString' || part.type === 'MultiLineString') {
        Object.assign(accumulatedStyle, customSearchLineStyle)
      }
      if (part.type === 'Polygon' || part.type === 'MultiPolygon') {
        Object.assign(accumulatedStyle, customSearchPolygonStyle)
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
