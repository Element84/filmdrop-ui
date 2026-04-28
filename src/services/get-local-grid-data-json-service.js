import { store } from '../redux/store'
import { setLocalGridData } from '../redux/slices/mainSlice'
import { resolveDataUrl, getCacheBusterSuffix } from '../utils/configBase'

export async function LoadLocalGridDataService(fileName) {
  const configUrl = `${resolveDataUrl(fileName)}${getCacheBusterSuffix()}`
  await fetch(configUrl, {
    cache: 'no-store'
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      const getLocalGridData = store.getState().mainSlice.localGridData
      const newObject = { [fileName.toUpperCase()]: json }
      if (!Object.prototype.hasOwnProperty.call(getLocalGridData, fileName)) {
        store.dispatch(setLocalGridData({ ...getLocalGridData, ...newObject }))
      }
    })
    .catch((error) => {
      const message = 'Error Fetching Local Grid Data'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
