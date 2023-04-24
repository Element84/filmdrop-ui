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
  const neLng =
    viewportBounds._northEast.lng > 180 ? 180 : viewportBounds._northEast.lng
  const swLng =
    viewportBounds._southWest.lng < -180 ? -180 : viewportBounds._southWest.lng
  return [
    swLng,
    viewportBounds._southWest.lat,
    neLng,
    viewportBounds._northEast.lat
  ].join(',')
}
