import { store } from '../redux/store'
import {
  setClickResults,
  setSearchLoading,
  setSearchResults,
  setmappedScenes,
  settabSelected,
  setpaginationNextLink,
  setpaginationPrevLink,
  setcurrentPage,
  settotalPages,
  setpaginationHistory
} from '../redux/slices/mainSlice'
import { addDataToLayer, footprintLayerStyle } from '../utils/mapHelper'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import { DEFAULT_API_MAX_ITEMS } from '../components/defaults'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

const DEFAULT_SEARCH_ERROR_SUMMARY = 'Error Fetching Search Results'
const DEFAULT_MOSAIC_TOP_ITEMS_ERROR_SUMMARY =
  'Error fetching top items for mosaic'

export async function SearchService(
  searchParams,
  typeOfSearch,
  contextLabel = DEFAULT_SEARCH_ERROR_SUMMARY,
  signal
) {
  const requestHeaders = buildStacRequestHeaders()

  const stacApiUrl = `${
    store.getState().mainSlice.appConfig.STAC_API_URL
  }/search?${searchParams}`

  console.log('STAC API Search Request:', stacApiUrl)
  console.log('Search Parameters:', searchParams)

  const fetchOptions = {
    credentials:
      store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
    headers: requestHeaders
  }
  if (signal) {
    fetchOptions.signal = signal
  }

  try {
    const response = await fetch(stacApiUrl, fetchOptions)

    if (!response.ok) {
      const normalizedError = await normalizeStacErrorResponse(
        response,
        contextLabel
      )
      console.error(contextLabel, normalizedError)
      return normalizedError
    }

    const json = await response.json()

    if (typeOfSearch === 'scene') {
      store.dispatch(setSearchResults(json))
      store.dispatch(setmappedScenes(json.features))

      // Extract pagination metadata
      const nextLink = json.links?.find((link) => link.rel === 'next')
      const prevLink = json.links?.find((link) => link.rel === 'prev')

      store.dispatch(setpaginationNextLink(nextLink?.href || null))
      store.dispatch(setpaginationPrevLink(prevLink?.href || null))
      store.dispatch(setcurrentPage(1))

      // Initialize pagination history with the current search URL (page 1)
      const currentUrl = `${store.getState().mainSlice.appConfig.STAC_API_URL}/search?${searchParams}`
      store.dispatch(setpaginationHistory([{ page: 1, url: currentUrl }]))

      // Calculate total pages if we have numberMatched
      if (json.context?.matched || json.numberMatched) {
        const totalItems = json.context?.matched || json.numberMatched
        const limit =
          store.getState().mainSlice.appConfig.API_MAX_ITEMS ||
          DEFAULT_API_MAX_ITEMS
        const totalPages = Math.ceil(totalItems / limit)
        store.dispatch(settotalPages(totalPages))
      }

      const options = {
        style: footprintLayerStyle
      }
      addDataToLayer(json, 'searchResultsLayer', options, true)
      return undefined
    }

    store.dispatch(setClickResults(json.features))
    store.dispatch(settabSelected('details'))
    return undefined
  } catch (error) {
    if (error?.name === 'AbortError') {
      return undefined
    }
    const normalizedError = normalizeStacNetworkError(error, contextLabel)
    console.error(contextLabel, normalizedError)
    return normalizedError
  } finally {
    store.dispatch(setSearchLoading(false))
  }
}

export async function fetchTopItemsForMosaic(
  searchParams,
  limit,
  contextLabel = DEFAULT_MOSAIC_TOP_ITEMS_ERROR_SUMMARY,
  signal
) {
  const requestHeaders = buildStacRequestHeaders()

  const effectiveLimit = Math.max(1, limit || 1)

  const stacApiUrl = `${
    store.getState().mainSlice.appConfig.STAC_API_URL
  }/search?${searchParams}`

  const fetchOptions = {
    credentials:
      store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
    headers: requestHeaders
  }
  if (signal) {
    fetchOptions.signal = signal
  }

  try {
    const response = await fetch(stacApiUrl, fetchOptions)

    if (!response.ok) {
      const normalizedError = await normalizeStacErrorResponse(
        response,
        contextLabel
      )
      throw normalizedError
    }

    const json = await response.json()
    const itemIds = Array.isArray(json.features)
      ? json.features.map((feature) => feature.id).filter(Boolean)
      : []

    return {
      itemIds,
      effectiveLimit: Math.min(effectiveLimit, itemIds.length)
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error
    }
    if (error && error.error) {
      console.error(contextLabel, error)
      throw error
    }

    const normalizedError = normalizeStacNetworkError(error, contextLabel)
    console.error(contextLabel, normalizedError)
    throw normalizedError
  }
}
