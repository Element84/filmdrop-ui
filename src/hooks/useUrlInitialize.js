/**
 * URL state initialization hook.
 *
 * Handles one-time restoration of app state from a shared URL.
 * When the app loads, this hook reads URL search params and populates
 * Redux state, then auto-executes a search if search params are present.
 *
 * Called internally by useUrlStateSync — not used directly by components.
 */
import { useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  setSelectedCollection,
  setSelectedCollectionData,
  setSelectedVisualization,
  setTabSelected,
  setSearchDateRangeValue,
  setViewMode,
  setQueryableFilters,
  setClickResults,
  setCurrentPopupResult,
  setSelectedPopupResultIndex,
  setSearchResults,
  setMappedScenes
} from '../redux/slices/mainSlice'
import { GetItemService } from '../services/get-item-service'
import { syncSelectionWithFetchedItem } from '../utils/selectionSync'
import {
  addDataToLayer,
  footprintLayerStyle,
  clearMapSelection,
  zoomToCollectionExtent,
  zoomToItemExtent
} from '../utils/mapHelper'
import { getCollectionVisualizations } from '../utils/configHelper'
import { showApplicationAlert } from '../utils/alertHelper'
import { newSearch } from '../utils/searchHelper'
import { extractQueryableParams } from '../router'
import { deserializeQueryableFiltersFromURL } from '../utils/urlParamHelper'
import { store } from '../redux/store'

/**
 * Check if a search object has meaningful search-committed params
 * that indicate a search was previously executed.
 */
function hasSearchParams(search) {
  return !!(search.col && search.dt)
}

