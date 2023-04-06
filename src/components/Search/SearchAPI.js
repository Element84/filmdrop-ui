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
  selectedCollection
) => {
  let preKey = ''
  if (selectedCollection.startsWith('sentinel')) {
    selectedCollection = 'sentinel'
  } else if (selectedCollection === 'cop-dem-glo-30') {
    selectedCollection = 'cdem'
    preKey = '10'
  } else if (selectedCollection === 'cop-dem-glo-90') {
    selectedCollection = 'cdem'
    preKey = '30'
  } else if (selectedCollection.startsWith('landsat')) {
    selectedCollection = 'landsat'
  }

  const responseData = await fetch(`/data/${selectedCollection}.json`)
  if (!responseData.ok) {
    throw new Error(`An error has occurred: ${responseData.status}`)
  }
  const dataFile = await responseData.json()
  // map grid keys and coordinates
  const mappedDataFile = new Map()
  const prefix = dataFile.prefix
  for (const key in dataFile.cells) {
    const gridKey = `${prefix}-${preKey}${key}`
    const geometries = {
      type: dataFile.type,
      coordinates: dataFile.cells[key]
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
    total_buckets: apiResponse?.aggregations?.find(
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
