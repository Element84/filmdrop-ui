// setup bbox from map viewport
export default function setupBbox(map, commaSeparated) {
  const viewportBounds = map.getBounds()
  const bbox = [
    viewportBounds._southWest.lng,
    viewportBounds._southWest.lat,
    viewportBounds._northEast.lng,
    viewportBounds._northEast.lat
  ]
  if (commaSeparated) {
    bbox.join(',')
  }
  return bbox
}
