import { store } from '../redux/store'
import { appendStacHeaderCookies } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

/**
 * Fetch bounds from a mosaicjson endpoint.
 * @param {string} mosaicURL - Mosaicjson URL.
 * @param {AbortSignal} [signal] - Optional abort signal.
 * @returns {Promise<number[]>} Bounding box array [west, south, east, north].
 * @throws {Object} Normalized error object when request fails.
 */
export async function GetMosaicBoundsService(mosaicURL, signal) {
  const contextLabel = 'Error Fetching Mosaicjson Tile Results'
  try {
    const requestHeaders = new Headers()
    appendStacHeaderCookies(requestHeaders)
    const response = await fetch(mosaicURL, {
      headers: requestHeaders,
      credentials:
        store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
      signal
    })

    if (!response.ok) {
      throw await normalizeStacErrorResponse(response, contextLabel)
    }

    const json = await response.json()
    return json.bounds
  } catch (error) {
    const normalizedError =
      error?.error === true
        ? error
        : normalizeStacNetworkError(error, contextLabel)
    // log full error for diagnosing client side errors if needed
    console.error(contextLabel, normalizedError)
    throw normalizedError
  }
}
