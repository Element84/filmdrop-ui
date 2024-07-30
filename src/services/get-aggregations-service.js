import { store } from '../redux/store'

export async function GetCollectionAggregationsService(collectionId) {
  const requestHeaders = new Headers()
  const JWT = localStorage.getItem('STAC_Auth_Token')
  const isSTACTokenAuthEnabled =
    store.getState().mainSlice.appConfig.STAC_TOKEN_AUTH_ENABLED ?? false
  if (JWT && isSTACTokenAuthEnabled) {
    requestHeaders.append('Authorization', `Bearer ${JWT}`)
  }
  return fetch(
    `${
      store.getState().mainSlice.appConfig.STAC_API_URL
    }/collections/${collectionId}/aggregations`,
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
      return json.aggregations
    })
    .catch((error) => {
      const message = 'Error Fetching Aggregations for: ' + collectionId
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
