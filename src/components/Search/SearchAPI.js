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

export const fetchGridCodeItems = async (
  searchParamsStr,
  selectedCollection,
  _gridCellData
) => {
  const gridAggName = selectedCollection.includes('landsat')
    ? 'grid_code_landsat_frequency'
    : 'grid_code_frequency'

  // fetch frequency and counts from API
  const searchURL = `${process.env.REACT_APP_STAC_API_URL}/aggregate?${searchParamsStr}&aggregations=${gridAggName},total_count`
  const response = await fetch(searchURL)
  if (!response.ok) {
    throw new Error(`An error has occurred: ${response.status}`)
  }
  const apiResponse = await response.json()
  const buckets = apiResponse.aggregations?.find(
    (el) => el.name === gridAggName
  ).buckets

  const numberMatched = apiResponse?.aggregations?.find(
    (el) => el.name === 'total_count'
  )?.value
  const overflow = apiResponse?.aggregations.find(
    (el) =>
      el.name === 'grid_code_frequency' ||
      el.name === 'grid_code_landsat_frequency'
  ).overflow

  // create Geojson file with matched geometry and frequency
  const mappedKeysToGrid = buckets
    .map((feature) => {
      const coordinates =
        _gridCellData[feature.key.split('-')[0].toLowerCase()].cells[
          feature.key.split('-')[1]
        ]

      return {
        geometry: {
          type: _gridCellData[feature.key.split('-')[0].toLowerCase()].type,
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
    searchType: 'AggregatedResults',
    properties: { overflow }
  }
}

function fixAntiMeridianPoints(hexBoundary) {
  // Example: [-170.6193233947984, -161.63482061718392, -165.41674992858836, -176.05696384421353, 175.98600155652952, 177.51613498805204, -170.6193233947984]
  const longArray = hexBoundary.map((element) => element[0])

  // get general location of polygon points east or west of antimeridian
  const lessThanNegative100 = longArray.filter((lng) => lng < -100)
  const greaterThanPositive100 = longArray.filter((lng) => lng > 100)
  const hasMorePositive =
    greaterThanPositive100.length > lessThanNegative100.length

  // adjust coordinate to join the rest of the polygon on the same side of the meridian
  for (const n in hexBoundary) {
    if (
      !hasMorePositive &&
      greaterThanPositive100.length > 0 &&
      hexBoundary[n][0] > -100
    ) {
      hexBoundary[n][0] = hexBoundary[n][0] - 360
      if (hexBoundary[n][0] < -180) {
        hexBoundary[n][0] = -180
      }
    } else if (
      hasMorePositive &&
      lessThanNegative100.length > 0 &&
      hexBoundary[n][0] < -100
    ) {
      hexBoundary[n][0] = hexBoundary[n][0] + 360
      if (hexBoundary[n][0] > 180) {
        hexBoundary[n][0] = 180
      }
    }
  }
  return hexBoundary
}

export const fetchGeoHexItems = async (searchParamsStr, zoomLevel) => {
  let largestRatio = 0
  let largestFrequency = 0
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
  const overflow = apiResponse?.aggregations.find(
    (el) => el.name === 'grid_geohex_frequency'
  ).overflow

  const convertedItems = buckets.map((feature) => {
    const hexBoundary = h3.cellToBoundary(feature.key, true)

    // fix coordinates that cross anti-meridian
    const fixedBoundaries = fixAntiMeridianPoints(hexBoundary)

    // calculate heat map color ratio
    const colorRatio = (feature.frequency / numberMatched) * 1000
    // capture largest ratio value to set the total number of color variations in colormap
    largestRatio = colorRatio > largestRatio ? colorRatio : largestRatio
    // capture largest frequency value to use in the legend and colormap
    largestFrequency =
      feature.frequency > largestFrequency
        ? feature.frequency
        : largestFrequency

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [fixedBoundaries]
      },
      properties: { frequency: feature.frequency, colorRatio, largestRatio }
    }
  })

  return {
    type: 'FeatureCollection',
    features: convertedItems,
    numberMatched,
    searchType: 'AggregatedResults',
    properties: { largestRatio, largestFrequency, overflow }
  }
}
