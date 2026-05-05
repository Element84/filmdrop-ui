import * as L from 'leaflet'
import { store } from '../redux/store'
import {
  setClickResults,
  setIsDrawingEnabled,
  setSearchGeojsonBoundary
} from '../redux/slices/mainSlice'
import { searchGridCodeScenes } from './searchHelper'
import GeoJSONValidation from './geojsonValidation'
import {
  getActiveRouter,
  getPathParams,
  ROUTE_COLLECTION_ITEM
} from '../router'
import {
  clickedFootprintLayerStyle,
  customSearchPointIconStyle,
  getCustomSearchLineStyle,
  getCustomSearchPolygonStyle
} from './mapStyles'
import { clearLayer } from './mapLayers'

export function mapClickHandler(e) {
  if (store.getState().mainSlice.isDrawingEnabled) {
    return
  }
  const map = store.getState().mainSlice.map
  const clickBounds = L.latLngBounds(e.latlng, e.latlng)
  if (map && Object.keys(map).length > 0) {
    const searchType = store.getState().mainSlice.searchType
    const searchResults = store.getState().mainSlice.searchResults

    if (
      e.originalEvent.detail === 2 ||
      store.getState().mainSlice.viewMode === 'mosaic' ||
      searchType === 'hex'
    ) {
      return
    }

    let intersectingFeatures = []
    const gridCodesToSearch = []
    if (searchResults !== null) {
      for (const f in searchResults.features) {
        const feature = searchResults.features[f]
        const featureBounds = L.geoJSON(feature).getBounds()
        if (featureBounds && featureBounds.intersects(clickBounds)) {
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
          if (searchType === 'scene') {
            if (intersectingFeatures.length > 0) {
              store.dispatch(setClickResults(intersectingFeatures))

              const firstItem = intersectingFeatures[0]
              if (firstItem.id) {
                const { collectionId } = getPathParams()
                getActiveRouter().navigate({
                  to: ROUTE_COLLECTION_ITEM,
                  params: { collectionId, itemId: firstItem.id },
                  search: (prev) => ({ ...prev, tab: 'details' }),
                  replace: true
                })
              }
            }
          } else if (searchType === 'grid-code') {
            for (const i in intersectingFeatures) {
              const iFeature = intersectingFeatures[i]
              gridCodesToSearch.push(iFeature.properties['grid:code'])
            }
          }
        }
      }
      if (searchType === 'grid-code') {
        searchGridCodeScenes(gridCodesToSearch)
      }
    }
  }
}

export function selectMappedScenes() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    const mappedScenes = store.getState().mainSlice.mappedScenes
    store.dispatch(setClickResults(mappedScenes))
    for (const f in mappedScenes) {
      const feature = mappedScenes[f]
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

export function enableMapPolyDrawing() {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    clearLayer('drawBoundsLayer')
    store.getState().mainSlice.mapDrawPolygonHandler.enable()

    map.on(L.Draw.Event.CREATED, (e) => {
      e.layer.options.color = getCustomSearchPolygonStyle().color
      map.eachLayer(function (layer) {
        if (layer.layer_name === 'drawBoundsLayer') {
          const drawLayer = e.layer
          drawLayer.setStyle(getCustomSearchPolygonStyle())
          drawLayer.options.interactive = false
          layer.addLayer(drawLayer)
          const data = layer.toGeoJSON()
          store.dispatch(setSearchGeojsonBoundary(data.features[0]))
          store.dispatch(setIsDrawingEnabled(false))
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
          pointToLayer: function (_feature, latlng) {
            return L.marker(latlng, { icon: customSearchPointIconStyle })
          }
        })
        geojsonLayer.setStyle((feature) => styleFeatures(feature))
        geojsonLayer.options.interactive = false
        layer.addLayer(geojsonLayer)
        store.dispatch(setSearchGeojsonBoundary(geojson))
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

function styleFeatures(feature) {
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
  return {}
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

          const layersInGroupOrdered = layer.getLayers()
          const orderMap = {}
          store.getState().mainSlice.referenceLayers.forEach((item, index) => {
            orderMap[item.combinedLayerName] = index
          })
          layersInGroupOrdered.sort(
            (a, b) => orderMap[b.layer_name] - orderMap[a.layer_name]
          )
          layersInGroupOrdered.forEach(function (layerInGroup) {
            layerInGroup.bringToFront()
          })
        }
      }
    })
  }
}
