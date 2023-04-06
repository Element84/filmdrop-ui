import { convertDateForURL, setupCommaSeparatedBbox } from '../../utils'
import { API_MAX_ITEMS } from '../defaults'

export const getCloudCoverQueryVal = (_cloudCover) => ({
  'eo:cloud_cover': { gte: 0, lte: _cloudCover }
})

export const getPolarizationQueryVal = () => ({
  'sar:polarizations': { in: ['VV', 'VH'] }
})

export const getSearchParams = ({
  datePickerRef,
  map,
  selectedCollectionRef,
  showCloudSliderRef,
  _cloudCover,
  _sarPolarizations,
  aggregated
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

  if (showCloudSliderRef.current) {
    searchParams.set(
      'query',
      encodeURIComponent(JSON.stringify(getCloudCoverQueryVal(_cloudCover)))
    )
  }

  if (_sarPolarizations) {
    if (searchParams.has('query')) {
      searchParams
        .get('query')
        .push(encodeURIComponent(JSON.stringify(getPolarizationQueryVal())))
    } else {
      searchParams.set(
        'query',
        encodeURIComponent(JSON.stringify(getPolarizationQueryVal()))
      )
    }
  }

  const searchParamsStr = [...searchParams]
    .reduce((obj, x) => {
      obj.push(x.join('='))
      return obj
    }, [])
    .join('&')
  return searchParamsStr
}
