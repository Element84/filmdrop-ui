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
      console.error(message, error)
      //   showApplicationAlert('error', message, 5000)
    })
}
