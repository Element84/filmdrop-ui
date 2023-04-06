import * as L from 'leaflet'

// setup latLngBounds
export function setupBounds(bbox) {
  const swCorner = L.latLng(bbox[1], bbox[0])
  const neCorner = L.latLng(bbox[3], bbox[2])
  return L.latLngBounds(swCorner, neCorner)
}

export function setupGeometryBounds(coordinates) {
  if (coordinates[0].length !== 5) {
    coordinates = coordinates[0][0]
  } else {
    coordinates = coordinates[0]
  }
  const swCorner = L.latLng(coordinates[3][1], coordinates[0][0])
  const neCorner = L.latLng(coordinates[1][1], coordinates[2][0])
  const featureBounds = L.latLngBounds(swCorner, neCorner)
  return featureBounds
}
