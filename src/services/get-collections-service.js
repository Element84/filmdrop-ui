import { store } from '../redux/store'
import {
  setCollectionsData,
  setShowAppLoading,
  setapplicationAlertMessage,
  setshowApplicationAlert
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
      if (!store.getState().mainSlice.appConfig.COLLECTIONS) {
        const builtCollectionData = buildCollectionsData(json)
        return builtCollectionData
      }
      if (json && json.collections && Array.isArray(json.collections)) {
        json.collections = json.collections.filter((collection) => {
          return store
            .getState()
            .mainSlice.appConfig.COLLECTIONS.includes(collection.id)
        })
        const builtCollectionData = buildCollectionsData(json)
        return builtCollectionData
      }
    })
    .then((formattedData) => {
      if (Object.values(formattedData).length === 0) {
        store.dispatch(
          setapplicationAlertMessage('Error: No Collections Found')
        )
        store.dispatch(setshowApplicationAlert(true))
      }
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