export function useUrlInitialize(search, dispatch) {
  const isInitializedRef = useRef(false)
  const isInitializing = useRef(false)
  const prevSearchRef = useRef(null)
  const latestItemRequest = useRef(null)

  // Redux state we need to watch for initialization readiness
  const appConfig = useSelector((state) => state.mainSlice.appConfig)
  const collectionsData = useSelector(
    (state) => state.mainSlice.collectionsData
  )
  const map = useSelector((state) => state.mainSlice.map)

  /**
   * Fetch and display a STAC item by collection and item ID.
   * Sets clickResults, currentPopupResult, and triggers raster overlay.
   */
  const fetchAndDisplayItem = useCallback(
    async (collectionId, itemId, prefetchedItem) => {
      if (!collectionId || !itemId) return

      latestItemRequest.current = itemId

      // If the item is already in search results (e.g. from a map click),
      // use it directly instead of making a redundant API call.
      const searchResults = store.getState().mainSlice.searchResults
      const cachedItem = searchResults?.features?.find((f) => f.id === itemId)
      if (cachedItem) {
        const existingClickResults = store.getState().mainSlice.clickResults
        const { clickResults, selectedIndex, currentResult } =
          syncSelectionWithFetchedItem(existingClickResults, cachedItem)

        dispatch(setClickResults(clickResults))
        dispatch(setSelectedPopupResultIndex(selectedIndex))
        dispatch(setCurrentPopupResult(currentResult))
        return cachedItem
      }

      try {
        // Use pre-fetched item or fetch from API
        const result =
          prefetchedItem ?? (await GetItemService(itemId, collectionId))

        // Discard result if a newer item request was initiated during the fetch
        if (latestItemRequest.current !== itemId) return

        if (result.error) {
          if (result.status === 404) {
            showApplicationAlert(
              'warning',
              `Item "${itemId}" not found in collection "${collectionId}"`
            )
          } else if (result.status === 403) {
            showApplicationAlert('warning', 'Authentication required')
          } else {
            showApplicationAlert(
              'error',
              'Unable to load item. Please check your network connection.'
            )
          }
          return
        }

        // Re-read from store — searchResults may have changed during the await
        const currentSearchResults = store.getState().mainSlice.searchResults

        // Add item to search results layer on map if not already there
        if (
          !currentSearchResults?.features ||
          currentSearchResults?.searchType === 'direct-item'
        ) {
          const searchResultsObject = {
            type: 'FeatureCollection',
            features: [result],
            searchType: 'direct-item'
          }
          dispatch(setSearchResults(searchResultsObject))
          dispatch(setMappedScenes(searchResultsObject.features))
          addDataToLayer(
            searchResultsObject,
            'searchResultsLayer',
            { style: footprintLayerStyle },
            true
          )
        }

        // Sync with existing click results
        const existingClickResults = store.getState().mainSlice.clickResults
        const { clickResults, selectedIndex, currentResult } =
          syncSelectionWithFetchedItem(existingClickResults, result)

        dispatch(setClickResults(clickResults))
        dispatch(setSelectedPopupResultIndex(selectedIndex))
        dispatch(setCurrentPopupResult(currentResult))
        return result
      } catch (error) {
        console.error('Error fetching item:', error)
        showApplicationAlert(
          'error',
          'An unexpected error occurred while loading the item'
        )
      }
    },
    [dispatch]
  )

  /**
   * Clear item selection state.
   */
  const clearItemSelection = useCallback(() => {
    clearMapSelection()
    dispatch(setClickResults([]))
    dispatch(setCurrentPopupResult(null))
    dispatch(setSelectedPopupResultIndex(0))
  }, [dispatch])

  /**
   * Initialization from shared URL.
   * Runs once when appConfig, collectionsData, and map are all ready.
   */
  useEffect(() => {
    if (isInitializedRef.current || isInitializing.current) return
    if (!appConfig || !collectionsData || collectionsData.length === 0) return
    if (!map || Object.keys(map).length === 0) return

    isInitializing.current = true

    function restoreVisualization(col, viz) {
      if (!viz) return
      const { visualizationKeys, hasVisualizations } =
        getCollectionVisualizations(col)
      if (hasVisualizations && visualizationKeys.includes(viz)) {
        dispatch(setSelectedVisualization(viz))
      } else if (viz) {
        showApplicationAlert(
          'warning',
          `Visualization "${viz}" not found for collection "${col}"`
        )
      }
    }

    const hasExplicitMapPosition = search.z != null || !!search.c

    async function restoreItem(col, item, tab, prefetchedItem) {
      if (!item) return
      const fetchedItem = await fetchAndDisplayItem(col, item, prefetchedItem)
      if (fetchedItem && !hasExplicitMapPosition) {
        zoomToItemExtent(fetchedItem)
      }
      // Default to details tab for item view, but respect URL tab if set
      if (!tab) {
        dispatch(setTabSelected('details'))
      }
    }

    async function initialize() {
      try {
        const urlSearch = search

        // 1. Map view is set from URL params by LeafMap's initial render
        // (MapContainer center/zoom props read from router.state.location.search).
        // No setView call needed here — doing so is unreliable across screen sizes.

        // 2. Set tab from URL
        if (urlSearch.tab) {
          dispatch(setTabSelected(urlSearch.tab))
        }

        // 3. If URL has search params, restore search state and auto-search
        if (hasSearchParams(urlSearch)) {
          const collection = collectionsData.find((c) => c.id === urlSearch.col)
          if (collection) {
            // Set collection directly — don't rely on CollectionDropdown's
            // useEffect, which only runs when the Search tab is rendered.
            dispatch(setSelectedCollection(urlSearch.col))
            dispatch(setSelectedCollectionData(collection))

            // Set date range from URL
            if (urlSearch.dt) {
              const parts = urlSearch.dt.split('/')
              if (parts.length === 2) {
                dispatch(setSearchDateRangeValue([parts[0], parts[1]]))
              }
            }

            // Set view mode from URL
            if (urlSearch.view) {
              dispatch(setViewMode(urlSearch.view))
            }

            // Set queryable filters from URL
            const filterParams = extractQueryableParams(urlSearch)
            if (Object.keys(filterParams).length > 0) {
              // collection.queryables is the properties dict directly
              // (e.g. { "eo:cloud_cover": { type: "number", ... } })
              // deserializeQueryableFiltersFromURL expects { properties: ... }
              const queryables = collection.queryables
              if (
                queryables &&
                typeof queryables === 'object' &&
                !queryables.error
              ) {
                const filters = deserializeQueryableFiltersFromURL(
                  filterParams,
                  { properties: queryables }
                )
                if (Object.keys(filters).length > 0) {
                  dispatch(setQueryableFilters(filters))
                }
              }
            }

            restoreVisualization(urlSearch.col, urlSearch.viz)

            // Auto-execute search with explicit overrides to avoid
            // race conditions with ViewSelector's collection-change effect
            // (which auto-selects a default view mode).
            newSearch({
              viewMode: urlSearch.view,
              preserveItem: !!urlSearch.item
            })

            await restoreItem(urlSearch.col, urlSearch.item, urlSearch.tab)
          } else {
            showApplicationAlert(
              'warning',
              `Collection "${urlSearch.col}" not found`
            )
          }
        } else if (urlSearch.col) {
          // Collection (and optionally item/view) without full search params
          const collection = collectionsData.find((c) => c.id === urlSearch.col)
          if (collection) {
            dispatch(setSelectedCollection(urlSearch.col))
            dispatch(setSelectedCollectionData(collection))
            if (urlSearch.view) {
              dispatch(setViewMode(urlSearch.view))
            }

            // Set queryable filters from URL
            const filterParams = extractQueryableParams(urlSearch)
            if (Object.keys(filterParams).length > 0) {
              const queryables = collection.queryables
              if (
                queryables &&
                typeof queryables === 'object' &&
                !queryables.error
              ) {
                const filters = deserializeQueryableFiltersFromURL(
                  filterParams,
                  { properties: queryables }
                )
                if (Object.keys(filters).length > 0) {
                  dispatch(setQueryableFilters(filters))
                }
              }
            }

            restoreVisualization(urlSearch.col, urlSearch.viz)
            if (urlSearch.item) {
              await restoreItem(urlSearch.col, urlSearch.item, urlSearch.tab)
            } else if (!hasExplicitMapPosition) {
              zoomToCollectionExtent(collection)
            }
          } else {
            showApplicationAlert(
              'warning',
              `Collection "${urlSearch.col}" not found`
            )
          }
        }

        prevSearchRef.current = urlSearch
        isInitializedRef.current = true
      } catch (error) {
        console.error('URL state initialization error:', error)
        prevSearchRef.current = search
        isInitializedRef.current = true
      } finally {
        isInitializing.current = false
      }
    }

    initialize()
  }, [
    appConfig,
    collectionsData,
    map,
    search,
    dispatch,
    fetchAndDisplayItem,
    clearItemSelection
  ])

  return {
    isInitializedRef,
    prevSearchRef,
    fetchAndDisplayItem,
    clearItemSelection
  }
}
