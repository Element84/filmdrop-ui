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
  gridCellData
) => {
  let preKey = ''
  if (selectedCollection.startsWith('sentinel-2')) {
    selectedCollection = 'sentinel'
  } else if (selectedCollection === 'cop-dem-glo-30') {
    selectedCollection = 'cdem'
    preKey = '10'
  } else if (selectedCollection === 'cop-dem-glo-90') {
    selectedCollection = 'cdem'
    preKey = '30'
  } else if (selectedCollection.startsWith('landsat')) {
    selectedCollection = 'landsat'
  } else if (selectedCollection.startsWith('naip')) {
    selectedCollection = 'naip'
  }

  // map grid keys and coordinates
  const mappedDataFile = new Map()
  const prefix = gridCellData[selectedCollection].prefix
  for (const key in gridCellData[selectedCollection].cells) {
    const gridKey = `${prefix}-${preKey}${key}`
    const geometries = {
      type: gridCellData[selectedCollection].type,
      coordinates: gridCellData[selectedCollection].cells[key]
    }
    mappedDataFile.set(gridKey, geometries)
  }

  // fetch frequency and counts from API
  const searchURL = `${process.env.REACT_APP_STAC_API_URL}/aggregate?${searchParamsStr}`
  const response = await fetch(searchURL)
  if (!response.ok) {
    throw new Error(`An error has occurred: ${response.status}`)
  }
  const apiResponse = await response.json()

  const apikeys = apiResponse.aggregations?.find(
    (el) => el.name === 'grid_code_frequency'
  )
  const context = {
    total_scenes: apiResponse?.aggregations?.find(
      (el) => el.name === 'total_count'
    )?.value
  }

  // create Geojson file with matched geometry and frequency
  let mappedResults = {}
  const mappedKeys = []
  apikeys.buckets.forEach(function (value) {
    const apiValue = value.key
    const aggregate = {
      type: 'Feature',
      properties: {
        'grid:code': value.key,
        frequency: value.frequency
      }
    }
    aggregate.geometry = mappedDataFile.get(apiValue)
    if (aggregate.geometry) {
      mappedKeys.push(aggregate)
    }
  })
  mappedResults = { features: mappedKeys, context }

  return mappedResults
}
