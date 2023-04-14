import { convertDateForURL, setupCommaSeparatedBbox } from '../../utils'
import { API_MAX_ITEMS } from '../defaults'

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
  _sarPolarizations,
  aggregated,
  gridCode
}) => {
  const aggregatedResults = aggregated || false

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

  if (!aggregatedResults) {
    searchParams.set('limit', API_MAX_ITEMS)
  }

  if (selectedCollectionRef.current) {
    searchParams.set('collections', selectedCollectionRef.current)
  }

  const query = {}
  if (showCloudSliderRef.current) {
    query['eo:cloud_cover'] = getCloudCoverQueryVal(_cloudCover)
  }
  if (_sarPolarizations) {
    query['sar:polarizations'] = { in: ['VV', 'VH'] }
  }
  if (gridCode) {
    if (selectedCollectionRef.current.includes('landsat')) {
      const gridCodeSplit = gridCode.split('-')[1]
      query['landsat:wrs_path'] = { eq: gridCodeSplit.substring(0, 3) }
      query['landsat:wrs_row'] = { eq: gridCodeSplit.slice(-3) }
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
  console.log(searchParamsStr)
  return searchParamsStr
}
