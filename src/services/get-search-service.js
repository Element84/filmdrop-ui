import { store } from '../redux/store'
import {
  setClickResults,
  setSearchLoading,
  setSearchResults,
  setmappedScenes,
  settabSelected,
  sethasLeftPanelTabChanged
} from '../redux/slices/mainSlice'
import { addDataToLayer, footprintLayerStyle } from '../utils/mapHelper'

export async function SearchService(searchParams, typeOfSearch) {
  const requestHeaders = new Headers()
  const JWT = localStorage.getItem('APP_AUTH_TOKEN')
  const isSTACTokenAuthEnabled =
    store.getState().mainSlice.appConfig.APP_TOKEN_AUTH_ENABLED ?? false
  if (JWT && isSTACTokenAuthEnabled) {
    requestHeaders.append('Authorization', `Bearer ${JWT}`)
  }
  await fetch(
    `${
      store.getState().mainSlice.appConfig.STAC_API_URL
    }/search?${searchParams}`,
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
      throw new Error()
    })
    .then((json) => {
      if (typeOfSearch === 'scene') {
        store.dispatch(setSearchResults(json))
        store.dispatch(setmappedScenes(json.features))
        const options = {
          style: footprintLayerStyle
        }
        store.dispatch(setSearchLoading(false))
        addDataToLayer(json, 'searchResultsLayer', options, true)
      } else {
        store.dispatch(setSearchLoading(false))
        store.dispatch(setClickResults(json.features))
        store.dispatch(settabSelected('details'))
        store.dispatch(sethasLeftPanelTabChanged(true))
      }
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Search Results'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
