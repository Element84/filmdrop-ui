import * as L from 'leaflet'
import { store } from '../redux/store'
import { colorMap } from './colorMap'
import { setClickResults, setShowPopupModal } from '../redux/slices/mainSlice'
import { searchGridCodeScenes, debounceNewSearch } from './searchHelper'

export function mapClickHandler(e) {
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
    console.log(_searchType)

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
              console.log(intersectingFeatures)
              store.dispatch(setClickResults(intersectingFeatures))
              store.dispatch(setShowPopupModal(true))
            } else {
              // clear store
              store.dispatch(setClickResults([]))
            }
          } else if (_searchType === 'grid-code') {
            // fetch all scenes from API with matching grid code
            console.log('try to get gridCode data to add to map')
            console.log(feature.properties['grid:code'])
            searchGridCodeScenes(feature.properties['grid:code'])
          }
        }
      }
    }
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

export const footprintLayerStyle = {
  color: '#3183f5',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.1,
  fillColor: '#3183f5'
}

export const gridCodeLayerStyle = {
  color: '#3183f5',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.1,
  fillColor: '#3183f5'
}

export const clickedFootprintLayerStyle = {
  color: '#ff7800',
  weight: 4,
  opacity: 0.65,
  fillOpacity: 0
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
