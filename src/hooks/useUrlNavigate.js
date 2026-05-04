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

// Returns referentially stable callbacks so consumers can list them in
// useEffect deps without causing re-runs on every render.
export function useUrlNavigate() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const collectionId = params.collectionId

  /**
   * Switch sidebar tab.
   * @param {'search'|'details'} tab
   */
  const setTab = useCallback(
    (tab) => navigate({ search: (prev) => ({ ...prev, tab }), replace: true }),
    [navigate]
  )

  /**
   * Change visualization selection.
   * @param {string} viz - Visualization key
   */
  const setViz = useCallback(
    (viz) => navigate({ search: (prev) => ({ ...prev, viz }), replace: true }),
    [navigate]
  )

  /**
   * Select an item (scene). Also switches to details tab.
   * Navigates to /:collectionId/:itemId path.
   * @param {string} itemId - The STAC item ID
   */
  const setItem = useCallback(
    (itemId) =>
      navigate({
        to: '/$collectionId/$itemId',
        params: { collectionId, itemId },
        search: (prev) => ({ ...prev, tab: 'details' }),
        replace: true
      }),
    [navigate, collectionId]
  )

  /**
   * Clear item selection. Navigates back to /:collectionId (or /).
   */
  const clearItem = useCallback(
    () =>
      navigate({
        to: collectionId ? '/$collectionId' : '/',
        params: collectionId ? { collectionId } : {},
        search: (prev) => ({ ...prev }),
        replace: true
      }),
    [navigate, collectionId]
  )

  return useMemo(
    () => ({ setTab, setViz, setItem, clearItem }),
    [setTab, setViz, setItem, clearItem]
  )
}
