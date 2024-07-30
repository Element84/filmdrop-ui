import { store } from '../redux/store'
import {
  setCollectionsData,
  setShowAppLoading,
  setapplicationAlertMessage,
  setshowApplicationAlert
} from '../redux/slices/mainSlice'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'

export async function GetCollectionsService(searchParams) {
  const requestHeaders = new Headers()
  const JWT = localStorage.getItem('STAC_Auth_Token')
  const isSTACTokenAuthEnabled =
    store.getState().mainSlice.appConfig.STAC_TOKEN_AUTH_ENABLED ?? false
  if (JWT && isSTACTokenAuthEnabled) {
    requestHeaders.append('Authorization', `Bearer ${JWT}`)
  }
  await fetch(
    `${store.getState().mainSlice.appConfig.STAC_API_URL}/collections`,
    {
      credentials:
        store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
      headers: requestHeaders
    }
  )
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      const error = new Error('Server responded with an error')
      error.status = response.status
      error.statusText = response.statusText
      return response.json().then((err) => {
        error.response = err
        throw error
      })
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
      if (error.status === 403) {
        store.dispatch(
          setapplicationAlertMessage(
            'STAC API returned 403. Bad Token OR needs STAC Auth Enabled in config.',
            'error'
          )
        )
        store.dispatch(setshowApplicationAlert(true))
        // logoutUser()
      }
      const message = 'Error Fetching Collections'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
