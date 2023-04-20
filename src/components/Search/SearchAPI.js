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
  const apiKeys = apiResponse.aggregations?.find(
    (el) => el.name === frequency
  ).buckets

  const numberMatched = apiResponse?.aggregations?.find(
    (el) => el.name === 'total_count'
  )?.value

  // create Geojson file with matched geometry and frequency
  const mappedKeysToGrid = apiKeys
    .map((feature) => {
      let coordinates =
        _gridCellData[feature.key.split('-')[0].toLowerCase()].cells[
          feature.key.split('-')[1]
        ]

      // for multipolygon grid cells, extract the next array
      if (coordinates && coordinates[0].length === 1) {
        coordinates = coordinates[0]
      }
      return {
        geometry: {
          type: 'Polygon',
          coordinates
        },
        type: 'Feature',
        properties: {
          'grid:code': feature.key,
          frequency: feature.frequency
        }
      }
    })
    .filter((feature) => feature.geometry.coordinates)

  return {
    type: 'FeatureCollection',
    features: mappedKeysToGrid,
    numberMatched,
    searchType: 'AggregatedResults'
  }
}

export const fetchGeoHexItems = async (searchParamsStr, zoomLevel) => {
  const precision = Math.round(zoomLevel / 3)

  // fetch frequency and counts from API
  const searchURL = `${process.env.REACT_APP_STAC_API_URL}/aggregate?${searchParamsStr}&aggregations=grid_geohex_frequency,total_count&grid_geohex_frequency_precision=${precision}`
  const response = await fetch(searchURL)
  if (!response.ok) {
    throw new Error(`An error has occurred: ${response.status}`)
  }
  const apiResponse = await response.json()
  const buckets = apiResponse.aggregations?.find(
    (el) => el.name === 'grid_geohex_frequency'
  ).buckets

  const numberMatched = apiResponse?.aggregations?.find(
    (el) => el.name === 'total_count'
  )?.value

  // set up the max and min values for frequency results
  const frequencyArr = buckets.map((feature) => feature.frequency)
  const frequencyMax = Math.max.apply(null, frequencyArr)
  const frequencyMin = Math.min.apply(null, frequencyArr)

  const h3 = require('h3-js')

  const convertedItems = buckets.map((feature) => {
    const hexBoundary = h3.cellToBoundary(feature.key)

    const frequencyScale =
      1 - (frequencyMax - feature.frequency) / (frequencyMax - frequencyMin)
    let colorLevel = 'low'
    if (frequencyScale > 0.25 && frequencyScale <= 0.5) {
      colorLevel = 'mid'
    } else if (frequencyScale > 0.5 && frequencyScale <= 0.75) {
      colorLevel = 'high'
    } else if (frequencyScale > 0.75) {
      colorLevel = 'max'
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [hexBoundary]
      },
      properties: { frequency: feature.frequency, colorLevel }
    }
  })

  return {
    type: 'FeatureCollection',
    features: convertedItems,
    numberMatched,
    searchType: 'AggregatedResults',
    properties: { freqMax: frequencyMax, freqMin: frequencyMin }
  }
}
