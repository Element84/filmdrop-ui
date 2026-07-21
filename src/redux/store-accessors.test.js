import { describe, expect, it, vi } from 'vitest'
import { createStoreAccessors } from './store-accessors'

describe('createStoreAccessors', () => {
  it('throws when no store is provided', () => {
    expect(() => createStoreAccessors()).toThrow(/requires a store instance/)
  })

  it('forwards dispatch and getState to the provided store', () => {
    const state = { ready: true }
    const dispatch = vi.fn()
    const getState = vi.fn(() => state)
    const subscribe = vi.fn(() => () => {})
    const accessors = createStoreAccessors({ dispatch, getState, subscribe })

    const action = { type: 'demo/action' }
    accessors.dispatch(action)

    expect(dispatch).toHaveBeenCalledWith(action)
    expect(accessors.getState()).toBe(state)
  })

  it('forwards subscribe and returns unsubscribe handler', () => {
    const unsubscribe = vi.fn()
    const subscribe = vi.fn(() => unsubscribe)
    const accessors = createStoreAccessors({
      dispatch: vi.fn(),
      getState: vi.fn(() => ({})),
      subscribe
    })

    const listener = vi.fn()
    const unsubscriber = accessors.subscribe(listener)

    expect(subscribe).toHaveBeenCalledWith(listener)
    expect(unsubscriber).toBe(unsubscribe)
  })
})
