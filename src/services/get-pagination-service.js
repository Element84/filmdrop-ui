import { store } from '../redux/store'
import {
  setSearchLoading,
  setSearchResults,
  setMappedScenes,
  setPaginationNextLink,
  setPaginationPrevLink,
  setCurrentPage,
  setTotalPages,
  addToPaginationHistory,
  setPaginationHistory
} from '../redux/slices/mainSlice'
import {
  addDataToLayer,
  clearLayer,
  clearMapSelection,
  CLICKED_SCENE_IMAGE_LAYER
} from '../utils/mapLayers'
import { footprintLayerStyle } from '../utils/mapStyles'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'
import { DEFAULT_API_MAX_ITEMS } from '../constants/defaults'
import { ROUTE_COLLECTION } from '../route-constants'
import { getActiveUrlController } from '../url-controller'

/**
 * Fetch a specific page of search results using pagination links
 * @param {string} pageUrl - The URL to fetch (next or prev link from STAC API)
 * @param {number} pageNumber - The page number being fetched
 * @param {AbortSignal} [signal] - Optional abort signal.
 * @returns {Promise<void | Object | undefined>} Resolves after state/layer updates complete, returns normalized error object on failure, or undefined when aborted.
 */
export async function FetchPageService(pageUrl, pageNumber, signal) {
  const requestHeaders = buildStacRequestHeaders()

  // If currently viewing an item, navigate back to collection path
  const pathParams = getActiveUrlController().getPathParams()
  if (pathParams.itemId) {
    getActiveUrlController().navigate({
      to: ROUTE_COLLECTION,
      params: { collectionId: pathParams.collectionId },
      search: (prev) => ({ ...prev }),
      replace: true
    })
  }

  store.dispatch(setSearchLoading(true))

  try {
    const response = await fetch(pageUrl, {
      credentials:
        store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
      headers: requestHeaders,
      signal
    })

    if (!response.ok) {
      throw await normalizeStacErrorResponse(
        response,
        'Error Fetching Paginated Results'
      )
    }

    const json = await response.json()

    // Clear previous results and selection from map
    clearMapSelection()
    clearLayer('searchResultsLayer')
    clearLayer(CLICKED_SCENE_IMAGE_LAYER)

    store.dispatch(setSearchResults(json))
    store.dispatch(setMappedScenes(json.features || []))

    // Extract pagination metadata
    const nextLink = json.links?.find((link) => link.rel === 'next')
    const prevLink = json.links?.find((link) => link.rel === 'prev')

    store.dispatch(setPaginationNextLink(nextLink?.href || null))
    store.dispatch(setPaginationPrevLink(prevLink?.href || null))

    // Only update page number if we have features or if it's valid within totalPages
    const currentTotalPages = store.getState().mainSlice.totalPages
    if (
      json.features?.length > 0 ||
      !currentTotalPages ||
      pageNumber <= currentTotalPages
    ) {
      store.dispatch(setCurrentPage(pageNumber))

      // Update pagination history
      const history = store.getState().mainSlice.paginationHistory || []
      const existingPageIndex = history.findIndex(
        (entry) => entry.page === pageNumber
      )

      if (existingPageIndex === -1) {
        // Add new page to history
        store.dispatch(
          addToPaginationHistory({ page: pageNumber, url: pageUrl })
        )
      } else if (existingPageIndex < history.length - 1) {
        store.dispatch(
          setPaginationHistory(history.slice(0, existingPageIndex + 1))
        )
      }
    }

    // Calculate total pages if we have numberMatched
    if (json.context?.matched || json.numberMatched) {
      const totalItems = json.context?.matched || json.numberMatched
      const limit =
        store.getState().mainSlice.appConfig.API_MAX_ITEMS ||
        DEFAULT_API_MAX_ITEMS
      const totalPages = Math.ceil(totalItems / limit)
      store.dispatch(setTotalPages(totalPages))
    }

    const options = {
      style: footprintLayerStyle
    }
    store.dispatch(setSearchLoading(false))
    addDataToLayer(json, 'searchResultsLayer', options, true)
  } catch (error) {
    store.dispatch(setSearchLoading(false))

    if (error?.name === 'AbortError') {
      return undefined
    }

    const message = 'Error Fetching Paginated Results'
    const normalizedError =
      error?.error === true ? error : normalizeStacNetworkError(error, message)
    console.error(message, normalizedError)
    return normalizedError
  }
}
