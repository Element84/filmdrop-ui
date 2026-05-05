import { store } from '../redux/store'
import { setLocalGridData } from '../redux/slices/mainSlice'
import { resolveDataUrl, getCacheBusterSuffix } from '../utils/configBase'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

export async function LoadLocalGridDataService(fileName, signal) {
  const configUrl = `${resolveDataUrl(fileName)}${getCacheBusterSuffix()}`
  const contextLabel = 'Error Fetching Local Grid Data'
  await fetch(configUrl, {
    cache: 'no-store',
    signal
  })
    .then(async (response) => {
      if (response.ok) {
        return response.json()
      }
      throw await normalizeStacErrorResponse(response, contextLabel)
    })
    .then((json) => {
      const getLocalGridData = store.getState().mainSlice.localGridData
      const newObject = { [fileName.toUpperCase()]: json }
      if (!Object.prototype.hasOwnProperty.call(getLocalGridData, fileName)) {
        store.dispatch(setLocalGridData({ ...getLocalGridData, ...newObject }))
      }
    })
    .catch((error) => {
      const normalizedError =
        error?.error === true
          ? error
          : normalizeStacNetworkError(error, contextLabel)
      // log full error for diagnosing client side errors if needed
      console.error(contextLabel, normalizedError)
    })
}
