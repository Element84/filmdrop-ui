import { store } from '../redux/store'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

export async function GetCollectionAggregationsService(collectionId, signal) {
  const requestHeaders = buildStacRequestHeaders()
  const contextLabel = `Error Fetching Aggregations for: ${collectionId}`

  try {
    const response = await fetch(
      `${
        store.getState().mainSlice.appConfig.STAC_API_URL
      }/collections/${collectionId}/aggregations`,
      {
        credentials:
          store.getState().mainSlice.appConfig.FETCH_CREDENTIALS ||
          'same-origin',
        headers: requestHeaders,
        signal
      }
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
    return json.aggregations
  } catch (error) {
    if (error?.name === 'AbortError') {
      return undefined
    }
    const normalizedError = normalizeStacNetworkError(error, contextLabel)
    console.error(contextLabel, normalizedError)
    return normalizedError
  }
}
