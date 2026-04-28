/**
 * Active-router state, split out from `./router.jsx` so setupTests can
 * register a stub router without transitively loading App and its hooks
 * (which would defeat per-test `vi.mock` calls).
 */

let activeRouter = null
const liveRouters = new Set()

function isDev() {
  return Boolean(import.meta.env?.DEV)
}

export function setActiveRouter(routerInstance, options) {
  const action = options && options.action
  if (action === 'mount') {
    liveRouters.add(routerInstance)
    activeRouter = routerInstance
    if (liveRouters.size > 1 && isDev()) {
      console.warn(
        'FilmDrop: multiple live FilmDropRoot routers detected. ' +
          'A single instance per page is assumed.'
      )
    }
  } else if (action === 'unmount') {
    liveRouters.delete(routerInstance)
    activeRouter = liveRouters.size > 0 ? Array.from(liveRouters).at(-1) : null
  } else if (isDev()) {
    console.warn(
      "FilmDrop: setActiveRouter requires { action: 'mount' | 'unmount' }"
    )
  }
}

export function getActiveRouterOrNull() {
  return activeRouter
}

/**
 * Test-only helper: forcibly reset the active-router refcount between tests.
 */
export function __resetActiveRouterForTests() {
  liveRouters.clear()
  activeRouter = null
}
