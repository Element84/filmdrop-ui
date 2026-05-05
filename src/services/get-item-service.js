import { store } from '../redux/store'
import { logoutUser } from '../utils/authHelper'
import { buildStacRequestHeaders } from '../utils/stacRequest'

/**
 * Fetches a single STAC item from the API.
 *
 * When collectionId is provided, fetches directly from
 * /collections/{collectionId}/items/{itemId}.
 *
 * When collectionId is omitted, searches across all collections via
 * /search?ids={itemId}. Returns an error if the item is not found or
 * if multiple items match (ambiguous IDs across collections).
 *
 * @param {string} itemId - The unique identifier for the item
 * @param {string} [collectionId] - The collection ID (optional)
 * @returns {Promise<Object>} The STAC item GeoJSON feature or error object {error: true, status: number}
 * @example
 * // Known collection
 * const item = await GetItemService('S2A_17SNB_20230617_0_L2A', 'sentinel-2-l2a')
 * // Unknown collection — discovers it via search
 * const item = await GetItemService('S2A_17SNB_20230617_0_L2A')
 */
export async function GetItemService(itemId, collectionId) {
  const appConfig = store.getState().mainSlice.appConfig

  const requestHeaders = buildStacRequestHeaders()

  const url = collectionId
    ? `${appConfig.STAC_API_URL}/collections/${collectionId}/items/${itemId}`
    : `${appConfig.STAC_API_URL}/search?${new URLSearchParams({ ids: itemId })}`

  try {
    const response = await fetch(url, {
      credentials: appConfig.FETCH_CREDENTIALS || 'same-origin',
      headers: requestHeaders
    })

    if (!response.ok) {
      if (response.status === 403) {
        logoutUser()
      }
      return { error: true, status: response.status }
    }

    const json = await response.json()

    // Direct endpoint returns the item; search endpoint returns a FeatureCollection
    if (collectionId) {
      return json
    }

    const features = json.features ?? []
    if (features.length === 1) {
      return features[0]
    }

    if (features.length > 1) {
      console.warn(
        `Ambiguous item ID "${itemId}": found in ${features.length} collections ` +
          `(${features.map((f) => f.collection).join(', ')}). ` +
          'Use ?col=<collection>&item=<id> to disambiguate.'
      )
    }

    return { error: true, status: 404 }
  } catch (error) {
    console.error('Error fetching STAC item:', error)
    return { error: true, status: null }
  }
}
