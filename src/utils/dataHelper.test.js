import { vi } from 'vitest'
import { store } from '../redux/store'
import {
  loadLocalGridData,
  isSceneInCart,
  numberOfSelectedInCart,
  areAllScenesSelectedInCart,
  setScenesForCartLayer
} from './dataHelper'
import * as getLocalGridDataService from '../services/get-local-grid-data-json-service'
import * as MapHelper from './mapHelper'

describe('dataHelper', () => {
  describe('loadLocalGridData', () => {
    it('calls service to load grid data', async () => {
      const spyLoadLocalGridDataService = vi.spyOn(
        getLocalGridDataService,
        'LoadLocalGridDataService'
      )
      await loadLocalGridData()
      expect(spyLoadLocalGridDataService).toHaveBeenCalledTimes(4)
    })
  })

  describe('isSceneInCart', () => {
    it('returns true if scene is in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          cartItems: mockCart
        }
      })
      const scene = { id: '1' }
      const result = isSceneInCart(scene)
      expect(result).toBe(true)
    })
    it('returns false if scene is not in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          cartItems: mockCart
        }
      })
      const scene = { id: '3' }
      const result = isSceneInCart(scene)
      expect(result).toBe(false)
    })
  })

  describe('numberOfSelectedInCart', () => {
    it('returns number of selected scenes in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          cartItems: mockCart
        }
      })
      const mockResults = [{ id: '1' }, { id: '3' }]
      const count = numberOfSelectedInCart(mockResults)
      expect(count).toBe(1)
    })
  })

  describe('areAllScenesSelectedInCart', () => {
    it('returns true if all scenes are in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          cartItems: mockCart
        }
      })
      const mockResults = [{ id: '1' }, { id: '2' }]
      const allInCart = areAllScenesSelectedInCart(mockResults)
      expect(allInCart).toBe(true)
    })
    it('returns false if some scenes not in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          cartItems: mockCart
        }
      })
      const mockResults = [{ id: '1' }, { id: '3' }]
      const allInCart = areAllScenesSelectedInCart(mockResults)
      expect(allInCart).toBe(false)
    })
  })

  describe('setScenesForCartLayer', () => {
    it('clears layer if no cart items', () => {
      const mockEmptyCart = []
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          cartItems: mockEmptyCart
        }
      })
      const spyClearLayer = vi.spyOn(MapHelper, 'clearLayer')
      setScenesForCartLayer()
      expect(spyClearLayer).toHaveBeenCalledWith('cartFootprintsLayer')
    })
    it('sets geojson and options for cart layer', () => {
      const mockCartItems = [{ id: '1' }, { id: '2' }]
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          cartItems: mockCartItems
        }
      })
      const spyAddDataToLayer = vi.spyOn(MapHelper, 'addDataToLayer')
      setScenesForCartLayer()
      expect(spyAddDataToLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FeatureCollection',
          features: mockCartItems
        }),
        'cartFootprintsLayer',
        expect.any(Object)
      )
    })
  })
})
