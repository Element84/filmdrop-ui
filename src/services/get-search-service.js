import { store } from '../redux/store'
import { setSearchLoading } from '../redux/slices/mainSlice'
import { VITE_STAC_API_URL } from '../assets/config'
import { addDataToLayer } from '../utils/mapHelper'

export async function SearchService(searchParams) {
  // get searchType from redux state
  // searchType = scene | grid_code | geohex
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
      // format layer geojson?
      // set results in map layer
      // set results in redux state
      store.dispatch(setSearchLoading(false))
      addDataToLayer(json, 'searchResultsLayer')
      //   store.dispatch(setClickedOrganizationDetails(json))
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Search Results'
      // store.dispatch(setClickedOrganizationDetails(null))
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
      //   showApplicationAlert('error', message, 5000)
    })
}
