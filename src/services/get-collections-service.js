import { store } from '../redux/store'
import {
  setCollectionsData,
  setCollectionsLoadError,
  setShowAppLoading
} from '../redux/slices/mainSlice'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'
import { getCollections } from './stac-api'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import { normalizeStacNetworkError } from '../utils/stacErrorHelper'

export async function GetCollectionsService(searchParams, signal) {
  const appConfig = store.getState().mainSlice.appConfig
  const requestHeaders = buildStacRequestHeaders()

  try {
    // Use stac-api client to fetch collections
    const json = await getCollections(appConfig.STAC_API_URL, {
      headers: requestHeaders,
      credentials: appConfig.FETCH_CREDENTIALS || 'same-origin',
      signal
    })

    const collections = appConfig.COLLECTIONS

    // Filter collections based on auto-configured _ids
    if (collections?._ids && Array.isArray(collections._ids)) {
      json.collections = json.collections.filter((collection) =>
        collections._ids.includes(collection.id)
      )
    }

    const formattedData = await buildCollectionsData(json)
    const collectionsCount = Object.values(formattedData).length

    store.dispatch(setCollectionsData(formattedData))
    store.dispatch(setCollectionsLoadError(false))
    store.dispatch(setShowAppLoading(false))
    loadLocalGridData()

    return {
      error: false,
      collectionsCount
    }
  } catch (error) {
    const normalizedError =
      error?.error === true
        ? error
        : normalizeStacNetworkError(error, 'Error Fetching Collections')

    // Set empty collections data to prevent UI errors
    store.dispatch(setCollectionsData([]))
    store.dispatch(setCollectionsLoadError(true))
    store.dispatch(setShowAppLoading(false))

    const message = 'Error Fetching Collections'
    // log full error for diagnosing client side errors if needed
    console.error(message, normalizedError)
    return normalizedError
  }
}
