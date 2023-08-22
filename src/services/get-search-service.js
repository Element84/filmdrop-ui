import { store } from '../redux/store'
import {
  setClickResults,
  setSearchLoading,
  setSearchResults,
  setShowPopupModal
} from '../redux/slices/mainSlice'
import { addDataToLayer, footprintLayerStyle } from '../utils/mapHelper'
import { showApplicationAlert } from '../utils/alertHelper'

export async function SearchService(searchParams, typeOfSearch) {
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
    `${
      store.getState().mainSlice.appConfig.STAC_API_URL
    }/search?${searchParams}`,
    apiRequestConfig
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
        const options = {
          style: footprintLayerStyle
        }
        store.dispatch(setSearchLoading(false))
        addDataToLayer(json, 'searchResultsLayer', options)
      } else {
        store.dispatch(setSearchLoading(false))
        store.dispatch(setClickResults(json.features))
        store.dispatch(setShowPopupModal(true))
      }
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Search Results'
      showApplicationAlert('error', message, null)
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
