/**
 * Helper hook for components to update URL params.
 *
 * Instead of dispatching directly to Redux for shareable state,
 * components use these functions to write to the URL. The useUrlStateSync
 * hook then propagates URL changes to Redux.
 *
 * Collection and item are path params (/:collectionId/:itemId).
 * All other state uses search params.
 *
 * All updates use replace: true — the app intentionally does not create
 * browser history entries, so back/forward navigates away from the app.
 */
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { getActiveUrlControllerOrNull } from '../url-controller'
import {
  ROUTE_COLLECTION,
  ROUTE_COLLECTION_ITEM,
  ROUTE_INDEX
} from '../route-constants'
import { useFilmDropOptions } from '../contexts/FilmDropOptionsContext'

// Returns referentially stable callbacks so consumers can list them in
// useEffect deps without causing re-runs on every render.
export function useUrlNavigate() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const { urlState } = useFilmDropOptions()
  const controller = getActiveUrlControllerOrNull()
  const shouldUseController = urlState !== undefined && !!controller

  const navigateFn = useCallback(
    (options) => {
      if (shouldUseController) {
        return controller.navigate(options)
      }
      return navigate(options)
    },
    [controller, navigate, shouldUseController]
  )

  const getCollectionId = useCallback(() => {
    if (shouldUseController) {
      const pathParams = controller.getPathParams() || {}
      return pathParams.collectionId
    }
    return params.collectionId
  }, [controller, params.collectionId, shouldUseController])

  /**
   * Switch sidebar tab.
   * @param {'search'|'details'} tab
   */
  const setTab = useCallback(
    (tab) =>
      navigateFn({
        search: (prev) => ({ ...prev, tab }),
        replace: true
      }),
    [navigateFn]
  )

  /**
   * Change visualization selection.
   * @param {string} viz - Visualization key
   */
  const setViz = useCallback(
    (viz) =>
      navigateFn({
        search: (prev) => ({ ...prev, viz }),
        replace: true
      }),
    [navigateFn]
  )

  /**
   * Select an item (scene). Also switches to details tab.
   * Navigates to /:collectionId/:itemId path.
   * @param {string} itemId - The STAC item ID
   */
  const setItem = useCallback(
    (itemId) => {
      const collectionId = getCollectionId()
      return navigateFn({
        to: ROUTE_COLLECTION_ITEM,
        params: { collectionId, itemId },
        search: (prev) => ({ ...prev, tab: 'details' }),
        replace: true
      })
    },
    [getCollectionId, navigateFn]
  )

  /**
   * Clear item selection. Navigates back to /:collectionId (or /).
   */
  const clearItem = useCallback(() => {
    const collectionId = getCollectionId()
    return navigateFn({
      to: collectionId ? ROUTE_COLLECTION : ROUTE_INDEX,
      params: collectionId ? { collectionId } : {},
      search: (prev) => ({ ...prev }),
      replace: true
    })
  }, [getCollectionId, navigateFn])

  return useMemo(
    () => ({ setTab, setViz, setItem, clearItem }),
    [setTab, setViz, setItem, clearItem]
  )
}
