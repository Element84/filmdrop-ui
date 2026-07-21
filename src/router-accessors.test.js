import { describe, expect, it, vi } from 'vitest'
import { createRouterAccessors } from './router-accessors'

describe('createRouterAccessors', () => {
  it('throws when no router is provided', () => {
    expect(() => createRouterAccessors()).toThrow(/requires a router instance/)
  })

  it('forwards navigate calls', () => {
    const navigate = vi.fn()
    const accessors = createRouterAccessors({
      navigate,
      state: { matches: [], location: { search: {} } }
    })

    const options = { to: '/demo' }
    accessors.navigate(options)

    expect(navigate).toHaveBeenCalledWith(options)
  })

  it('returns merged path params from matched routes', () => {
    const accessors = createRouterAccessors({
      navigate: vi.fn(),
      state: {
        matches: [
          { params: { collectionId: 'c1', shared: 'parent' } },
          { params: { itemId: 'i1', shared: 'child' } },
          { params: null }
        ],
        location: { search: {} }
      }
    })

    expect(accessors.getPathParams()).toEqual({
      collectionId: 'c1',
      itemId: 'i1',
      shared: 'child'
    })
  })

  it('returns an immutable snapshot of search state', () => {
    const sourceSearch = { dt: '2024-01-01/2024-01-31', view: 'scene' }
    const accessors = createRouterAccessors({
      navigate: vi.fn(),
      state: { matches: [], location: { search: sourceSearch } }
    })

    const snapshot = accessors.getSearch()

    expect(snapshot).toEqual(sourceSearch)
    expect(snapshot).not.toBe(sourceSearch)
    expect(Object.isFrozen(snapshot)).toBe(true)

    expect(() => {
      snapshot.view = 'hex'
    }).toThrow(TypeError)
    expect(sourceSearch.view).toBe('scene')
    expect(snapshot.view).toBe('scene')
  })

  it('returns an immutable empty object when search is absent', () => {
    const accessors = createRouterAccessors({
      navigate: vi.fn(),
      state: { matches: [], location: {} }
    })

    const snapshot = accessors.getSearch()

    expect(snapshot).toEqual({})
    expect(Object.isFrozen(snapshot)).toBe(true)
  })
})
