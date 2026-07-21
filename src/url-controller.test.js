import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  createControlledUrlController,
  setActiveUrlController,
  getActiveUrlController,
  getActiveUrlControllerOrNull,
  __resetActiveUrlControllerForTests
} from './url-controller'
import {
  ROUTE_COLLECTION,
  ROUTE_COLLECTION_ITEM,
  ROUTE_INDEX
} from './route-constants'

describe('url-controller', () => {
  beforeEach(() => {
    __resetActiveUrlControllerForTests()
  })

  describe('createControlledUrlController', () => {
    it('throws when getState is missing', () => {
      expect(() => createControlledUrlController({})).toThrow(
        /requires getState/
      )
    })

    it('derives next state for route transitions and search updater', async () => {
      let state = {
        collectionId: 'sentinel-2',
        itemId: 'item-1',
        search: { tab: 'details', view: 'scene' }
      }
      const onChange = vi.fn((nextState) => {
        state = nextState
      })

      const controller = createControlledUrlController({
        getState: () => state,
        onChange
      })

      await controller.navigate({
        to: ROUTE_COLLECTION,
        params: { collectionId: 'landsat-c2-l2' },
        search: (prev) => ({ ...prev, tab: 'search' }),
        replace: true
      })

      expect(onChange).toHaveBeenCalledWith(
        {
          collectionId: 'landsat-c2-l2',
          itemId: undefined,
          search: { tab: 'search', view: 'scene' }
        },
        {
          replace: true,
          source: 'filmdrop-controller'
        }
      )

      await controller.navigate({
        to: ROUTE_COLLECTION_ITEM,
        params: { collectionId: 'landsat-c2-l2', itemId: 'item-2' }
      })
      expect(state.collectionId).toBe('landsat-c2-l2')
      expect(state.itemId).toBe('item-2')

      await controller.navigate({ to: ROUTE_INDEX })
      expect(state.collectionId).toBeUndefined()
      expect(state.itemId).toBeUndefined()
    })

    it('returns immutable controlled search snapshots', () => {
      const controller = createControlledUrlController({
        getState: () => ({ search: { tab: 'details' } }),
        onChange: vi.fn()
      })

      const snapshot = controller.getSearch()
      expect(snapshot).toEqual({ tab: 'details' })
      expect(Object.isFrozen(snapshot)).toBe(true)
      expect(() => {
        snapshot.tab = 'search'
      }).toThrow(TypeError)
    })
  })

  describe('active controller refs', () => {
    it('tracks latest mounted controller and restores previous on unmount', () => {
      const controllerA = { id: 'A' }
      const controllerB = { id: 'B' }

      setActiveUrlController(controllerA, { action: 'mount' })
      expect(getActiveUrlController()).toBe(controllerA)

      setActiveUrlController(controllerB, { action: 'mount' })
      expect(getActiveUrlController()).toBe(controllerB)

      setActiveUrlController(controllerB, { action: 'unmount' })
      expect(getActiveUrlController()).toBe(controllerA)

      setActiveUrlController(controllerA, { action: 'unmount' })
      expect(getActiveUrlControllerOrNull()).toBeNull()
      expect(() => getActiveUrlController()).toThrow(
        /before FilmDropRoot mount/
      )
    })
  })
})
