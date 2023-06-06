import { store } from '../redux/store'
import {
  setClickResults,
  setSearchLoading,
  setSearchResults,
  setShowPopupModal
} from '../redux/slices/mainSlice'
import { VITE_STAC_API_URL } from '../assets/config'
import { addDataToLayer, footprintLayerStyle } from '../utils/mapHelper'

export async function SearchService(searchParams, typeOfSearch) {
  await fetch(`${VITE_STAC_API_URL}/search?${searchParams}`, {
    method: 'GET'
  })
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
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
