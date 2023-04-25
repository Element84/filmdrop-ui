import * as h3 from 'h3-js'

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
  let largestRatio = 0
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

  const convertedItems = buckets.map((feature) => {
    const hexBoundary = h3.cellToBoundary(feature.key, true)

    // fix coordinates that cross anti-meridian
    const longArray = hexBoundary.map((element) => element[0])

    // get general location of polygon points above/below zero
    let posPoints = 0
    let negPoints = 0
    for (const n in longArray) {
      if (longArray[n] > 100) {
        posPoints++
      } else if (longArray[n] < -100) {
        negPoints++
      }
    }
    const positive = posPoints > negPoints
    // adjust coordinate to join the rest of the polygon on the same side of the meridian
    for (const n in hexBoundary) {
      if (!positive && posPoints > 0 && hexBoundary[n][0] > -100) {
        hexBoundary[n][0] = hexBoundary[n][0] - 360
        if (hexBoundary[n][0] < -180) {
          hexBoundary[n][0] = -180
        }
      } else if (positive && negPoints > 0 && hexBoundary[n][0] < -100) {
        hexBoundary[n][0] = hexBoundary[n][0] + 360
        if (hexBoundary[n][0] > 180) {
          hexBoundary[n][0] = 180
        }
      }
    }

    // calculate heat map color ratio
    const colorRatio = (feature.frequency / numberMatched) * 1000
    // capture largest ratio value to set the total number of color variations in colormap
    largestRatio = colorRatio > largestRatio ? colorRatio : largestRatio

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [hexBoundary]
      },
      properties: { frequency: feature.frequency, colorRatio }
    }
  })

  return {
    type: 'FeatureCollection',
    features: convertedItems,
    numberMatched,
    searchType: 'AggregatedResults',
    properties: { largestRatio }
  }
}
