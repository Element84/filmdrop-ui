/**
 * TanStack Router configuration for FilmDrop UI
 *
 * Path-based routes for resource selection:
 *   /                          — no collection selected (landing)
 *   /:collectionId             — collection selected
 *   /:collectionId/:itemId     — collection + item selected
 *
 * Search params carry display preferences and search state:
 *   dt, view, viz, tab, z, c   — reserved params
 *   anything else              — dynamic queryable filters
 *
 * The useUrlStateSync hook in App.jsx reads path params + search params
 * and syncs to Redux. Components continue reading from Redux via useSelector.
 */
import {
  createRouter,
  createRootRoute,
  createRoute,
  defaultStringifySearch
} from '@tanstack/react-router'
import App from './App'

// Active-router state lives in its own module so setupTests can import it
// without pulling in App (which router.jsx imports for the root route).
import {
  setActiveRouter,
  getActiveRouterOrNull,
  __resetActiveRouterForTests
} from './router-test-hooks'

/**
 * Reserved search param names that are not queryable filters.
 * Any param not in this set is treated as a dynamic queryable filter
 * (including _min/_max suffixed variants used for range filters).
 *
 * Note: `col` and `item` are path params (/:collectionId/:itemId),
 * not search params.
 */
export const RESERVED_PARAMS = new Set(['dt', 'view', 'viz', 'tab', 'z', 'c'])

/**
 * Extract queryable filter params from the raw search object.
 * Returns any params not in the RESERVED_PARAMS set.
 */
export function extractQueryableParams(search) {
  const result = {}
  for (const [key, value] of Object.entries(search)) {
    if (!RESERVED_PARAMS.has(key)) {
      result[key] = value
    }
  }
  return result
}

/**
 * Normalize and validate URL search params.
 * Exported for direct unit testing.
 */
export function normalizeSearch(search) {
  return {
    // Search-committed params (updated on Search click)
    dt: String(search.dt ?? ''),
    view: ['scene', 'hex', 'grid-code', 'mosaic'].includes(search.view)
      ? search.view
      : '',
    // Immediate params (updated on user interaction)
    viz: String(search.viz ?? ''),
    tab: ['search', 'details'].includes(search.tab) ? search.tab : '',
    z: search.z != null ? Number(search.z) : undefined,
    c: String(search.c ?? ''),
    // Dynamic queryable filter params (pass through non-reserved keys)
    ...extractQueryableParams(search)
  }
}

const rootRoute = createRootRoute({
  validateSearch: normalizeSearch,
  component: App
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => null
})

const collectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$collectionId',
  component: () => null
})

const itemRoute = createRoute({
  getParentRoute: () => collectionRoute,
  path: '/$itemId',
  component: () => null
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  collectionRoute.addChildren([itemRoute])
])

/**
 * Preferred key order for URL search params.
 * Reserved params appear first in this fixed order for readability,
 * then any queryable filter params follow in alphabetical order.
 */
const PARAM_ORDER = ['dt', 'view', 'viz', 'tab', 'z', 'c']

/**
 * Custom stringifySearch that strips empty/null/undefined values and
 * enforces deterministic key ordering before serialization.
 * normalizeSearch restores defaults on read, so omitting these keys
 * keeps the URL short without losing state.
 */
function stringifySearch(search) {
  const ordered = {}

  // Reserved params in fixed order
  for (const key of PARAM_ORDER) {
    if (key in search) {
      const value = search[key]
      if (value !== '' && value !== undefined && value !== null) {
        ordered[key] = value
      }
    }
  }

  // Remaining params (queryable filters) in alphabetical order
  const remaining = Object.keys(search)
    .filter((key) => !PARAM_ORDER.includes(key))
    .sort()
  for (const key of remaining) {
    const value = search[key]
    if (value !== '' && value !== undefined && value !== null) {
      ordered[key] = value
    }
  }

  return defaultStringifySearch(ordered)
}

export const router = createRouter({ routeTree, stringifySearch })

// Route path constants — mirror the TanStack route tree above. Callers in
// searchHelper, mapHelper, get-pagination-service, and useUrlNavigate import
// these instead of hard-coding the path strings.
export const ROUTE_INDEX = '/'
export const ROUTE_COLLECTION = '/$collectionId'
export const ROUTE_COLLECTION_ITEM = '/$collectionId/$itemId'

// FilmDropRoot creates a router via createFilmDropRouter() and registers it
// via setActiveRouter(). Non-hook call sites read it through getActiveRouter()
// or accept a router argument. Legacy `import { router }` callers keep working
// via the module-scope `router` above, which is the fallback before mount.

/**
 * Create a FilmDrop router instance. Accepts `basepath` (TanStack's native
 * option; `FilmDropRoot` maps the public `basename` prop to this).
 */
export function createFilmDropRouter(options) {
  const opts = options || {}
  const config = { routeTree, stringifySearch }
  if (opts.basepath) {
    config.basepath = opts.basepath
  }
  return createRouter(config)
}

export { setActiveRouter, __resetActiveRouterForTests }

export function getActiveRouter() {
  if (import.meta.env?.DEV && !getActiveRouterOrNull()) {
    console.warn(
      'FilmDrop: getActiveRouter called before FilmDropRoot mount; using fallback router.'
    )
  }
  // Fall back to the module-scope `router` (SPA / legacy) if no FilmDropRoot
  // has mounted yet — keeps existing behavior for pre-FilmDropRoot callers.
  return getActiveRouterOrNull() || router
}

/**
 * Read current path params from router state.
 * For use outside React (searchHelper, mapHelper, services).
 * Accepts an optional router argument; falls back to the active router.
 * Returns { collectionId?, itemId? }.
 */
export function getPathParams(routerArg) {
  const r = routerArg || getActiveRouter()
  const matches = r.state.matches
  // Accumulate params from all matched routes
  let params = {}
  for (const match of matches) {
    if (match.params) {
      params = { ...params, ...match.params }
    }
  }
  return params
}
