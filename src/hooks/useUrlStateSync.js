/**
 * URL → Redux synchronization hook.
 *
 * Orchestrates two phases:
 * 1. Initialization (delegated to useUrlInitialize): one-time state
 *    restoration from a shared URL on app load.
 * 2. Ongoing sync (this file): propagates URL param changes to Redux
 *    so components re-render via useSelector.
 *
 * Data flow is one-directional (URL → Redux only).
 * Components write to URL via useUrlNavigate or router.navigate.
 *
 * Collection and item come from path params (/:collectionId/:itemId).
 * All other state comes from search params.
 */
import { useEffect, useMemo } from 'react'
import { useSearch, useParams } from '@tanstack/react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSelectedCollection,
  setSelectedVisualization,
  settabSelected,
  setSearchDateRangeValue,
  setViewMode,
  setQueryableFilters
} from '../redux/slices/mainSlice'
import { extractQueryableParams } from '../router'
import { deserializeQueryableFiltersFromURL } from '../utils/urlParamHelper'
import { showApplicationAlert } from '../utils/alertHelper'
import { useUrlInitialize } from './useUrlInitialize'

/**
 * Declarative map for simple URL param → Redux sync.
 * Each entry defines how a single param maps to a Redux action.
 *
 * - param: key in the combined urlState object
 * - action: Redux action creator to dispatch
 * - defaultValue: fallback when param is falsy (omit to dispatch raw value)
 * - transform: optional (value) => dispatchable value; return null to skip
 * - requireTruthy: if true, skip dispatch when value is falsy
 */
const SIMPLE_PARAM_HANDLERS = [
  { param: 'tab', action: settabSelected, defaultValue: 'search' },
  { param: 'viz', action: setSelectedVisualization, defaultValue: null },
  { param: 'view', action: setViewMode, defaultValue: 'scene' },
  { param: 'col', action: setSelectedCollection, requireTruthy: true },
  {
    param: 'dt',
    action: setSearchDateRangeValue,
    requireTruthy: true,
    transform: (value) => {
      const parts = value.split('/')
      return parts.length === 2 ? parts : null
    }
  }
]

/**
 * Order-independent shallow equality for plain objects with string values.
 */
function shallowEqual(a, b) {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every((key) => a[key] === b[key])
}

export function useUrlStateSync() {
  const search = useSearch({ from: '__root__' })
  const params = useParams({ strict: false })
  const dispatch = useDispatch()

  // Build combined URL state: search params + path params mapped to col/item
  const collectionId = params.collectionId || ''
  const itemId = params.itemId || ''
  const urlState = useMemo(
    () => ({
      ...search,
      col: collectionId,
      item: itemId
    }),
    [search, collectionId, itemId]
  )

  const selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const collectionsData = useSelector(
    (state) => state.mainSlice.collectionsData
  )

  const { isInitialized, prevSearch, fetchAndDisplayItem, clearItemSelection } =
    useUrlInitialize(urlState, dispatch)

  /**
   * Ongoing URL → Redux sync.
   * Runs whenever URL params change after initialization.
   */
  useEffect(() => {
    if (!isInitialized.current) return
    if (prevSearch.current === null) return

    const prev = prevSearch.current
    prevSearch.current = urlState

    // Validate collection change before processing other params
    if (urlState.col !== prev.col && urlState.col) {
      const collectionExists = collectionsData?.some(
        (c) => c.id === urlState.col
      )
      if (!collectionExists) {
        showApplicationAlert(
          'warning',
          `Collection "${urlState.col}" not found`
        )
        // Skip dispatching the invalid collection — leave state unchanged
        // but still process other param changes below
      }
    }

    // Process simple params via handler map
    for (const {
      param,
      action,
      defaultValue,
      transform,
      requireTruthy
    } of SIMPLE_PARAM_HANDLERS) {
      if (urlState[param] !== prev[param]) {
        if (requireTruthy && !urlState[param]) continue
        // Skip invalid collection — already handled above
        if (param === 'col' && urlState.col) {
          const collectionExists = collectionsData?.some(
            (c) => c.id === urlState.col
          )
          if (!collectionExists) continue
        }
        const raw =
          defaultValue !== undefined && !urlState[param]
            ? defaultValue
            : urlState[param]
        if (transform) {
          const value = transform(raw)
          if (value !== null) dispatch(action(value))
        } else {
          dispatch(action(raw))
        }
      }
    }

    // Sync queryable filters (needs JSON comparison across multiple keys)
    const prevFilters = extractQueryableParams(prev)
    const currFilters = extractQueryableParams(urlState)
    if (!shallowEqual(prevFilters, currFilters)) {
      const queryables = selectedCollectionData?.queryables
      if (queryables && typeof queryables === 'object' && !queryables.error) {
        const filters = deserializeQueryableFiltersFromURL(currFilters, {
          properties: queryables
        })
        dispatch(setQueryableFilters(filters))
      }
    }

    // Sync item selection (async fetch or clear)
    if (urlState.item !== prev.item) {
      if (urlState.item) {
        const col = urlState.col || prev.col
        fetchAndDisplayItem(col, urlState.item)
      } else {
        clearItemSelection()
      }
    }
  }, [
    urlState,
    selectedCollectionData,
    collectionsData,
    dispatch,
    fetchAndDisplayItem,
    clearItemSelection,
    isInitialized,
    prevSearch
  ])
}
