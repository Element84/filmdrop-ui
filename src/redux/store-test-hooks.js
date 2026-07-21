// Active store ref contract. FilmDropRoot calls setActiveStore on mount /
// unmount; the refcount keeps the ref alive through React StrictMode double-
// mount cycles. Dev-mode warns when more than one live instance is detected
// (single-instance per page is assumed for v1).

let activeStore = null
const liveStores = new Set()

function isDev() {
  return Boolean(import.meta.env?.DEV)
}

export function setActiveStore(storeInstance, options) {
  const action = options && options.action
  if (action === 'mount') {
    liveStores.add(storeInstance)
    activeStore = storeInstance
    if (liveStores.size > 1 && isDev()) {
      console.warn(
        'FilmDrop: multiple live FilmDropRoot instances detected. ' +
          'A single instance per page is assumed.'
      )
    }
  } else if (action === 'unmount') {
    liveStores.delete(storeInstance)
    activeStore = liveStores.size > 0 ? Array.from(liveStores).at(-1) : null
  } else if (isDev()) {
    console.warn(
      "FilmDrop: setActiveStore requires { action: 'mount' | 'unmount' }"
    )
  }
}

export function getActiveStoreOrNull() {
  return activeStore
}

export function getActiveStore() {
  if (!activeStore && isDev()) {
    console.warn('FilmDrop: getActiveStore called before FilmDropRoot mount')
  }
  return activeStore
}

/**
 * Test-only helper: forcibly reset the active-store refcount between tests.
 */
export function __resetActiveStoreForTests() {
  liveStores.clear()
  activeStore = null
}
