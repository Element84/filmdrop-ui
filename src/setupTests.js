import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { mainSliceReset } from './redux/slices/mainSlice'
import { createFilmDropStore, setActiveStore } from './redux/store'
// Router is not imported at module scope. router.jsx imports App (for the
// root route component), which would transitively load hooks and components
// before per-test `vi.mock(...)` calls can take effect. We register a stub
// router via router-test-hooks instead; tests that need a real router either
// mock '@tanstack/react-router' or pass one through renderFilmDrop.
import { setActiveRouter } from './router-test-hooks'
import {
  setActiveUrlController,
  __resetActiveUrlControllerForTests
} from './url-controller'
import { resetRuntimeForTests } from './testing/runtime-test-hooks'
import 'resize-observer-polyfill'

// vi.mock is hoisted to the top of the module at parse time. Placing these
// inside beforeEach is a silent no-op.
vi.mock('./services/get-collections-service.js')
vi.mock('./services/get-config-service.js')
vi.mock('./services/get-local-grid-data-json-service.js')

window.HTMLCanvasElement.prototype.getContext = () => {}
global.ResizeObserver = require('resize-observer-polyfill')

// Mock global fetch to prevent "Invalid URL" errors in tests.
// Tests that need fetch should mock it explicitly.
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
)

expect.extend(matchers)

// Shared test store + stub router. Active refs are re-registered each test so
// a failing test cannot leak state into the next.
const testStore = createFilmDropStore()
// Stub router: satisfies non-React callers of getActiveRouter(). Tests that
// exercise the real router either mock '@tanstack/react-router' or pass one
// through renderFilmDrop. A stub keeps setupTests free of the router.jsx
// → App import chain.
const testRouter = {
  state: { location: { search: {} }, matches: [] },
  navigate: () => {},
  subscribe: () => () => {}
}
const testUrlController = {
  navigate: () => Promise.resolve(),
  getPathParams: () => ({}),
  getSearch: () => Object.freeze({})
}
setActiveStore(testStore, { action: 'mount' })
setActiveRouter(testRouter, { action: 'mount' })
setActiveUrlController(testUrlController, { action: 'mount' })

beforeEach(() => {
  // Re-register the shared refs each test so getActiveStore / getActiveRouter
  // resolve even if a previous test unmounted them.
  resetRuntimeForTests()
  setActiveStore(testStore, { action: 'mount' })
  setActiveRouter(testRouter, { action: 'mount' })
  setActiveUrlController(testUrlController, { action: 'mount' })
  testStore.dispatch(mainSliceReset())

  // Suppress console.error for expected errors in tests
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  __resetActiveUrlControllerForTests()
})
