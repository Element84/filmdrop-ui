export const fetchAPIitems = async (searchParamsStr) => {
  const searchURL = `${process.env.REACT_APP_STAC_API_URL}/search?${searchParamsStr}`

  const response = await fetch(searchURL)
  if (!response.ok) {
    throw new Error(`An error has occurred: ${response.status}`)
  }
  const items = await response.json()
  return items
}

export const fetchAggregatedItems = async (
  searchParamsStr,
  selectedCollection,
  _gridCellData
) => {
  const frequency = selectedCollection.includes('landsat')
    ? 'grid_code_landsat_frequency'
    : 'grid_code_frequency'

  // fetch frequency and counts from API
  const searchURL = `${process.env.REACT_APP_STAC_API_URL}/aggregate?${searchParamsStr}&aggregations=${frequency},total_count`
  const response = await fetch(searchURL)
  if (!response.ok) {
    throw new Error(`An error has occurred: ${response.status}`)
  }
  const apiResponse = await response.json()
  const apikeys = apiResponse.aggregations?.find((el) => el.name === frequency)

  const numberMatched = apiResponse?.aggregations?.find(
    (el) => el.name === 'total_count'
  )?.value

  // create Geojson file with matched geometry and frequency
  const mappedKeys = apikeys.buckets
    .map((value) => {
      const apiValue = value.key
      const gridKey = apiValue.split('-')
      const coordinates =
        _gridCellData[gridKey[0].toLowerCase()].cells[gridKey[1]]
      return {
        geometry: {
          type: _gridCellData[gridKey[0].toLowerCase()].type,
          coordinates
        },
        type: 'Feature',
        properties: {
          'grid:code': value.key,
          frequency: value.frequency
        }
      }
    })
    .filter((x) => x)

  return {
    type: 'FeatureCollection',
    features: mappedKeys,
    numberMatched,
    searchType: 'AggregatedResults'
  }
}
