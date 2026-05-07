import { vi } from 'vitest'
import {
  loadLocalGridData,
  isSceneInCart,
  numberOfSelectedInCart,
  areAllScenesSelectedInCart,
  setScenesForCartLayer
} from './dataHelper'
import * as getLocalGridDataService from '../services/get-local-grid-data-json-service'
import * as mapLayers from './mapLayers'

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
      const scene = { id: '1' }
      const result = isSceneInCart(scene, mockCart)
      expect(result).toBe(true)
    })
    it('returns false if scene is not in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      const scene = { id: '3' }
      const result = isSceneInCart(scene, mockCart)
      expect(result).toBe(false)
    })
  })

  describe('numberOfSelectedInCart', () => {
    it('returns number of selected scenes in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      const mockResults = [{ id: '1' }, { id: '3' }]
      const count = numberOfSelectedInCart(mockResults, mockCart)
      expect(count).toBe(1)
    })
  })

  describe('areAllScenesSelectedInCart', () => {
    it('returns true if all scenes are in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      const mockResults = [{ id: '1' }, { id: '2' }]
      const allInCart = areAllScenesSelectedInCart(mockResults, mockCart)
      expect(allInCart).toBe(true)
    })
    it('returns false if some scenes not in cart', () => {
      const mockCart = [{ id: '1' }, { id: '2' }]
      const mockResults = [{ id: '1' }, { id: '3' }]
      const allInCart = areAllScenesSelectedInCart(mockResults, mockCart)
      expect(allInCart).toBe(false)
    })
  })

  describe('setScenesForCartLayer', () => {
    it('clears layer if no cart items', () => {
      const mockEmptyCart = []
      const spyClearLayer = vi.spyOn(mapLayers, 'clearLayer')
      setScenesForCartLayer(mockEmptyCart)
      expect(spyClearLayer).toHaveBeenCalledWith('cartFootprintsLayer')
    })
    it('sets geojson and options for cart layer', () => {
      const mockCartItems = [{ id: '1' }, { id: '2' }]
      const spyAddDataToLayer = vi.spyOn(mapLayers, 'addDataToLayer')
      setScenesForCartLayer(mockCartItems)
      expect(spyAddDataToLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FeatureCollection',
          features: mockCartItems
        }),
        'cartFootprintsLayer',
        expect.any(Object),
        true
      )
    })
  })
})
