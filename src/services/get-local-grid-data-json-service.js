import { store } from '../redux/store'
import { setLocalGridData } from '../redux/slices/mainSlice'
import { resolveDataUrl, getCacheBusterSuffix } from '../utils/configBase'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

/**
 * Load a local grid data file into Redux cache if it is not already present.
 * @param {string} fileName - Grid dataset name (e.g. cdem, doqq, mgrs, wrs2).
 * @param {AbortSignal} [signal] - Optional abort signal.
 * @returns {Promise<void>} Resolves when fetch and optional cache update complete.
 */
export async function LoadLocalGridDataService(fileName, signal) {
  const configUrl = `${resolveDataUrl(fileName)}${getCacheBusterSuffix()}`
  const contextLabel = 'Error Fetching Local Grid Data'
  try {
    const response = await fetch(configUrl, {
      cache: 'no-store',
      signal
    })

    if (!response.ok) {
      throw await normalizeStacErrorResponse(response, contextLabel)
    }

    const json = await response.json()
    const getLocalGridData = store.getState().mainSlice.localGridData
    const newObject = { [fileName.toUpperCase()]: json }
    if (!Object.prototype.hasOwnProperty.call(getLocalGridData, fileName)) {
      store.dispatch(setLocalGridData({ ...getLocalGridData, ...newObject }))
    }
  } catch (error) {
    const normalizedError =
      error?.error === true
        ? error
        : normalizeStacNetworkError(error, contextLabel)
    // log full error for diagnosing client side errors if needed
    console.error(contextLabel, normalizedError)
  }
}
