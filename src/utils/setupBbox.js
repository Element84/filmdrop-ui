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
