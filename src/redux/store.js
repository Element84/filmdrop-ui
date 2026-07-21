import { configureStore } from '@reduxjs/toolkit'
import mainSlice from './slices/mainSlice'
import {
  setActiveStore,
  getActiveStore,
  getActiveStoreOrNull
} from './store-test-hooks'

/**
 * Factory for a FilmDrop Redux store.
 *
 * `serializableCheck: false` is required because the Leaflet `map` instance
 * lives in Redux state and is deeply non-serializable. Consequence: Redux
 * DevTools time-travel will not work for map state.
 */
export function createFilmDropStore() {
  return configureStore({
    reducer: {
      mainSlice
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  })
}

export { setActiveStore, getActiveStore }

/**
 * Back-compat `store` binding used by ~51 modules (source + tests).
 * Proxy forwards every access to the current active store so existing
 * `import { store } from '../redux/store'` call sites continue to work.
 *
 * Consumers that need a freshly-created instance should call
 * `createFilmDropStore()` directly.
 */
export const store = new Proxy(
  {},
  {
    get(_target, prop) {
      const s = getActiveStoreOrNull()
      if (!s) {
        throw new Error(
          'FilmDrop: store accessed before FilmDropRoot mounted. ' +
            'Call setActiveStore(store, { action: "mount" }) first.'
        )
      }
      // Return the raw value. Redux Toolkit's getState/dispatch/subscribe are
      // closures that do not use `this`, so binding is unnecessary — and
      // binding would produce a new function reference on every access,
      // which breaks react-redux's useSyncExternalStore equality (it
      // re-subscribes when `subscribe` identity changes, causing infinite
      // re-renders).
      return s[prop]
    },
    set(_target, prop, value) {
      // Forward writes so vi.spyOn(store, 'getState') works through the proxy.
      const s = getActiveStoreOrNull()
      if (!s) return false
      s[prop] = value
      return true
    },
    has(_target, prop) {
      const s = getActiveStoreOrNull()
      return s ? prop in s : false
    },
    getOwnPropertyDescriptor(_target, prop) {
      const s = getActiveStoreOrNull()
      if (!s) return undefined
      return (
        Object.getOwnPropertyDescriptor(s, prop) ||
        // Fall back to prototype descriptor so spyOn can wrap prototype
        // methods like `getState` / `dispatch` on Redux Toolkit stores.
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(s), prop) || {
          value: s[prop],
          writable: true,
          enumerable: true,
          configurable: true
        }
      )
    },
    defineProperty(_target, prop, descriptor) {
      const s = getActiveStoreOrNull()
      if (!s) return false
      Object.defineProperty(s, prop, descriptor)
      return true
    }
  }
)
