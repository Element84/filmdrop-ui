import React, { useRef, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { RouterProvider } from '@tanstack/react-router'
import { createFilmDropStore, setActiveStore } from './redux/store'
import { createFilmDropRouter, setActiveRouter } from './router'
import { RuntimeContext, setActiveRuntime } from './runtime'
import { createStoreAccessors } from './redux/store-accessors'
import { createRouterAccessors } from './router-accessors'
import { setConfigBaseUrl, setConfigCacheBuster } from './utils/configBase'
import { clearPendingAlertTimeout } from './utils/alertHelper'
import {
  createControlledUrlController,
  setActiveUrlController
} from './url-controller'
import { FilmDropOptionsContext } from './contexts/FilmDropOptionsContext'
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
    configCacheBuster,
    applyDocumentBranding = true,
    persistThemePreference = true,
    onError,
    onOpenExternal,
    config,
    urlState,
    onUrlStateChange,
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
  const initialUrlModeRef = useRef(urlState !== undefined)
  const optionsStateRef = useRef({
    urlState,
    onUrlStateChange
  })
  optionsStateRef.current = {
    urlState,
    onUrlStateChange
  }
  const runtimeRef = useRef(null)
  const urlControllerRef = useRef(null)

  if (runtimeRef.current === null) {
    runtimeRef.current = {
      store,
      router,
      accessors: {
        store: createStoreAccessors(store),
        router: createRouterAccessors(router)
      }
    }
  }

  if (urlControllerRef.current === null) {
    const isControlledUrl = initialUrlModeRef.current
    if (isControlledUrl && typeof onUrlStateChange !== 'function') {
      throw new Error(
        'FilmDrop: urlState requires onUrlStateChange so navigation updates can be synchronized.'
      )
    }

    // Fail fast for a misconfigured controlled contract, then keep the
    // onChange wrapper stable via refs across re-renders. Safe to reuse the
    // router accessors instance created above: createRouterAccessors
    // returns a stateless wrapper around `router` with no internal mutable
    // state of its own.
    urlControllerRef.current = isControlledUrl
      ? createControlledUrlController({
          getState: () => optionsStateRef.current.urlState,
          onChange: (nextState, meta) => {
            const handler = optionsStateRef.current.onUrlStateChange
            if (typeof handler === 'function') {
              handler(nextState, meta)
            }
          }
        })
      : runtimeRef.current.accessors.router
  }

  // A production throw here would turn a host-integration mistake into a
  // full page crash — safer to always log loudly and only hard-fail in dev/test.
  if (initialUrlModeRef.current !== (urlState !== undefined)) {
    const message =
      'FilmDrop: urlState controlled mode changed after mount. ' +
      'Remount FilmDropRoot (e.g. via a changed `key` prop) to switch URL ownership modes.'
    console.error(message)
    if (import.meta.env?.DEV) {
      throw new Error(message)
    }
  }

  const runtime = runtimeRef.current

  useLayoutEffect(() => {
    // Prevent duplicate active ref registration during React StrictMode dev remounts
    // In StrictMode, the component remounts: re-add to refcount so the
    // unmount cleanup doesn't drop the only live ref.
    if (!storeRef.current.__filmdropRegistered) {
      setActiveStore(store, { action: 'mount' })
      setActiveRouter(router, { action: 'mount' })
      setActiveUrlController(urlControllerRef.current, { action: 'mount' })
      setActiveRuntime(runtime, { action: 'mount' })
      storeRef.current.__filmdropRegistered = true
    }
    return () => {
      setActiveStore(store, { action: 'unmount' })
      setActiveRouter(router, { action: 'unmount' })
      setActiveUrlController(urlControllerRef.current, { action: 'unmount' })
      setActiveRuntime(runtime, { action: 'unmount' })
      storeRef.current.__filmdropRegistered = false
      clearPendingAlertTimeout()
    }
  }, [runtime, store, router])

  // Sync configUrl prop changes and clear on unmount to prevent
  // stale base inheritance across remounts.
  useLayoutEffect(() => {
    setConfigBaseUrl(configUrl ?? null)
    return () => {
      setConfigBaseUrl(null)
    }
  }, [configUrl])

  useLayoutEffect(() => {
    setConfigCacheBuster(configCacheBuster ?? 'timestamp')
    return () => {
      setConfigCacheBuster('timestamp')
    }
  }, [configCacheBuster])

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

  // Gate APP_THEME_PREFERENCE localStorage reads/writes.
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.__filmdropPersistThemePreference = persistThemePreference !== false
      return () => {
        delete window.__filmdropPersistThemePreference
      }
    }
    return undefined
  }, [persistThemePreference])

  const optionsValue = {
    config,
    urlState,
    onUrlStateChange
  }

  return (
    <ErrorBoundary onError={onError}>
      <Provider store={store}>
        <RuntimeContext.Provider value={runtime}>
          <FilmDropOptionsContext.Provider value={optionsValue}>
            <RouterProvider router={router} />
            {children}
          </FilmDropOptionsContext.Provider>
        </RuntimeContext.Provider>
      </Provider>
    </ErrorBoundary>
  )
}

FilmDropRoot.propTypes = {
  basename: PropTypes.string,
  configUrl: PropTypes.string,
  configCacheBuster: PropTypes.string,
  applyDocumentBranding: PropTypes.bool,
  persistThemePreference: PropTypes.bool,
  onError: PropTypes.func,
  onOpenExternal: PropTypes.func,
  config: PropTypes.object,
  urlState: PropTypes.shape({
    collectionId: PropTypes.string,
    itemId: PropTypes.string,
    search: PropTypes.object
  }),
  onUrlStateChange: PropTypes.func,
  children: PropTypes.node
}
