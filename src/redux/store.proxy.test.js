import { describe, expect, it, vi } from 'vitest'
import { createFilmDropStore, setActiveStore, store } from './store'
import { resetRuntimeForTests } from '../testing/runtime-test-hooks'

describe('store proxy invariants', () => {
  it('throws before an active store is mounted', () => {
    resetRuntimeForTests()
    expect(() => store.getState()).toThrow(
      /store accessed before FilmDropRoot mounted/
    )
  })

  it('preserves method identity across repeated reads', () => {
    resetRuntimeForTests()
    const testStore = createFilmDropStore()
    setActiveStore(testStore, { action: 'mount' })

    const subscribeA = store.subscribe
    const subscribeB = store.subscribe
    expect(subscribeA).toBe(subscribeB)
  })

  it('supports vi.spyOn on proxied store methods', () => {
    resetRuntimeForTests()
    const testStore = createFilmDropStore()
    setActiveStore(testStore, { action: 'mount' })

    const spy = vi.spyOn(store, 'getState')
    store.getState()
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
