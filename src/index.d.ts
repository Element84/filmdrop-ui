// Public type surface for filmdrop-ui. Hand-authored; do not auto-generate.

import type { ComponentType, ReactNode } from 'react'

export interface FilmDropErrorInfo {
  componentStack: string
  phase: 'render' | 'effect' | 'config-load' | 'auth'
}

export type FilmDropOnError = (error: Error, info: FilmDropErrorInfo) => void

export type FilmDropOnOpenExternal = (
  url: string,
  meta?: { source?: string; [key: string]: unknown }
) => void

export interface FilmDropUrlSearchState {
  dt?: string
  view?: 'scene' | 'hex' | 'grid-code' | 'mosaic'
  viz?: string
  tab?: 'search' | 'details'
  z?: number
  c?: string
  [queryableParam: string]: unknown
}

export interface FilmDropUrlState {
  collectionId?: string
  itemId?: string
  search?: FilmDropUrlSearchState
}

export type FilmDropOnUrlStateChange = (
  nextState: FilmDropUrlState,
  meta: { replace?: boolean; source: string }
) => void

export interface FilmDropRootProps {
  /** Public alias of TanStack Router's `basepath`, e.g. "/filmdrop". */
  basename?: string
  /** URL (or directory base) for `config/config.json` and `data/*.json`. */
  configUrl?: string
  /**
   * Cache-busting strategy for config/favicon/grid-data fetches:
   * - `'timestamp'` (default) — append `?_cb=<Date.now()>`
   * - `'none'` — never append a cache-busting query param
   * - any other string — use as a literal revision stamp
   *   (`?_cb=<encoded value>`). Ideal for per-deploy hashes.
   */
  configCacheBuster?: string
  /**
   * When true (default), FilmDrop mutates `document.title`, favicon, and
   * theme CSS variables on `<html>`. Set false for embedded consumers.
   */
  applyDocumentBranding?: boolean
  /**
   * When true (default), persist the current theme to
   * `localStorage['APP_THEME_PREFERENCE']`. Set false to let a host app
   * manage theme preference in its own store.
   */
  persistThemePreference?: boolean
  /** Called from the library's ErrorBoundary on uncaught errors. */
  onError?: FilmDropOnError
  /**
   * Optional override for external-link navigation. Defaults to
   * `window.open(url, '_blank', 'noopener,noreferrer')`.
   */
  onOpenExternal?: FilmDropOnOpenExternal
  /** Optional props-driven runtime config. When provided, config fetch is skipped. */
  config?: Record<string, unknown>
  /** Optional parent-controlled URL state source for embedded usage. */
  urlState?: FilmDropUrlState
  /** Callback fired when FilmDrop requests URL state changes in controlled mode. */
  onUrlStateChange?: FilmDropOnUrlStateChange
  children?: ReactNode
}

/** Root component for FilmDrop UI. Mount exactly one per page. */
export const FilmDropRoot: ComponentType<FilmDropRootProps>

/**
 * Clear internal field-discovery LRU caches (STAC field types, specs,
 * metadata). Useful for host apps that tear down and remount FilmDrop and
 * want to reclaim memory.
 */
export function clearFieldCaches(): void

export default FilmDropRoot
