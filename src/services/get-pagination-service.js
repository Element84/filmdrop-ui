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
  footprintLayerStyle,
  clearLayer,
  clearMapSelection
} from '../utils/mapHelper'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import { DEFAULT_API_MAX_ITEMS } from '../constants/defaults'
import { getActiveRouter, getPathParams, ROUTE_COLLECTION } from '../router'

/**
 * Fetch a specific page of search results using pagination links
 * @param {string} pageUrl - The URL to fetch (next or prev link from STAC API)
 * @param {number} pageNumber - The page number being fetched
 */
export async function FetchPageService(pageUrl, pageNumber) {
  const requestHeaders = buildStacRequestHeaders()

  // If currently viewing an item, navigate back to collection path
  const pathParams = getPathParams()
  if (pathParams.itemId) {
    getActiveRouter().navigate({
      to: ROUTE_COLLECTION,
      params: { collectionId: pathParams.collectionId },
      search: (prev) => ({ ...prev }),
      replace: true
    })
  }

  store.dispatch(setSearchLoading(true))

  await fetch(pageUrl, {
    credentials:
      store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
    headers: requestHeaders
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      // Clear previous results and selection from map
      clearMapSelection()
      clearLayer('searchResultsLayer')
      clearLayer('clickedSceneImageLayer')

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
        const history = store.getState().mainSlice.paginationHistory
        const existingPageIndex = history.findIndex(
          (h) => h.page === pageNumber
        )

        if (existingPageIndex === -1) {
          // Add new page to history
          store.dispatch(
            addToPaginationHistory({ page: pageNumber, url: pageUrl })
          )
        } else {
          // Trim history to this page (going back)
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
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Paginated Results'
      console.error(message, error)
    })
}
