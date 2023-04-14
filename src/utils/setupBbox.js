// setup bbox used in the addMosaic function
export const setupArrayBbox = (map) => {
  const viewportBounds = map.getBounds()
  return [
    viewportBounds._southWest.lng,
    viewportBounds._southWest.lat,
    viewportBounds._northEast.lng,
    viewportBounds._northEast.lat
  ]
}

// setup bbox used in the searchAPI function
export const setupCommaSeparatedBbox = (map) => {
  const viewportBounds = map.getBounds()
  return [
    viewportBounds._southWest.lng,
    viewportBounds._southWest.lat,
    viewportBounds._northEast.lng,
    viewportBounds._northEast.lat
  ].join(',')
}

// setup bbox used in the aggregated scenes search
export const boundsToBbox = (bounds) => {
  return [
    bounds._southWest.lng,
    bounds._southWest.lat,
    bounds._northEast.lng,
    bounds._northEast.lat
  ].join(',')
}
