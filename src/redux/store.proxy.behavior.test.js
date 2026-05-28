import { describe, expect, it } from 'vitest'
import {
  createFilmDropStore,
  setActiveStore,
  store,
  getActiveStore
} from './store'
import { resetRuntimeForTests } from '../testing/runtime-test-hooks'

describe('store proxy behavior baseline', () => {
  it('throws before active store mount', () => {
    resetRuntimeForTests()
    expect(() => store.getState()).toThrow(
      /store accessed before FilmDropRoot mounted/
    )
  })

  it('forwards through active store instance', () => {
    resetRuntimeForTests()
    const testStore = createFilmDropStore()
    setActiveStore(testStore, { action: 'mount' })

    expect(getActiveStore()).toBe(testStore)
    expect(store.getState()).toEqual(testStore.getState())
  })

  it('switches active store by mount/unmount ordering', () => {
    resetRuntimeForTests()
    const storeA = createFilmDropStore()
    const storeB = createFilmDropStore()

    setActiveStore(storeA, { action: 'mount' })
    setActiveStore(storeB, { action: 'mount' })
    expect(getActiveStore()).toBe(storeB)

    setActiveStore(storeB, { action: 'unmount' })
    expect(getActiveStore()).toBe(storeA)
  })
})
