import { useMemo } from 'react'
import { useParams, useSearch } from '@tanstack/react-router'
import { useFilmDropOptions } from '../contexts/FilmDropOptionsContext'

function normalizeControlledUrlState(urlState) {
  if (!urlState || typeof urlState !== 'object') {
    return null
  }

  return {
    ...(urlState.search || {}),
    col: urlState.collectionId || '',
    item: urlState.itemId || ''
  }
}

export function useResolvedUrlState() {
  // Always call TanStack hooks to preserve hook order regardless of mode.
  const search = useSearch({ from: '__root__' })
  const params = useParams({ strict: false })
  const { urlState } = useFilmDropOptions()

  return useMemo(() => {
    const controlledState = normalizeControlledUrlState(urlState)
    if (controlledState) {
      return controlledState
    }

    return {
      ...search,
      col: params.collectionId || '',
      item: params.itemId || ''
    }
  }, [urlState, search, params.collectionId, params.itemId])
}
