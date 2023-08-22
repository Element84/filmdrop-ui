import { store } from '../redux/store'
import {
  setCollectionsData,
  setShowAppLoading
} from '../redux/slices/mainSlice'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'
import { showApplicationAlert } from '../utils/alertHelper'

export async function GetCollectionsService(searchParams) {
  const apiRequestConfig = store.getState().mainSlice.appConfig.UI_SOURCE_ID
    ? {
        method: 'GET',
        headers: {
          'X-FILMDROP-UI-SOURCE_ID':
            store.getState().mainSlice.appConfig.UI_SOURCE_ID
        }
      }
    : {
        method: 'GET'
      }

  await fetch(
    `${store.getState().mainSlice.appConfig.STAC_API_URL}/collections`,
    apiRequestConfig
  )
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      const builtCollectionData = buildCollectionsData(json)
      return builtCollectionData
    })
    .then((formattedData) => {
      store.dispatch(setCollectionsData(formattedData))
      store.dispatch(setShowAppLoading(false))
      loadLocalGridData()
    })
    .catch((error) => {
      const message = 'Error Fetching Collections'
      store.dispatch(setShowAppLoading(false))
      showApplicationAlert('error', message, null)
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
