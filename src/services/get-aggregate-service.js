import { store } from '../redux/store'
import { setSearchLoading, setSearchResults } from '../redux/slices/mainSlice'
import {
  addDataToLayer,
  buildHexGridLayerOptions,
  gridCodeLayerStyle
} from '../utils/mapHelper'
import { mapHexGridFromJson, mapGridCodeFromJson } from '../utils/searchHelper'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

const DEFAULT_AGGREGATE_ERROR_SUMMARY =
  'Error Fetching Aggregate Search Results'

export async function AggregateSearchService(
  searchParams,
  gridType,
  contextLabel = DEFAULT_AGGREGATE_ERROR_SUMMARY,
  signal
) {
  const requestHeaders = buildStacRequestHeaders()

  const fetchOptions = {
    credentials:
      store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
    headers: requestHeaders
  }
  if (signal) {
    fetchOptions.signal = signal
  }

  try {
    const response = await fetch(
      `${
        store.getState().mainSlice.appConfig.STAC_API_URL
      }/aggregate?${searchParams}`,
      fetchOptions
    )

    if (!response.ok) {
      const normalizedError = await normalizeStacErrorResponse(
        response,
        contextLabel
      )
      console.error(contextLabel, normalizedError)
      return normalizedError
    }

    const json = await response.json()

    let gridFromJson
    let options
    if (gridType === 'hex') {
      gridFromJson = mapHexGridFromJson(json)
      store.dispatch(setSearchResults(gridFromJson))
      options = buildHexGridLayerOptions(gridFromJson.properties.largestRatio)
    } else {
      gridFromJson = mapGridCodeFromJson(json)
      store.dispatch(setSearchResults(gridFromJson))
      options = {
        style: gridCodeLayerStyle,
        onEachFeature: function (feature, layer) {
          const scenes = feature.properties.frequency > 1 ? 'scenes' : 'scene'
          layer.bindTooltip(
            `${feature.properties.frequency.toString()} <span>${scenes}</span>`,
            {
              permanent: false,
              direction: 'top',
              className: 'tooltip_style',
              interactive: false
            }
          )
          layer.on('mouseout', function (e) {
            const map = store.getState().mainSlice.map
            map.eachLayer(function (layer) {
              if (layer.getTooltip()) {
                layer.closeTooltip()
              }
            })
          })
        }
      }
    }

    addDataToLayer(gridFromJson, 'searchResultsLayer', options, true)
    return undefined
  } catch (error) {
    if (error?.name === 'AbortError') {
      return undefined
    }
    const normalizedError = normalizeStacNetworkError(error, contextLabel)
    console.error(contextLabel, normalizedError)
    return normalizedError
  } finally {
    store.dispatch(setSearchLoading(false))
  }
}
