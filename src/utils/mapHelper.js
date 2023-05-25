import * as L from 'leaflet'
import { store } from '../redux/store'

export function mapClickHandler(e) {
  const map = store.getState().mainSlice.map
  const clickBounds = L.latLngBounds(e.latlng, e.latlng)
  console.log(clickBounds)
  if (map && Object.keys(map).length > 0) {
    map.eachLayer(function (layer) {
      if (layer.layer_name) {
        console.log(layer.layer_name)
        console.log(layer.getLayers().length)
      }
    })
  }
}

// searchResultsLayer | clickedSceneHighlightLayer | clickedSceneImageLayer
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

// searchResultsLayer | clickedSceneHighlightLayer | clickedSceneImageLayer
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
      if (layer.layer_name) {
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
  // clear redux selectedFeature
  clearLayer('clickedSceneHighlightLayer')
  clearLayer('clickedSceneImageLayer')
}

function zoomToBounds(bounds) {
  const map = store.getState().mainSlice.map
  if (map && Object.keys(map).length > 0) {
    map.fitBounds(bounds)
  }
}

function leafletBoundsFromBBOX(bbox) {
  const swCorner = L.latLng(bbox[1], bbox[0])
  const neCorner = L.latLng(bbox[3], bbox[2])
  const leafletBounds = L.latLngBounds(swCorner, neCorner)
  return leafletBounds
}

// setup bbox used in the addMosaic function
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
