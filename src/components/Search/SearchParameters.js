import { convertDateForURL, setupCommaSeparatedBbox } from '../../utils'
import { API_MAX_ITEMS, SearchTypes } from '../defaults'

export const getCloudCoverQueryVal = (_cloudCover) => ({
  gte: 0,
  lte: _cloudCover
})

export const getSearchParams = ({
  datePickerRef,
  map,
  selectedCollectionRef,
  showCloudSliderRef,
  _cloudCover,
  sarPolarizationsRef,
  typeOfSearch,
  gridCode,
  mosaicLimit
}) => {
  // build date input
  const combinedDateRange = convertDateForURL(datePickerRef.current)

  // get viewport bounds and setup bbox parameter if a bbox is not passed in
  let bbox = null
  if (typeof map === 'object' && !Array.isArray(map) && map !== null) {
    bbox = setupCommaSeparatedBbox(map)
  } else {
    bbox = map
  }
  const searchParams = new Map([
    ['bbox', bbox],
    ['datetime', combinedDateRange]
  ])

  if (typeOfSearch === SearchTypes.Scene) {
    searchParams.set('limit', API_MAX_ITEMS)
  }

  if (mosaicLimit) {
    searchParams.set('limit', mosaicLimit)
  }

  if (selectedCollectionRef.current) {
    searchParams.set('collections', selectedCollectionRef.current)
  }

  const query = {}
  if (showCloudSliderRef.current) {
    query['eo:cloud_cover'] = getCloudCoverQueryVal(_cloudCover)
  }
  if (sarPolarizationsRef.current) {
    query['sar:polarizations'] = { in: ['VV', 'VH'] }
  }
  if (gridCode) {
    if (selectedCollectionRef.current.includes('landsat')) {
      // extract the path and row from gridcode value, e.g., WRS2-123123
      query['landsat:wrs_path'] = { eq: gridCode.substring(5, 8) }
      query['landsat:wrs_row'] = { eq: gridCode.slice(-3) }
    } else {
      query['grid:code'] = { eq: gridCode }
    }
  }

  searchParams.set('query', encodeURIComponent(JSON.stringify(query)))

  const searchParamsStr = [...searchParams]
    .reduce((obj, x) => {
      obj.push(x.join('='))
      return obj
    }, [])
    .join('&')

  return searchParamsStr
}
