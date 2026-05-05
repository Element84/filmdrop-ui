import { store } from '../redux/store'
import {
  setCollectionsData,
  setCollectionsLoadError,
  setShowAppLoading,
  setApplicationAlertMessage,
  setShowApplicationAlert
} from '../redux/slices/mainSlice'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'
import { showApplicationAlert } from '../utils/alertHelper'
import { getCollections } from './stac-api'
import { buildStacRequestHeaders } from '../utils/stacRequest'

export async function GetCollectionsService(searchParams) {
  const appConfig = store.getState().mainSlice.appConfig
  const requestHeaders = buildStacRequestHeaders()

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
      store.dispatch(setApplicationAlertMessage('Error: No Collections Found'))
      store.dispatch(setShowApplicationAlert(true))
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
