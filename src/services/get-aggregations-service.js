import { VITE_STAC_API_URL } from '../assets/config'

export async function GetCollectionAggregationsService(collectionId) {
  return fetch(
    `${VITE_STAC_API_URL}/collections/${collectionId}/aggregations`,
    {
      method: 'GET'
    }
  )
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      return json.aggregations
    })
    .catch((error) => {
      const message = 'Error Fetching Aggregations for: ' + collectionId
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
      //   showApplicationAlert('error', message, 5000)
    })
}
