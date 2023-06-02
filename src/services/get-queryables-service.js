import { VITE_STAC_API_URL } from '../assets/config'

export function GetCollectionQueryablesService(collectionId) {
  return fetch(`${VITE_STAC_API_URL}/collections/${collectionId}/queryables`, {
    method: 'GET'
  })
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
