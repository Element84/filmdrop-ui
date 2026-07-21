import { store } from '../redux/store'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

/**
 * Fetch aggregation definitions for a collection.
 * @param {string} collectionId - STAC collection id.
 * @param {AbortSignal} [signal] - Optional abort signal.
 * @returns {Promise<Array|Object|undefined>} Aggregation array, normalized error object, or undefined on abort.
 */
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
