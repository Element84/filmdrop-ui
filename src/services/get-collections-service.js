import { store } from '../redux/store'
import {
  setCollectionsData,
  setShowAppLoading
} from '../redux/slices/mainSlice'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'

export async function GetCollectionsService(searchParams) {
  await fetch(
    `${store.getState().mainSlice.appConfig.STAC_API_URL}/collections`,
    {
      method: 'GET'
    }
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
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
