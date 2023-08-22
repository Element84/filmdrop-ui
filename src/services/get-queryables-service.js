import { store } from '../redux/store'
import { showApplicationAlert } from '../utils/alertHelper'

export async function GetCollectionQueryablesService(collectionId) {
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

  return fetch(
    `${
      store.getState().mainSlice.appConfig.STAC_API_URL
    }/collections/${collectionId}/queryables`,
    apiRequestConfig
  )
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      return json.properties
    })
    .catch((error) => {
      const message = 'Error Fetching Aggregations for: ' + collectionId
      showApplicationAlert('error', message, null)
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
