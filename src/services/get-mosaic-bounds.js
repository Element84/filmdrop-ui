import { store } from '../redux/store'
import { appendStacHeaderCookies } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

export function GetMosaicBoundsService(mosaicURL, signal) {
  const contextLabel = 'Error Fetching Mosaicjson Tile Results'
  return new Promise(function (resolve, reject) {
    const requestHeaders = new Headers()
    appendStacHeaderCookies(requestHeaders)
    fetch(mosaicURL, {
      headers: requestHeaders,
      credentials:
        store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
      signal
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json()
        }
        throw await normalizeStacErrorResponse(response, contextLabel)
      })
      .then((json) => {
        resolve(json.bounds)
      })
      .catch((error) => {
        const normalizedError =
          error?.error === true
            ? error
            : normalizeStacNetworkError(error, contextLabel)
        // log full error for diagnosing client side errors if needed
        console.error(contextLabel, normalizedError)
        reject(normalizedError)
      })
  })
}
