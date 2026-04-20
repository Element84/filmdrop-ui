import React, { useRef, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { RouterProvider } from '@tanstack/react-router'
import { createFilmDropStore, setActiveStore } from './redux/store'
import { createFilmDropRouter, setActiveRouter } from './router'
import { setConfigBaseUrl } from './utils/configBase'
import { clearPendingAlertTimeout } from './utils/alertHelper'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'

/**
 * Root component for FilmDrop UI.
 *
 * Owns Redux store and TanStack router lifecycle. Consumers mount exactly
 * one <FilmDropRoot /> per page.
 *
 * Props:
 *   basename — public alias of TanStack's router `basepath` (e.g. "/app")
 *   configUrl — URL/base for config.json and data files (default: Vite BASE_URL)
 *   applyDocumentBranding — if true (default), App mutates document.title,
 *     favicon, and theme CSS vars on <html>
 *   onError — (error, { componentStack, phase }) => void for error boundary
 *   onOpenExternal — (url, meta?) => void override for external links
 */
export default function FilmDropRoot(props) {
  const {
    basename,
    configUrl,
    applyDocumentBranding = true,
    onError,
    onOpenExternal,
    children
  } = props

  // Initialize configUrl before rendering. Unconditional setter call clears
  // stale base on prop transitions to prevent cross-mount inheritance.
  const initialConfigUrlRef = useRef(false)
  if (!initialConfigUrlRef.current) {
    setConfigBaseUrl(configUrl ?? null)
    initialConfigUrlRef.current = true
  }

  // Lazy-init store + router exactly once per mount.
  const storeRef = useRef(null)
  const routerRef = useRef(null)
  if (storeRef.current === null) {
    storeRef.current = createFilmDropStore()
  }
  if (routerRef.current === null) {
    routerRef.current = createFilmDropRouter({ basepath: basename })
  }

  const store = storeRef.current
  const router = routerRef.current

  // Synchronously register active refs so non-hook call sites
  // (searchHelper, mapHelper, services) work on first render.
  if (typeof window !== 'undefined' && !storeRef.current.__filmdropRegistered) {
    setActiveStore(store, { action: 'mount' })
    setActiveRouter(router, { action: 'mount' })
    storeRef.current.__filmdropRegistered = true
  }

  useLayoutEffect(() => {
    // In StrictMode, the component remounts: re-add to refcount so the
    // unmount cleanup doesn't drop the only live ref.
    if (!storeRef.current.__filmdropRegistered) {
      setActiveStore(store, { action: 'mount' })
      setActiveRouter(router, { action: 'mount' })
      storeRef.current.__filmdropRegistered = true
    }
    return () => {
      setActiveStore(store, { action: 'unmount' })
      setActiveRouter(router, { action: 'unmount' })
      storeRef.current.__filmdropRegistered = false
      clearPendingAlertTimeout()
    }
  }, [store, router])

  // Sync configUrl prop changes and clear on unmount to prevent
  // stale base inheritance across remounts.
  useLayoutEffect(() => {
    setConfigBaseUrl(configUrl ?? null)
    return () => {
      setConfigBaseUrl(null)
    }
  }, [configUrl])

  // Temporary window-property plumbing for the external-link handler until
  // it is threaded via context/props to PageHeader/RightContent.
  useLayoutEffect(() => {
    if (typeof onOpenExternal === 'function' && typeof window !== 'undefined') {
      window.__filmdropOnOpenExternal = onOpenExternal
      return () => {
        delete window.__filmdropOnOpenExternal
      }
    }
    return undefined
  }, [onOpenExternal])

  // Branding toggle
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.__filmdropApplyBranding = applyDocumentBranding !== false
      return () => {
        delete window.__filmdropApplyBranding
      }
    }
    return undefined
  }, [applyDocumentBranding])

  return (
    <ErrorBoundary onError={onError}>
      <Provider store={store}>
        <RouterProvider router={router} />
        {children}
      </Provider>
    </ErrorBoundary>
  )
}

FilmDropRoot.propTypes = {
  basename: PropTypes.string,
  configUrl: PropTypes.string,
  applyDocumentBranding: PropTypes.bool,
  onError: PropTypes.func,
  onOpenExternal: PropTypes.func,
  children: PropTypes.node
}
