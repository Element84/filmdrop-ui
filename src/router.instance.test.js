import { describe, expect, it } from 'vitest'
import { router, createFilmDropRouter, getActiveRouter } from './router'
import {
  setActiveRouter,
  __resetActiveRouterForTests,
  getActiveRouterOrNull
} from './router-test-hooks'

describe('router instance behavior', () => {
  it('returns module-scope fallback router before any root mount', () => {
    __resetActiveRouterForTests()
    expect(getActiveRouterOrNull()).toBeNull()
    expect(getActiveRouter()).toBe(router)
  })

  it('uses active mounted router when set', () => {
    __resetActiveRouterForTests()
    const instanceRouter = createFilmDropRouter({ basepath: '/embed' })
    setActiveRouter(instanceRouter, { action: 'mount' })

    expect(getActiveRouter()).toBe(instanceRouter)

    setActiveRouter(instanceRouter, { action: 'unmount' })
  })

  it('restores previously-mounted router after latest unmounts', () => {
    __resetActiveRouterForTests()
    const routerA = createFilmDropRouter({ basepath: '/a' })
    const routerB = createFilmDropRouter({ basepath: '/b' })

    setActiveRouter(routerA, { action: 'mount' })
    setActiveRouter(routerB, { action: 'mount' })
    expect(getActiveRouter()).toBe(routerB)

    setActiveRouter(routerB, { action: 'unmount' })
    expect(getActiveRouter()).toBe(routerA)

    setActiveRouter(routerA, { action: 'unmount' })
    expect(getActiveRouterOrNull()).toBeNull()
    expect(getActiveRouter()).toBe(router)
  })
})
