import { store } from '../redux/store'
import { getAuthToken } from '../utils/authHelper'
import {
  setCollectionsData,
  setCollectionsLoadError,
  setShowAppLoading,
  setapplicationAlertMessage,
  setshowApplicationAlert
} from '../redux/slices/mainSlice'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'
import { showApplicationAlert } from '../utils/alertHelper'
import { getCollections } from './stac-api'
import { appendStacHeaderCookies } from '../utils/stacRequest'

export async function GetCollectionsService(searchParams) {
  const appConfig = store.getState().mainSlice.appConfig
  const JWT = getAuthToken()
  const isSTACTokenAuthEnabled = appConfig.APP_TOKEN_AUTH_ENABLED ?? false

  // Build custom headers for authentication
  const requestHeaders = new Headers()
  if (JWT && isSTACTokenAuthEnabled) {
    requestHeaders.append('Authorization', `Bearer ${JWT}`)
  }
  appendStacHeaderCookies(requestHeaders)

  try {
    // Use stac-api client to fetch collections
    const json = await getCollections(appConfig.STAC_API_URL, {
      headers: requestHeaders,
      credentials: appConfig.FETCH_CREDENTIALS || 'same-origin'
    })

    const collections = appConfig.COLLECTIONS

    // Filter collections based on auto-configured _ids
    if (collections?._ids && Array.isArray(collections._ids)) {
      json.collections = json.collections.filter((collection) =>
        collections._ids.includes(collection.id)
      )
    }

    const formattedData = await buildCollectionsData(json)

    if (Object.values(formattedData).length === 0) {
      store.dispatch(setapplicationAlertMessage('Error: No Collections Found'))
      store.dispatch(setshowApplicationAlert(true))
    }

    store.dispatch(setCollectionsData(formattedData))
    store.dispatch(setCollectionsLoadError(false))
    store.dispatch(setShowAppLoading(false))
    loadLocalGridData()
  } catch (error) {
    // Set empty collections data to prevent UI errors
    store.dispatch(setCollectionsData([]))
    store.dispatch(setCollectionsLoadError(true))
    store.dispatch(setShowAppLoading(false))

    if (error.status === 403) {
      showApplicationAlert(
        'error',
        'STAC API returned 403. Bad Token OR needs STAC Auth Enabled in config.',
        null,
        true
      )
    } else {
      showApplicationAlert('error', 'Error Fetching Collections')
    }
    const message = 'Error Fetching Collections'
    // log full error for diagnosing client side errors if needed
    console.error(message, error)
  }
}
