// fetch(`${API_ENDPOINT}/collections`)
// .then((response) => response.json())
// .then((actualData) => {
//   const sortedData = actualData.collections.sort((a, b) =>
//     a.id > b.id ? 1 : b.id > a.id ? -1 : 0
//   )
//   setCollectionData(sortedData)
// })
// .catch((err) => {
//   console.log('Collections Fetch Error: ', err.message)
// })

import { store } from '../redux/store'
import {
  setCollectionsData,
  setShowAppLoading
} from '../redux/slices/mainSlice'
import { VITE_STAC_API_URL } from '../assets/config'
import { buildCollectionsData, loadLocalGridData } from '../utils/dataHelper'

export async function GetCollectionsService(searchParams) {
  // get searchType from redux state
  // searchType = scene | grid | geohex
  await fetch(`${VITE_STAC_API_URL}/collections`, {
    method: 'GET'
  })
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
      console.log(formattedData)
      store.dispatch(setCollectionsData(formattedData))
      store.dispatch(setShowAppLoading(false))
      loadLocalGridData()
    })
    .catch((error) => {
      const message = 'Error Fetching Collections'
      // store.dispatch(setClickedOrganizationDetails(null))
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
      //   showApplicationAlert('error', message, 5000)
    })
}
