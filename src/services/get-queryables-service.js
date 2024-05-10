import { store } from '../redux/store'

export function GetCollectionQueryablesService(collectionId) {
  return fetch(
    `${
      store.getState().mainSlice.appConfig.STAC_API_URL
    }/collections/${collectionId}/queryables`,
    {
      credentials:
        store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin'
    }
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
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
