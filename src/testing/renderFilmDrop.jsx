/**
 * Canonical test harness for FilmDrop components.
 *
 * Wraps a subject component in a Provider + RouterProvider and registers
 * the store/router as active. Cleans up on unmount so parallel tests don't
 * leak refs.
 *
 * Usage:
 *   import { renderFilmDrop } from '../../testing/renderFilmDrop'
 *
 *   const { store, router, getByTestId } = renderFilmDrop(<MyComponent />)
 *
 * Options:
 *   preloadedState — dispatched via mainSliceReset + setters (not supported yet)
 *   basename — forwarded to createFilmDropRouter
 *   initialUrl — navigates the router before render
 */
import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createFilmDropStore, setActiveStore } from '../redux/store'
import { createFilmDropRouter, setActiveRouter } from '../router'
import { resetRuntimeForTests } from './runtime-test-hooks'

export function renderFilmDrop(ui, options = {}) {
  const { basename, initialUrl } = options

  const testStore = options.store || createFilmDropStore()
  const testRouter =
    options.router || createFilmDropRouter({ basepath: basename })

  resetRuntimeForTests()
  setActiveStore(testStore, { action: 'mount' })
  setActiveRouter(testRouter, { action: 'mount' })

  if (initialUrl) {
    try {
      testRouter.navigate({ to: initialUrl })
    } catch {
      // ignore navigation errors in test setup
    }
  }

  // No RouterProvider — TanStack's RouterProvider renders its own route tree
  // and ignores children, discarding the subject UI. Components using TanStack
  // hooks should mount their own RouterProvider in the test.
  const result = render(<Provider store={testStore}>{ui}</Provider>)

  const originalUnmount = result.unmount
  result.unmount = () => {
    setActiveStore(testStore, { action: 'unmount' })
    setActiveRouter(testRouter, { action: 'unmount' })
    originalUnmount()
  }

  return {
    ...result,
    store: testStore,
    router: testRouter,
    dispatch: testStore.dispatch,
    navigate: testRouter.navigate.bind(testRouter)
  }
}
