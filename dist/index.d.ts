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

export interface FilmDropRootProps {
  /** Public alias of TanStack Router's `basepath`, e.g. "/filmdrop". */
  basename?: string
  /** URL (or directory base) for `config/config.json` and `data/*.json`. */
  configUrl?: string
  /**
   * When true (default), FilmDrop mutates `document.title`, favicon, and
   * theme CSS variables on `<html>`. Set false for embedded consumers.
   */
  applyDocumentBranding?: boolean
  /** Called from the library's ErrorBoundary on uncaught errors. */
  onError?: FilmDropOnError
  /**
   * Optional override for external-link navigation. Defaults to
   * `window.open(url, '_blank', 'noopener,noreferrer')`.
   */
  onOpenExternal?: FilmDropOnOpenExternal
  children?: ReactNode
}

/** Root component for FilmDrop UI. Mount exactly one per page. */
export const FilmDropRoot: ComponentType<FilmDropRootProps>

export default FilmDropRoot
